import { z } from "zod"
import { publicProcedure, router } from "../trpc"
import { env } from "../../../env/server.mjs"

export const correctionRouter = router({
  create: publicProcedure
    .input(
      z.object({
        key: z.string(),
        responseId: z.string(),
        language: z.string(),
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
    }),

  addDiffFragments: publicProcedure
    .input(
      z.object({
        correctionId: z.string(),
        diff: z.array(
          z.object({
            type: z.enum(["original", "addition", "deletion"]),
            content: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { correctionId, diff } = input
      ctx.prisma.correction.update({
        where: { id: correctionId },
        data: { diff: { createMany: { data: diff } } },
      })
    }),
})
