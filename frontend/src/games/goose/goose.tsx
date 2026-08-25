import { useCallback, useEffect, useRef } from "react";
import { useGoose } from "games/goose/useGoose";
import { drawBoard, drawPlayers } from "./components/board";

export function getPosition(number: number, cellSize: number) {
	if (number === 0) {
		return null;
	}

	const position = number - 1;

	const row = Math.floor(position / 9);
	const column = position % 9;

	const visualColumn = row % 2 === 0 ? column : 8 - column;

	return {
		x: visualColumn * cellSize,
		y: row * cellSize,
	};
}

export function Goose() {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const { board, rollDice, gameState } = useGoose();

	const draw = useCallback(() => {
		const canvas = canvasRef.current;

		if (!canvas) {
			return;
		}

		const ctx = canvas.getContext("2d");

		if (!ctx) {
			return;
		}

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const cellSize = canvas.width / 9;

		drawBoard(ctx, board, cellSize);
		drawPlayers(ctx, gameState.playerstate ?? {}, cellSize);
	}, [board, gameState.playerstate]);

	useEffect(() => {
		draw();
	}, [draw]);

	function handleClick() {
		rollDice();
	}

	return (
		<canvas ref={canvasRef} width={1000} height={900} onClick={handleClick}
			style={{width: "100%", height: "100%", display: "block", position: "absolute", top: 0, left: 0}}
/>
	);
}