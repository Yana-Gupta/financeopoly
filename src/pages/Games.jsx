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
    <div className="flex flex-row w-full text-center items-center justify-center">
      <div className="grid grid-cols-3 gap-4 my-10 justify-between w-full">
        {games &&
          games.map((game, index) => {
            console.log(game)
            return (
              <div key={game._id} className="w-60 h-80">
                <div> Game {index + 1} </div>
                <div>
                </div>
                <div> {game.status} </div>
              </div>
            )
          })}
      </div>

      <button
        onClick={() => createGame()}
        className="fixed hover:bg-cyan-700 flex justify-center items-center right-10 bottom-20 rounded-full h-20 w-20 bg-cyan-600 shadow-lg shadow-slate-700 "
      >
        <PlusIcon />
      </button>
    </div>
  )
}

export default Game
