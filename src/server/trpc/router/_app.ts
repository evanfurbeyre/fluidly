// src/server/trpc/router/_app.ts
import { router } from "../trpc"
import { responseRouter } from "./response"
import { authRouter } from "./auth"

export const appRouter = router({
  response: responseRouter,
  auth: authRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
