import axios from "axios"
import type { GetStaticProps, NextPage } from "next"
import Head from "next/head"
import { useState } from "react"
import Audio from "../../components/Audio"
import AudioInput from "../../components/AudioInput"
import Correction from "../../components/Correction"
import { prisma } from "../../server/db/client"
import { trpc } from "../../utils/trpc"

type Props = {
  id: string
}

const Response: NextPage<Props> = ({ id }) => {
  const [addingCorrection, setAddingCorrection] = useState(false)
  const getResponseQry = trpc.response.findUnique.useQuery({ id })
  const correctionAudioUploadQry = trpc.response.getAudioUploadUrl.useQuery()
  const addCorrection = trpc.correction.create.useMutation()

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

  return (
    <>
      <Head>
        <title>Speaking Correction</title>
        <meta name="description" content="language learning tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container mx-auto flex items-center justify-center p-6">
        <div className="flex w-full flex-col items-stretch gap-4 sm:w-96">
          <h1 className="text-2xl">{response.prompt.prompt}</h1>

          {hasAudio ? (
            <Audio src={response.audio?.audioUrl as string} />
          ) : (
            <p>User has not submitted audio yet.</p>
          )}

          <div className="mt-5 flex w-full flex-row items-center justify-between">
            <h2 className="text-lg">Corrections</h2>
            <button
              type="button"
              onClick={() => setAddingCorrection(true)}
              className="btn-outline btn btn-primary btn-sm"
            >
              Add Correction
            </button>
          </div>

          {addingCorrection && (
            <div className="absolute left-0 bottom-0 w-screen">
              <AudioInput onSubmit={submitCorrection} onCancel={() => setAddingCorrection(false)} />
            </div>
          )}

          {hasCorrections && (
            <>
              {response.corrections.map((cor) => (
                <Correction key={cor.id} correction={cor} />
              ))}
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
