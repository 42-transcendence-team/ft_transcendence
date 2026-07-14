import { useState } from "react";
import { checkWinner, getWinningLine } from "./rules";
import { useGame } from "context/gameContext";

export type Player = "X" | "O";

export type TicTacToeMode = "local" | "online_create" | "online_join";

export type Board = [
	[Player | null, Player | null, Player | null],
	[Player | null, Player | null, Player | null],
	[Player | null, Player | null, Player | null]
];

const emptyBoard: Board = [
	[null, null, null],
	[null, null, null],
	[null, null, null],
];

type GameState = "menu" | "playing" | "finished" | "joining" | "waiting";

function createEmptyBoard(): Board {
	return emptyBoard.map(row => row.map(() => null)) as Board;
}

export function useTicTacToe() {
	const [ board, setBoard ] = useState<Board>(createEmptyBoard());
	const [ currentPlayer, setCurrentPlayer ] = useState<Player>("X");
	const [ gameState, setGameState ] = useState<GameState>("menu");
	const [ mode, setMode ] = useState<TicTacToeMode | null>(null);
	const { createGame, joinGame, makeMove, leaveGame } = useGame();

	const winner = checkWinner(board);
	const line = getWinningLine(board);
	const draw = !winner && board.flat().every(cell => cell !== null);

	function startGame(selectedMode: TicTacToeMode) {
		createGame("TICTACTOE", selectedMode);
		setMode(selectedMode);
		setBoard(createEmptyBoard());
		setCurrentPlayer("X");
		setGameState("playing");
	}

	function play(row: number, col: number) {
		if (gameState !== "playing") return;
		if (board[row][col]) return;

		makeMove({ row, col });

		const newBoard = structuredClone(board);

		newBoard[row][col] = currentPlayer;

		setBoard(newBoard);

		const newWinner = checkWinner(newBoard);
		const newDraw = newBoard.flat().every(cell => cell !== null);

		if (newWinner || newDraw) {
			setGameState("finished");
			return;
		}

		setCurrentPlayer(
			currentPlayer === "X" ? "O" : "X"
		);
	}

	function restart() {
		setBoard(createEmptyBoard());
		setCurrentPlayer("X");
		setGameState("playing");
	}


	function reset() {
		setBoard(createEmptyBoard());
		setCurrentPlayer("X");
		setMode(null);
		setGameState("menu");
	}

	return { board, currentPlayer, winner, line, draw, 
		gameState, mode, play, restart, reset, startGame,
	};
}