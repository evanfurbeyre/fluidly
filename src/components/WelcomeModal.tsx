import { ArrowRightCircleIcon } from "@heroicons/react/24/solid"

const message1 =
  "We’re glad you’re here. If you’re getting this, it means we’ve signed you up for a limited trial for a language learning tool we’ve been working on. Simply respond to the open-ended questions on our app, and we’ll provide quality feedback that you can learn from."

const message2 =
  "We would love for you to try our product for a short time and let us know what you think!"

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
          <p className="py-4">{message1}</p>
          <p className="pb-2">{message2}</p>
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
