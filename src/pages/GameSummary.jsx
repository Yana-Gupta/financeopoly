import "./style.css"

import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { TilesData } from "../utils/GameData"
import { useParams } from "react-router-dom"
import { fetchGameById } from "../redux/gameSlice"

const GameSummary = () => {
  const [tableState, setTableState] = React.useState("stop")

  const { game, error } = useSelector((state) => state.game)

  const dispatch = useDispatch()
  const { id } = useParams()

  useEffect(() => {
    dispatch(fetchGameById(id))
  }, [dispatch, id])

  const toggleTable = () => {
    if (tableState === "stop") {
      setTableState("start")
      setTimeout(() => setTableState("rotation"), 2000)
    } else {
      setTableState("hide")
      setTimeout(() => setTableState("stop"), 2000)
    }
  }

  return (
    <div className="gameBoard">
      {/* Game Logs */}
      <div className="absolute left-8 top-[20%] py-2 px-4 w-[350px] border-4 rounded-lg border-red-700 bg-white shadow-lg">
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

      {/* Game Board */}
      <div className={`table ${tableState}`} onClick={toggleTable}>
        <div className="frame">
          <div className="corner tl" style={{ "--order": 1 }}>
            <div>
              free <span>🅿️</span> parking
            </div>
          </div>
          <div className="corner tr" style={{ "--order": 11 }}>
            <div>
              go to <span>👮</span> jail
            </div>
          </div>
          <div className="corner bl" style={{ "--order": 31 }}>
            <div>
              in <span>🗝</span> jail
            </div>
          </div>
          <div className="corner br" style={{ "--order": 41 }}>
            <div>
              <em>
                collect <br /> £200 salary as you pass
              </em>{" "}
              go <span>↖️</span>
            </div>
          </div>
          <div className="center" style={{ "--order": 13 }}>
            <div className="logo">Financopoly</div>
            <div className="cards community">community chest</div>
            <div className="cards chance">chance</div>
          </div>
          {TilesData.List.map((tile, index) => (
            <div
              key={index}
              className={`tile ${tile.pos} ${tile.color}`}
              style={{ "--order": tile.order }}
            >
              <div className="inside">
                <h2>{tile.label}</h2>
                <span>{tile.icon}</span>
                <strong>{tile.price}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute right-20 top-[20%] py-2 px-4 w-[350px] border-4 rounded-lg border-blue-700 bg-white shadow-lg">
        <h1 className="text-2xl font-semibold mb-2">Game Stats</h1>
        <div className="max-h-[300px] overflow-y-auto">
          {game?.allPlayers?.length > 0 ? (
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
      </div>
    </div>
  )
}

export default GameSummary
