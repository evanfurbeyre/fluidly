import { PrismaClient } from "@prisma/client"
import { readFileSync } from "fs"
import type { GetStaticProps, NextPage } from "next"
import Head from "next/head"
import Input from "../components/Input"
import Output from "../components/Output"
import { Data } from "../data/data"

const Correction: NextPage<Data> = (props) => {
  let state = "input"
  if (props.revisions) state = "output"

  return (
    <>
      <Head>
        <title>Speaking Correction</title>
        <meta name="description" content="language learning tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {state === "input" && (
        <div>
          <h1>{props.content}</h1>
          <Input id={props?.id || ""} />
        </div>
      )}
      {state === "output" && <Output {...props} />}
    </>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  const id = context.params?.id as string
  const response = await new PrismaClient().response.findUnique({
    include: { prompt: true },
    where: { id },
  })

  const original = response?.originalUrl
    ? readFileSync(`./src/data/b64_audio/${response?.originalUrl}`, {
        encoding: "utf8",
        flag: "r",
      })
    : null
  const correction = response?.correctionUrl
    ? readFileSync(`./src/data/b64_audio/${response?.correctionUrl}`, {
        encoding: "utf8",
        flag: "r",
      })
    : null
  const feedback = response?.feedbackUrl
    ? readFileSync(`./src/data/b64_audio/${response?.feedbackUrl}`, {
        encoding: "utf8",
        flag: "r",
      })
    : null

  return {
    props: {
      id,
      content: response?.prompt?.content,
      language: response?.prompt?.language,
      revisions: response?.revisions,
      audioUris: {
        original,
        correction,
        feedback,
      },
    },
  }
}

export const getStaticPaths = async () => {
  const responses = await new PrismaClient().response.findMany()
  const paths = responses.map(({ id }) => ({ params: { id } }))
  return { paths, fallback: false }
}

export default Correction
