import { Prisma } from "@prisma/client"

/**
 * Users
 */
const nate: Prisma.UserCreateInput = {
  email: "nmfurbearr@gmail.com",
  name: "Nate F",
}

const evan: Prisma.UserCreateInput = {
  email: "evan.furbeyre@gmail.com",
  name: "Evan F",
}

/**
 * Prompts
 */
const prompt: Prisma.PromptCreateInput = {
  prompt: "Como estas?",
  language: "es",
}

/**
 * Audio
 */
const audio: Prisma.AudioCreateInput = {
  bucket: "sample-bucket",
  key: "sample-key",
  language: "es",
}

const data = {
  users: [nate, evan],
  prompt,
  audio,
}

export default data
