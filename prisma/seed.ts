import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const nate = await prisma.user.upsert({
    where: { email: "nmfurbearr@gmail.com" },
    update: {},
    create: {
      email: "nmfurbearr@gmail.com",
      name: "Nate F",
      responses: {
        create: {
          audio: {
            create: {
              bucket: "sample-bucket",
              key: "sample-key",
              language: "es",
            },
          },
          prompt: {
            create: {
              prompt: "Como estas?",
              language: "es",
            },
          },
        },
      },
    },
  })

  const evan = await prisma.user.upsert({
    where: { email: "evan.furbeyre@gmail.com" },
    update: {},
    create: {
      email: "evan.furbeyre@gmail.com",
      name: "Evan F",
      responses: {
        create: {
          audio: {
            create: {
              bucket: "sample-bucket",
              key: "sample-key",
              language: "es",
            },
          },
          prompt: {
            create: {
              prompt: "Comment ça va?",
              language: "fr",
            },
          },
        },
      },
    },
  })

  console.log({ nate, evan })
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
