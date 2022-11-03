import { XMarkIcon } from "@heroicons/react/24/solid"
import { DiffFragment, DiffType } from "@prisma/client"
import { NextPage } from "next"
import { useState } from "react"
import { trpc } from "../utils/trpc"
import DiffBlock from "./DiffBlock"

type Props = {
  correctionId?: string
  responseId?: string
  onSubmit: () => void
  onCancel?: () => void
}

type DiffFrag = {
  type: DiffType
  content: string
}

const defaultDiffFrag: DiffFrag = {
  type: "original",
  content: "",
}

const DiffInput: NextPage<Props> = ({ correctionId, responseId, onSubmit, onCancel }) => {
  const addDiffFragments = trpc.correction.addDiffFragments.useMutation()
  const addTextCorrection = trpc.correction.createTextOnlyCorrection.useMutation()

  const [diffFrag, setDiffFrag] = useState<DiffFrag>(defaultDiffFrag)
  const [result, setResult] = useState<DiffFrag[]>([])

  return (
    <div className="relative mt-4 flex flex-col rounded-lg border-2 bg-gray-100 p-4">
      <h1>Create Diff</h1>
      <textarea
        value={diffFrag.content}
        placeholder="Enter correction fragment here..."
        className="my-2 w-full rounded-lg border-2 p-4 text-sm"
        onChange={(e) => setDiffFrag((d) => ({ ...d, content: e.target.value }))}
      ></textarea>
      <div className="my-2 flex w-full items-center justify-between">
        <div className="btn-group">
          <div
            // type="radio"
            // id="original"
            // name="diffType"
            // value="original"
            className="btn btn-xs"
            // data-title="original"
            // checked={diffFrag.type === "original"}
            // onChange={(e) => setDiffFrag((d) => ({ ...d, type: e.target.value as DiffType }))}
          >
            Original
          </div>
          <div
            // type="radio"
            // id="addition"
            // name="diffType"
            // value="addition"
            className="btn btn-xs"
            // data-title="addition"
            // checked={diffFrag.type === "addition"}
            // onChange={(e) => setDiffFrag((d) => ({ ...d, type: e.target.value as DiffType }))}
          >
            Addition
          </div>
          <div
            // type="radio"
            // id="deletion"
            // name="diffType"
            // value="deletion"
            className="btn btn-xs"
            // data-title="deletion"
            // checked={diffFrag.type === "deletion"}
            // onChange={(e) => setDiffFrag((d) => ({ ...d, type: e.target.value as DiffType }))}
          >
            Deletion
          </div>
        </div>
        <button
          className="btn-outline btn btn-primary btn-sm mr-2"
          onClick={() => {
            if (diffFrag.content === "") return
            setResult((r) => [...r, diffFrag])
            setDiffFrag(defaultDiffFrag)
          }}
        >
          Add
        </button>
      </div>

      <h1>Result:</h1>
      <div className="my-2 w-full rounded-lg border-2 bg-white p-4">
        <DiffBlock diff={result as DiffFragment[]} />
      </div>
      <div className="self-end">
        {Boolean(result.length) && (
          <button className="btn-outline btn btn-error btn-sm mr-2" onClick={() => setResult([])}>
            Start over
          </button>
        )}
        <button
          onClick={() => {
            if (correctionId) {
              addDiffFragments.mutate({ correctionId, diff: result })
            } else if (responseId) {
              addTextCorrection.mutate({ diff: result, responseId })
            }
            setTimeout(onSubmit, 1000)
          }}
          className="btn btn-primary btn-sm mr-2"
        >
          Submit
        </button>
      </div>
      {onCancel && (
        <div className="absolute top-2 right-2">
          <button className=" btn btn-ghost btn-square btn-xs" onClick={onCancel}>
            <XMarkIcon />
          </button>
        </div>
      )}
    </div>
  )
}

export default DiffInput
