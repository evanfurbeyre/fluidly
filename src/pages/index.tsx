import { XMarkIcon } from "@heroicons/react/24/solid"
import { Prompt, User } from "@prisma/client"
import type { InferGetServerSidePropsType, NextPage } from "next"
import { signIn, useSession } from "next-auth/react"
import Head from "next/head"
import Link from "next/link"
import { useEffect, useState } from "react"
import { prisma } from "../server/db/client"
import { trpc } from "../utils/trpc"
import { ResponseWithRelations } from "../utils/types"

const Cell = ({ children }: { children: React.ReactNode }) => {
  return <td className="w-96">{children}</td>
}

type AdminPageProps = InferGetServerSidePropsType<typeof getServerSideProps>
type FilterType = "all" | "needs-submission" | "needs-correction"

const Admin: NextPage<AdminPageProps> = (props) => {
  const [filter, setFilter] = useState<FilterType>("all")
  const [responses, setResponses] = useState(props.responses)
  const [prompts, setPrompts] = useState(props.prompts)
  const [users, setUsers] = useState(props.users)
  const { data: session } = useSession()

  const deleteResponse = trpc.response.delete.useMutation({
    onSettled(data, error) {
      if (error) console.log("error:", error)
      if (data) setResponses(responses.filter(({ id }) => id !== data.id))
    },
  })

  useEffect(() => {
    const filteredResponses =
      filter === "needs-submission"
        ? props.responses.filter((resp) => !resp.audioId)
        : filter === "needs-correction"
        ? props.responses.filter((resp) => resp.corrections?.length === 0)
        : props.responses
    setResponses(filteredResponses)
  }, [filter, props.responses])

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center pt-12">
        <div className="w-24 text-center">
          <span className="">Admin?</span>
          <button type="button" className="btn-ghost btn" onClick={() => signIn()}>
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Admin</title>
        <meta name="description" content="language learning tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <select
          onChange={(e) => setFilter(e.target.value as FilterType)}
          className="select-primary select select-sm my-5"
          value={filter}
        >
          <option value="all">All</option>
          <option value="needs-submission">Waiting for submission</option>
          <option value="needs-correction">Waiting for corrections</option>
        </select>
        <div className="overflow-x-auto">
          <table className="table-compact table">
            <thead>
              <tr>
                <Cell>Response</Cell>
                <Cell>User</Cell>
                <Cell>Audio</Cell>
                <Cell>Corrections</Cell>
                <Cell>Prompt</Cell>
              </tr>
            </thead>
            <tbody>
              {responses.map((resp) => (
                <Link key={JSON.stringify(resp)} href={`/${resp.id}`} passHref>
                  <tr className="hover cursor-pointer">
                    <Cell>
                      <div className="flex flex-row items-center">
                        <button
                          className="btn-outline btn-error btn-square btn-xs btn mr-2"
                          onClick={(e) => {
                            e.preventDefault()
                            if (window.confirm("Sure you want to delete this?")) {
                              deleteResponse.mutate({ id: resp.id })
                            }
                          }}
                        >
                          <XMarkIcon className="h-6 w-6" />
                        </button>
                        <span>{resp.id}</span>
                      </div>
                    </Cell>
                    <Cell>{resp.user.name}</Cell>
                    <Cell>{(!!resp.audio).toString()}</Cell>
                    <Cell>{(!!resp.corrections?.length).toString()}</Cell>
                    <Cell>{resp.prompt.prompt}</Cell>
                  </tr>
                </Link>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-5 flex flex-col gap-3">
          <CreateResponseForm
            users={users}
            prompts={prompts}
            onComplete={(r) => setResponses((responses) => [...responses, r])}
          />
          <CreateUserForm onComplete={(u) => setUsers((users) => [...users, u])} />
          <CreatePromptForm onComplete={(p) => setPrompts((prompts) => [...prompts, p])} />
        </div>
      </div>
    </>
  )
}

type CreateResponseFormProps = {
  users: User[]
  prompts: Prompt[]
  onComplete: (response: ResponseWithRelations) => void
}

const CreateResponseForm = ({ onComplete, users, prompts }: CreateResponseFormProps) => {
  const [selectedUser, setSelectedUser] = useState<User | undefined>(users[0])
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | undefined>(prompts[0])

  const createResponse = trpc.response.create.useMutation({
    onSettled(data, error) {
      if (error) console.log("error:", error)
      if (data) onComplete(data)
    },
  })

  return (
    <div className="flex flex-row flex-wrap items-center gap-2 rounded p-2">
      <span>
        <label className="mr-2">User:</label>
        <select
          value={selectedUser?.id ?? ""}
          className="select-primary select select-sm"
          onChange={(e) => {
            const user = users.find(({ id }) => id === e.target.value)
            setSelectedUser(user)
          }}
        >
          {users.map(({ id, name }) => {
            return (
              <option key={id} value={id}>
                {name ?? "Unnamed User"}
              </option>
            )
          })}
        </select>
      </span>
      <span>
        <label className="mr-2">Prompt:</label>
        <select
          onChange={(e) => setSelectedPrompt(prompts.find(({ id }) => id === e.target.value))}
          className="select-primary select select-sm"
          value={selectedPrompt?.id ?? ""}
        >
          {prompts.map(({ id, prompt }) => {
            return (
              <option key={id} value={id}>
                {prompt}
              </option>
            )
          })}
        </select>
      </span>
      <button
        className={`btn-primary btn-sm btn ${createResponse.isLoading && "loading"}`}
        disabled={!selectedUser?.id || !selectedPrompt?.id}
        onClick={() => {
          if (!selectedUser?.id || !selectedPrompt?.id) return
          createResponse.mutate({ userId: selectedUser.id, promptId: selectedPrompt.id })
        }}
      >
        Create response
      </button>
    </div>
  )
}

const CreateUserForm = ({ onComplete }: { onComplete: (_: User) => void }) => {
  const [statusMessage, setStatusMessage] = useState({ color: "black", message: "" })
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")

  const createUser = trpc.user.create.useMutation({
    onSettled(data, error) {
      if (error) setStatusMessage({ color: "red", message: error.message })
      if (data) {
        setStatusMessage({ color: "green", message: "success" })
        onComplete(data)
      }
    },
  })

  return (
    <div className="flex flex-row flex-wrap items-center gap-2 rounded p-2">
      <span>
        <label className="mr-2">Name:</label>
        <input
          onChange={(e) => setName(e.target.value)}
          className="input-primary input input-sm"
          value={name}
        />
      </span>
      <span>
        <label className="mr-2">Email:</label>
        <input
          onChange={(e) => setEmail(e.target.value)}
          className="input-primary input input-sm"
          value={email}
        />
      </span>
      <button
        className={`btn-primary btn-sm btn ${createUser.isLoading && "loading"}`}
        onClick={() => {
          if (!email.trim() || !name.trim()) {
            setStatusMessage({ color: "red", message: "email and name required" })
            return
          }
          createUser.mutate({ email, name })
        }}
      >
        Create user
      </button>
      <p className={`text-${statusMessage.color}-500 ml-2`}>{statusMessage.message}</p>
    </div>
  )
}

const CreatePromptForm = ({ onComplete }: { onComplete: (_: Prompt) => void }) => {
  const [statusMessage, setStatusMessage] = useState({ color: "black", message: "" })
  const [prompt, setPrompt] = useState("")
  const [lang, setLang] = useState("es")

  const createPrompt = trpc.prompt.create.useMutation({
    onSettled(data, error) {
      if (error) setStatusMessage({ color: "red", message: error.message })
      if (data) {
        setStatusMessage({ color: "green", message: "success" })
        onComplete(data)
      }
    },
  })

  return (
    <div className="flex flex-row flex-wrap items-center gap-2 rounded p-2">
      <span>
        <label className="mr-2">Prompt:</label>
        <input
          onChange={(e) => setPrompt(e.target.value)}
          className="input-primary input input-sm"
          value={prompt}
        />
      </span>
      <span>
        <label className="mr-2">Language:</label>
        <select
          onChange={(e) => setLang(e.target.value)}
          className="select-primary select select-sm"
          value={lang}
        >
          <option value="es">Spanish</option>
          <option value="fr">French</option>
        </select>
      </span>
      <button
        className={`btn-primary btn-sm btn ${createPrompt.isLoading && "loading"}`}
        onClick={() => {
          if (!lang.trim() || !prompt.trim()) {
            setStatusMessage({ color: "red", message: "prompt and language required" })
            return
          }
          createPrompt.mutate({ language: lang, prompt })
        }}
      >
        Create prompt
      </button>
      <p className={`text-${statusMessage.color}-500 ml-2`}>{statusMessage.message}</p>
    </div>
  )
}

export const getServerSideProps = async () => {
  const [responses, prompts, users] = await Promise.all([
    prisma.response.findMany({
      include: {
        user: true,
        audio: true,
        corrections: true,
        prompt: true,
      },
    }),
    prisma.prompt.findMany(),
    prisma.user.findMany(),
  ])

  return {
    props: {
      responses,
      prompts,
      users,
    },
  }
}

export default Admin
