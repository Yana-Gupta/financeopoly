
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
        throw new Error("Unable to check user")
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
    
        // Parse response
        const data = await response.json();
    
        if (response.ok) {
            return { success: true, player: data.results[0].document };
        } else {
            console.error("Sanity API returned an error:", data);
            throw new Error(data.error?.description || "Sanity API error");
        }
    } catch (error) {
        console.error("Error registering player:", error.message);
        throw new Error("Unable to register player");
    }    
};

export const loginPlayer = async (playerData) => {
    const { email } = playerData;

    try {
        const playerCheck = await checkPlayer(email);

        if (playerCheck.exists) {
            return { success: true, player: playerCheck.player };
        } else {
            const registeredPlayer = await registerPlayer(playerData);
            return { success: true, player: registeredPlayer.player };
        }

    } catch (error) {
        console.error("Error logging in player:", error);
        throw new Error("Unable to log in player");
    }
};
