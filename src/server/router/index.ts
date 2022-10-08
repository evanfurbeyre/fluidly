// src/server/router/index.ts
import { createRouter } from "./context"
import superjson from "superjson"

import { exampleRouter } from "./example"
import { awsRouter } from "./aws"

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("example.", exampleRouter)
  .merge("aws.", awsRouter)

// export type definition of API
export type AppRouter = typeof appRouter
