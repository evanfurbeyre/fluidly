import { z } from "zod"
import { env } from "../../../env/server.mjs"
import { responseWithRelations } from "../../../utils/types"
import { generateSignedUrl, getSignedUrl } from "../../services/s3"
import { publicProcedure, router } from "../trpc"

export const responseRouter = router({
  create: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        promptId: z.string(),
      }),
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.response.create({
        data: input,
        include: responseWithRelations.include,
      })
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.response.delete({ where: { id: input.id } })
    }),

  findUnique: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const res = await ctx.prisma.response.findUnique({
        include: responseWithRelations.include,
        where: { id: input.id },
      })
      if (!res) return null
      if (!res?.audio || !res.audio?.key) return res

      const promises = []

      const responsePromise = getSignedUrl(res.audio.key).then((url) => {
        if (res.audio) res.audio.audioUrl = url
      })

      promises.push(responsePromise)

      // Attach pre-signed url of feedback
      if (res.feedback) {
        const feedbackPromise = getSignedUrl(res.feedback.key).then((url) => {
          if (res.feedback) res.feedback.audioUrl = url
        })
        promises.push(feedbackPromise)
      }

      // Attach pre-signed urls of correction audio
      res.corrections.forEach((cor) => {
        if (cor.audio) {
          const correctionPromise = getSignedUrl(cor.audio.key).then((url) => {
            if (cor.audio) cor.audio.audioUrl = url
          })
          promises.push(correctionPromise)
        }
      })

      await Promise.all(promises)

      return res
    }),

  addResponseAudio: publicProcedure
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
          response: {
            connect: {
              id: input.responseId,
            },
          },
        },
      })
      return audio
    }),

  getAudioUploadUrl: publicProcedure.query(async () => {
    return generateSignedUrl()
  }),

  addResponseFeedback: publicProcedure
    .input(
      z.object({
        responseId: z.string(),
        key: z.string(),
        language: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.response.update({
        where: { id: input.responseId },
        data: {
          feedback: {
            create: {
              key: input.key,
              bucket: env.AWS_AUDIO_INPUT_BUCKET,
              language: input.language,
            },
          },
        },
      })
    }),

  addResponseFeedbackText: publicProcedure
    .input(
      z.object({
        responseId: z.string(),
        text: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.response.update({
        where: { id: input.responseId },
        data: {
          feedbackText: input.text,
        },
      })
    }),
})
