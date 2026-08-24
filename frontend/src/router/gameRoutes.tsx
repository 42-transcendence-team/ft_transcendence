
import { Games } from "@pages/Games";
import GameView from "@pages/GameView";

export const GameRoutes = {
	path: "games",
	children: [
		{ index: true, element: <Games /> },
		{ path: ":gameType", element: <GameView /> },
		{ path: ":gameType/:gameId", element: <GameView /> },
	],
};
