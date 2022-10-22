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
  createResponse: publicProcedure
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
  deleteResponse: publicProcedure.input(z.object({ id: z.string() })).mutation(({ input, ctx }) => {
    return ctx.prisma.response.delete({ where: { id: input.id } })
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

  getPrompt: publicProcedure
    .input(z.object({ id: z.string() }).optional())
    .query(async ({ input, ctx }) => {
      return input?.id
        ? ctx.prisma.prompt.findUnique({ where: { id: input.id } })
        : ctx.prisma.prompt.findFirst()
    }),

  getUser: publicProcedure
    .input(z.object({ id: z.string() }).optional())
    .query(async ({ input, ctx }) => {
      return input?.id
        ? ctx.prisma.user.findUnique({ where: { id: input.id } })
        : ctx.prisma.user.findFirst()
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

  getResponse: publicProcedure
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
          Key: res.corrections[0]?.audio.key,
        })
        const url2 = await getSignedUrl(client, command2, { expiresIn: 3600 })
        if (res.corrections[0]?.audio) {
          res.corrections[0].audio.audioUrl = url2
          console.log("res.corrections[0].audioUrl:", res.corrections[0]?.audio.audioUrl)
        }
      }

      return res
    }),

  addCorrection: publicProcedure
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
      return ctx.prisma.diffFragment.createMany({
        data: diff.map((d) => ({
          ...d,
          correctionId,
        })),
      })
    }),
})
