import { z } from "zod"
import { publicProcedure, router } from "../trpc"

export const userRouter = router({
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.user.create({
        data: {
          name: input.name,
        },
      })
    }),

  findUnique: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return ctx.prisma.user.findUnique({ where: { id: input.id } })
    }),

  findMany: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany()
  }),
})
