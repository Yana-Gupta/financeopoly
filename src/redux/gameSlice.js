import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { showHumanPlayerPrompt, AIPLayerAction, fetchGameById, createNewGame, updateGameInSanity } from "./actions/gameAction"

const initialState = {
  game: {},
  error: null,
  loading: false,
  playing: false,
};
export const handleAIPropertyPurchase = createAsyncThunk(
  'game/handleAIPropertyPurchase',
  async (data, { getState, dispatch }) => {
    dispatch(gamePlaying());
    const { currentPlayer, propertyData, gameState } = data;

    console.log(currentPlayer, propertyData, gameState);
    try {
      await AIPLayerAction(currentPlayer, propertyData, gameState.allPlayers)
        .then(response => {
          if (response.toLowerCase() === "buy") {
            const updatedPlayer = {
              ...currentPlayer,
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

            // Dispatch the updated game state
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
    updateGameState: (state, action) => {
      const { log, gameState } = action.payload;
      state.game = gameState;  // Update the entire game state if necessary
      state.game.gameLog.push(log);  // Append the log message
    },
    gamePlaying: (state) => {
      state.playing = true;
    },
    gameNotPlaying: (state) => {
      state.playing = false;
    }
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
        state.game = action.payload;
        state.loading = false;
      })
      .addCase(fetchGameById.rejected, (state, action) => {
        state.loading = true;
        state.error = action.payload;
        state.loading = false;
      })

  },
});

export const { startGame, rollDice, endTurn, resetGame, endGame, updateGameState, gamePlaying, gameNotPlaying } = gameSlice.actions;
export default gameSlice.reducer;
