import { DiffFragment, DiffType } from "@prisma/client"
import { NextPage } from "next"
import { useState } from "react"
import { trpc } from "../utils/trpc"
import DiffBlock from "./DiffBlock"

type Props = {
  correctionId: string
  onSubmit: () => void
}

type DiffFrag = {
  type: DiffType
  content: string
}

const defaultDiffFrag: DiffFrag = {
  type: "original",
  content: "",
}

const DiffInput: NextPage<Props> = ({ correctionId, onSubmit }) => {
  const addDiffFragments = trpc.correction.addDiffFragments.useMutation()
  const [diffFrag, setDiffFrag] = useState<DiffFrag>(defaultDiffFrag)
  const [result, setResult] = useState<DiffFrag[]>([])

  return (
    <div className="mt-4 flex flex-col rounded-lg border-2 bg-gray-100 p-4">
      <h1>Create Diff</h1>
      <textarea
        value={diffFrag.content}
        placeholder="Enter correction fragment here..."
        className="my-2 w-full rounded-lg border-2 p-4 text-sm"
        onChange={(e) => setDiffFrag((d) => ({ ...d, content: e.target.value }))}
      ></textarea>
      <div className="my-2 flex w-full flex-row items-center justify-between">
        <div className="btn-group">
          <input
            type="radio"
            id="original"
            name="diffType"
            value="original"
            className="btn btn-xs"
            data-title="original"
            checked={diffFrag.type === "original"}
            onChange={(e) => setDiffFrag((d) => ({ ...d, type: e.target.value as DiffType }))}
          />
          <input
            type="radio"
            id="addition"
            name="diffType"
            value="addition"
            className="btn btn-xs"
            data-title="addition"
            checked={diffFrag.type === "addition"}
            onChange={(e) => setDiffFrag((d) => ({ ...d, type: e.target.value as DiffType }))}
          ></input>
          <input
            type="radio"
            id="deletion"
            name="diffType"
            value="deletion"
            className="btn btn-xs"
            data-title="deletion"
            checked={diffFrag.type === "deletion"}
            onChange={(e) => setDiffFrag((d) => ({ ...d, type: e.target.value as DiffType }))}
          />
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
        <button className="btn-outline btn btn-error btn-sm mr-2" onClick={() => setResult([])}>
          Start over
        </button>
        <button
          onClick={() => {
            addDiffFragments.mutate({ correctionId, diff: result })
            setTimeout(onSubmit, 1000)
          }}
          className="btn btn-primary btn-sm mr-2"
        >
          Submit
        </button>
      </div>
    </div>
  )
}

export default DiffInput
