import { InformationCircleIcon } from "@heroicons/react/24/solid"
import { Language } from "@prisma/client"
import { useState } from "react"
import { trpc } from "../utils/trpc"
import { ResponseWithRelations } from "../utils/types"
import Audio from "./Audio"
import AudioInput from "./AudioInput"
import InstructionsModal from "./InstructionsModal"
import WelcomeModal from "./WelcomeModal"

type Props = {
  response: ResponseWithRelations
  refetchResponse: () => void
}

const InputScreen = (props: Props) => {
  const { response, refetchResponse } = props
  const [showWelcomeModal, setShowWelcomeModal] = useState(response.user.needsWelcome)
  const [showInstructionsModal, setShowInstructionsModal] = useState(false)
  const addResponseAudio = trpc.response.addResponseAudio.useMutation()
  const nativeLanguage = response.user.nativeLanguage as Language
  const updateUser = trpc.user.update.useMutation()

  const submitResponseAudio = async (key: string) => {
    addResponseAudio.mutate(
      {
        key: key,
        responseId: response.id,
        language: response.language,
      },
      {
        onSettled: () => refetchResponse(),
      },
    )
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col items-center justify-center">
      <div className="flex max-w-md flex-col gap-12">
        <div className="flex flex-col items-center px-4">
          <span className="tooltip" data-tip={response.prompt[nativeLanguage]}>
            <InformationCircleIcon className="h-4 w-4 fill-gray-400" />
          </span>
          <h1 className="text-center text-2xl">{response.prompt[response.language]}</h1>
        </div>
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
      {showWelcomeModal && (
        <WelcomeModal
          onClose={() => {
            setShowWelcomeModal(false)
            setShowInstructionsModal(true)
          }}
        />
      )}
      {showInstructionsModal && (
        <InstructionsModal
          onClose={() => {
            setShowInstructionsModal(false)
            updateUser.mutate({
              id: response.userId,
              data: { needsWelcome: false },
            })
          }}
        />
      )}
    </div>
  )
}

export default InputScreen
