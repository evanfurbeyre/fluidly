import axios from "axios"
import type { GetStaticProps, NextPage } from "next"
import { useSession } from "next-auth/react"
import Head from "next/head"
import { useState } from "react"
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
  const correctionAudioUploadQry = trpc.response.getAudioUploadUrl.useQuery()
  const addCorrection = trpc.correction.create.useMutation()
  const { data: session } = useSession()
  const [adminMode, setAdminMode] = useState(false)
  const [addingCorrection, setAddingCorrection] = useState(false)

  if (getResponseQry.isLoading || responseAudioUploadQry.isLoading) {
    return <></>
  }

  const { data: response, refetch: refetchResponse } = getResponseQry
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
    setTimeout(refetchResponse, 1000) // hack... refetching right away doesn't return with response audio
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
    setTimeout(refetchResponse, 1000) // hack... refetching right away doesn't return with response audio
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

      {!hasCorrections && !adminMode && (
        <div className="flex min-h-screen flex-col items-center justify-center">
          {session && (
            <div className="form-control grow-0">
              <label className="label cursor-pointer">
                <span className="label-text mr-4">Admin?</span>
                <input
                  type="checkbox"
                  className="toggle-primary toggle toggle-sm"
                  checked={adminMode}
                  onChange={() => setAdminMode(!adminMode)}
                />
              </label>
            </div>
          )}
          <div className="flex grow items-center text-center">
            <div className="flex max-w-md flex-col gap-12">
              <h1 className="text-2xl">{response.prompt.prompt}</h1>
              {hasAudio && response.audio?.audioUrl && <Audio src={response.audio.audioUrl} />}
              {hasAudio && !hasCorrections && (
                <div className="text-xs">
                  Thanks for your submission! <br /> You&apos;ll be notified when feedback is ready.
                </div>
              )}
            </div>
          </div>
          {!hasAudio && (
            <div className="w-screen grow-0">
              <AudioInput onSubmit={submitResponseAudio} />
            </div>
          )}
        </div>
      )}
      {(adminMode || hasCorrections) && (
        <div className="container mx-auto flex items-center justify-center p-6">
          <div className="flex w-full flex-col gap-4 sm:w-96">
            {session && (
              <div className="form-control grow-0">
                <label className="label cursor-pointer">
                  <span className="label-text mr-4">Admin?</span>
                  <input
                    type="checkbox"
                    className="toggle-primary toggle toggle-sm"
                    checked={adminMode}
                    onChange={() => setAdminMode(!adminMode)}
                  />
                </label>
              </div>
            )}
            <h1 className="w-full text-2xl">{response.prompt.prompt}</h1>
            {hasAudio && <Audio src={response.audio?.audioUrl as string} />}
            <div className="mt-5 flex w-full flex-row items-center justify-between">
              <h2 className="text-lg">Corrections</h2>
              <button
                type="button"
                onClick={() => setAddingCorrection(true)}
                className="btn-outline btn-primary btn-sm btn"
              >
                Add Correction
              </button>
            </div>
            {response.corrections.map((cor) => (
              <Correction key={cor.id} correction={cor} refetchResponse={refetchResponse} />
            ))}
          </div>
          {addingCorrection && (
            <div className="absolute left-0 bottom-0 w-screen">
              <AudioInput onSubmit={submitCorrection} onCancel={() => setAddingCorrection(false)} />
            </div>
          )}
        </div>
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
