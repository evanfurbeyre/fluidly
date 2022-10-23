import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { v4 } from "uuid"
import { z } from "zod"
import { env } from "../../../env/server.mjs"
import { publicProcedure, router } from "../trpc"

const client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
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

      // TODO: is there a better way to attach presigned urls?

      // Attach pre-signed url of audio
      const responseCommand = new GetObjectCommand({
        Bucket: env.AWS_AUDIO_INPUT_BUCKET,
        Key: res.audio.key,
      })

      const correctionCommands = res.corrections.map(() => {
        return new GetObjectCommand({
          Bucket: env.AWS_AUDIO_INPUT_BUCKET,
          Key: res.corrections[0]?.audio.key,
        })
      })

      const urls = await Promise.all([
        getSignedUrl(client, responseCommand, { expiresIn: 3600 }),
        ...correctionCommands.map((c) => getSignedUrl(client, c, { expiresIn: 3600 })),
      ])

      res.audio.audioUrl = urls[0]

      res.corrections.forEach((c, i) => {
        const audioUrl = urls[i + 1] // first audioUrl in array belongs to the response
        if (audioUrl) c.audio.audioUrl = audioUrl
      })

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
          responses: {
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
})
