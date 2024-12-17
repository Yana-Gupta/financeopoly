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

      // Create the mutation to insert a new game
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

      // Simulate API call to save the game to the backend using fetch
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

      // Get the transactionId from the response
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

// Initial state based on schema
const initialState = {
  game: {}, error: null
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    startGame: (state, action) => {
      // This action is called after fetching the game data
      state.game = action.payload
    },

    rollDice: (state) => {
      const currentPlayer = state.players[state.currentTurn];
      const diceRoll = Math.ceil(Math.random() * 6) + Math.ceil(Math.random() * 6);

      currentPlayer.position = (currentPlayer.position + diceRoll) % 40;
      state.gameLog.push(
        `${currentPlayer.name} rolled a ${diceRoll} and moved to position ${currentPlayer.position}`
      );
      state.currentAction = `${currentPlayer.name} rolled a ${diceRoll}`;
    },

    endTurn: (state) => {
      const currentPlayer = state.players[state.currentTurn];
      state.gameLog.push(`${currentPlayer.name} ended their turn.`);

      state.currentTurn = (state.currentTurn + 1) % state.players.length;
      const nextPlayer = state.players[state.currentTurn];
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
        console.log("Game fetched successfully:", action.payload);
        // Start the game with the fetched data
        state.game = action.payload
      })
      .addCase(fetchGameById.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { startGame, rollDice, endTurn, resetGame, endGame } = gameSlice.actions;
export default gameSlice.reducer;
