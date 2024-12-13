import "./style.css"

import React from "react"

import { TilesData } from "../utils/GameData"

const GameSummary = ({ id }) => {
  const [tableState, setTableState] = React.useState("stop")

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
      <div className="absolute right-20 top-[20%] py-1 px-2 w-[200px] border-4 rounded-lg border-red-700">
        <h1 className="text-2xl font-semibold"> Game Stats </h1>

        <div>


        </div>
      </div>
    </div>
  )
}

export default GameSummary
