import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl as _getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { v4 } from "uuid"
import { env } from "../../env/server.mjs"

const EXP_DURATION = 3600

const client = new S3Client({
  region: "us-east-2",
  credentials: {
    accessKeyId: env.AWS_KEY,
    secretAccessKey: env.AWS_SECRET,
  },
})

export const getSignedUrl = (key: string) => {
  const command = new GetObjectCommand({
    Bucket: env.AWS_AUDIO_INPUT_BUCKET,
    Key: key,
  })
  return _getSignedUrl(client, command, { expiresIn: EXP_DURATION })
}

export const generateSignedUrl = async () => {
  const key = `${v4()}.wav`
  const command = new PutObjectCommand({
    Bucket: env.AWS_AUDIO_INPUT_BUCKET,
    Key: key,
  })
  const url = await _getSignedUrl(client, command, { expiresIn: EXP_DURATION })

  return { key, url }
}
