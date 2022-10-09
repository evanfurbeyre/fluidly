import type { GetStaticProps, NextPage } from "next"
import Head from "next/head"
import Link from "next/link"
import { Prisma } from "@prisma/client"
import { prisma } from "../server/db/client"

type Responses = Prisma.PromiseReturnType<typeof getResponses>
type Props = {
  responses: Responses
}

const Cell = ({ children }: { children: React.ReactNode }) => {
  return <td className="w-64">{children}</td>
}

const Admin: NextPage<Props> = (props) => {
  const { responses } = props

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
                  <Link href={`/${resp.id}`}>{resp.id}</Link>
                </Cell>
                <Cell>{resp.user.name}</Cell>
                <Cell>{(!!resp.audio).toString()}</Cell>
                <Cell>{(!!resp.corrections?.length).toString()}</Cell>
              </tr>
            ))}
          </tbody>
        </table>
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
