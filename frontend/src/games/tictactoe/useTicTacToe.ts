import { useState } from 'react';
import { checkWinner } from './rules';

export type Player = "X" | "O";
export type Cell = Player | null;
export type Board = Cell[][];

export function useTicTacToe() {
  const [board, setBoard] = useState<Board>([
	[null, null, null],
	[null, null, null],
	[null, null, null],
  ]);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Player | null>(null);

  const makeMove = (row: number, col: number) => {
	if (board[row][col] || winner) {
	  return;
	}

	const newBoard = board.map((r, i) =>
	  r.map((cell, j) => (i === row && j === col ? currentPlayer : cell))
	) as Board;

	setBoard(newBoard);
	const newWinner = checkWinner(newBoard);
	if (newWinner) {
	  setWinner(newWinner);
	} else {
	  setCurrentPlayer(prev => (prev === 'X' ? 'O' : 'X'));
	}
  };

  const resetGame = () => {
	setBoard([
	  [null, null, null],
	  [null, null, null],
	  [null, null, null],
	]);
	setCurrentPlayer('X');
	setWinner(null);
  };

  return { board, currentPlayer, winner, makeMove, resetGame };
}
