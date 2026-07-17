import { useState } from "react";
import { checkWinner, getWinningLine } from "./rules";
import { useGame } from "context/gameContext";

export type Player = "X" | "O";

export type TicTacToeMode = "local" | "online_create" | "online_join";

export type TicTacToeBoard = [
	[Player | null, Player | null, Player | null],
	[Player | null, Player | null, Player | null],
	[Player | null, Player | null, Player | null]
];

const emptyBoard: TicTacToeBoard = [
	[null, null, null],
	[null, null, null],
	[null, null, null],
];

function createEmptyBoard(): TicTacToeBoard {
	return emptyBoard.map(row => row.map(() => null)) as TicTacToeBoard;
}

export function useTicTacToe() {
	const [ board, setBoard ] = useState<TicTacToeBoard>(createEmptyBoard());
	const [ currentPlayer, setCurrentPlayer] = useState<Player>("X");
	const [ mode, setMode ] = useState<TicTacToeMode | null>(null);
	const { createGame, joinGame, makeMove, leaveGame, gameState, setGameStatus, returnMenu } = useGame();

	const winner = checkWinner(board);
	const line = getWinningLine(board);
	const draw = !winner && board.flat().every(cell => cell !== null);

	function startGame(selectedMode: TicTacToeMode) {
		createGame("TICTACTOE", selectedMode);
		setMode(selectedMode);
		setBoard(createEmptyBoard());
		setCurrentPlayer("X");
		console.log(`gameGameState: ${gameState.status}`);
	}

	function play(row: number, col: number) {
		if (gameState?.status !== "PLAYING") return;
		if (board[row][col]) return;

		makeMove({ row, col });

		const newBoard = structuredClone(board);

		newBoard[row][col] = currentPlayer;

		setBoard(newBoard);

		const newWinner = checkWinner(newBoard);
		const newDraw = newBoard.flat().every(cell => cell !== null);

		if (newWinner || newDraw) {
			setGameStatus("FINISHED");
			return;
		}

		setCurrentPlayer(
			currentPlayer === "X" ? "O" : "X"
		);
	}

	function reset() {
		setBoard(createEmptyBoard());
		setCurrentPlayer("X");
		setMode(null);
		returnMenu();
	}

	return { board, currentPlayer, winner, line, draw, 
		gameState, mode, play, reset, startGame, returnMenu
	};
}