import type { NextPage } from 'next';
import Head from 'next/head';

type CorProps = { children: string };
const AddCor = ({ children }: CorProps) => (
  <span className="rounded border border-green-300 bg-green-100 font-medium text-green-700">
    {children}
  </span>
);
const DelCor = ({ children }: CorProps) => (
  <span className="rounded border border-red-300 bg-red-100 font-medium text-red-700">
    {children}
  </span>
);

const Correction: NextPage = () => {
  return (
    <>
      <Head>
        <title>Speak to Learn</title>
        <meta name="description" content="language learning tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto my-10 p-6">
        <p className="mb-5 text-lg font-bold italic">
          What do you remember about being 5 years old? TEST
        </p>
        <h3>Original Audio:</h3>
        <audio controls>
          <source src="./audiofile3.mp3" type="audio/mp3" />
        </audio>

        <h3>Correction:</h3>
        <audio controls>
          <source src="./audiofile1.ogg" type="audio/ogg" />
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

        <h3>Feedback:</h3>
        <audio controls>
          <source src="./audiofile4.ogg" type="audio/ogg" />
        </audio>
        <p>
          Bon travail, en tous cas, mes félicitations. J’attend votre prochain
          audio avec impatience.
        </p>
      </main>
    </>
  );
};

export const getStaticProps = async () => {
  return {
    props: {
      id: '1',
    },
  };
};

export const getStaticPaths = async () => {
  return { paths: [{ params: { id: '1' } }], fallback: false };
};

export default Correction;
