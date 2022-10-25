import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid"
import { useEffect, useState } from "react"
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
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [duration, setDuration] = useState(0)

  const handleStart = async () => {
    recorder = await getRecorder()
    if (!recorder) return null
    recorder.ondataavailable = (e) => chunks.push(e.data)
    recorder.onstop = async () => {
      blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" })
      setAudioURL(window.URL.createObjectURL(blob))
      setRecording(false)
    }
    recorder.start()
    setRecording(true)
  }

  const handleStop = async () => {
    recorder?.stop()
  }

  const handleReset = () => {
    chunks = []
    setAudioURL("")
    setDuration(0)
  }

  const handleSubmit = async () => {
    setLoading(true)
    await onSubmit(blob)
    setLoading(false)
    setSuccess(true)
  }

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined
    if (recording) {
      interval = setInterval(() => {
        setDuration((seconds) => seconds + 0.1)
      }, 100)
    } else if (!recording && duration !== 0) {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [recording, duration])

  return (
    <div className="flex flex-col items-center justify-center p-4 ring-4 ring-slate-300">
      {!audioURL && (
        <>
          {recording && (
            <p className="mb-2">{new Date(duration * 1000).toISOString().slice(15, 21)}</p>
          )}
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
              className="btn-outline btn-error btn w-28"
              onClick={handleReset}
            >
              Discard
            </button>
            <button
              type="button"
              disabled={recording || !audioURL}
              className={`btn-primary btn w-28 ${loading && "loading"}`}
              onClick={handleSubmit}
            >
              {success ? <CheckIcon className="h-6 w-6" /> : loading ? "" : "Submit"}
            </button>
          </div>
        </div>
      )}
      {onCancel && (
        <div className="absolute top-1 right-1">
          <button className="btn-ghost btn-square btn-xs btn" onClick={onCancel}>
            <XMarkIcon />
          </button>
        </div>
      )}
    </div>
  )
}

export default AudioInput
