import { useSession } from "next-auth/react"
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid"

type Props = {
  src: string
  withOptions?: boolean
}

const Audio = (props: Props) => {
  const { src, withOptions } = props
  const { data: session } = useSession()

  return (
    <div className="flex">
      <audio src={src} className="w-full rounded-2xl" controls />
      {/* {session && withOptions && (
        <div className="flex w-12 grow-0 items-center justify-center">
          <div className="dropdown-end dropdown">
            <button tabIndex={0} className="">
              <EllipsisVerticalIcon className="h-6 w-6" />
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
      )} */}
    </div>
  )
}

export default Audio
