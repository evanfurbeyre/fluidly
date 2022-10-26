import { Bars3Icon } from "@heroicons/react/24/solid"
import Link from "next/link"
import React, { useContext } from "react"
import { AdminContext } from "../pages/_app"

const NavBar = () => {
  const { adminMode, setAdminMode } = useContext(AdminContext)

  return (
    <div className="navbar sticky top-0 border-b-2 bg-base-100">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn-ghost btn-circle btn">
            <Bars3Icon className="h-6 w-6" />
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu rounded-box menu-compact mt-3 w-52 bg-base-100 p-2 shadow"
          >
            <li>
              <Link href={"/admin"}>Admin Page</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="navbar-center">
        <a className="btn-ghost btn text-xl normal-case">fluidly</a>
      </div>
      <div className="navbar-end">
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
      </div>
    </div>
  )
}

export default NavBar
