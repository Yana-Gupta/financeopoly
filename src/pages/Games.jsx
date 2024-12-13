import { useDispatch, useSelector } from "react-redux"
import { useEffect } from "react"
import { getAllGames } from "../redux/authSlice"
import { createNewGame } from "../redux/gameSlice"

import PlusIcon from "../assets/svg/PlusIcon"

const Game = () => {
  const { player, games } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  const createGame = () => {
    console.log("Game Created")
    dispatch(createNewGame({playerId: player._id, playerName: player.name}));
  }

  useEffect(() => {
    if (player && player._id) {
      console.log("Fetching games for player", player._id)
      dispatch(getAllGames(player._id))
    }
  }, [player])

  return (
    <div className="flex flex-row w-full text-center items-center justify-center">
      <h2 className="text-center">Games List</h2>
      <div className="grid grid-cols-3 gap-4">
        {games &&
          games.map((game, index) => {
            return <div className=""></div>
          })}
      </div>

      <button
        onClick={() => createGame()}
        className="absolute hover:bg-cyan-700 flex justify-center items-center right-10 bottom-20 rounded-full h-20 w-20 bg-cyan-600 shadow-lg shadow-slate-700 "
      >
        <PlusIcon />
      </button>
    </div>
  )
}

export default Game
