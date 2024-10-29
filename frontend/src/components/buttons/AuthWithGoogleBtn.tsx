import { FaGoogle } from "react-icons/fa";
import RedirectToGoogleAccounts from "../../utils/auth/SignUpWithGoogle";

interface authWithGoogleProps {
  action: string
}

/**
 * Renders the signup / login with google button
 * @returns The signup / login with google button
 */
const AuthWithGoogleBtn = ({ action }: authWithGoogleProps) => {
  return (
    <button className="btn-primary btn-secondary w-full flex gap-3"
    onClick={RedirectToGoogleAccounts}
  >
    <FaGoogle/>
    {`${action} with Google`}
  </button>
  )
}

export default AuthWithGoogleBtn;
