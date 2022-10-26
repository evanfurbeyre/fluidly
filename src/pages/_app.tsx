import type { Session } from "next-auth"
import { SessionProvider } from "next-auth/react"
import type { AppType } from "next/app"
import React, { useState } from "react"
import Layout from "../components/Layout"
import "../styles/globals.css"
import { trpc } from "../utils/trpc"

export const AdminContext = React.createContext({
  adminMode: false,
  setAdminMode: (() => null) as (value: boolean) => void, // todo: clean up typescript here
})

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const [adminMode, setAdminMode] = useState(false)
  return (
    <SessionProvider session={session}>
      <AdminContext.Provider value={{ adminMode, setAdminMode }}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AdminContext.Provider>
    </SessionProvider>
  )
}

export default trpc.withTRPC(MyApp)
