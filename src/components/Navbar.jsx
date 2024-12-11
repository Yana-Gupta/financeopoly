import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"
import { googlePlayerSignIn } from "../redux/actions/authAction"
import { useDispatch, useSelector } from 'react-redux';


const CLIENT_ID =
  "162458700878-a8e200u370isgaonemsl27pbcef20jdv.apps.googleusercontent.com"

const Navbar = () => {
  const dispatch = useDispatch();
  const { player, loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const handleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse.credential;
    console.log(idToken)
    try {
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
        const user = await response.json();
    
        const userData = {
          googleId: user.sub,
          email: user.email,
          name: user.name,
          profilePic: user.picture,
        };
    
        dispatch(googlePlayerSignIn(userData)); 
        console.log("User logged in and saved successfully");
      } catch (error) {
        console.error("")
      }
  }
  
  const handleError = () => {}
  return (
    <div className="h-28 w-full bg-cyan-700 flex flex-row text-center items-center justify-between px-12">
      <div className="text-3xl font-bold">Financeopoly</div>

      <div className="flex flex-row gap-x-8 justify-between">
        <div>Dashboard</div>
        <div className="text-xl px-2 py-1">
          <GoogleOAuthProvider clientId={CLIENT_ID}>
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              useOneTap
            />
          </GoogleOAuthProvider>
        </div>
      </div>
    </div>
  )
}

export default Navbar
