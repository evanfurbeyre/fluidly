import { Prisma } from "@prisma/client"

/**
 * Users
 */
const nate: Prisma.UserCreateInput = {
  name: "Nate F",
  nativeLanguage: "en",
}

const evan: Prisma.UserCreateInput = {
  name: "Evan F",
  nativeLanguage: "en",
}

/**
 * Prompts
 */
const prompt: Prisma.PromptCreateInput = {
  en: "How are you?",
  es: "Como estas?",
  fr: "Comment ça va?",
}

/**
 * Audio
 */
const audio: Prisma.AudioCreateInput = {
  bucket: "sample-bucket",
  key: "sample-key",
  language: "es",
}

/**
 * Diff
 */

const diff: Prisma.DiffFragmentCreateInput[] = [
  {
    content: "Quand j’avais cinq ans, je me souviens",
    type: "original",
  },
  {
    content: "de",
    type: "addition",
  },
  {
    content: "marcher à la station de bus pour aller à l’école. Je me souviens",
    type: "original",
  },
  {
    content: "que",
    type: "addition",
  },
  {
    content: "ma professeur",
    type: "original",
  },
  {
    content: ", elle",
    type: "deletion",
  },
  {
    content: "s’appelait Kathy Johnson.",
    type: "original",
  },
  {
    content: "Je me souviens le… comment dit-on “descanso”, non c’est espagnol… le pause,",
    type: "deletion",
  },
  {
    content: "je me souviens",
    type: "original",
  },
  {
    content: "le",
    type: "deletion",
  },
  {
    content: "de la",
    type: "addition",
  },
  {
    content: "pause.",
    type: "original",
  },
]

const data = {
  users: [nate, evan],
  prompt,
  audio,
  diff,
}

export default data
