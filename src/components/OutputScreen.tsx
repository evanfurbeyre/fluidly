import { MicrophoneIcon, PencilSquareIcon } from "@heroicons/react/24/solid"
import { Audio as AudioType, Correction as CorrectionType, DiffFragment } from "@prisma/client"
import { useState } from "react"
import Audio from "./Audio"
import AudioInput from "./AudioInput"
import Correction from "./Correction"
import DiffInput from "./DiffInput"

type Props = {
  admin: boolean
  prompt: string
  audioUrl: string | null | undefined
  feedbackAudioUrl: string | null | undefined
  corrections: Array<CorrectionType & { audio: AudioType | null; diff: DiffFragment[] }>
  refetchResponse: () => void
  feedbackText: string | null | undefined
  responseId: string
  submitResponseAudio: (b: Blob) => Promise<void>
  submitCorrection: (b: Blob) => Promise<void>
  submitTextCorrection: () => Promise<void>
  submitFeedback: (b: Blob) => Promise<void>
  submitTextFeedback: (t: string) => Promise<void>
}

const OutputScreen = (props: Props) => {
  const {
    prompt,
    audioUrl,
    feedbackAudioUrl,
    corrections,
    refetchResponse,
    responseId,
    submitResponseAudio,
    submitCorrection,
    submitTextCorrection,
    submitFeedback,
    submitTextFeedback,
  } = props
  const [addingCorrection, setAddingCorrection] = useState(false)
  const [addingTextCorrection, setAddingTextCorrection] = useState(false)
  const [addingFeedback, setAddingFeedback] = useState(false)
  const [addingTextFeedback, setAddingTextFeedback] = useState(false)
  const [feedbackText, setFeedbackText] = useState(props.feedbackText || "")

  return (
    <div className="container mx-auto flex flex-col items-center justify-center p-6">
      <div className="flex w-full flex-col gap-4 sm:w-96">
        <h1 className="w-full text-2xl">{prompt}</h1>
        {audioUrl && <Audio src={audioUrl} />}
        <div className="mt-5 flex w-full flex-row items-center justify-between">
          <h2 className="text-lg">Corrections</h2>
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
        </div>
        {corrections.map((cor) => (
          <Correction key={cor.id} correction={cor} refetchResponse={refetchResponse} />
        ))}
        <div className="mt-5 flex w-full flex-row items-center justify-between">
          <h2 className="text-lg">Feedback</h2>
          <div>
            <button
              type="button"
              onClick={() => setAddingFeedback(true)}
              className="btn-outline btn btn-primary btn-sm mr-4"
            >
              <MicrophoneIcon className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => setAddingTextFeedback(true)}
              className="btn-outline btn btn-primary btn-sm"
            >
              <PencilSquareIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
        {feedbackAudioUrl && <Audio src={feedbackAudioUrl as string} />}
        {!addingTextFeedback && <div>{feedbackText}</div>}
      </div>

      {!audioUrl && (
        <div className="fixed bottom-0 w-screen bg-white">
          <AudioInput onSubmit={submitResponseAudio} />
        </div>
      )}
      {addingCorrection && (
        <div className="fixed bottom-0 w-screen bg-white">
          <AudioInput onSubmit={submitCorrection} onCancel={() => setAddingCorrection(false)} />
        </div>
      )}
      {addingTextCorrection && (
        <div className="fixed bottom-0 w-screen bg-white">
          <DiffInput responseId={responseId} onSubmit={submitTextCorrection} />
        </div>
      )}
      {addingFeedback && (
        <div className="fixed bottom-0 w-screen bg-white">
          <AudioInput onSubmit={submitFeedback} onCancel={() => setAddingFeedback(false)} />
        </div>
      )}
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
              className="btn-outline btn btn-error btn-sm"
              onClick={() => {
                setAddingTextFeedback(false)
                setFeedbackText("")
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
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
  )
}

export default OutputScreen
