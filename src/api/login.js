

export const checkPlayer = async (email) => {
    const query = `*[_type == "player" && email == $email][0]`; // Updated schema name
    const params = { email };

    try {
        const response = await fetch(
            `https://z8q5dvew.api.sanity.io/v2021-06-07/data/query/production`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer YOUR_SANITY_API_TOKEN`,
                },
                body: JSON.stringify({ query, params }),
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
        throw new Error("Unable to check player");
    }
};

export const registerPlayer = async ({ googleId, email, name, profilePic }) => {
    try {
        const mutations = [
            {
                create: {
                    _type: "player", // Updated schema name
                    googleId,
                    email,
                    name,
                    profilePic,
                    createdAt: new Date().toISOString(),
                },
            },
        ];

        const response = await fetch(
            `https://z8q5dvew.api.sanity.io/v2021-06-07/data/query/production`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer YOUR_SANITY_API_TOKEN`, // Use a token with write access
                },
                body: JSON.stringify({ mutations }),
            }
        );

        const data = await response.json();
        return { success: true, player: data.results[0].document };
    } catch (error) {
        console.error("Error registering player:", error);
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
