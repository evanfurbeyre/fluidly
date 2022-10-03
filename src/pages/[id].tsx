import type { NextPage, GetStaticProps } from 'next';
import Head from 'next/head';

type CorProps = { children: string };
const AddCor = ({ children }: CorProps) => (
  <span className="rounded bg-green-100 font-medium text-green-700">
    {children}
  </span>
);
const DelCor = ({ children }: CorProps) => (
  <span className="rounded bg-red-100 font-medium text-red-700">
    {children}
  </span>
);

const Correction: NextPage = (props: any) => {
  const { question, audio, transcripts } = props;

  return (
    <>
      <Head>
        <title>Speaking Correction</title>
        <meta name="description" content="language learning tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto my-10 max-w-xs p-6">
        <p className="mb-5 text-xl font-bold italic text-gray-800">
          {question}
        </p>
        <h3 className="font-semibold text-gray-800">Audio d&apos;origine:</h3>
        <audio controls className="w-full">
          <source src={audio.original} type="audio/mp3" />
        </audio>

        <p className="py-4">
          Quand j’avais cinq ans, je me souviens <AddCor>de</AddCor> marcher à
          la station de bus pour aller à l’école. Je me souviens{' '}
          <AddCor>que</AddCor> ma professeur <DelCor>, elle</DelCor> s’appelait
          Kathy Johnson.{' '}
          <DelCor>
            Je me souviens le… comment dit-on “descanso”, non c’est espagnol… le
            pause,
          </DelCor>{' '}
          je me souviens <AddCor>de la</AddCor> <DelCor>le</DelCor> pause.
        </p>

        <h3 className="font-semibold text-gray-800">Correction:</h3>
        <audio controls className="w-full">
          <source src={audio.correction} type="audio/mp3" />
        </audio>

        <h3 className="font-semibold text-gray-800">
          Retour d&apos;information:
        </h3>
        <audio controls className="w-full">
          <source src={audio.feedback} type="audio/mp3" />
        </audio>
        {/* <p>
          {transcripts.feedback.results.transcripts.map((t: any) => (
            <span key={t.transcript}>{t.transcript}</span>
          ))}
        </p> */}
      </main>
    </>
  );
};
console.log('process.env.VERCEL_URL:', process.env.VERCEL_URL);
const server = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';
console.log('server:', server);

export const getStaticProps: GetStaticProps = async (context) => {
  // const res = await fetch(`${server}/api/${context?.params?.id}`);
  // const data = await res.json();
  return {
    props: {
      question: "Qu'est-ce que tu te souviens d'avoir cinq ans?",
      audio: {
        original: './evan-original-1.mp3',
        correction: './evan-correction-1.mp3',
        feedback: './evan-feedback-1.mp3',
      },
      transcripts: {},
    },
  };
};

export const getStaticPaths = async () => {
  const res = await fetch(`${server}/api`);
  const ids = await res.json();
  const paths = ids.map((id: string) => ({ params: { id } }));
  // const paths = [{ params: { id: '1' } }];
  return { paths, fallback: false };
};

export default Correction;
