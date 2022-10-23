import { useState } from "react"
import { CorrectionWithRelations } from "../utils/types"
import DiffBlock from "./DiffBlock"
import DiffInput from "./DiffInput"

type CorrectionProps = { correction: CorrectionWithRelations }

const Correction = ({ correction }: CorrectionProps) => {
  const { id, audio, diff } = correction
  const [addingDiff, setAddingDiff] = useState(false)
  const isAdmin = window.location.href.includes("/admin/") // todo: use more robust admin check

  return (
    <div>
      {audio.audioUrl && (
        <audio src={audio.audioUrl} controls className="w-full rounded-lg">
          <source />
        </audio>
      )}

      {diff.length > 0 && (
        <div className="rounded-2xl bg-stone-100 p-4">
          <DiffBlock diff={diff} />
        </div>
      )}

      {isAdmin && !addingDiff && (
        <button
          type="button"
          onClick={() => setAddingDiff(true)}
          className="float-right rounded-lg border-2 px-2 py-1 text-sm"
        >
          Add text
        </button>
      )}

      {addingDiff && (
        <>
          <DiffInput correctionId={id} />
          <button
            className="float-right rounded-lg border-2 px-2 py-1 text-sm"
            type="button"
            onClick={() => setAddingDiff(false)}
          >
            Cancel
          </button>
        </>
      )}
    </div>
  )
}

export default Correction
