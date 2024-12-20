import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"
import { googlePlayerSignIn } from "../redux/actions/authAction"
import { useDispatch, useSelector } from "react-redux"

const CLIENT_ID =
  "162458700878-a8e200u370isgaonemsl27pbcef20jdv.apps.googleusercontent.com"

const Navbar = () => {
  const dispatch = useDispatch()
  const { player } = useSelector((state) => state.auth)

  const handleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse.credential
    try {
      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
      )
      const user = await response.json()

      const userData = {
        googleId: user.sub,
        email: user.email,
        name: user.name,
        profilePic: user.picture,
      }

      dispatch(googlePlayerSignIn(userData))
      console.log("User logged in and saved successfully")
    } catch (error) {
      console.error("Error during login:", error)
    }
  }

  const handleError = () => {
    console.error("Google login failed.")
  }

  return (
    <div className="h-28 w-full bg-gradient-to-r from-orange-500 to-orange-600 flex flex-row items-center justify-between px-6 lg:px-20 font-nunito-sans">
      <div className="text-4xl font-bold hover:text-orange-950 text-orange-900 transition">
        <p className="font-extrabold">Financeopoly</p>
      </div>

      <div className="flex items-center gap-x-24">
        <div className="font-semibold text-xl lg:text-2xl text-gray-300 ">Gaming Center</div>

        <div className="text-xl px-2 py-1">
          {player ? (
            <img
              src={player?.profilePic}
              alt={player?.name || "User"}
              className="h-14 w-14 rounded-full border border-white hover:shadow-lg transition"
            />
          ) : (
            <GoogleOAuthProvider clientId={CLIENT_ID}>
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                useOneTap
              />
            </GoogleOAuthProvider>
          )}
        </div>
      </div>
    </div>
  )
}

export default Navbar
