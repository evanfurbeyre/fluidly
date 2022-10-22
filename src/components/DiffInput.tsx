import { DiffFragment, DiffType } from "@prisma/client"
import { NextPage } from "next"
import { useState } from "react"
import { trpc } from "../utils/trpc"
import DiffBlock from "./DiffBlock"

type Props = {
  correctionId: string
}

type DiffFrag = {
  type: DiffType
  content: string
}

const defaultDiffFrag: DiffFrag = {
  type: "original",
  content: "",
}

const DiffInput: NextPage<Props> = ({ correctionId }) => {
  const addDiffFragments = trpc.response.addDiffFragments.useMutation()
  const [diffFrag, setDiffFrag] = useState<DiffFrag>(defaultDiffFrag)
  const [result, setResult] = useState<DiffFrag[]>([])

  return (
    <div className="mt-4 flex flex-col rounded-lg border-2 bg-gray-100 p-4">
      <h1>Create Diff</h1>
      <textarea
        value={diffFrag.content}
        placeholder="Add a diff fragment here"
        className="my-2 w-full rounded-lg border-2 p-4"
        onChange={(e) => setDiffFrag((d) => ({ ...d, content: e.target.value }))}
      ></textarea>
      <div className="mb-3 flex w-full flex-row justify-between">
        <span>
          <input
            type="radio"
            id="original"
            name="diffType"
            value="original"
            checked={diffFrag.type === "original"}
            onChange={(e) => setDiffFrag((d) => ({ ...d, type: e.target.value as DiffType }))}
          />
          <label className="ml-1">original</label>
        </span>
        <span>
          <input
            type="radio"
            id="addition"
            name="diffType"
            value="addition"
            checked={diffFrag.type === "addition"}
            onChange={(e) => setDiffFrag((d) => ({ ...d, type: e.target.value as DiffType }))}
          ></input>
          <label className="ml-1">addition</label>
        </span>
        <span>
          <input
            type="radio"
            id="deletion"
            name="diffType"
            value="deletion"
            checked={diffFrag.type === "deletion"}
            onChange={(e) => setDiffFrag((d) => ({ ...d, type: e.target.value as DiffType }))}
          />
          <label className="ml-1">deletion</label>
        </span>
      </div>
      <div className="self-end">
        <button
          className=" rounded-lg border-2 border-orange-500 py-1 px-2 text-orange-500"
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
        <button
          className=" mr-2 rounded-lg border-2 border-red-500 py-1 px-2 text-red-500"
          onClick={() => setResult([])}
        >
          Start over
        </button>
        <button
          onClick={() => addDiffFragments.mutate({ correctionId, diff: result })}
          className="rounded-lg bg-orange-400 py-1 px-2 text-white"
        >
          Submit
        </button>
      </div>
    </div>
  )
}

export default DiffInput
