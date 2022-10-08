import axios from "axios"
import { useEffect, useState } from "react"
import { trpc } from "../utils/trpc"

const getRecorder = async () => {
  if (typeof window === "undefined") return null
  const stream = await window.navigator.mediaDevices.getUserMedia({ audio: true })
  return new MediaRecorder(stream)
}

let recorder: MediaRecorder | undefined | null
let chunks: Blob[] = []

type Props = {
  id: string
}

const Input = (props: Props) => {
  const { id } = props
  const [audioURL, setAudioURL] = useState<string>()
  const [recording, setRecording] = useState(false)
  const [success, setSuccess] = useState(false)
  const { data: url } = trpc.useQuery(["aws.getUploadUrl", { key: id }])

  const handleStart = async () => {
    setRecording(true)
    recorder = await getRecorder()
    if (!recorder) return null
    recorder.ondataavailable = (e) => chunks.push(e.data)
    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" })
      setAudioURL(window.URL.createObjectURL(blob))
    }
    recorder.start()
  }

  const handleStop = async () => {
    setRecording(false)
    recorder?.stop()
  }

  const handleReset = () => {
    chunks = []
    setAudioURL("")
  }

  const handleSubmit = async () => {
    const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" })
    axios({
      method: "PUT",
      url,
      data: blob,
    }).catch((e) => {
      console.log("Error uploading:", e)
    })
    setSuccess(true)
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-xl p-4 ring-4 ring-slate-300 md:w-96">
      <div className="flex w-full justify-between pb-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full ring-2 ring-slate-200 ring-offset-2">
          <button
            type="button"
            className={
              !recording ? "h-14 w-14 rounded-full bg-red-600" : "h-12 w-12 rounded-xl bg-red-600"
            }
            onClick={!recording ? handleStart : handleStop}
          ></button>
        </div>
        <div className={`${success && "hidden"}`}>
          <button
            type="button"
            disabled={recording || !audioURL}
            className="my-2 w-28 rounded-lg bg-slate-300 font-medium text-slate-900 disabled:bg-slate-200 disabled:text-slate-400"
            onClick={handleReset}
          >
            RESET
          </button>
          <button
            type="button"
            disabled={recording || !audioURL}
            className="my-2 w-28 rounded-lg bg-slate-300 font-medium text-slate-800 disabled:bg-slate-200 disabled:text-slate-400"
            onClick={handleSubmit}
          >
            SUBMIT
          </button>
        </div>
        <span className={`flex items-center justify-center text-green-500 ${!success && "hidden"}`}>
          Audio successfully submitted
        </span>
      </div>
      <audio
        src={audioURL}
        controls
        className={`w-full rounded-lg ${!audioURL && "opacity-50"}`}
      ></audio>
    </div>
  )
}

export default Input
