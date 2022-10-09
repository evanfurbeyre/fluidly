import { Audio, DiffFragment } from "@prisma/client"

type Props = {
  audio: Audio
  diff: DiffFragment[]
}

const Correction = (props: Props) => {
  const { audio, diff } = props

  return (
    <>
      {audio.audioUrl && (
        <audio src={audio.audioUrl} controls className="w-full">
          <source />
        </audio>
      )}
      {diff.map(({ content, type }, index) => {
        switch (type) {
          case "addition":
            return (
              <span key={index} className="mx-1 rounded bg-green-100 font-medium text-green-700">
                {content}
              </span>
            )
          case "deletion":
            return (
              <span key={index} className="mx-1 rounded bg-red-100 font-medium text-red-700">
                {content}
              </span>
            )
          default:
            return <span key={index}>{content}</span>
        }
      })}
    </>
  )
}

export default Correction
