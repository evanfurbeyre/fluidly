import { z } from "zod"
import { publicProcedure, router } from "../trpc"

export const promptRouter = router({
  create: publicProcedure
    .input(
      z.object({
        en: z.string(),
        es: z.string(),
        fr: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.prompt.create({ data: input })
    }),

  findUnique: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return ctx.prisma.prompt.findUnique({ where: { id: input.id } })
    }),

  findMany: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.prompt.findMany()
  }),
})
