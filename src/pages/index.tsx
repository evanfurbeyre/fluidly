import { XMarkIcon } from "@heroicons/react/24/solid"
import { Language, Prompt, User } from "@prisma/client"
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

const getStatus = (hasAudio: boolean, hasCorrections: boolean) => {
  if (!hasAudio) return "awaiting response"
  if (hasAudio && !hasCorrections) return "awaiting correction"
  if (hasAudio && hasCorrections) return "complete"
  return "invalid"
}

const MILLIS_PER_HR = 3600000
const getHoursFromNow = (ts: Date) => {
  return Math.round((Date.now() - ts.getTime()) / MILLIS_PER_HR)
}

const Admin: NextPage<AdminPageProps> = (props) => {
  const [filter, setFilter] = useState<FilterType>("needs-correction")
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
        ? props.responses.filter((resp) => resp.audioId && resp.corrections?.length === 0)
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
        <div className="flex justify-center">
          <select
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="select-primary select select-sm my-5"
            value={filter}
          >
            <option value="all">All</option>
            <option value="needs-submission">Waiting for submission</option>
            <option value="needs-correction">Waiting for corrections</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="table-compact table">
            <thead>
              <tr>
                <Cell> </Cell>
                <Cell>User</Cell>
                <Cell>Status</Cell>
                <Cell>Prompt</Cell>
                <Cell>Hours Ready</Cell>
                <Cell>Correcter</Cell>
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
                      </div>
                    </Cell>
                    <Cell>{resp.user.name}</Cell>
                    <Cell>{getStatus(!!resp.audioId, !!resp.corrections.length)}</Cell>
                    <Cell>{resp.prompt[resp.language ?? "en"]}</Cell>
                    <Cell>{resp.audio && getHoursFromNow(resp.audio.createdAt)}</Cell>
                    <Cell>{resp.corrector?.name}</Cell>
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
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("en")
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
        <label className="mr-2">Language:</label>
        <select
          onChange={(e) => setSelectedLanguage(e.target.value as Language)}
          className="select-primary select select-sm  truncate"
          value={selectedLanguage}
        >
          {Object.values(Language).map((lang) => {
            return (
              <option key={lang} value={lang}>
                {lang}
              </option>
            )
          })}
        </select>
      </span>
      <span>
        <label className="mr-2">Prompt:</label>
        <select
          onChange={(e) => setSelectedPrompt(prompts.find(({ id }) => id === e.target.value))}
          className="select-primary select select-sm w-64 truncate"
          value={selectedPrompt?.id ?? ""}
        >
          {prompts.map((prompt) => {
            return (
              <option key={prompt.id} value={prompt.id}>
                {prompt[selectedLanguage]}
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
          createResponse.mutate({
            userId: selectedUser.id,
            promptId: selectedPrompt.id,
            language: selectedLanguage,
          })
        }}
      >
        Create response
      </button>
    </div>
  )
}

const CreateUserForm = ({ onComplete }: { onComplete: (_: User) => void }) => {
  const [statusMessage, setStatusMessage] = useState({ color: "black", message: "" })
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
      <button
        className={`btn-primary btn-sm btn ${createUser.isLoading && "loading"}`}
        onClick={() => {
          if (!name.trim()) {
            setStatusMessage({ color: "red", message: "email and name required" })
            return
          }
          createUser.mutate({ name })
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
  const [esPrompt, setEsPrompt] = useState("")
  const [enPrompt, setEnPrompt] = useState("")
  const [frPrompt, setFrPrompt] = useState("")

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
        <label className="mr-2">English:</label>
        <input
          onChange={(e) => setEnPrompt(e.target.value)}
          className="input-primary input input-sm"
          value={enPrompt}
        />
      </span>
      <span>
        <label className="mr-2">Spanish:</label>
        <input
          onChange={(e) => setEsPrompt(e.target.value)}
          className="input-primary input input-sm"
          value={esPrompt}
        />
      </span>
      <span>
        <label className="mr-2">French:</label>
        <input
          onChange={(e) => setFrPrompt(e.target.value)}
          className="input-primary input input-sm"
          value={frPrompt}
        />
        <button
          className={`btn-primary btn-sm btn ml-2 ${createPrompt.isLoading && "loading"}`}
          onClick={() => {
            if (!esPrompt.trim() || !enPrompt.trim() || !frPrompt.trim()) {
              setStatusMessage({ color: "red", message: "please fill out all languages" })
              return
            }
            createPrompt.mutate({
              es: esPrompt,
              en: enPrompt,
              fr: frPrompt,
            })
          }}
        >
          Create prompt
        </button>
      </span>
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
        corrector: true,
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
