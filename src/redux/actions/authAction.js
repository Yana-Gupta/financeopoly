import { checkPlayer, loginPlayer, registerPlayer } from "../../api/login";
import { loginStart, loginSuccess, loginFailure } from "../authSlice"

export const googlePlayerSignIn = (userData) => async (dispatch) => {
    dispatch(loginStart());  
    try {
        const checkIfPlayer = await checkPlayer(userData.email);

        let playerData;

        console.log(checkIfPlayer)

        if (checkIfPlayer.exists) {
            console.log("Player exists")
            playerData = await loginPlayer(checkIfPlayer.player);
        } else {
            console.log("Player does not exists")
            playerData = await registerPlayer(userData);
        }
        dispatch(loginSuccess(playerData));

    } catch (error) {
        console.error("Error in Google player sign-in:", error);
        dispatch(loginFailure(error.message || "Something went wrong"));
    }
};
