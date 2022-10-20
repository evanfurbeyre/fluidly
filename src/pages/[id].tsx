import type { GetStaticProps, NextPage } from "next"
import Head from "next/head"
import axios from "axios"
import AudioInput from "../components/AudioInput"
import Correction from "../components/Correction"
import { prisma } from "../server/db/client"
import { trpc } from "../utils/trpc"
import { useRouter } from "next/router"
import { useState } from "react"

type Props = {
  id: string
}

const Response: NextPage<Props> = ({ id }) => {
  const [addingCorrection, setAddingCorrection] = useState(false)
  const { query } = useRouter()
  const getResponseQry = trpc.useQuery(["response.getResponse", { id }])
  const responseAudioUploadQry = trpc.useQuery(["response.getAudioUploadUrl"])
  const correctionAudioUploadQry = trpc.useQuery(["response.getAudioUploadUrl"])
  const addResponseAudio = trpc.useMutation(["response.addResponseAudio"])
  const addCorrection = trpc.useMutation(["response.addCorrection"])

  if (
    getResponseQry.isLoading ||
    responseAudioUploadQry.isLoading ||
    correctionAudioUploadQry.isLoading
  ) {
    return <></>
  }

  const { data: response } = getResponseQry
  const { url: resUrl, key: resKey } = responseAudioUploadQry.data ?? {}
  const { url: corUrl, key: corKey } = correctionAudioUploadQry.data ?? {}

  if (!response) {
    throw new Error("no response found")
  }
  if (!resKey || !resUrl || !corKey || !corUrl) {
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

  const submitCorrection = async (blob: Blob) => {
    // TODO: maybe we should just send the blob to the server and upload there??
    await axios({
      method: "PUT",
      url: corUrl,
      data: blob,
    }).catch((e) => {
      console.log("Error uploading:", e)
      throw e
    })
    addCorrection.mutate({
      key: corKey,
      responseId: response.id,
      language: response.prompt.language,
    })
  }

  const hasAudio = typeof response.audio?.audioUrl === "string"
  const hasCorrections = Boolean(response.corrections.length)
  const isAdmin = query.admin

  console.log("response.corrections:", response.corrections)

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
              controls
              className="w-full rounded-lg"
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
            <>
              <h2 className="mt-3">Corrections</h2>
              {response.corrections.map((cor) => (
                <Correction key={cor.id} audio={cor.audio} diff={cor.diff} />
              ))}
            </>
          )}

          {/* Show add correction button ifAdmin */}
          {isAdmin && !addingCorrection && (
            <button
              className="rounded-lg bg-slate-300 py-1 px-3 font-medium text-slate-800"
              type="button"
              onClick={() => setAddingCorrection(true)}
            >
              Add Correction
            </button>
          )}

          {/* Show add correction section if addingCorrection */}
          {addingCorrection && (
            <div>
              <AudioInput onSubmit={submitCorrection} />
              <button type="button" onClick={() => setAddingCorrection(false)}>
                Cancel
              </button>
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
