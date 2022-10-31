import axios from "axios"
import type { GetStaticProps, NextPage } from "next"
import Head from "next/head"
import { useContext } from "react"
import InputScreen from "../components/InputScreen"
import OutputScreen from "../components/OutputScreen"
import { prisma } from "../server/db/client"
import { trpc } from "../utils/trpc"
import { AdminContext } from "./_app"

type Props = {
  id: string
}

const Response: NextPage<Props> = ({ id }) => {
  const getResponseQry = trpc.response.findUnique.useQuery({ id })
  const addResponseAudio = trpc.response.addResponseAudio.useMutation()
  const addResponseFeedback = trpc.response.addResponseFeedback.useMutation()
  const addResponseFeedbackText = trpc.response.addResponseFeedbackText.useMutation()
  const responseAudioUploadQry = trpc.response.getAudioUploadUrl.useQuery()
  const correctionAudioUploadQry = trpc.response.getAudioUploadUrl.useQuery()
  const feedbackAudioUploadQry = trpc.response.getAudioUploadUrl.useQuery()
  const addCorrection = trpc.correction.create.useMutation()

  const { adminMode } = useContext(AdminContext)

  if (getResponseQry.isLoading || responseAudioUploadQry.isLoading) {
    return <></>
  }

  const { data: response, refetch: refetchResponse } = getResponseQry
  const { url: resUrl, key: resKey } = responseAudioUploadQry.data ?? {}
  const { url: corUrl, key: corKey } = correctionAudioUploadQry.data ?? {}
  const { url: feedUrl, key: feedKey } = feedbackAudioUploadQry.data ?? {}

  if (!response) {
    throw new Error("no response found")
  }
  if (!resKey || !resUrl || !corKey || !corUrl || !feedKey || !feedUrl) {
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
    addResponseAudio.mutate(
      {
        key: resKey,
        responseId: response.id,
        language: response.prompt.language,
      },
      {
        onSettled: () => refetchResponse(),
      },
    )
  }

  const submitFeedback = async (blob: Blob) => {
    await axios({
      method: "PUT",
      url: feedUrl,
      data: blob,
    }).catch((e) => {
      console.log("Error uploading:", e)
      throw e
    })
    addResponseFeedback.mutate(
      {
        key: feedKey,
        responseId: response.id,
        language: response.prompt.language,
      },
      {
        onSettled: () => refetchResponse,
      },
    )
  }

  const submitCorrection = async (blob: Blob) => {
    await axios({
      method: "PUT",
      url: corUrl,
      data: blob,
    }).catch((e) => {
      console.log("Error uploading:", e)
      throw e
    })
    addCorrection.mutate(
      {
        key: corKey,
        responseId: response.id,
        language: response.prompt.language,
      },
      {
        onSettled: () => refetchResponse,
      },
    )
  }

  const submitTextCorrection = async () => {
    // actual mutation happens in DiffInput
    setTimeout(() => {
      refetchResponse()
    }, 1000) // hack... refetching right away doesn't return with response audio
  }

  const submitTextFeedback = async (text: string) => {
    await addResponseFeedbackText.mutate(
      {
        responseId: response.id,
        text,
      },
      {
        onSettled: () => refetchResponse,
      },
    )
  }

  const hasCorrections = Boolean(response.corrections.length)
  const hasFeedback = Boolean(response.feedback || response.feedbackText)

  return (
    <>
      <Head>
        <title>Speaking Correction</title>
        <meta name="description" content="language learning tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {!hasCorrections && !hasFeedback && !adminMode ? (
        <InputScreen
          audioUrl={response?.audio?.audioUrl}
          prompt={response.prompt.prompt}
          submitResponseAudio={submitResponseAudio}
        />
      ) : (
        <OutputScreen
          responseId={id}
          prompt={response.prompt.prompt}
          admin={adminMode}
          audioUrl={response?.audio?.audioUrl}
          feedbackAudioUrl={response?.feedback?.audioUrl}
          feedbackText={response.feedbackText}
          corrections={response.corrections}
          submitResponseAudio={submitResponseAudio}
          submitCorrection={submitCorrection}
          submitTextCorrection={submitTextCorrection}
          submitFeedback={submitFeedback}
          submitTextFeedback={submitTextFeedback}
          refetchResponse={refetchResponse}
        />
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
