import "./style.css"

import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { TilesData } from "../utils/GameData"
import { AllTilesData } from "../utils/AllTilesData"
import { useParams } from "react-router-dom"
import {
  rollDice,
  gamePlaying,
  gameNotPlaying,
  endTurn,
} from "../redux/gameSlice"

import {
  fetchGameById, updateGameInSanity, handleAIPropertyPurchase,
} from "../redux/actions/gameAction"

const playerColors = ["#e74c3c", "#3498db", "#2ecc71", "#f1c40f"]

const GameSummary = () => {
  const [tableState, setTableState] = React.useState("stop")

  const { game, playing, loading } = useSelector((state) => state.game)

  const dispatch = useDispatch()
  const { id } = useParams()

  useEffect(() => {
    dispatch(fetchGameById(id))
  }, [dispatch, id])

  const toggleTable = () => {
    if (tableState === "stop") {
      setTableState("start")
      setTimeout(() => setTableState("rotation"), 2000)
      document.getElementById("game-stat").style.display = "none"
      document.getElementById("game-log").style.display = "none"
    } else {
      setTableState("hide")
      setTimeout(() => setTableState("stop"), 2000)
      document.getElementById("game-stat").style.display = "block"
      document.getElementById("game-log").style.display = "block"
    }
  }

  const handleDiceRoll = async () => {
    dispatch(gamePlaying())
    const diceRoll = Math.ceil(Math.random() * 6) + Math.ceil(Math.random() * 6)

    console.log(game.currentTurn)

    dispatch(rollDice({ diceRoll, AllTilesData, game }))

    const currentPlayer = game.allPlayers[game.currentTurn]
    const currentTile =
      AllTilesData.List[(currentPlayer.position + diceRoll) % 40]

    console.log(currentTile, AllTilesData.List, currentPlayer)

    if (currentTile.TilesDataIndex !== null && currentPlayer.isAI) {
      const propertyData = game.initialProperties[currentTile.TilesDataIndex]
      console.log(
        game.initialProperties,
        game.initialProperties[currentTile.TilesDataIndex],
        currentTile.TilesDataIndex,
        currentTile
      )
      console.log(propertyData)
      if (propertyData.ownerId === null) {
        console.log("there is an ai buying ")
        await dispatch(
          handleAIPropertyPurchase({
            currentPlayer,
            propertyData,
            gameState: game,
            diceRoll,
          })
        )
      }
    }

    await dispatch(endTurn())

    await dispatch(updateGameInSanity())
      .then(() => {
        console.log("Game state successfully synced with Sanity")
      })
      .catch((error) => {
        console.error("Error syncing game state with Sanity:", error)
      })

    dispatch(gameNotPlaying())
  }
  console.log(game)

  if (loading) return <div> Loading... </div>

  if (game)
    return (
      <div className="gameBoard bg-orange-100">
        <div
          className="absolute left-8 top-[20%] py-2 px-4 w-[300px] border-4 rounded-lg border-orange-500 bg-white shadow-lg"
          id="game-log"
        >
          <h1 className="text-2xl font-semibold mb-2">Game Logs</h1>
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {game?.gameLog?.length > 0 ? (
              game.gameLog.map((log, index) => (
                <div
                  key={index}
                  className={`p-1 border ${
                    index % 2 === 0 ? "bg-gray-100" : "bg-white"
                  } rounded`}
                >
                  <p className="text-sm">{log}</p>
                </div>
              ))
            ) : (
              <p>No game logs available.</p>
            )}
          </div>
        </div>

        <div className="absolute top-10 left-8">
          <button
            disabled={playing}
            onClick={handleDiceRoll}
            className="bg-green-500 text-black py-2 px-4 rounded hover:bg-green-600"
          >
            Roll Dice { game && game?.allPlayers && game?.allPlayers[game?.currentTurn]?.name}  🎲
          </button>
        </div>

        <div className={`table ${tableState}`} onClick={toggleTable}>
          <div className="frame">
            <div className="corner tile tl" style={{ "--order": 1 }}>
              <div>
                free <span>🅿️</span> parking
              </div>
              {game?.allPlayers?.map((player, index) => {
                if (AllTilesData.List[player.position].order == 1) {
                  return (
                    <span
                      className="text-white flex flex-row items-center justify-center rounded-md -top-4 z-50"
                      style={{
                        fontSize: "16px",
                        backgroundColor: playerColors[index],
                        padding: "2px 2px",
                      }}
                    >
                      {player.name}
                    </span>
                  )
                } else return ""
              })}
            </div>
            <div className="corner tile tr" style={{ "--order": 11 }}>
              <div>
                go to <span>👮</span> jail
              </div>
              {game?.allPlayers?.map((player, index) => {
                if (AllTilesData.List[player.position].order == 1) {
                  return (
                    <span
                      className="text-white flex flex-row items-center justify-center rounded-md -top-4 z-50"
                      style={{
                        fontSize: "16px",
                        backgroundColor: playerColors[index],
                        padding: "2px 2px",
                      }}
                    >
                      {player.name}
                    </span>
                  )
                } else return <div> </div>
              })}
            </div>
            <div className="corner bl" style={{ "--order": 31 }}>
              <div>
                in <span>🗝</span> jail
              </div>
              {game?.allPlayers?.map((player, index) => {
                if (AllTilesData.List[player.position].order == 31)
                  return (
                    <span
                      className="text-white flex flex-row items-center justify-center rounded-md -top-4 z-50"
                      style={{
                        fontSize: "16px",
                        backgroundColor: playerColors[index],
                        padding: "2px 2px",
                      }}
                    >
                      {player.name}
                    </span>
                  )
                else return ""
              })}
            </div>
            <div className="corner tile br" style={{ "--order": 41 }}>
              <div>
                <em>
                  collect <br /> £200 salary as you pass
                </em>{" "}
                go <span>↖️</span>
              </div>
              {game?.allPlayers?.map((player, index) => {
                if (AllTilesData.List[player.position].order == 41)
                  return (
                    <span
                      className="text-white flex flex-row items-center justify-center rounded-md relative -top-4 z-50"
                      style={{
                        fontSize: "16px",
                        backgroundColor: playerColors[index],
                        padding: "2px 2px",
                      }}
                    >
                      {player.name}
                    </span>
                  )
                else return ""
              })}
            </div>
            <div className="center" style={{ "--order": 13 }}>
              <div className="logo ">Financopoly</div>
              <div className="cards community">community chest</div>
              <div className="cards chance">chance</div>
            </div>
            {TilesData.List.map((tile, index) => (
              <div
                key={index}
                className={`tile ${tile.pos} ${tile.color} tile`}
                style={{ "--order": tile.order }}
              >
                <div className="inside">
                  <h2>{tile.label}</h2>
                  <span>{tile.icon}</span>
                  <strong>{tile.price}</strong>

                  {game?.allPlayers?.map((player, index) => {
                    if (AllTilesData.List[player.position].order == tile.order)
                      return (
                        <span
                          className="text-white flex flex-row items-center justify-center rounded-md -top-4 z-50"
                          style={{
                            fontSize: "12px",
                            backgroundColor: playerColors[index],
                            padding: "2px 2px",
                          }}
                        >
                          {player.name}
                        </span>
                      )
                    else return ""
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="absolute right-8 top-[20%] py-2 px-4 w-[300px] border-4 rounded-lg border-orange-400 bg-white shadow-lg"
          id="game-stat"
        >
          <h1 className="text-2xl font-semibold mb-2">Game Stats</h1>
          <div className="max-h-[300px] overflow-y-auto">
            {game && game?.allPlayers?.length > 0 ? (
              game.allPlayers.map((player, index) => (
                <div
                  key={index}
                  className="border-b py-2 px-1 last:border-b-0 space-y-1"
                >
                  <h2 className="font-bold text-lg">
                    {player.name}{" "}
                    <span className="text-sm">
                      ({player.isAI ? "AI Player 🤖" : "Human 🧑"})
                    </span>
                  </h2>
                  <p>💰 Balance: ${player.balance}</p>
                  <p>🚩 Position: {player.position}</p>
                  <p>🏠 Properties Owned: {player.properties?.length || 0}</p>
                </div>
              ))
            ) : (
              <p>No player stats available.</p>
            )}
          </div>

          <div className="absolute bottom-8 "></div>
        </div>
      </div>
    )

  return <></>
}

export default GameSummary
