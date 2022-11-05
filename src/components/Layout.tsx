import { ReactElement } from "react"
import NavBar from "./Navbar"

type Props = { children: ReactElement }

export default function Layout({ children }: Props) {
  return (
    <div className="flex h-screen w-screen flex-col items-center">
      <NavBar />
      {children}
    </div>
  )
}
