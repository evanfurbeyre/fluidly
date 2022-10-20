import { Audio, DiffFragment } from "@prisma/client"

type Props = {
  audio: Audio
  diff: DiffFragment[]
}

const Correction = (props: Props) => {
  const { audio, diff } = props

  return (
    <div>
      {audio.audioUrl && (
        <audio src={audio.audioUrl} controls className="w-full rounded-lg">
          <source />
        </audio>
      )}
      <div className="mt-8 rounded-2xl bg-stone-100 py-4 px-5">
        <p className="leading-8">
          {diff.map(({ content, type }, index) => {
            switch (type) {
              case "addition":
                return (
                  <span
                    key={index}
                    className="rounded bg-green-100 px-1 font-medium text-green-700 first:pl-0 last:pr-0"
                  >
                    {content}
                  </span>
                )
              case "deletion":
                return (
                  <span
                    key={index}
                    className="rounded bg-red-100 px-1 font-medium text-red-700 first:pl-0 last:pr-0"
                  >
                    {content}
                  </span>
                )
              default:
                return (
                  <span key={index} className="px-1 first:pl-0 last:pr-0">
                    {content}
                  </span>
                )
            }
          })}
        </p>
      </div>
    </div>
  )
}

export default Correction
