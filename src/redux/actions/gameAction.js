import { createAsyncThunk } from "@reduxjs/toolkit";
import { TilesData } from "../../utils/GameData"

const SANITY_API_TOKEN = "sk8oSSjaJahz6F2E93Gm2WVsqHEJubfdWT8YvAZQ2kLDLUFhHz3fHM6xaB8Q72BKmZxkPTSKE3Ec7RBDymlTI01XwKsBhatu8qnZTCcjWteUHJLQD1kos890V2cG76yFgKxcGwrXZeBVdo5e0XuLHRLclVHXowUcxBmf7hz3MY3I8MBqLIqT";

const OPENAI_API_KEY = "106bf79dfc2341398b085ff3425d3eab";

const showHumanPlayerPrompt = (player, property) => {


    console.log("This from human prompt")
    const prompt = `
      You landed on ${property.name}. 
      Price: $${property.price}.
      Your Balance: $${player.balance}.
      Owned Properties: ${player.properties.length}.
      Net Worth: $${player.balance + player.properties.reduce((acc, p) => acc + p.price, 0)}.
  
      Do you want to buy this property?
    `;

    return confirm(prompt);
}
const AIPLayerAction = async (currentPlayer, currentProperty, players) => {
    let opponentDetails = players.map((player, index) => {
        if (player === currentPlayer) {
            return ` `;
        } else {
            return `${index + 1} ${player.balance} & ${player.properties.join(", ")}`;
        }
    }).join(". ");

    opponentDetails = "Monopoly game opponent balance and assets"


    const truncatedOpponentDetails = opponentDetails.length > 200
        ? opponentDetails.slice(0, 200) + "..."
        : opponentDetails;

    const prompt = `
${truncatedOpponentDetails}.
Our player at ${currentPlayer.position} & balance ${currentPlayer.balance}.
Please respond with one action, one word:
- "buy ${currentProperty.name} at ${currentProperty.price}" what's your pick,
- "skip" if the AI decides to skip,`;

    // Truncate the prompt if necessary
    const truncatedPrompt = prompt.length > 256
        ? prompt.slice(0, 240) + "..."
        : prompt;


    try {

        const response = await fetch("https://api.aimlapi.com/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo",
                messages: [
                    { "role": "user", "content": truncatedPrompt }
                ],
                max_tokens: 50,
                temperature: 0.7,
            })
        });

        
        const data = await response.json();
        if ( data.statusCode === 200 ) return data?.choices[0]?.message?.content;
        else return "buy"
    } catch (error) {
        console.error(error)
        return "buy"
    }


};

export const fetchGameById = createAsyncThunk(
    "game/fetchById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await fetch(
                `https://z8q5dvew.api.sanity.io/v2021-06-07/data/query/production`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${SANITY_API_TOKEN}`,
                    },
                    body: JSON.stringify({
                        query: "*[_type == 'game' && _id == $id][0]",
                        params: {
                            id: id
                        }
                    }
                    ),
                }
            );

            const gameDataFromSanity = await response.json();

            if (!response.ok) {
                throw new Error('Failed to fetch game data');
            }

            console.log("Fetched game data from Sanity:", gameDataFromSanity.result);

            return gameDataFromSanity.result; // Return the game data
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const createNewGame = createAsyncThunk(
    "game/create",
    async ({ playerId, playerName }, { dispatch, rejectWithValue }) => {
        try {
            console.log("Creating new game for player");
            console.log(playerId, playerName);

            // Helper function to create a player
            const createPlayer = (name, isAI, playerId = 0) => ({
                id: playerId === 0 ? Math.random().toString(36).substring(2, 9) : playerId,
                name: name,
                balance: 10000,
                position: 0,
                isAI: isAI,
                properties: [],
                debt: 0,
                assets: [],
            });

            // Properties list with initial values and owner set to null
            const properties = TilesData;
            const gameData = {
                status: "ongoing",
                startTime: new Date().toISOString(),
                currentTurn: 0,
                allPlayers: [
                    createPlayer(playerName, false, playerId),
                    createPlayer("AI player 1", true),
                    createPlayer("AI Player 2", true),
                    createPlayer("AI Player 3", true),
                ],
                gameLog: [`${playerName} started the game.`],

            };

            const propertyMutations = properties.List.map((property) => ({
                create: {
                    _type: "property",
                    name: property.label,
                    price: property.price,
                    color: property.color,
                    icon: property.icon,
                    position: property.pos,
                    ownerId: property.ownerId,
                    order: property.order
                },
            }));

            const gameMutation = {
                create: {
                    _type: "game",
                    humanPlayer: {
                        _type: "reference",
                        _ref: playerId,
                    },
                    status: "ongoing",
                    startTime: new Date().toISOString(),
                    currentTurn: 0,
                    allPlayers: gameData.allPlayers.map((player) => ({
                        id: player.id,
                        name: player.name,
                        balance: player.balance,
                        position: player.position,
                        isAI: player.isAI,
                        properties: player.properties,
                        debt: player.debt,
                        assets: player.assets,
                    })),
                    gameLog: gameData.gameLog,
                    initialProperties: propertyMutations.map((mutation) => mutation.create),
                },
            };

            const response = await fetch(
                "https://z8q5dvew.api.sanity.io/v2021-06-07/data/mutate/production?returnIds=true",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${SANITY_API_TOKEN}`,
                    },
                    body: JSON.stringify({ mutations: [gameMutation, ...propertyMutations] }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to create game");
            }

            const responseData = await response.json();
            const gameId = responseData.results[0].id;
            console.log("Game created, transactionId:", gameId);

            dispatch(fetchGameById(gameId));

            return gameId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const updateGameInSanity = createAsyncThunk(
    "game/updateInSanity",
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            const game = state.game.game;
            const mutations = [
                {
                    patch: {
                        id: game._id,
                        set: {
                            "allPlayers": game.allPlayers,
                            "gameLog": game.gameLog,
                            "currentTurn": game.currentTurn,
                            "initialProperties": game.initialProperties,
                        },
                    },
                },
            ];

            const response = await fetch(
                "https://z8q5dvew.api.sanity.io/v2021-06-07/data/mutate/production",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${SANITY_API_TOKEN}`,
                    },
                    body: JSON.stringify({ mutations }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update game in Sanity");
            }

            const responseData = await response.json();
            console.log("Game updated successfully in Sanity:", responseData);

            return responseData;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const handleAIPropertyPurchase = createAsyncThunk(
    'game/handleAIPropertyPurchase',
    async (data, { getState, dispatch }) => {
      dispatch(gamePlaying());
      const { currentPlayer, propertyData, gameState, diceRoll } = data;
  
      console.log(currentPlayer, propertyData, gameState);
      try {
        await AIPLayerAction(currentPlayer, propertyData, gameState.allPlayers)
          .then(response => {
            if (response.toLowerCase() === "buy") {
              const updatedPlayer = {
                ...currentPlayer,
                position: (currentPlayer.position + diceRoll)%40, 
                balance: currentPlayer.balance - propertyData.price,
                properties: [...(currentPlayer.properties || []), { ...propertyData, ownerId: gameState.currentTurn }],
              };
              const updatedGameState = {
                ...gameState,
                allPlayers: gameState.allPlayers.map(player =>
                  player.id === currentPlayer.id ? updatedPlayer : player
                ),
                gameLog: [
                  ...gameState.gameLog,
                  `${updatedPlayer.name} bought the property ${propertyData.name} for ${propertyData.price} $.`
                ]
              };
  
              dispatch(updateGameState({
                log: `${updatedPlayer.name} bought the property ${propertyData.name} for ${propertyData.price} $.`,
                gameState: updatedGameState
              }));
  
            } else {
              const updatedGameState = {
                ...gameState,
                gameLog: [
                  ...gameState.gameLog,
                  `${currentPlayer.name} decided not to buy ${propertyData.name}.`
                ]
              };
              dispatch(updateGameState({
                log: `${currentPlayer.name} decided not to buy ${propertyData.name}.`,
                gameState: updatedGameState
              }));
  
            }
          }
          )
      } catch (error) {
        console.error("API call failed:", error);
        const updatedGameState = {
          ...gameState,
        };
        dispatch(updateGameState({
          log: "AI failed to make a property purchase decision.",
          gameState: updatedGameState
        }));
      }
    }
  );


export { AIPLayerAction, showHumanPlayerPrompt };
