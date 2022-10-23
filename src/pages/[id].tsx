import axios from "axios"
import type { GetStaticProps, NextPage } from "next"
import Head from "next/head"
import AudioInput from "../components/AudioInput"
import DiffBlock from "../components/DiffBlock"
import { prisma } from "../server/db/client"
import { trpc } from "../utils/trpc"

type Props = {
  id: string
}

const Response: NextPage<Props> = ({ id }) => {
  const getResponseQry = trpc.response.findUnique.useQuery({ id })
  const addResponseAudio = trpc.response.addResponseAudio.useMutation()
  const responseAudioUploadQry = trpc.response.getAudioUploadUrl.useQuery()

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
      <div className="container mx-auto flex items-center justify-center p-6">
        <div className="flex w-full flex-col items-center gap-4 sm:w-96">
          <h1 className="text-2xl">{response.prompt.prompt}</h1>

          {/* Show audio or AudioInput */}
          {hasAudio ? (
            <audio
              src={response.audio?.audioUrl as string}
              className="w-full rounded-lg"
              controls
            />
          ) : (
            <AudioInput onSubmit={submitResponseAudio} />
          )}

          {/* Show message if corrections are pending */}
          {hasAudio && !hasCorrections && (
            <div className="p-6 text-center">be patient, correction coming soon</div>
          )}

          {/* Show corrections */}
          {hasCorrections && (
            <div className="w-full">
              <h2 className="mt-5 text-xl">Corrections</h2>
              {response.corrections.map((cor) => (
                <div className="my-2 w-full" key={cor.id}>
                  {cor.audio?.audioUrl && (
                    <audio src={cor.audio.audioUrl} controls className="w-full rounded-lg">
                      <source />
                    </audio>
                  )}

                  {cor.diff.length > 0 && (
                    <div className="my-4 rounded-2xl bg-stone-100 py-4 px-5">
                      <DiffBlock diff={cor.diff} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
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
