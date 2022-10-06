export type RevisionFragment = {
  content: string
  type: "original" | "addition" | "deletion"
}
export type Data = {
  content: string
  language: "fr" | "es"
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
  cl8waomez0004p2brkheil87e: {
    language: "fr",
    content: "Qu'est-ce que tu te souviens d'avoir cinq ans?",
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
  cl8waslv30007p2brfiezkiaf: {
    language: "es",
    content: "¿Cuál es tu rutina en la mañana?",
    audio: {
      original: "nate-original-1",
      correction: "evan-correction-1",
      feedback: "evan-feedback-1",
    },
    revisions: [],
  },
  cl8xmcpbj0004p2rveafdcoui: {
    language: "es",
    content: "Danos un resumen de una película que te guste mucho",
    audio: {
      original: "katie-o-1",
      correction: "evan-correction-1",
      feedback: "evan-feedback-1",
    },
    revisions: [
      {
        type: "original",
        content:
          "Hola. Bueno, en realidad yo prefiero los programas de televisión. Entonces, esto es lo que me voy a explicar hoy. Ha Bueno, mi programa favorita se llama abstracto en la Flex. Es un mini documental sobre Bueno, cada episodio es un venido a comentar sobre artistas diferentes con medios diferentes a tipo el fotógrafo Platon y la pago arquitecta Naranjax Ven. Y la de tenedora este Glenn A. El programa muestra las vidas de las Artes, sus hombres de artes y las ideas que informen todo que lo hacen. Y esto es razón, que",
      },
    ],
  },
}
