import type { GetStaticProps, NextPage } from "next"
import Head from "next/head"
import { useContext } from "react"
import InputScreen from "../components/InputScreen"
import OutputScreen from "../components/OutputScreen"
import { prisma } from "../server/db/client"
import { trpc } from "../utils/trpc"
import { AdminContext } from "./_app"

type Props = {
  id: string
}

const Response: NextPage<Props> = ({ id }) => {
  const getResponseQry = trpc.response.findUnique.useQuery({ id })
  const { data: response, refetch: refetchResponse } = getResponseQry
  const { adminMode } = useContext(AdminContext)

  if (getResponseQry.isLoading) {
    return <></>
  }

  if (!response) {
    throw new Error("no response found")
  }

  const hasCorrections = Boolean(response.corrections.length)
  const hasFeedback = Boolean(response.feedback || response.feedbackText)

  return (
    <>
      <Head>
        <title>Speaking Correction</title>
        <meta name="description" content="language learning tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {!hasCorrections && !hasFeedback && !adminMode ? (
        <InputScreen response={response} refetchResponse={refetchResponse} />
      ) : (
        <OutputScreen response={response} refetchResponse={refetchResponse} />
      )}
    </>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  const id = context.params?.id as string

  return {
    props: { id },
    revalidate: 10,
  }
}

export const getStaticPaths = async () => {
  const responses = await prisma.response.findMany()
  const paths = responses.map(({ id }) => ({ params: { id } }))
  return { paths, fallback: "blocking" }
}

export default Response
