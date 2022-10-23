import { correctionRouter } from "./correction"
import { promptRouter } from "./prompt"
import { userRouter } from "./user"
// src/server/trpc/router/_app.ts
import { router } from "../trpc"
import { authRouter } from "./auth"
import { responseRouter } from "./response"

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  prompt: promptRouter,
  response: responseRouter,
  correction: correctionRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
