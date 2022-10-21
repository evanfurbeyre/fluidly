import axios from "axios"
import type { GetStaticProps, NextPage } from "next"
import Head from "next/head"
import { useState } from "react"
import AudioInput from "../../components/AudioInput"
import DiffBlock from "../../components/DiffBlock"
import DiffInput from "../../components/DiffInput"
import { prisma } from "../../server/db/client"
import { trpc } from "../../utils/trpc"

type Props = {
  id: string
}

const Response: NextPage<Props> = ({ id }) => {
  const [addingDiff, setAddingDiff] = useState(false)
  const [addingCorrection, setAddingCorrection] = useState(false)
  const getResponseQry = trpc.useQuery(["response.getResponse", { id }])
  const correctionAudioUploadQry = trpc.useQuery(["response.getAudioUploadUrl"])
  const addCorrection = trpc.useMutation(["response.addCorrection"])

  if (getResponseQry.isLoading || correctionAudioUploadQry.isLoading) {
    return <></>
  }

  const response = getResponseQry.data
  const { url: corUrl, key: corKey } = correctionAudioUploadQry.data ?? {}

  if (!response) {
    throw new Error("no response found")
  }
  if (!corKey || !corUrl) {
    throw new Error("bad upload url")
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
  const correctionId = response.corrections[0]?.id
  const diff = response.corrections[0]?.diff
  const hasDiff = Boolean(diff && diff.length > 0)

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

          {hasAudio ? (
            <audio
              src={response.audio?.audioUrl as string}
              className="w-full rounded-lg"
              controls
            />
          ) : (
            <p>User has not submitted audio yet.</p>
          )}

          {!hasCorrections && !addingCorrection && (
            <button
              type="button"
              onClick={() => setAddingCorrection(true)}
              className="rounded-lg bg-slate-300 py-1 px-3 font-medium text-slate-800"
            >
              Add Correction
            </button>
          )}

          {addingCorrection && (
            <div>
              <AudioInput onSubmit={submitCorrection} />
              <button
                className="float-right mt-3 rounded-lg border-2 px-2 py-1"
                type="button"
                onClick={() => setAddingCorrection(false)}
              >
                Cancel
              </button>
            </div>
          )}

          {hasCorrections && (
            <>
              <h2 className="mt-3">Existing Correction</h2>
              {response.corrections.map((cor) => (
                <>
                  {cor.audio?.audioUrl && (
                    <audio src={cor.audio.audioUrl} controls className="w-full rounded-lg">
                      <source />
                    </audio>
                  )}
                  {cor.diff.length > 0 && (
                    <div className="rounded-2xl bg-stone-100 py-4 px-5">
                      <DiffBlock diff={cor.diff} />
                    </div>
                  )}
                </>
              ))}
            </>
          )}

          {hasCorrections && !hasDiff && !addingDiff && (
            <button
              type="button"
              onClick={() => setAddingDiff(true)}
              className="rounded-lg bg-slate-300 py-1 px-3 font-medium text-slate-800"
            >
              Add Diff
            </button>
          )}

          {addingDiff && correctionId && (
            <>
              <DiffInput correctionId={correctionId} />
              <button
                className="float-right mt-3 rounded-lg border-2 px-2 py-1"
                type="button"
                onClick={() => setAddingDiff(false)}
              >
                Cancel
              </button>
            </>
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
