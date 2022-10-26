import { ReactElement } from "react"
import NavBar from "./Navbar"

type Props = { children: ReactElement }

export default function Layout({ children }: Props) {
  return (
    <>
      <NavBar />
      <div className="pb-28">
        <main>{children}</main>
      </div>
    </>
  )
}
