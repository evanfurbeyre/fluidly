import { InformationCircleIcon } from "@heroicons/react/24/solid"
import { Language } from "@prisma/client"
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
  const targetLang = response.user.targetLang as Language
  const nativeLang = response.user.nativeLang as Language

  const submitResponseAudio = async (key: string) => {
    addResponseAudio.mutate(
      {
        key: key,
        responseId: response.id,
        language: targetLang,
      },
      {
        onSettled: () => refetchResponse(),
      },
    )
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col items-center justify-center">
      <div className="flex max-w-md flex-col gap-12">
        <h1 className="text-center text-2xl">
          <span className="tooltip" data-tip={response.prompt[nativeLang]}>
            <InformationCircleIcon className="float-right h-6 w-6 fill-gray-400 pb-2" />
            {response.prompt[targetLang]}
          </span>
        </h1>
        {response.audio?.audioUrl && (
          <>
            <Audio src={response.audio.audioUrl} />
            <div className="text-center text-xs">
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
