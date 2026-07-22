// import type { TicTacToeBoard, Player } from './useTicTacToe';

// export function checkWinner(board: TicTacToeBoard): Player | null {
// 	for (let i = 0; i < 3; i++) {
// 		if (board[i][0] && board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
// 			return board[i][0];
// 		}
// 		if (board[0][i] && board[0][i] === board[1][i] && board[1][i] === board[2][i]) {
// 			return board[0][i];
// 		}
// 	}
// 	if (board[0][0] && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
// 		return board[0][0];
// 	}
// 	if (board[0][2] && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
// 		return board[0][2];
// 	}
// 	return null;
// }

// export function getWinningLine(board: TicTacToeBoard): [number, number][] | null {
// 	for (let i = 0; i < 3; i++) {
// 		if (board[i][0] && board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
// 			return [
// 				[i, 0],
// 				[i, 1],
// 				[i, 2],
// 			];
// 		}

// 		if ( board[0][i] && board[0][i] === board[1][i] && board[1][i] === board[2][i]) {
// 			return [
// 				[0, i],
// 				[1, i],
// 				[2, i],
// 			];
// 		}
// 	}

// 	if (board[0][0] && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
// 		return [
// 			[0, 0],
// 			[1, 1],
// 			[2, 2],
// 		];
// 	}

// 	if (board[0][2] && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
// 		return [
// 			[0, 2],
// 			[1, 1],
// 			[2, 0],
// 		];
// 	}

// 	return null;
// }