import { PrismaClient } from "@prisma/client"
import seed from "./data"

const prisma = new PrismaClient()

async function main() {
  for (const user of seed.users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        ...user,
        responses: {
          create: {
            // audio: { create: seed.audio },
            prompt: { create: seed.prompt },
          },
        },
      },
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
