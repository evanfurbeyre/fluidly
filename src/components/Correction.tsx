import { useContext, useState } from "react"
import { AdminContext } from "../pages/_app"
import { trpc } from "../utils/trpc"
import { CorrectionWithRelations } from "../utils/types"
import Audio from "./Audio"
import DiffBlock from "./DiffBlock"
import DiffInput from "./DiffInput"

type CorrectionProps = {
  responseId: string
  correction: CorrectionWithRelations
  refetchResponse: () => void
}

const Correction = ({ correction, refetchResponse, responseId }: CorrectionProps) => {
  const { id, audio, diff } = correction
  const [addingDiff, setAddingDiff] = useState(false)
  const { adminMode } = useContext(AdminContext)
  const deleteCorrection = trpc.correction.deleteCorrection.useMutation({
    onSettled: refetchResponse,
  })

  return (
    <div className="flex flex-col">
      <div className="rounded-2xl bg-stone-200">
        {audio?.audioUrl && <Audio src={audio.audioUrl} withOptions />}
        {diff.length > 0 && (
          <div className="py-2 px-4">
            <DiffBlock diff={diff} />
          </div>
        )}
      </div>

      {!addingDiff && adminMode && (
        <div className="mt-1 flex gap-1 self-end">
          <button
            type="button"
            onClick={() => deleteCorrection.mutate({ id })}
            className="btn-outline btn-primary btn-xs btn"
          >
            Delete correction
          </button>
          <button
            type="button"
            onClick={() => setAddingDiff(true)}
            className="btn-outline btn-primary btn-xs btn"
          >
            Add text
          </button>
        </div>
      )}

      {addingDiff && (
        <DiffInput
          correctionId={id}
          responseId={responseId}
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
