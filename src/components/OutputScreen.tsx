import { MicrophoneIcon, PencilSquareIcon } from "@heroicons/react/24/solid"
import { useContext, useState } from "react"
import { AdminContext } from "../pages/_app"
import { trpc } from "../utils/trpc"
import { ResponseWithRelations } from "../utils/types"
import Audio from "./Audio"
import AudioInput from "./AudioInput"
import Correction from "./Correction"
import DiffInput from "./DiffInput"

type Props = {
  response: ResponseWithRelations
  refetchResponse: () => void
}

const OutputScreen = ({ response, refetchResponse }: Props) => {
  const { adminMode } = useContext(AdminContext)
  const [addingFeedback, setAddingFeedback] = useState(false)
  const [addingCorrection, setAddingCorrection] = useState(false)
  const [addingTextFeedback, setAddingTextFeedback] = useState(false)
  const [addingTextCorrection, setAddingTextCorrection] = useState(false)
  const [feedbackText, setFeedbackText] = useState(response.feedbackText || "")

  const addCorrection = trpc.correction.create.useMutation()
  const addResponseFeedback = trpc.response.addResponseFeedback.useMutation()
  const addResponseFeedbackText = trpc.response.addResponseFeedbackText.useMutation()
  const deleteFeedback = trpc.response.deleteFeedbackAudio.useMutation()

  const submitCorrection = async (key: string) => {
    addCorrection.mutate(
      {
        key: key,
        responseId: response.id,
        language: response.prompt.language,
      },
      {
        onSettled: () => {
          refetchResponse()
          setAddingCorrection(false)
        },
      },
    )
  }

  const submitFeedback = async (key: string) => {
    addResponseFeedback.mutate(
      {
        key: key,
        responseId: response.id,
        language: response.prompt.language,
      },
      {
        onSettled: () => {
          refetchResponse()
          setAddingFeedback(false)
        },
      },
    )
  }

  const submitTextFeedback = async (text: string) => {
    addResponseFeedbackText.mutate(
      {
        responseId: response.id,
        text,
      },
      {
        onSettled: () => {
          refetchResponse()
          setAddingTextFeedback(false)
        },
      },
    )
  }

  const submitTextCorrection = async () => {
    // actual mutation happens in DiffInput
    setTimeout(() => {
      refetchResponse()
      setAddingTextCorrection(false)
    }, 1000) // hack... refetching right away doesn't return with response audio
  }

  return (
    <div className="container mx-auto flex flex-col items-center justify-center p-6">
      <div className="flex w-full flex-col gap-4 sm:w-96">
        <h1 className="w-full text-center text-2xl">{response.prompt.prompt}</h1>
        {response.audio?.audioUrl && <Audio src={response.audio.audioUrl} />}
        <div className="mt-5 flex w-full flex-row items-center justify-between">
          {(adminMode || response.corrections.length) && <h2 className="text-lg">Corrections</h2>}
          {adminMode && (
            <div>
              <button
                type="button"
                onClick={() => setAddingCorrection(true)}
                className="btn-outline btn-primary btn-sm btn mr-4"
              >
                <MicrophoneIcon className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={() => setAddingTextCorrection(true)}
                className="btn-outline btn-primary btn-sm btn"
              >
                <PencilSquareIcon className="h-6 w-6" />
              </button>
            </div>
          )}
        </div>
        {response.corrections.map((cor) => (
          <Correction key={cor.id} correction={cor} refetchResponse={refetchResponse} />
        ))}
        <div className="mt-5 flex w-full flex-row items-center justify-between">
          {(adminMode || response.feedback?.audioUrl || feedbackText) && (
            <h2 className="text-lg">Feedback</h2>
          )}
          {adminMode && (
            <div>
              <button
                type="button"
                onClick={() => setAddingFeedback(true)}
                className="btn-outline btn-primary btn-sm btn mr-4"
              >
                <MicrophoneIcon className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={() => setAddingTextFeedback(true)}
                className="btn-outline btn-primary btn-sm btn"
              >
                <PencilSquareIcon className="h-6 w-6" />
              </button>
            </div>
          )}
        </div>
        {response.feedback?.audioUrl && (
          <div>
            <Audio src={response.feedback.audioUrl} />
            {adminMode && (
              <button
                type="button"
                className="btn-outline btn-primary btn-xs btn float-right mt-1"
                onClick={() => deleteFeedback.mutate({ id: response.id })}
              >
                Delete feedback audio
              </button>
            )}
          </div>
        )}
        {!addingTextFeedback && <div className="text-center">{feedbackText}</div>}
        {addingTextFeedback && (
          <form className="flex w-full flex-col gap-2 pt-4">
            <textarea
              className="textarea-primary textarea w-full"
              defaultValue={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="btn-outline btn-error btn-sm btn"
                onClick={() => {
                  setAddingTextFeedback(false)
                  setFeedbackText("")
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary btn-sm btn"
                onClick={() => {
                  submitTextFeedback(feedbackText)
                  setAddingTextFeedback(false)
                }}
              >
                Submit
              </button>
            </div>
          </form>
        )}
      </div>

      {addingCorrection && (
        <div className="fixed bottom-0 w-screen bg-white">
          <AudioInput onSubmit={submitCorrection} onCancel={() => setAddingCorrection(false)} />
        </div>
      )}
      {addingTextCorrection && (
        <div className="fixed bottom-0 w-screen bg-white">
          <DiffInput
            responseId={response.id}
            onSubmit={submitTextCorrection}
            onCancel={() => setAddingTextCorrection(false)}
          />
        </div>
      )}
      {addingFeedback && (
        <div className="fixed bottom-0 w-screen bg-white">
          <AudioInput onSubmit={submitFeedback} onCancel={() => setAddingFeedback(false)} />
        </div>
      )}
    </div>
  )
}

export default OutputScreen
