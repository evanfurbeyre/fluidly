import Audio from "./Audio"
import AudioInput from "./AudioInput"

type Props = {
  audioUrl: string | null | undefined
  prompt: string
  submitResponseAudio: (b: Blob) => Promise<void>
}

const InputScreen = (props: Props) => {
  const { audioUrl, prompt, submitResponseAudio } = props
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="flex grow items-center text-center">
        <div className="flex max-w-md flex-col gap-12">
          <h1 className="text-2xl">{prompt}</h1>
          {audioUrl && (
            <>
              <Audio src={audioUrl} />
              <div className="text-xs">
                Thanks for your submission! <br /> You&apos;ll be notified when feedback is ready.
              </div>
            </>
          )}
        </div>
      </div>
      {!audioUrl && (
        <div className="fixed bottom-0 w-screen bg-white">
          <AudioInput onSubmit={submitResponseAudio} />
        </div>
      )}
    </div>
  )
}

export default InputScreen
