import dotenv from 'dotenv';


dotenv.config();






export const checkPlayer = async (email) => {
    try {
        const response = await fetch(
            `https://z8q5dvew.api.sanity.io/v2021-06-07/data/query/production`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer sk8oSSjaJahz6F2E93Gm2WVsqHEJubfdWT8YvAZQ2kLDLUFhHz3fHM6xaB8Q72BKmZxkPTSKE3Ec7RBDymlTI01XwKsBhatu8qnZTCcjWteUHJLQD1kos890V2cG76yFgKxcGwrXZeBVdo5e0XuLHRLclVHXowUcxBmf7hz3MY3I8MBqLIqT`,
                },
                body: JSON.stringify({
                    query: "*[_type == 'player' && email == $email][0]",
                    params: {
                        email: email
                    }
                }),
            }
        );
        const data = await response.json();
        if (data.result) {
            return { exists: true, player: data.result };
        } else {
            return { exists: false };
        }
    } catch (error) {
        console.error("Error checking player:", error);
        return { exists: false }
    }
};

export const registerPlayer = async ({ googleId, email, name, profilePic }) => {
    try {
        const mutations = [
            {
                create: {
                    _type: "player",
                    name: name,
                    email: email,
                    googleId: googleId,
                    profilePic: profilePic,
                    createdAt: new Date().toISOString(),
                },
            },
        ];

        const response = await fetch(
            `https://z8q5dvew.api.sanity.io/v2021-06-07/data/mutate/production`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer sk8oSSjaJahz6F2E93Gm2WVsqHEJubfdWT8YvAZQ2kLDLUFhHz3fHM6xaB8Q72BKmZxkPTSKE3Ec7RBDymlTI01XwKsBhatu8qnZTCcjWteUHJLQD1kos890V2cG76yFgKxcGwrXZeBVdo5e0XuLHRLclVHXowUcxBmf7hz3MY3I8MBqLIqT`,
                },
                body: JSON.stringify({ mutations }),
            }
        );

        const data = await response.json();

        if (response.ok) {
            console.log(data)
            return { success: true, playerId: data.transactionId };
        } else {
            console.error("Sanity API returned an error:", data);
            throw new Error(data.error?.description || "Sanity API error");
        }
    } catch (error) {
        console.error("Error registering player:", error.message);
        throw new Error("Unable to register player");
    }
};

export const fetchPlayerById = async (playerId) => {
    try {
        const response = await fetch(
            `https://z8q5dvew.api.sanity.io/v2021-06-07/data/query/production`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer sk8oSSjaJahz6F2E93Gm2WVsqHEJubfdWT8YvAZQ2kLDLUFhHz3fHM6xaB8Q72BKmZxkPTSKE3Ec7RBDymlTI01XwKsBhatu8qnZTCcjWteUHJLQD1kos890V2cG76yFgKxcGwrXZeBVdo5e0XuLHRLclVHXowUcxBmf7hz3MY3I8MBqLIqT`,
                },
                body: JSON.stringify({
                    query: "*[_type == 'player' && _id == $playerId][0]",
                    params: {
                        playerId: playerId,
                    },
                }),
            }
        );

        const data = await response.json();
        console.log("Player Data:", data.result);
        return data.result;
    } catch (error) {
        console.error("Error fetching player by ID:", error);
        return null
    }
}

export const loginPlayer = async (playerData) => {
    const { email } = playerData;

    try {
        const playerCheck = await checkPlayer(email);

        if (playerCheck.exists) {
            localStorage.setItem("playerId", playerCheck.player._id);
            console.log(playerCheck.player);
            return { success: true, player: playerCheck.player };
        } else {
            const registeredPlayer = await registerPlayer(playerData);
            console.log(registerPlayer)
            localStorage.setItem("playerId", registeredPlayer.transactionId);

            const player = fetchPlayerById(registerPlayer.transactionId);
            return { success: true, player: player };
        }
    } catch (error) {
        console.error("Error logging in player:", error);
        throw new Error("Unable to log in player");
    }
};
