const games = [
	{
		id: 1,
		name: "Game 1",
		description: "This is the first game.",
	},
	{
		id: 2,
		name: "Game 2",
		description: "This is the second game.",
	},
	{
		id: 3,
		name: "Game 3",
		description: "This is the third game.",
	},
];

export const Games = () => {

	function handleGameClick(gameId: number) {
		console.log(`Game ${gameId} clicked`);
	}

	function handleJoinGame(gameId: number) {
		console.log(`Joining game ${gameId}`);
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