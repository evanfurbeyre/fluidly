import axios from "axios"
import { trpc } from "../utils/trpc"
import { ResponseWithRelations } from "../utils/types"
import Audio from "./Audio"
import AudioInput from "./AudioInput"

type Props = {
  response: ResponseWithRelations
  refetchResponse: () => void
}

const InputScreen = (props: Props) => {
  const { response, refetchResponse } = props
  const addResponseAudio = trpc.response.addResponseAudio.useMutation()
  const responseAudioUploadQry = trpc.response.getAudioUploadUrl.useQuery()

  if (responseAudioUploadQry.isLoading) {
    return <></>
  }

  const { url: resUrl, key: resKey } = responseAudioUploadQry.data ?? {}

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

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="flex grow items-center text-center">
        <div className="flex max-w-md flex-col gap-12">
          <h1 className="text-2xl">{response.prompt.prompt}</h1>
          {response.audio?.audioUrl && (
            <>
              <Audio src={response.audio.audioUrl} />
              <div className="text-xs">
                Thanks for your submission! <br /> You&apos;ll be notified when feedback is ready.
              </div>
            </>
          )}
        </div>
      </div>
      {!response.audio?.audioUrl && (
        <div className="fixed bottom-0 w-screen bg-white">
          <AudioInput onSubmit={submitResponseAudio} />
        </div>
      )}
    </div>
  )
}

export default InputScreen
