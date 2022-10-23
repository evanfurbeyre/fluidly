import { useSession } from "next-auth/react"
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid"

type Props = {
  src: string
}

const Audio = (props: Props) => {
  const { src } = props
  const { data: session } = useSession()

  return (
    <div className="flex bg-slate-500">
      <audio src={src} className="" controls />
      {session && (
        <div className="flex w-12 items-center justify-center">
          <div className="dropdown-end dropdown">
            <button tabIndex={0} className="text-white">
              <EllipsisVerticalIcon className="h-6 w-6 text-white" />
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content menu rounded-box w-52 bg-base-100 p-2 shadow"
            >
              <li>
                <a>Re-Record</a>
              </li>
              <li>
                <a>Add Text</a>
              </li>
              <li>
                <a>Delete</a>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

Audio.defaultProps = {
  options: false,
}

export default Audio
