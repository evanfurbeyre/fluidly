import { DiffFragment } from "@prisma/client"

type Props = {
  diff: DiffFragment[]
}

const DiffBlock = (props: Props) => {
  const { diff } = props

  return (
    <p className="leading-8">
      {diff.map(({ content, type }, index) => {
        switch (type) {
          case "addition":
            return (
              <>
                <span key={index} className="rounded bg-green-200 font-medium text-green-800">
                  {content}
                </span>
                <span> </span>
              </>
            )
          case "deletion":
            return (
              <>
                <span
                  key={index}
                  className="rounded bg-red-200 font-medium text-red-800 line-through"
                >
                  {content}
                </span>
                <span> </span>
              </>
            )
          default:
            return (
              <>
                <span key={index}>{content}</span>
                <span> </span>
              </>
            )
        }
      })}
    </p>
  )
}

export default DiffBlock
