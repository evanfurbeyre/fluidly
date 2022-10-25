import { useState } from "react"
import { CorrectionWithRelations } from "../utils/types"
import Audio from "./Audio"
import DiffBlock from "./DiffBlock"
import DiffInput from "./DiffInput"

type CorrectionProps = {
  correction: CorrectionWithRelations
  refetchResponse: () => void
}

const Correction = ({ correction, refetchResponse }: CorrectionProps) => {
  const { id, audio, diff } = correction
  const [addingDiff, setAddingDiff] = useState(false)

  return (
    <div>
      <div className="rounded-2xl bg-stone-200">
        {audio.audioUrl && <Audio src={audio.audioUrl} withOptions />}
        {diff.length > 0 && (
          <div className="py-2 px-4">
            <DiffBlock diff={diff} />
          </div>
        )}
      </div>

      {!addingDiff && (
        <button
          type="button"
          onClick={() => setAddingDiff(true)}
          className="btn-primary btn-sm btn float-right mt-1"
        >
          Add text
        </button>
      )}

      {addingDiff && (
        <>
          <DiffInput
            correctionId={id}
            onSubmit={() => {
              setAddingDiff(false)
              refetchResponse()
            }}
          />
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
