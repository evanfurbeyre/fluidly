import { ArrowRightCircleIcon } from "@heroicons/react/24/solid"

// const welcomeMessage =
//   "We've built a tool we hope will help people improve their foreign language speaking skills, and we would love for you to try it out."

const welcomeMessage =
  "We're glad you're here. If you're getting this, it means we've signed you up for a limited trial of a language learning tool we've been working on. We think that people will be able to improve their foreign language speaking skills simply by responding to open-ended questions and receiving quality feedback. We would love for you to try our product for a short time and let us know what you think!"

type WelcomeModalProps = { onClose?: () => void }

const WelcomeModal = ({ onClose }: WelcomeModalProps) => {
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
          <h3 className="text-lg font-bold">{"Welcome!"}</h3>
          <p className="py-4">{welcomeMessage}</p>
          <div className="modal-action">
            <label htmlFor="my-modal" className="btn-primary btn" onClick={onClose}>
              See how it works!
              <ArrowRightCircleIcon className="ml-3 h-6 w-6" />
            </label>
          </div>
        </div>
      </div>
    </>
  )
}

export default WelcomeModal
