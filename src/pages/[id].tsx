import type { NextPage } from "next"
import { Data, data } from "../data/data"
import Head from "next/head"
import { readFileSync } from "fs"

type CorProps = { children: string }
const AddCor = ({ children }: CorProps) => (
  <span className="rounded bg-green-100 font-medium text-green-700">{children}</span>
)
const DelCor = ({ children }: CorProps) => (
  <span className="rounded bg-red-100 font-medium text-red-700">{children}</span>
)

const Correction: NextPage<Data> = (props) => {
  const { question, lang, audioUris } = props
  const labels = sectionLabels[lang]

  return (
    <>
      <Head>
        <title>Speaking Correction</title>
        <meta name="description" content="language learning tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto my-10 max-w-xs p-6">
        <p className="mb-5 text-xl font-bold italic text-gray-800">{question}</p>
        <h3 className="font-semibold text-gray-800">{labels.original}</h3>
        <audio controls className="w-full">
          <source src={`data:audio/mp3;base64,${audioUris?.original}`} />
        </audio>

        <p className="py-4">
          Quand j’avais cinq ans, je me souviens <AddCor>de</AddCor> marcher à la station de bus
          pour aller à l’école. Je me souviens <AddCor>que</AddCor> ma professeur{" "}
          <DelCor>, elle</DelCor> s’appelait Kathy Johnson.{" "}
          <DelCor>
            Je me souviens le… comment dit-on “descanso”, non c’est espagnol… le pause,
          </DelCor>{" "}
          je me souviens <AddCor>de la</AddCor> <DelCor>le</DelCor> pause.
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

export const getStaticProps = async (context: any) => {
  const id = context.params?.id

  return {
    props: {
      ...data[id],
      audioUris: {
        original: readFileSync(`./src/data/b64_audio/${data[id]?.audio.original}`, {
          encoding: "utf8",
          flag: "r",
        }),
        correction: readFileSync(`./src/data/b64_audio/${data[id]?.audio.correction}`, {
          encoding: "utf8",
          flag: "r",
        }),
        feedback: readFileSync(`./src/data/b64_audio/${data[id]?.audio.feedback}`, {
          encoding: "utf8",
          flag: "r",
        }),
      },
    },
  }
}

export const getStaticPaths = async () => {
  const paths = Object.keys(data).map((id: string) => ({ params: { id } }))
  return { paths, fallback: false }
}

export default Correction
