import { useCallback, useEffect, useRef } from "react";
import { useGoose, type GooseCell, type GoosePlayerState } from "games/goose/useGoose";

const PLAYER_COLORS: Record<number, string> = {
	1: "#e53935", 
	2: "#1e88e5",
	3: "#fdd835",
	4: "#43a047",
	5: "#8e24aa",
	6: "#fb8c00",
};

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

export function drawBoard(
	ctx: CanvasRenderingContext2D,
	board: GooseCell[],
	cellSize: number
) {
	board.forEach((cell) => {
		const position = getPosition(cell.number, cellSize);

		if (!position) {
			return;
		}

		const { x, y } = position;

		ctx.strokeRect(x, y, cellSize, cellSize);

		ctx.font = `${Math.max(12, cellSize * 0.2)}px Arial`;
		ctx.textAlign = "left";
		ctx.textBaseline = "top";
		ctx.fillText(String(cell.number), x + 5, y + 5);

		let emoji = "";

		switch (cell.type) {
			case "goose":
				emoji = "🪿";
				break;
			case "bridge":
				emoji = "🌉";
				break;
			case "inn":
				emoji = "🏠";
				break;
			case "dice":
				emoji = "🎲";
				break;
			case "well":
				emoji = "⛲";
				break;
			case "maze":
				emoji = "🌀";
				break;
			case "prison":
				emoji = "🚔";
				break;
			case "skull":
				emoji = "💀";
				break;
		}

		if (emoji) {
			ctx.font = `${cellSize * 0.7}px Arial`;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";

			ctx.fillText(
				emoji,
				x + cellSize / 2,
				y + cellSize / 2
			);
		}
	});
}

export function drawPlayers(
	ctx: CanvasRenderingContext2D,
	playerState: Record<string, GoosePlayerState> | null | undefined,
	cellSize: number
) {
	if (!playerState) {
		return;
	}

	const playersByPosition: Record<number, GoosePlayerState[]> = {};

	Object.values(playerState).forEach((player) => {
		if (player.position === 0) {
			return;
		}

		if (!playersByPosition[player.position]) {
			playersByPosition[player.position] = [];
		}

		playersByPosition[player.position].push(player);
	});

	Object.values(playersByPosition).forEach((players) => {
		const position = getPosition(players[0].position, cellSize);

		if (!position) {
			return;
		}

		const centerX = position.x + cellSize / 2;
		const centerY = position.y + cellSize / 2;

		const radius = cellSize * 0.22;

		players.forEach((player, index) => {
			let offsetX = 0;
			let offsetY = 0;

			if (players.length === 2) {
				offsetX = index === 0 ? -radius * 0.8 : radius * 0.8;
			} else if (players.length === 3) {
				if (index === 0) {
					offsetY = -radius * 0.8;
				} else if (index === 1) {
					offsetX = -radius * 0.8;
					offsetY = radius * 0.8;
				} else {
					offsetX = radius * 0.8;
					offsetY = radius * 0.8;
				}
			} else {
				const angle = (index / players.length) * Math.PI * 2;

				offsetX = Math.cos(angle) * radius * 0.75;
				offsetY = Math.sin(angle) * radius * 0.75;
			}

			const x = centerX + offsetX;
			const y = centerY + offsetY;

			ctx.save();

			ctx.beginPath();

			ctx.arc(x, y, radius, 0, Math.PI * 2);

			ctx.fillStyle = PLAYER_COLORS[player.token];
			ctx.fill();

			ctx.strokeStyle = "#222";
			ctx.lineWidth = 2;
			ctx.stroke();

			ctx.fillStyle = "#fff";
			ctx.font = `bold ${cellSize * 0.18}px Arial`;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";

			ctx.fillText(String(player.token), x, y);

			ctx.restore();
		});
	});
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
		<canvas
			ref={canvasRef} width={1000} height={1000} onClick={handleClick}
			style={{width: "100%", height: "100%", display: "block", position: "absolute", top: 0, left: 0}}
		/>
	);
}