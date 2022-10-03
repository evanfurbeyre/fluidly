import type { NextPage } from 'next';
import { data } from '../data/data';
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
      </main>
    </>
  );
};

export const getStaticProps = async (context: any) => {
  const id = context.params?.id;
  return {
    props: data[id],
  };
};

export const getStaticPaths = async () => {
  const paths = Object.keys(data).map((id: string) => ({ params: { id } }));
  return { paths, fallback: false };
};

export default Correction;
