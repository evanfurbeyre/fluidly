export type Data = {
  question: string
  lang: "fr" | "es"
  audio: {
    original: string
    correction: string
    feedback: string
  }
  audioUris?: {
    original: string
    correction: string
    feedback: string
  }
  revision: {
    content: string
    type: "original" | "addition" | "deletion"
  }[]
}

export const data: Record<string, Data> = {
  "1": {
    lang: "fr",
    question: "Qu'est-ce que tu te souviens d'avoir cinq ans?",
    audio: {
      original: "evan-original-1.7",
      correction: "evan-correction-1.7",
      feedback: "evan-feedback-1.7",
    },
    revision: [
      { content: "sample", type: "original" },
      { content: "sample", type: "addition" },
      { content: "sample", type: "deletion" },
    ],
  },
  "2": {
    lang: "es",
    question: "¿Cuál es tu rutina en la mañana?",
    audio: {
      original: "./nate-original-1.mp3",
      correction: "./evan-correction-1.mp3",
      feedback: "./evan-feedback-1.mp3",
    },
    revision: [],
  },
}
