import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { v4 } from "uuid"
import { z } from "zod"
import { env } from "../../../env/server.mjs"
import { publicProcedure, router } from "../trpc"

const client = new S3Client({
  region: "us-east-2",
  credentials: {
    accessKeyId: env.AWS_KEY,
    secretAccessKey: env.AWS_SECRET,
  },
})

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
        include: {
          user: true,
          audio: true,
          prompt: true,
          corrections: true,
        },
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
        include: {
          user: true,
          audio: true,
          feedback: true,
          corrections: {
            include: {
              audio: true,
              diff: true,
            },
          },
          prompt: true,
        },
        where: { id: input.id },
      })
      if (!res) return null
      if (!res?.audio || !res.audio?.key) return res

      const promises = []
      // Attach pre-signed url of audio
      const responseCommand = new GetObjectCommand({
        Bucket: env.AWS_AUDIO_INPUT_BUCKET,
        Key: res.audio.key,
      })
      const responsePromise = getSignedUrl(client, responseCommand, { expiresIn: 3600 }).then(
        (url) => {
          if (res.audio) res.audio.audioUrl = url
        },
      )
      promises.push(responsePromise)

      // Attach pre-signed url of feedback

      if (res.feedback) {
        const feedbackCommand = new GetObjectCommand({
          Bucket: env.AWS_AUDIO_INPUT_BUCKET,
          Key: res.feedback.key,
        })
        const feedbackPromise = getSignedUrl(client, feedbackCommand, { expiresIn: 3600 }).then(
          (url) => {
            if (res.feedback) res.feedback.audioUrl = url
          },
        )
        promises.push(feedbackPromise)
      }

      // Attach pre-signed urls of correction audio
      res.corrections.forEach((cor) => {
        if (cor.audio) {
          const correctionCommand = new GetObjectCommand({
            Bucket: env.AWS_AUDIO_INPUT_BUCKET,
            Key: cor.audio.key,
          })
          const correctionPromise = getSignedUrl(client, correctionCommand, {
            expiresIn: 3600,
          }).then((url) => {
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
    const key = `${v4()}.ogg`
    const command = new PutObjectCommand({
      Bucket: env.AWS_AUDIO_INPUT_BUCKET,
      Key: key,
    })
    const url = await getSignedUrl(client, command, { expiresIn: 3600 })
    return {
      key,
      url,
    }
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
