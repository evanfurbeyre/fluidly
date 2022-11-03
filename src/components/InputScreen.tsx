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

  const submitResponseAudio = async (key: string) => {
    addResponseAudio.mutate(
      {
        key: key,
        responseId: response.id,
        language: response.prompt.language,
      },
      {
        onSettled: () => refetchResponse(),
      },
    )
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col items-center justify-center">
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
      {!response.audio?.audioUrl && (
        <div className="fixed bottom-0 w-screen bg-white">
          <AudioInput onSubmit={submitResponseAudio} />
        </div>
      )}
    </div>
  )
}

export default InputScreen
