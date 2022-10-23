import { Prompt, User } from "@prisma/client"
import type { GetStaticProps, NextPage } from "next"
import Head from "next/head"
import Link from "next/link"
import { useState } from "react"
import { prisma } from "../../server/db/client"
import { trpc } from "../../utils/trpc"
import { ResponseWithRelations } from "../../utils/types"

type Props = { responses: ResponseWithRelations[] }

const Cell = ({ children }: { children: React.ReactNode }) => {
  return <td className="w-96">{children}</td>
}

const Admin: NextPage<Props> = (props) => {
  const [responses, setResponses] = useState(props.responses)
  const deleteResponse = trpc.response.delete.useMutation({
    onSettled(data, error) {
      if (error) console.log("error:", error)
      if (data) setResponses(responses.filter(({ id }) => id !== data.id))
    },
  })

  return (
    <>
      <Head>
        <title>Admin</title>
        <meta name="description" content="language learning tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="p-5">
        <table className="">
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
              <tr key={JSON.stringify(resp)}>
                <Cell>
                  <div className="my-1 mr-4 flex flex-row">
                    <button
                      className="mr-2 rounded bg-red-500 py-0 px-2 text-white"
                      onClick={() => {
                        if (window.confirm("Sure you want to delete this?")) {
                          deleteResponse.mutate({ id: resp.id })
                        }
                      }}
                    >
                      X
                    </button>
                    <Link href={`/${resp.id}`}>
                      <a className="underline">Submission</a>
                    </Link>
                    <span className="mx-3">|</span>
                    <Link href={`/admin/${resp.id}`}>
                      <a className="underline">Correction</a>
                    </Link>
                  </div>
                </Cell>
                <Cell>{resp.user.name}</Cell>
                <Cell>{(!!resp.audio).toString()}</Cell>
                <Cell>{(!!resp.corrections?.length).toString()}</Cell>
                <Cell>{resp.prompt.prompt}</Cell>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-5">
          <CreateResponseForm onComplete={(r) => setResponses((responses) => [...responses, r])} />
          <CreateUserForm />
          <CreatePromptForm />
        </div>
      </div>
    </>
  )
}

type CreateResponseFormProps = {
  onComplete: (response: ResponseWithRelations) => void
}

const CreateResponseForm = ({ onComplete }: CreateResponseFormProps) => {
  const [selectedUser, setSelectedUser] = useState<User>()
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt>()
  const users = trpc.user.findMany.useQuery()
  const prompts = trpc.prompt.findMany.useQuery()
  const createResponse = trpc.response.create.useMutation({
    onSettled(data, error) {
      if (error) console.log("error:", error)
      if (data) onComplete(data)
    },
  })

  console.log("selectedUser.id:", selectedUser?.id)

  return (
    <div className="flex flex-row items-center rounded p-2">
      <label className="mr-2">User:</label>
      <select
        value={selectedUser?.id ?? ""}
        className="mr-2 rounded border-2 px-2 py-2"
        onChange={(e) => {
          const user = users.data?.find(({ id }) => id === e.target.value)
          setSelectedUser(user)
        }}
      >
        <option disabled={true} value={""}>
          -- Choose an option --
        </option>
        {users.data?.map(({ id, name }) => {
          return (
            <option key={id} value={id}>
              {name ?? "Unnamed User"}
            </option>
          )
        })}
      </select>
      <label className="mr-2">Prompt:</label>
      <select
        onChange={(e) => setSelectedPrompt(prompts.data?.find(({ id }) => id === e.target.value))}
        className="mr-2 rounded border-2 px-2 py-2"
        value={selectedPrompt?.id ?? ""}
      >
        <option disabled={true} value={""}>
          -- Choose an option --
        </option>
        {prompts.data?.map(({ id, prompt }) => {
          return (
            <option key={id} value={id}>
              {prompt}
            </option>
          )
        })}
      </select>
      <button
        className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300"
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

const CreateUserForm = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [statusMessage, setStatusMessage] = useState({ color: "black", message: "" })
  const createUser = trpc.user.create.useMutation({
    onSettled(data, error) {
      if (error) setStatusMessage({ color: "red", message: error.message })
      if (data) setStatusMessage({ color: "green", message: "success" })
    },
  })

  return (
    <div className="flex flex-row items-center rounded p-2">
      <label className="mr-2">Name:</label>
      <input onChange={(e) => setName(e.target.value)} value={name} className="mr-2 border-2" />
      <label className="mr-2">Email:</label>
      <input onChange={(e) => setEmail(e.target.value)} value={email} className="mr-2 border-2" />
      <button
        className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
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

const CreatePromptForm = () => {
  const [lang, setLang] = useState("")
  const [prompt, setPrompt] = useState("")
  const [statusMessage, setStatusMessage] = useState({ color: "black", message: "" })

  const createPrompt = trpc.prompt.create.useMutation({
    onSettled(data, error) {
      if (error) setStatusMessage({ color: "red", message: error.message })
      if (data) setStatusMessage({ color: "green", message: "success" })
    },
  })

  return (
    <div className="flex flex-row items-center rounded p-2">
      <label className="mr-2">Prompt:</label>
      <input onChange={(e) => setPrompt(e.target.value)} value={prompt} className="mr-2 border-2" />
      <label className="mr-2">Language:</label>
      <select
        onChange={(e) => setLang(e.target.value)}
        className="mr-2 rounded border-2 px-2 py-2"
        value={lang}
      >
        <option value="es">Spanish</option>
        <option value="fr">French</option>
      </select>
      <button
        className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
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

const getResponses = async () => {
  const responses = await prisma.response.findMany({
    include: {
      user: true,
      audio: true,
      corrections: true,
      prompt: true,
    },
  })
  return responses
}

export const getStaticProps: GetStaticProps = async () => {
  const responses: ResponseWithRelations[] = await getResponses()
  return {
    props: {
      responses,
    },
  }
}

export default Admin
