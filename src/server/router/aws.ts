import { createRouter } from "./context"
import { z } from "zod"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { env } from "../../env/server.mjs"

const client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
})

export const awsRouter = createRouter().query("getUploadUrl", {
  input: z.object({
    key: z.string(),
  }),
  async resolve({ input }) {
    const command = new PutObjectCommand({
      Bucket: env.AWS_AUDIO_INPUT_BUCKET,
      Key: input.key + ".ogg",
    })
    const url = await getSignedUrl(client, command, { expiresIn: 3600 })
    return url
  },
})
