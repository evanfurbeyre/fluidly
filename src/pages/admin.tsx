import { Prisma } from "@prisma/client"
import type { GetStaticProps, NextPage } from "next"
import Head from "next/head"
import Link from "next/link"
import { useState } from "react"
import { prisma } from "../server/db/client"
import { trpc } from "../utils/trpc"

type Responses = Prisma.PromiseReturnType<typeof getResponses>
type Props = {
  responses: Responses
}

const Cell = ({ children }: { children: React.ReactNode }) => {
  return <td className="w-64">{children}</td>
}

const Admin: NextPage<Props> = (props) => {
  const [responses, setResponses] = useState(props.responses)
  const defaultPrompt = trpc.useQuery(["response.getPrompt"])
  const defaultUser = trpc.useQuery(["response.getUser"])

  const createResponse = trpc.useMutation(["response.createResponse"], {
    onSettled(data, error) {
      if (error) console.log("error:", error)
      if (data) setResponses([...responses, data])
    },
  })

  const deleteResponse = trpc.useMutation(["response.deleteResponse"], {
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
      <div className="">
        <h1>Responses</h1>
        <table className="">
          <thead>
            <tr>
              <Cell>id</Cell>
              <Cell>user</Cell>
              <Cell>audio</Cell>
              <Cell>corrections</Cell>
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
                    <Link href={`/${resp.id}`}>{resp.id}</Link>
                  </div>
                </Cell>
                <Cell>{resp.user.name}</Cell>
                <Cell>{(!!resp.audio).toString()}</Cell>
                <Cell>{(!!resp.corrections?.length).toString()}</Cell>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-5">
          <button
            className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
            onClick={() => {
              if (!defaultPrompt.data?.id) {
                return console.log("Could not create response: default prompt not found")
              }
              if (!defaultUser.data?.id) {
                return console.log("Could not create response: default user not found")
              }
              createResponse.mutate({
                userId: defaultUser.data.id,
                promptId: defaultPrompt.data.id,
              })
            }}
          >
            New response
          </button>
        </div>
      </div>
    </>
  )
}

const getResponses = async () => {
  const responses = await prisma.response.findMany({
    include: {
      user: true,
      audio: true,
      corrections: true,
    },
  })
  return responses
}

export const getStaticProps: GetStaticProps = async () => {
  const responses: Responses = await getResponses()
  return {
    props: {
      responses,
    },
  }
}

export default Admin
