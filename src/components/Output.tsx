import { Data, type RevisionFragment } from "../data/data"

const Output = (props: Data) => {
  const { content, audioUris, language, revisions } = props
  const labels = sectionLabels[language]

  return (
    <>
      <main className="container mx-auto my-10 max-w-sm p-6">
        <p className="mb-5 text-xl font-bold italic text-gray-800">{content}</p>
        <h3 className="font-semibold text-gray-800">{labels.original}</h3>
        <audio controls className="w-full">
          <source src={`data:audio/mp3;base64,${audioUris?.original}`} />
        </audio>

        <p className="py-4">
          <RevisionSection revisions={revisions} />
        </p>

        <h3 className="font-semibold text-gray-800">{labels.correction}</h3>
        <audio controls className="w-full">
          <source src={`data:audio/mp3;base64,${audioUris?.correction}`} />
        </audio>

        <h3 className="font-semibold text-gray-800">{labels.feedback}</h3>
        <audio controls className="w-full">
          <source src={`data:audio/mp3;base64,${audioUris?.feedback}`} />
        </audio>
      </main>
    </>
  )
}

const sectionLabels = {
  fr: {
    original: "Audio d'origine",
    correction: "Correction",
    feedback: "Retour d'information",
  },
  es: {
    original: "Audio original",
    correction: "Corrección",
    feedback: "Retroalimentación",
  },
}

const RevisionSection = ({ revisions }: { revisions: RevisionFragment[] }) => {
  return (
    <>
      {revisions.map(({ content, type }, index) => {
        switch (type) {
          case "addition":
            return (
              <span key={index} className="mx-1 rounded bg-green-100 font-medium text-green-700">
                {content}
              </span>
            )
          case "deletion":
            return (
              <span key={index} className="mx-1 rounded bg-red-100 font-medium text-red-700">
                {content}
              </span>
            )
          default:
            return <span key={index}>{content}</span>
        }
      })}
    </>
  )
}

export default Output
