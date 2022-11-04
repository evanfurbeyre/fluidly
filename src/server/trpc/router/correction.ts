import { z } from "zod"
import { publicProcedure, router } from "../trpc"
import { env } from "../../../env/server.mjs"
import { DiffType, Language } from "@prisma/client"

export const correctionRouter = router({
  create: publicProcedure
    .input(
      z.object({
        key: z.string(),
        responseId: z.string(),
        language: z.nativeEnum(Language),
        correctorId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const audio = await ctx.prisma.audio.create({
        data: {
          key: input.key,
          bucket: env.AWS_AUDIO_INPUT_BUCKET,
          language: input.language,
        },
      })
      await ctx.prisma.correction.create({
        data: {
          responseId: input.responseId,
          audioId: audio.id,
        },
      })
      await ctx.prisma.response.update({
        where: { id: input.responseId },
        data: {
          correctorId: input.correctorId,
        },
      })
    }),

  createTextOnlyCorrection: publicProcedure
    .input(
      z.object({
        responseId: z.string(),
        correctorId: z.string(),
        diff: z.array(
          z.object({
            type: z.nativeEnum(DiffType),
            content: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.correction.create({
        data: {
          responseId: input.responseId,
          diff: { createMany: { data: input.diff } },
        },
      })
      await ctx.prisma.response.update({
        where: { id: input.responseId },
        data: {
          correctorId: input.correctorId,
        },
      })
    }),

  addDiffFragments: publicProcedure
    .input(
      z.object({
        correctionId: z.string(),
        correctorId: z.string(),
        responseId: z.string(),
        diff: z.array(
          z.object({
            type: z.nativeEnum(DiffType),
            content: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { correctionId, diff, responseId, correctorId } = input
      await ctx.prisma.correction.update({
        where: { id: correctionId },
        data: { diff: { createMany: { data: diff } } },
      })
      await ctx.prisma.response.update({
        where: { id: responseId },
        data: {
          correctorId: correctorId,
        },
      })
    }),

  deleteCorrection: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.correction.delete({
        where: { id: input.id },
      })
    }),
})
