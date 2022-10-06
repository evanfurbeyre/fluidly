import { PrismaClient } from "@prisma/client"
import { readFileSync } from "fs"
import type { GetStaticProps, NextPage } from "next"
import Head from "next/head"
import { Data, data, RevisionFragment } from "../data/data"

const Correction: NextPage<Data> = (props) => {
  const { content, audioUris, language, revisions } = props
  const labels = sectionLabels[language]

  return (
    <>
      <Head>
        <title>Speaking Correction</title>
        <meta name="description" content="language learning tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto my-10 max-w-sm p-6">
        <p className="mb-5 text-xl font-bold italic text-gray-800">{content}</p>
        <h3 className="font-semibold text-gray-800">{labels.original}</h3>
        <audio controls className="w-full">
          <source src={`data:audio/mp3;base64,${audioUris?.original}`} />
        </audio>

        <p className="py-4">
          <RevisionSection revisions={revisions} />
        </p>

        <h3 className="font-semibold text-gray-800">{labels.correction}</h3>
        <audio controls className="w-full">
          <source src={`data:audio/mp3;base64,${audioUris?.correction}`} />
        </audio>

        <h3 className="font-semibold text-gray-800">{labels.feedback}</h3>
        <audio controls className="w-full">
          <source src={`data:audio/mp3;base64,${audioUris?.feedback}`} />
        </audio>
      </main>
    </>
  )
}

const sectionLabels = {
  fr: {
    original: "Audio d'origine",
    correction: "Correction",
    feedback: "Retour d'information",
  },
  es: {
    original: "Audio original",
    correction: "Corrección",
    feedback: "Retroalimentación",
  },
}

const RevisionSection = ({ revisions }: { revisions: RevisionFragment[] }) => {
  return (
    <>
      {revisions.map(({ content, type }, index) => {
        switch (type) {
          case "addition":
            return (
              <span key={index} className="mx-1 rounded bg-green-100 font-medium text-green-700">
                {content}
              </span>
            )
          case "deletion":
            return (
              <span key={index} className="mx-1 rounded bg-red-100 font-medium text-red-700">
                {content}
              </span>
            )
          default:
            return <span key={index}>{content}</span>
        }
      })}
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
  const paths = Object.keys(data).map((id: string) => ({ params: { id } }))
  return { paths, fallback: false }
}

export default Correction
