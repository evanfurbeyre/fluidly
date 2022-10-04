export type RevisionFragment = {
  content: string
  type: "original" | "addition" | "deletion"
}
export type Data = {
  question: string
  lang: "fr" | "es"
  audio: {
    original: string
    correction: string
    feedback: string
  }
  revisions: RevisionFragment[]
  audioUris?: {
    original: string
    correction: string
    feedback: string
  }
}

export const data: Record<string, Data> = {
  "1": {
    lang: "fr",
    question: "Qu'est-ce que tu te souviens d'avoir cinq ans?",
    audio: {
      original: "evan-original-1",
      correction: "evan-correction-1",
      feedback: "evan-feedback-1",
    },
    revisions: [
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
    ],
  },
  "2": {
    lang: "es",
    question: "¿Cuál es tu rutina en la mañana?",
    audio: {
      original: "nate-original-1",
      correction: "evan-correction-1",
      feedback: "evan-feedback-1",
    },
    revisions: [],
  },
}
