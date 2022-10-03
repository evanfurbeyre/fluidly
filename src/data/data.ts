type Data = {
  [key: string]: {
    question: string;
    audio: {
      original: string;
      correction: string;
      feedback: string;
    };
    revision: {
      content: string;
      type: "original" | "addition" | "deletion";
    }[];
  };
};

export const data: Data = {
  "1": {
    question: "Qu'est-ce que tu te souviens d'avoir cinq ans?",
    audio: {
      original: "./evan-original-1.mp3",
      correction: "./evan-correction-1.mp3",
      feedback: "./evan-feedback-1.mp3",
    },
    revision: [
      { content: "sample", type: "original" },
      { content: "sample", type: "addition" },
      { content: "sample", type: "deletion" },
    ],
  },
};
