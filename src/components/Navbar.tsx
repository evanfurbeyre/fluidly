import Link from "next/link"
import { useContext } from "react"
import { AdminContext } from "../pages/_app"
import { signOut, useSession } from "next-auth/react"

const NavBar = () => {
  const { data: session } = useSession()
  const { adminMode, setAdminMode } = useContext(AdminContext)

  if (!session) return <></>

  return (
    <div className="navbar sticky z-50 border-b-2 bg-base-100">
      <div className="navbar-start">
        {session && (
          <div className="pl-2">
            <Link href={"/"}>Admin Page</Link>
          </div>
        )}
      </div>
      <div className="navbar-end mr-6">
        {session && (
          <div className="form-control grow-0">
            <label className="label cursor-pointer">
              <span className="label-text mr-2">Admin?</span>
              <input
                type="checkbox"
                className="toggle-primary toggle toggle-sm"
                checked={adminMode}
                onChange={() => setAdminMode(!adminMode)}
              />
            </label>
          </div>
        )}
      </div>
      <button type="button" className="btn-outline btn btn-sm mr-4" onClick={() => signOut()}>
        Sign out
      </button>
    </div>
  )
}

export default NavBar
