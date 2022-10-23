import axios from "axios"
import type { GetStaticProps, NextPage } from "next"
import { useSession } from "next-auth/react"
import Head from "next/head"
import Audio from "../components/Audio"
import AudioInput from "../components/AudioInput"
import Correction from "../components/Correction"
import { prisma } from "../server/db/client"
import { trpc } from "../utils/trpc"

type Props = {
  id: string
}

const Response: NextPage<Props> = ({ id }) => {
  const getResponseQry = trpc.response.findUnique.useQuery({ id })
  const addResponseAudio = trpc.response.addResponseAudio.useMutation()
  const responseAudioUploadQry = trpc.response.getAudioUploadUrl.useQuery()
  const { data: session } = useSession()
  console.log("session:", session)

  if (getResponseQry.isLoading || responseAudioUploadQry.isLoading) {
    return <></>
  }

  const response = getResponseQry.data
  const { url: resUrl, key: resKey } = responseAudioUploadQry.data ?? {}

  if (!response) {
    throw new Error("no response found")
  }
  if (!resKey || !resUrl) {
    throw new Error("bad upload url")
  }

  const submitResponseAudio = async (blob: Blob) => {
    await axios({
      method: "PUT",
      url: resUrl,
      data: blob,
    }).catch((e) => {
      console.log("Error uploading:", e)
      throw e
    })
    addResponseAudio.mutate({
      key: resKey,
      responseId: response.id,
      language: response.prompt.language,
    })
  }

  const hasAudio = typeof response.audio?.audioUrl === "string"
  const hasCorrections = Boolean(response.corrections.length)

  return (
    <>
      <Head>
        <title>Speaking Correction</title>
        <meta name="description" content="language learning tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div
        className={`container mx-auto flex h-screen flex-col items-center p-6 ${
          hasCorrections ? "justify-start text-left" : "justify-center text-center"
        }`}
      >
        <div className={`flex w-full flex-col items-stretch gap-4 sm:w-96`}>
          <h1 className={`w-full text-2xl`}>{response.prompt.prompt}</h1>

          {hasAudio && response.audio?.audioUrl && <Audio src={response.audio.audioUrl} />}

          {hasAudio && !hasCorrections && (
            <div className="p-6 text-xs">
              Thanks for your submission! <br /> You&apos;ll be notified when feedback is ready.
            </div>
          )}

          {hasCorrections && (
            <>
              <h2 className="mt-5 text-xl">Corrections</h2>
              {response.corrections.map((cor) => (
                <Correction key={cor.id} correction={cor} />
              ))}
            </>
          )}
        </div>
      </div>
      {!hasAudio && (
        <div className="absolute left-0 bottom-0 w-screen">
          <AudioInput onSubmit={submitResponseAudio} />
        </div>
      )}
    </>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  const id = context.params?.id as string

  return {
    props: {
      id,
    },
  }
}

export const getStaticPaths = async () => {
  const responses = await prisma.response.findMany()
  const paths = responses.map(({ id }) => ({ params: { id } }))
  return { paths, fallback: false }
}

export default Response
