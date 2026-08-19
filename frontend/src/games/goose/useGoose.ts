import { useGame, type GameState } from "context/gameContext";
import { useState } from "react";
import { GOOSE_BOARD } from "./components/board";

export type GooseMode = "local" | "online" | "join";

export type GooseCellType = "normal" | "goose" | "bridge" | "inn" | "well" | "maze" | "prison" | "dice" | "skull";

export interface GooseCell {
	number: number;
	type: GooseCellType;
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
	playerstate: Record<string, GoosePlayerState>;
	actions: GooseAction[];
	turn: number;
}

export function useGoose() {
	const [mode, setMode] = useState<GooseMode | null>(null);

	const {makeMove, gameState: rawGameState, returnMenu, joinGame} = useGame();

	const gameState = rawGameState as unknown as GooseGameState;

	const players = Object.entries(
		gameState.playerstate ?? {}
	).map(([id, player]) => ({
		id,
		...player,
	}));

	function rollDice() {
		if (gameState.status !== "PLAY") { return; }

		makeMove({});
	}

	function reset() {
		setMode(null);
		returnMenu();
	}

	return { mode, gameState, board: GOOSE_BOARD, players, rollDice, reset, joinGame };
}

export default useGoose;