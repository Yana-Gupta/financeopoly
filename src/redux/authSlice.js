import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchPlayerById = createAsyncThunk(
  "auth/fetchPlayerById",
  async (_, { rejectWithValue }) => {
    console.log("Fetching Player Data...");

    const playerId = localStorage.getItem("playerId");

    if (!playerId) {
      console.error("No playerId found in localStorage");
      return null;
    }
    console.log("Player ID from localStorage:", playerId);
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
            params: { playerId },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      console.log("Sanity API Response:", data);

      if (data.result) {
        return data.result;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching player:", error);
      return rejectWithValue("Error fetching player");
    }
  }
);

// Fetch all games for a given player
export const getAllGames = createAsyncThunk(
  "game/getAllGames",
  async (playerId, { rejectWithValue }) => {
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
            query: "*[_type == 'game' && humanPlayers match $playerId]",
            params: { playerId },
          }),
        }
      );

      const data = await response.json();

      if (data.result) {
        return data.result; // Return the list of games
      } else {
        return rejectWithValue("No games found for this player");
      }
    } catch (error) {
      return rejectWithValue("Error fetching games");
    }
  }
);



// Initial state
const initialState = {
  player: null,
  loading: false,
  error: null,
  games: [],
};

// Reducer slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.player = action.payload;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.player = null;
      state.error = null;
      state.games = []; // Clear games on logout
    },
    setGames: (state, action) => {
      state.games = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetching player data
      .addCase(fetchPlayerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlayerById.fulfilled, (state, action) => {
        state.loading = false;
        state.player = action.payload;
      })
      .addCase(fetchPlayerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllGames.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllGames.fulfilled, (state, action) => {
        state.loading = false;
        state.games = action.payload; // Store the games in the state
      })
      .addCase(getAllGames.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, setGames } = authSlice.actions;
export default authSlice.reducer;
