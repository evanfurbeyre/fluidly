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
              <span
                key={index}
                className="rounded border-2 border-green-500 bg-green-100 px-1 font-medium text-green-700 first:pl-0 last:pr-0"
              >
                {content}
              </span>
            )
          case "deletion":
            return (
              <span
                key={index}
                className="rounded border-2 border-red-500 bg-red-100 px-1 font-medium text-red-700 first:pl-0 last:pr-0"
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
  )
}

export default DiffBlock
