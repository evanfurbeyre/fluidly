import { useContext, useState } from "react"
import { AdminContext } from "../pages/_app"
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
  const { adminMode } = useContext(AdminContext)

  return (
    <div>
      <div className="rounded-2xl bg-stone-200">
        {audio?.audioUrl && <Audio src={audio.audioUrl} withOptions />}
        {diff.length > 0 && (
          <div className="py-2 px-4">
            <DiffBlock diff={diff} />
          </div>
        )}
      </div>

      {!addingDiff && adminMode && (
        <button
          type="button"
          onClick={() => setAddingDiff(true)}
          className="btn btn-primary btn-sm float-right mt-1"
        >
          Add text
        </button>
      )}

      {addingDiff && (
        <DiffInput
          correctionId={id}
          onSubmit={() => {
            setAddingDiff(false)
            refetchResponse()
          }}
          onCancel={() => {
            setAddingDiff(false)
          }}
        />
      )}
    </div>
  )
}

export default Correction
