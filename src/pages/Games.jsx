import { useDispatch, useSelector } from "react-redux"
import { useEffect } from "react"
import { getAllGames } from "../redux/authSlice"
import { createNewGame } from "../redux/gameSlice"
import { useNavigate } from "react-router-dom"

import PlusIcon from "../assets/svg/PlusIcon"

const Game = () => {
  const { player, games } = useSelector((state) => state.auth)
  const { game, error } = useSelector((state) => state.game)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const createGame = async () => {
    console.log("Game Created")
    console.log(player)

    try {
      const response = await dispatch(
        createNewGame({ playerId: player._id, playerName: player.name })
      )
      const gameId = response?.payload

      console.log(game)
      navigate(`/game/summary/${gameId}`)
    } catch (error) {
      console.error("Error creating game:", error)
    }
  }

  useEffect(() => {
    if (player && player._id) {
      dispatch(getAllGames(player._id))
    }
    console.log(games)
  }, [player])

  console.log(game)
  return (
    <div className="flex flex-col w-full text-center items-center justify-center">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10 w-full px-4">
        {games &&
          games.map((game, index) => {
            const isOngoing = game.status === "ongoing"
            const winner = game.winner || "No winner yet"

            return (
              <div
                key={game._id}
                className="p-4 border-2 rounded-lg shadow-lg hover:shadow-xl transition-shadow bg-white flex flex-col justify-between"
              >
                <div className="text-xl font-semibold mb-2">
                  Game {index + 1}
                </div>
                <div className="text-lg text-gray-700 mb-4">
                  Status:{" "}
                  <span
                    className={`font-bold ${
                      isOngoing ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {game.status}
                  </span>
                </div>
                {isOngoing ? (
                  <button
                    onClick={() => navigate(`/game/summary/${game._id}`)}
                    className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                  >
                    Enter Game
                  </button>
                ) : (
                  <div className="text-gray-800 font-medium">
                    Winner:{" "}
                    <span className="font-bold text-indigo-600">{winner}</span>
                  </div>
                )}
              </div>
            )
          })}
      </div>

      <button
        onClick={createGame}
        className="fixed hover:bg-cyan-700 flex justify-center items-center right-10 bottom-20 rounded-full h-20 w-20 bg-cyan-600 shadow-lg shadow-slate-700"
      >
        <PlusIcon />
      </button>
    </div>
  )
}

export default Game
