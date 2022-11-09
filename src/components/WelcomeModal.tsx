import { ArrowRightCircleIcon } from "@heroicons/react/24/solid"

const message1 = `
Thanks for agreeing to participate in our trial!
As foreign language learners ourselves, we wanted a better way to improve our speaking abilities.
So we built something that we think can help with that!
`

const message2 = `
We would love for you to try it out and let us know what you think!
`

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
              How it works
              <ArrowRightCircleIcon className="ml-3 h-6 w-6" />
            </label>
          </div>
        </div>
      </div>
    </>
  )
}

export default WelcomeModal
