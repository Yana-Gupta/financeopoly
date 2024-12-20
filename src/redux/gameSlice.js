import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
const SANITY_API_TOKEN = "sk8oSSjaJahz6F2E93Gm2WVsqHEJubfdWT8YvAZQ2kLDLUFhHz3fHM6xaB8Q72BKmZxkPTSKE3Ec7RBDymlTI01XwKsBhatu8qnZTCcjWteUHJLQD1kos890V2cG76yFgKxcGwrXZeBVdo5e0XuLHRLclVHXowUcxBmf7hz3MY3I8MBqLIqT";
import { TilesData } from "../utils/GameData"
import { showHumanPlayerPrompt, AIPLayerAction } from "./actions/gameAction"

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

      // Send the mutations to Sanity API
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

export const rollDiceAsync = createAsyncThunk(
  "game/rollDice",
  async ({ diceRoll, AllTilesData, game }, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState();
      const currentPlayer = { ...state.game.game.allPlayers[state.game.game.currentTurn] };
      const newPosition = (currentPlayer.position + diceRoll) % 40;

      const currentTile = AllTilesData.List[newPosition];
      const propertyData = game.initialProperties[currentTile.TilesDataIndex];
      let newGameState = { ...state.game.game };

      console.log(newGameState)

      // Update player position immutably
      currentPlayer.position = newPosition;

      // Log the move
      const logEntry = `${currentPlayer.name} rolled a ${diceRoll} and moved to ${currentTile.label}.`;
      newGameState.gameLog = [...newGameState.gameLog, logEntry];

      // Handle specific tiles
      if (currentTile.label.toLowerCase().includes("go to jail")) {
        currentPlayer.inJail = true;
        newGameState.gameLog.push(`${currentPlayer.name} was sent to jail.`);
      } else if (currentTile.label.toLowerCase().includes("tax")) {
        currentPlayer.balance -= currentTile.price;
        newGameState.gameLog.push(`${currentPlayer.name} paid ${currentTile.price} to ${currentTile.label}.`);
      } else if (propertyData) {
        if (propertyData.ownerId === null && currentPlayer.balance >= propertyData.price) {
          if (currentPlayer.isAI) {
            // AI auto-purchases properties

            const AIDecision = await AIPLayerAction(currentPlayer, propertyData, state.game.game.allPlayers)

            if (AIDecision.toLowerCase() === "buy" ) {

              currentPlayer.balance -= propertyData.price;
              const updatedProperty = {
                ...propertyData,
                ownerId: state.game.game.currentTurn,
              };

              currentPlayer.properties = [...(currentPlayer.properties || []), updatedProperty];
              newGameState.initialProperties[currentTile.TilesDataIndex] = updatedProperty;
              newGameState.gameLog.push(
                `${currentPlayer.name} (AI) bought ${propertyData.name} for ${propertyData.price}`
              );
            }
          } else {

            const HumanDecision = await showHumanPlayerPrompt(player, propertyData)
            if ( HumanDecision ) {
              
            }
            newGameState.gameLog.push(`${currentPlayer.name} decided to pass on purchasing ${propertyData.name}`);
          }
        } else if (propertyData.ownerId !== 4 && propertyData.ownerId !== game.currentTurn) {

        }
      }

      return { newGameState, currentPlayer };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


const initialState = {
  game: {},
  error: null,
  loading: false,
};
const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    startGame: (state, action) => {
      state.game = action.payload;
    },
    rollDice: (state, action) => {
      const { diceRoll, AllTilesData, game } = action.payload;
      const currentPlayer = state.game.allPlayers[state.game.currentTurn];
      const newPosition = (currentPlayer.position + diceRoll) % 40;

      console.log(state.game);

      currentPlayer.position = newPosition;

      console.log(newPosition);
      const currentTile = AllTilesData.List[newPosition];
      const propertyData = game.initialProperties[currentTile.TilesDataIndex];

      console.log(currentTile, propertyData);

      const logEntry = `${currentPlayer.name} rolled a ${diceRoll} and moved to ${currentTile.label}`;
      state.game.gameLog.push(logEntry);

      const tileLabel = currentTile.label.toLowerCase();

      if (tileLabel.includes("go to jail")) {
        currentPlayer.inJail = true;
        state.game.gameLog.push(`${currentPlayer.name} was sent to jail.`);
        state.game.currentAction = `${currentPlayer.name} landed on "Go to Jail" and was sent to jail.`;
      } else if (tileLabel.toLowerCase().includes("tax")) {
        const tax = 200;
        currentPlayer.balance -= tax;
        state.game.gameLog.push(`${currentPlayer.name} paid ${tax} in ${tileLabel}.`);
      } else if (tileLabel.includes("super tax")) {
        const tax = 100;
        currentPlayer.balance -= tax;
        state.game.gameLog.push(`${currentPlayer.name} paid ${tax} in super tax.`);
        state.game.currentAction = `${currentPlayer.name} landed on "Super Tax" and paid ${tax}.`;
      } else if (tileLabel.includes("free parking")) {
        state.game.gameLog.push(`${currentPlayer.name} landed on Free Parking.`);
        state.game.currentAction = `${currentPlayer.name} landed on "Free Parking". Nothing happens.`;
      } else if (tileLabel.includes("chance")) {
        const fee = 50; // Set a fixed fee for "Chance"
        currentPlayer.balance -= fee;
        state.game.gameLog.push(`${currentPlayer.name} paid a ${fee} fee for landing on Chance.`);
        state.game.currentAction = `${currentPlayer.name} landed on "Chance" and paid a ${fee} fee.`;
      } else if (tileLabel.includes("community chest")) {
        const fee = 100; // Set a fixed fee for "Community Chest"
        currentPlayer.balance -= fee;
        state.game.gameLog.push(`${currentPlayer.name} paid a ${fee} fee for landing on Community Chest.`);
        state.game.currentAction = `${currentPlayer.name} landed on "Community Chest" and paid a ${fee} fee.`;
      }
      else if (propertyData) {
        console.log("Here property for sale");
        console.log(propertyData.ownerId !== null && propertyData.ownerId !== 4 && propertyData.ownerId !== currentPlayer.id);
        console.log(propertyData.ownerId === null);

        if (propertyData.ownerId !== null && propertyData.ownerId !== 4 && propertyData.ownerId !== currentPlayer.id) {
          const rent = Math.floor(propertyData.price * 0.1);
          currentPlayer.balance -= rent;

          const owner = state.game.allPlayers[propertyData.ownerId];
          owner.balance += rent;

          state.game.gameLog.push(`${currentPlayer.name} paid ${rent} in rent to ${owner.name}`);
          state.game.currentAction = `${currentPlayer.name} landed on ${currentTile.label}, owned by ${owner.name}, and paid ${rent} in rent.`;
        } else if (propertyData.ownerId === null) {
          if (!currentPlayer.isAI) {
            const ok = showHumanPlayerPrompt(currentPlayer, propertyData);
            if (ok) {
              if (currentPlayer.balance >= propertyData.price) {
                currentPlayer.balance -= propertyData.price;

                const updatedProperty = {
                  ...propertyData,
                  ownerId: game.currentTurn, // Update the owner
                };

                currentPlayer.properties = [...(currentPlayer.properties || []), updatedProperty];
                state.game.gameLog.push(`${currentPlayer.name} bought the property ${propertyData.name} for ${propertyData.price} $.`);

                state.game.initialProperties[currentTile.TilesDataIndex] = updatedProperty;

              } else {
                state.game.gameLog.push(`${currentPlayer.name} attempted to purchase ${propertyData.name}, but did not have enough funds.`);
              }
            }
          } else {


          }
        } else {
          state.game.currentAction = `${currentPlayer.name} landed on their own property (${currentTile.label}).`;
        }
      } else {
        state.game.currentAction = `${currentPlayer.name} landed on ${currentTile.label}.`;
      }

      state.game.currentTurn = (state.game.currentTurn + 1) % state.game.allPlayers.length;
    },
    endTurn: (state) => {
      const currentPlayer = state.game.allPlayers[state.game.currentTurn];
      state.game.gameLog.push(`${currentPlayer.name} ended their turn.`);

      state.game.currentTurn = (state.game.currentTurn + 1) % state.game.allPlayers.length;
    },

    endGame: (state) => {
      state.game.status = "completed";
      state.game.endTime = new Date().toISOString();
      state.game.gameLog.push("The game has ended.");
    },

    resetGame: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNewGame.fulfilled, (state, action) => {
        console.log("Game created successfully:", action.payload);
      })
      .addCase(createNewGame.rejected, (state, action) => {
        state.game.error = action.payload;
      })
      .addCase(fetchGameById.fulfilled, (state, action) => {
        state.game.loading = true;
        console.log("Game fetched successfully:", action.payload);
        state.game = action.payload;
        state.game.loading = false;
      })
      .addCase(fetchGameById.rejected, (state, action) => {
        state.game.loading = true;
        state.game.error = action.payload;
        state.game.loading = false;
      })
      .addCase(rollDiceAsync.fulfilled, (state, action) => {
        const { newGameState, currentPlayer } = action.payload;

        state.game = {
          ...newGameState,
          allPlayers: state.game.allPlayers.map((player, index) =>
            index === newGameState.currentTurn ? currentPlayer : player
          ),
        };
        state.game.currentTurn = (state.game.currentTurn + 1)%(state.game.allPlayers.length)
      });

  },
});

export const { startGame, rollDice, endTurn, resetGame, endGame } = gameSlice.actions;
export default gameSlice.reducer;
