import original from './evan-original-1.json';
import correction from './evan-correction-1.json';
import feedback from './evan-feedback-1.json';

type Data = {
  [key: string]: {
    question: string;
    audio: {
      original: string;
      correction: string;
      feedback: string;
    };
    transcripts: {
      original: any;
      correction: any;
      feedback: any;
    };
  };
};

export const data: Data = {
  '1': {
    question: "Qu'est-ce que tu te souviens d'avoir cinq ans?",
    audio: {
      original: './evan-original-1.mp3',
      correction: './evan-correction-1.mp3',
      feedback: './evan-feedback-1.mp3',
    },
    transcripts: {
      original,
      correction,
      feedback,
    },
  },
};
