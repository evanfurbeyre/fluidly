import { CheckIcon } from "@heroicons/react/24/solid"
import { useState } from "react"
import Audio from "./Audio"

const getRecorder = async () => {
  if (typeof window === "undefined") return null
  const stream = await window.navigator.mediaDevices.getUserMedia({ audio: true })
  return new MediaRecorder(stream)
}

let recorder: MediaRecorder | undefined | null
let chunks: Blob[] = []
let blob: Blob

type Props = {
  onSubmit: (b: Blob) => Promise<void>
  onCancel?: () => void
}

const AudioInput = ({ onSubmit, onCancel }: Props) => {
  const [audioURL, setAudioURL] = useState<string>()
  const [recording, setRecording] = useState(false)
  const [audioDuration, setAudioDuration] = useState(0)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleStart = async () => {
    setRecording(true)
    recorder = await getRecorder()
    if (!recorder) return null
    recorder.ondataavailable = (e) => chunks.push(e.data)
    recorder.onstop = async () => {
      blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" })
      setAudioURL(window.URL.createObjectURL(blob))
      setRecording(false)
    }
    recorder.start()
  }

  const handleStop = async () => {
    recorder?.stop()
  }

  const handleReset = () => {
    chunks = []
    setAudioURL("")
  }

  const handleSubmit = async () => {
    setLoading(true)
    await onSubmit(blob)
    setLoading(false)
    setSuccess(true)
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 ring-4 ring-slate-300">
      {!audioURL && (
        <>
          {recording && <p className="mb-2">{audioDuration.toFixed(2)}</p>}
          <button
            type="button"
            onClick={!recording ? handleStart : handleStop}
            className={`flex h-14 w-14 items-center justify-center rounded-full ${
              recording ? "ring-2 ring-slate-300" : "bg-red-500"
            }`}
          >
            {recording && <div className={"h-8 w-8 rounded-lg bg-red-600"} />}
          </button>
        </>
      )}
      {audioURL && (
        <div>
          <Audio src={audioURL} />
          <div className={`mt-2 flex flex-row justify-around`}>
            <button
              type="button"
              disabled={recording || !audioURL}
              className="btn btn-outline w-28"
              onClick={handleReset}
            >
              Discard
            </button>
            <button
              type="button"
              disabled={recording || !audioURL}
              className={`btn w-28 ${loading && "loading"}`}
              onClick={handleSubmit}
            >
              {success ? <CheckIcon className="h-6 w-6" /> : "Submit"}
            </button>
          </div>
        </div>
      )}
      {onCancel && (
        <button className="absolute top-0 right-2" onClick={onCancel}>
          X
        </button>
      )}
    </div>
  )
}

export default AudioInput
