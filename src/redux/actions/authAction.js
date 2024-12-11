import { checkPlayer, loginPlayer, registerPlayer } from "../../api/login";


// import { setPlayer } from "./playerSlice"; // Import Redux slice action

export const googlePlayerSignIn = (userData) => async (dispatch) => {
    try {
        // Check if the player exists
        const checkIfPlayer = await checkPlayer(userData.email);

        let playerData;

        if (checkIfPlayer.exists) {
            // Log in the existing player
            playerData = await loginPlayer(checkIfPlayer.player);
        } else {
            // Register the new player
            playerData = await registerPlayer(userData);
        }

        // Dispatch the player data to the Redux store
        // dispatch(setPlayer(playerData));

        return playerData;
    } catch (error) {
        console.error("Error in Google player sign-in:", error);
        throw new Error("Google player sign-in failed");
    }
};
