import { useState } from "react";
import { useGame } from "context/gameContext";
import { type GameState } from "context/gameContext";

export type Player = "X" | "O";

type TicTacToeMode = "local" | "online" | "join";

export type TicTacToeBoard = [
	[Player | null, Player | null, Player | null],
	[Player | null, Player | null, Player | null],
	[Player | null, Player | null, Player | null]
];

export interface TicTacToeGameState extends GameState {
    board: number[][];
    turn: number;
    winning_line?: [number, number][];
}

function mapBackendToFrontendBoard(backendBoard: number[][] | null): TicTacToeBoard {
    const empty: TicTacToeBoard = [
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ];
    if (!backendBoard) return empty;

    return backendBoard.map(row => 
        row.map(cell => {
            if (cell === 1) return "X";
            if (cell === 2) return "O";
            return null;
        })
    ) as TicTacToeBoard;
}

export function useTicTacToe() {
    const [ mode, setMode ] = useState<TicTacToeMode | null>(null);
    const { makeMove, gameState: rawGameState, returnMenu, joinGame } = useGame();

    const gameState = rawGameState as unknown as TicTacToeGameState;

    const backendBoard = mapBackendToFrontendBoard(gameState.board);
    const currentTurn: Player = gameState.turn === 2 ? "O" : "X";
    
    const line = gameState.winning_line || null; 

    const draw = gameState.status === "FINISH" && !gameState.winner;

    function play(row: number, col: number) {
        if (gameState?.status !== "PLAY") return;
        if (backendBoard[row][col]) return;

        makeMove({ row, col });
    }

    function reset() {
        setMode(null);
        returnMenu();
    }

    return { currentPlayer: currentTurn, line, draw, backendBoard,
		gameState, mode, play, reset, returnMenu, joinGame
    };
}