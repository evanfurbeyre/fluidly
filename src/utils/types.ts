import { Prisma } from "@prisma/client"

export const responseWithRelations = Prisma.validator<Prisma.ResponseArgs>()({
  include: {
    user: true,
    audio: true,
    prompt: true,
    feedback: true,
    corrector: true,
    corrections: {
      include: {
        diff: true,
        audio: true,
      },
    },
  },
})

const correctionWithRelations = Prisma.validator<Prisma.CorrectionArgs>()({
  include: {
    // response: true,
    audio: true,
    diff: true,
  },
})

export type ResponseWithRelations = Prisma.ResponseGetPayload<typeof responseWithRelations>

export type CorrectionWithRelations = Prisma.CorrectionGetPayload<typeof correctionWithRelations>
