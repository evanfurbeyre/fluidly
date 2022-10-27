import { useSession } from "next-auth/react"
import Link from "next/link"
import { useContext } from "react"
import { AdminContext } from "../pages/_app"

const NavBar = () => {
  const { data: authed } = useSession()
  const { adminMode, setAdminMode } = useContext(AdminContext)

  return (
    <div className="navbar sticky top-0 border-b-2 bg-base-100">
      <div className="navbar-start">
        {authed && (
          <div className="pl-2">
            <Link href={"/admin"}>Admin Page</Link>
          </div>
        )}
      </div>
      <div className="navbar-center">
        <a className="text-xl font-semibold normal-case">fluidly</a>
      </div>
      <div className="navbar-end">
        {authed && (
          <div className="form-control grow-0">
            <label className="label cursor-pointer">
              <span className="label-text mr-4">Admin?</span>
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
    </div>
  )
}

export default NavBar
