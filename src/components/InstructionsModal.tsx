import { CheckCircleIcon } from "@heroicons/react/24/solid"

const step1 =
  "1. Each day we'll text you a link to a prompt, which you'll respond to in your chosen language with the audio recorder component on the page. Speak for as long as you have things to say. The more the better!"

const step2 =
  "2. Within 24 hours we will send you a new link with audio and text corrections made by an experienced teacher in your chosen language."

type WelcomeModalProps = { onClose?: () => void }

const InstructionsModal = ({ onClose }: WelcomeModalProps) => {
  return (
    <>
      <div className="modal modal-open">
        <div className="modal-box relative">
          <label
            onClick={onClose}
            htmlFor="welcome-modal"
            className="btn-outline btn-primary btn-xs btn-circle btn absolute right-2 top-2"
          >
            ✕
          </label>
          <h3 className="text-lg font-bold">{"Here's how it works"}</h3>
          <p className="mt-4">{step1}</p>
          <p className="mt-4">{step2}</p>
          <div className="modal-action">
            <label htmlFor="my-modal" className="btn-primary btn normal-case" onClick={onClose}>
              Okay
              <CheckCircleIcon className="ml-2 h-5 w-5" />
            </label>
          </div>
        </div>
      </div>
    </>
  )
}
export default InstructionsModal
