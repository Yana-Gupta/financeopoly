import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getAllGames } from "../redux/authSlice";
import { createNewGame } from "../redux/actions/gameAction";
import { useNavigate } from "react-router-dom";

import PlusIcon from "../assets/svg/PlusIcon";

const GameCard = ({ game, navigate }) => {
  const isOngoing = game.status === "ongoing";

  return (
    <div
      key={game._id}
      className="p-4 border-[4px] rounded-lg shadow-lg hover:shadow-xl transition-shadow bg-red-950 border-red-800 flex flex-col justify-between max-w-96 h-96 game-card"
    >
      <div className="text-xl font-semibold mb-2 text-gray-200 w-full">
        Game {game._id}
      </div>
      <div className="text-lg text-black bg-orange-200 mb-4">
        Status:{" "}
        <span
          className={`bg-opacity-15 font-bold ${
            isOngoing ? "text-green-600" : "text-red-600"
          }`}
        >
          {game.status}
        </span>
      </div>
      {isOngoing ? (
        <button
          onClick={() => navigate(`/game/summary/${game._id}`)}
          className="bg-orange-500 text-white py-2 px-4 hover:bg-orange-600 rounded-xl transition duration-300 ease-in-out"
        >
          Enter Game
        </button>
      ) : (
        <div className="text-gray-300 font-medium">
          Winner:{" "}
          <span className="font-bold text-indigo-600">{game.winner}</span>
        </div>
      )}
    </div>
  );
};

const Game = () => {
  const { player, games } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Function to Create New Game
  const createGame = async () => {
    console.log("Game Created");
    console.log(player);

    try {
      const response = await dispatch(
        createNewGame({ playerId: player._id, playerName: player.name })
      ).unwrap();
      const gameId = response;

      console.log(response);
      navigate(`/game/summary/${gameId}`);
    } catch (error) {
      console.error("Error creating game:", error);
    }
  };

  // Fetch All Games
  useEffect(() => {
    if (player && player._id) {
      dispatch(getAllGames(player._id));
    }
    console.log(games);
  }, [player, dispatch]);

  return (
    <div className="flex-grow flex min-h-screen flex-col bg-gradient-to-r from-orange-500 to-orange-600 w-full text-center items-center ">
      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-10 w-full px-20 py-8">
        {games && games.length > 0 ? (
          games.map((game) => (
            <GameCard key={game._id} game={game} navigate={navigate} />
          ))
        ) : (
          <p className="text-white font-semibold text-lg">
            No games available. Create a new game!
          </p>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={createGame}
        className="fixed hover:bg-orange-500 flex justify-center items-center right-10 bottom-20 rounded-full h-20 w-20 bg-orange-400 shadow-lg shadow-red-900"
        aria-label="Create New Game"
        title="Create New Game"
      >
        <PlusIcon />
      </button>
    </div>
  );
};

export default Game;
