import { TicTacToe } from "games/tictactoe/ticTacToe";
import { ConnectFour } from "games/connectFour/connectFour";
import { useNavigate } from "react-router-dom";
import { Goose } from "games/goose/goose";

export const games = [
	{
		id: "tictactoe",
		name: "Tic Tac Toe",
		description: "This is the first game.",
		aspectRatio: 1,
		component: TicTacToe,
	},
	// {
	// 	id: "parchis",
	// 	name: "Parchis",
	// 	description: "This is the second game.",
	// 	aspectRatio: 16 / 9,
	// 	component: () => <div>Parchis Game Component</div>,
	// },
	{
		id: "goose",
		name: "Goose",
		description: "This is the third game.",
		aspectRatio: 4 / 3,
		component: Goose,
	},
	{
		id: "connectfour",
		name: "Connect Four",
		description: "This is the fourth game.",
		aspectRatio: 4 / 3,
		component: ConnectFour,
	}
];

export const Games = () => {
	const navigate = useNavigate();

	function handleGameClick(gameId: string) {
		console.log(`Game ${gameId} clicked`);
	}

	function handleJoinGame(gameId: string) {
		console.log(`Joining game ${gameId}`);
		navigate(`/app/games/${gameId}`);
	}

	function displayGameList() {
		return (
			<ul className="game-list">
				{games.map((game) => (
					<li key={game.id} className="game-item" onClick={() => handleGameClick(game.id)}>
						<h2>{game.name}</h2>
						<p>{game.description}</p>
						<button onClick={(e) => { e.stopPropagation(); handleJoinGame(game.id); }}>Join Game</button>
					</li>
				))}
			</ul>
		);
	}

	return (
		<>
			<h1>Games</h1>
			{displayGameList()}
		</>
	);
};