import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";


export const fetchGameById = createAsyncThunk(
  "game/fetchById",
  async (transactionId, { rejectWithValue }) => {
    try {
      // Fetch the created game using the transactionId
      const response = await fetch(
        `https://z8q5dvew.api.sanity.io/v2021-06-07/data/query/production?query=*[_id=="${transactionId}"]`
      );

      const gameDataFromSanity = await response.json();

      if (!response.ok) {
        throw new Error('Failed to fetch game data');
      }

      console.log("Fetched game data from Sanity:", gameDataFromSanity);

      return gameDataFromSanity.result[0]; // Return the game data
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


// Async thunk to create a new game
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
        players: [
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
            players: gameData.players.map(player => ({
              _type: "player", 
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
          }
        }
      ];

      // Simulate API call to save the game to the backend using fetch
      const response = await fetch('https://z8q5dvew.api.sanity.io/v2021-06-07/data/mutate/production', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer YOUR_SANITY_API_TOKEN`,  // Replace with your actual API token
        },
        body: JSON.stringify({ mutations }),
      });

      if (!response.ok) {
        throw new Error('Failed to create game');
      }

      // Get the transactionId from the response
      const responseData = await response.json();
      const transactionId = responseData.transactionId;
      console.log("Game created, transactionId:", transactionId);

      return transactionId; // Return the transactionId to fetch the game later
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to fetch game data by transactionId

// Initial state based on schema
const initialState = {
  gameId: "",
  status: "ongoing", // Default status is ongoing
  startTime: "",
  endTime: null,
  currentTurn: 0,
  players: [],
  gameLog: [],
  error: null,
  currentAction: null,
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    startGame: (state, action) => {
      // This action is called after fetching the game data
      const { gameId, status, startTime, players, gameLog, currentTurn } = action.payload;

      state.gameId = gameId;
      state.status = status;
      state.startTime = startTime;
      state.players = players;
      state.gameLog = gameLog;
      state.currentTurn = currentTurn;
      state.currentAction = `${players[0].name}'s turn!`;
    },

    rollDice: (state) => {
      const currentPlayer = state.players[state.currentTurn];
      const diceRoll = Math.ceil(Math.random() * 6) + Math.ceil(Math.random() * 6);

      currentPlayer.position = (currentPlayer.position + diceRoll) % 40;
      state.gameLog.push(`${currentPlayer.name} rolled a ${diceRoll} and moved to position ${currentPlayer.position}`);
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
        dispatch(gameSlice.actions.startGame(action.payload)); // Start the game with fetched data
      })
      .addCase(fetchGameById.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { startGame, rollDice, endTurn, resetGame, endGame } = gameSlice.actions;
export default gameSlice.reducer;
