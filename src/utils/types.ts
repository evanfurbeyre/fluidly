import { Prisma } from "@prisma/client"

const responseWithRelations = Prisma.validator<Prisma.ResponseArgs>()({
  include: {
    user: true,
    audio: true,
    prompt: true,
    corrections: true,
  },
})

export type ResponseWithRelations = Prisma.ResponseGetPayload<typeof responseWithRelations>
