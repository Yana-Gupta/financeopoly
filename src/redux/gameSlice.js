import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
const SANITY_API_TOKEN = "sk8oSSjaJahz6F2E93Gm2WVsqHEJubfdWT8YvAZQ2kLDLUFhHz3fHM6xaB8Q72BKmZxkPTSKE3Ec7RBDymlTI01XwKsBhatu8qnZTCcjWteUHJLQD1kos890V2cG76yFgKxcGwrXZeBVdo5e0XuLHRLclVHXowUcxBmf7hz3MY3I8MBqLIqT";



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

      // Create the game data
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

      const mutations = [
        {
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
          },

        },
      ];

      const response = await fetch(
        "https://z8q5dvew.api.sanity.io/v2021-06-07/data/mutate/production?returnIds=true",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SANITY_API_TOKEN}`, // Replace with your actual API token
          },
          body: JSON.stringify({ mutations }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create game");
      }

      const responseData = await response.json();
      const id = responseData.results[0].id;
      console.log("Game created, transactionId:", id);

      dispatch(fetchGameById(id)); // Fetch the game by its transactionId

      return id;
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

      // Sanity mutations
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
      state.game = action.payload
    },

    rollDice: (state, action) => {
      const { diceRoll, AllTilesData } = action.payload;
      const currentPlayer = state.game.allPlayers[state.game.currentTurn];
      const newPosition = (currentPlayer.position + diceRoll) % 40;

      currentPlayer.position = newPosition;

      console.log(newPosition)
      const currentTile = AllTilesData.List[newPosition];

      console.log(currentTile)

      const logEntry = `${currentPlayer.name} rolled a ${diceRoll} and moved to ${currentTile.label}`;
      state.game.gameLog.push(logEntry);

      if (currentTile.price > 0) {
        if (!currentTile.owner) {
          state.game.currentAction = `${currentPlayer.name} landed on ${currentTile.label}. It is available for purchase at ${currentTile.price}.`;
          currentTile.options = ["Buy", "Skip"];
        } else if (currentTile.owner !== currentPlayer.id) {
          const rent = Math.floor(currentTile.price * 0.1);
          currentPlayer.balance -= rent;
          const owner = state.game.allPlayers.find((player) => player.id === currentTile.owner);
          owner.balance += rent;

          state.game.gameLog.push(`${currentPlayer.name} paid ${rent} in rent to ${owner.name}`);
          state.game.currentAction = `${currentPlayer.name} landed on ${currentTile.label}, owned by ${owner.name}, and paid ${rent} in rent.`;
        } else {
          state.game.currentAction = `${currentPlayer.name} landed on their own property (${currentTile.label}).`;
        }
      } else if (currentTile.label.toLowerCase().includes("chance")) {
        state.game.currentAction = `${currentPlayer.name} landed on a Chance tile! Draw a card.`;
      } else if (currentTile.label.toLowerCase().includes("community chest")) {
        state.game.currentAction = `${currentPlayer.name} landed on a Community Chest tile! Draw a card.`;
      } else if (currentTile.label.toLowerCase().includes("tax")) {
        const tax = currentTile.price;
        currentPlayer.balance -= tax;
        state.game.gameLog.push(`${currentPlayer.name} paid ${tax} in tax.`);
        state.game.currentAction = `${currentPlayer.name} landed on ${currentTile.label} and paid ${tax} in tax.`;
      } else {
        state.game.currentAction = `${currentPlayer.name} landed on ${currentTile.label}.`;
      }
      state.game.currentTurn = (state.game.currentTurn + 1) % state.game.allPlayers.length;
    },



    endTurn: (state) => {
      const currentPlayer = state.players[state.currentTurn];
      state.gameLog.push(`${currentPlayer.name} ended their turn.`);

      state.currentTurn = (state.currentTurn + 1) % state.players.length;
      const nextPlayer = state.allPlayers[state.currentTurn];
      state.currentAction = `${nextPlayer.name}'s turn!`;
    },

    endGame: (state) => {
      state.status = "completed";
      state.endTime = new Date().toISOString();
      state.gameLog.push("The game has ended.");
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
        state.error = action.payload;
      })
      .addCase(fetchGameById.fulfilled, (state, action) => {
        state.loading = true;
        console.log("Game fetched successfully:", action.payload);
        state.game = action.payload
        state.loading = false
      })
      .addCase(fetchGameById.rejected, (state, action) => {
        state.loading = true;
        state.error = action.payload;
        state.loading = false;
      })


  },
});

export const { startGame, rollDice, endTurn, resetGame, endGame } = gameSlice.actions;
export default gameSlice.reducer;
