import { useGame, type GameState } from "context/gameContext";
import { useState } from "react";

export type GooseMode = "local" | "online" | "join";

export type GooseCellType = "normal" | "goose" | "bridge" | "inn"
	| "well" | "maze" | "prison" | "dice" | "skull";

export interface GooseCell {
	number: number;
	type: GooseCellType;
}

export interface GooseBackendCell {
	Number: number;
	Type: number;
}

export interface GoosePlayerState {
	position: number;
	skip_turns: number;
	in_well: boolean;
	in_prison: boolean;
	token: number;
}

export interface GooseAction {
	type: string;
	token: number;
	from?: number;
	to?: number;
	dice1?: number;
	dice2?: number;
	payload?: string;
}

export interface GooseGameState extends GameState {
	board: GooseBackendCell[] | null;
	playerstate: Record<string, GoosePlayerState>;
	actions: GooseAction[];
	turn: number;
}

function mapCellType(type: number): GooseCellType {
	switch (type) {
		case 1:
			return "goose";
		case 2:
			return "bridge";
		case 3:
			return "inn";
		case 4:
			return "well";
		case 5:
			return "maze";
		case 6:
			return "prison";
		case 7:
			return "dice";
		case 8:
			return "skull";
		default:
			return "normal";
	}
}


function mapBackendBoard(board: GooseGameState["board"]): GooseCell[] {
	if (!board) {
		return [];
	}

	return board.map((cell) => ({
		number: cell.Number,
		type: mapCellType(cell.Type),
	}));
}


export function useGoose() {
	const [mode, setMode] = useState<GooseMode | null>(null);

	const {
		makeMove,
		gameState: rawGameState,
		returnMenu,
		joinGame,
	} = useGame();

	const gameState = rawGameState as unknown as GooseGameState;

	const board = mapBackendBoard(gameState.board);

	const players = Object.entries(gameState.playerstate ?? {}).map(
		([id, player]) => ({
			id,
			...player,
		})
	);

	function rollDice() {
		if (gameState.status !== "PLAY") {
			return;
		}

		makeMove({});
	}

	function reset() {
		setMode(null);
		returnMenu();
	}

	return {
		mode,
		gameState,
		board,
		players,
		rollDice,
		reset,
		joinGame,
	};
}
export default useGoose;