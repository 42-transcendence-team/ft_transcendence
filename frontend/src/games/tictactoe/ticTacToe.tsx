import { useTicTacToe } from "./useTicTacToe";

export function TicTacToe() {
	const { board, currentPlayer, winner, makeMove, resetGame } =
		useTicTacToe();

	return (
		<div>
			<h1>Tic Tac Toe</h1>

			<h2>Turno: {currentPlayer}</h2>

			{winner && <h2>Ganador: {winner}</h2>}

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(3, 60px)",
					gap: "5px",
				}}
			>
				{board.map((row, i) =>
					row.map((cell, j) => (
						<button
							key={`${i}-${j}`}
							onClick={() => makeMove(i, j)}
							style={{
								width: 60,
								height: 60,
								fontSize: 24,
							}}
						>
							{cell}
						</button>
					))
				)}
			</div>

			<button onClick={resetGame}>
				Reset
			</button>
		</div>
	);
}