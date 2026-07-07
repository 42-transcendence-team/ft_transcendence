import { Games } from "@pages/Games";
import { TicTacToe } from "games/tictactoe/ticTacToe";

export const GameRoutes = {
	path: "games",
	children: [
		{ index: true, element: <Games /> },
		{ path: "tictactoe", element: <TicTacToe /> }
	],
};
