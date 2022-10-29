import { MicrophoneIcon, PencilSquareIcon } from "@heroicons/react/24/solid"
import axios from "axios"
import type { GetStaticProps, NextPage } from "next"
import Head from "next/head"
import { useContext, useState } from "react"
import Audio from "../components/Audio"
import AudioInput from "../components/AudioInput"
import Correction from "../components/Correction"
import DiffInput from "../components/DiffInput"
import { prisma } from "../server/db/client"
import { trpc } from "../utils/trpc"
import { AdminContext } from "./_app"

type Props = {
  id: string
}

const Response: NextPage<Props> = ({ id }) => {
  const getResponseQry = trpc.response.findUnique.useQuery({ id })
  const addResponseAudio = trpc.response.addResponseAudio.useMutation()
  const responseAudioUploadQry = trpc.response.getAudioUploadUrl.useQuery()
  const correctionAudioUploadQry = trpc.response.getAudioUploadUrl.useQuery()
  const addCorrection = trpc.correction.create.useMutation()
  const [addingCorrection, setAddingCorrection] = useState(false)
  const [addingTextCorrection, setAddingTextCorrection] = useState(false)
  const { adminMode } = useContext(AdminContext)

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
    setTimeout(() => {
      refetchResponse()
      setAddingCorrection(false)
    }, 1000) // hack... refetching right away doesn't return with response audio
  }

  const submitTextCorrection = async () => {
    // addCorrection.mutate({
    //   key: corKey,
    //   responseId: response.id,
    //   language: response.prompt.language,
    // })
    setTimeout(() => {
      refetchResponse()
      setAddingTextCorrection(false)
    }, 1000) // hack... refetching right away doesn't return with response audio
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
        <div className="flex h-[calc(100vh-75px)] flex-col items-center justify-center">
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
            <div className="fixed bottom-0 w-screen bg-white">
              <AudioInput onSubmit={submitResponseAudio} />
            </div>
          )}
        </div>
      )}
      {(adminMode || hasCorrections) && (
        <div className="container mx-auto flex items-center justify-center p-6">
          <div className="flex w-full flex-col gap-4 sm:w-96">
            <h1 className="w-full text-2xl">{response.prompt.prompt}</h1>
            {hasAudio && <Audio src={response.audio?.audioUrl as string} />}
            <div className="mt-5 flex w-full flex-row items-center justify-between">
              <h2 className="text-lg">Corrections</h2>
              {adminMode && (
                <div>
                  <button
                    type="button"
                    onClick={() => setAddingCorrection(true)}
                    className="btn-outline btn btn-primary btn-sm mr-4"
                  >
                    <MicrophoneIcon className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddingTextCorrection(true)}
                    className="btn-outline btn btn-primary btn-sm"
                  >
                    <PencilSquareIcon className="h-6 w-6" />
                  </button>
                </div>
              )}
            </div>
            {response.corrections.map((cor) => (
              <Correction key={cor.id} correction={cor} refetchResponse={refetchResponse} />
            ))}
          </div>
          {addingCorrection && (
            <div className="fixed bottom-0 w-screen bg-white">
              <AudioInput onSubmit={submitCorrection} onCancel={() => setAddingCorrection(false)} />
            </div>
          )}
          {addingTextCorrection && (
            <div className="fixed bottom-0 w-screen bg-white">
              <DiffInput responseId={id} onSubmit={submitTextCorrection} />
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
