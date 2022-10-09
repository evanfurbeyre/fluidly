import { createRouter } from "./context"
import { z } from "zod"
import { v4 } from "uuid"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { env } from "../../env/server.mjs"

const client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
})

export const responseRouter = createRouter()
  /**
   *
   */
  .mutation("addResponseAudio", {
    input: z.object({
      key: z.string(),
      responseId: z.string(),
      language: z.string(),
    }),
    async resolve({ input, ctx }) {
      const audio = await ctx.prisma.audio.create({
        data: {
          key: input.key,
          bucket: env.AWS_AUDIO_INPUT_BUCKET,
          language: input.language,
          Response: {
            connect: {
              id: input.responseId,
            },
          },
        },
      })
      return audio
    },
  })

  /**
   *
   */
  .mutation("addCorrection", {
    input: z.object({
      key: z.string(),
      responseId: z.string(),
      language: z.string(),
    }),
    async resolve({ input, ctx }) {
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
    },
  })

  /**
   *
   */
  .query("getAudioUploadUrl", {
    async resolve() {
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
    },
  })

  /**
   *
   */
  .query("getResponse", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input, ctx }) {
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
      const command1 = new GetObjectCommand({
        Bucket: env.AWS_AUDIO_INPUT_BUCKET,
        Key: res.audio.key,
      })
      const url1 = await getSignedUrl(client, command1, { expiresIn: 3600 })
      res.audio.audioUrl = url1

      if (res.corrections && res.corrections.length > 0) {
        // Attach pre-signed url of audio
        const command2 = new GetObjectCommand({
          Bucket: env.AWS_AUDIO_INPUT_BUCKET,
          Key: res.corrections[0].audio.key,
        })
        const url2 = await getSignedUrl(client, command2, { expiresIn: 3600 })
        res.corrections[0].audio.audioUrl = url2
        console.log("res.corrections[0].audioUrl:", res.corrections[0].audio.audioUrl)
      }

      return res
    },
  })
