import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import Store from "./redux/store.js";
import Layout from "./components/Layout.jsx";
import Game from "./pages/Games.jsx";
import ErrorComponent from "./components/Error.jsx";
import GameSummary from "./pages/GameSummary.jsx";
import dotenv from 'dotenv';


const appRouter = createBrowserRouter([
  {
    path: "/",
    element:  <App />,
    children: [
      {
        path: "/",
        element: <App />,
      },
      {
        path: "/game",
        element: <Game />,
      },
      {
        path: "/game/summary/:id",
        element: <GameSummary />,
      },
    ],
    errorElement: <ErrorComponent />,
  },
]);

dotenv.config();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={Store}>
      <RouterProvider router={appRouter} />
    </Provider>
  </StrictMode>
);
