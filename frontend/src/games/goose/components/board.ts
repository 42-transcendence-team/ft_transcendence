import { type GooseCell, type GooseCellType, type GoosePlayerState } from "games/goose/useGoose";
import { getPosition } from "./actions";

const PLAYER_COLORS: Record<number, string> = {
	1: "#e53935",
	2: "#1e88e5",
	3: "#fdd835",
	4: "#43a047",
	5: "#8e24aa",
	6: "#fb8c00",
};

const CELL_BORDER = "#4a4036";

const GOOSE_CELL_TYPES: Record<number, GooseCellType> = {
	5: "goose",
	9: "goose",
	14: "goose",
	18: "goose",
	23: "goose",
	27: "goose",
	32: "goose",
	36: "goose",
	41: "goose",
	45: "goose",
	50: "goose",
	54: "goose",
	59: "goose",

	6: "bridge",
	12: "bridge",
	19: "inn",
	26: "dice",
	31: "well",
	42: "maze",
	53: "dice",
	56: "prison",
	58: "skull",
};

export const GOOSE_BOARD: GooseCell[] = Array.from(
	{ length: 64 },
	(_, number) => ({
		number,
		type: GOOSE_CELL_TYPES[number] ?? "normal",
	})
);

function drawPencilLine(ctx: CanvasRenderingContext2D,
	x1: number, y1: number, x2: number, y2: number, seed: number) {
	const steps = 14;

	ctx.beginPath();

	for (let i = 0; i <= steps; i++) {
		const t = i / steps;

		let x = x1 + (x2 - x1) * t;
		let y = y1 + (y2 - y1) * t;

		const noise = ((seed * 37 + i * 17) % 9) - 4;

		const offset = noise * 0.45;

		if (Math.abs(x2 - x1) > Math.abs(y2 - y1)) {
			y += offset;
		} else {
			x += offset;
		}

		if (i === 0) {
			ctx.moveTo(x, y);
		} else {
			ctx.lineTo(x, y);
		}
	}

	ctx.stroke();
}

function getCellEmoji(type: GooseCell["type"]): string {
	switch (type) {
		case "goose":
			return "🪿";
		case "bridge":
			return "🌉";
		case "inn":
			return "🏠";
		case "dice":
			return "🎲";
		case "well":
			return "⛲";
		case "maze":
			return "🌀";
		case "prison":
			return "🚔";
		case "skull":
			return "💀";
		default:
			return "";
	}
}

function getCellBackground(type: GooseCell["type"]): string {
	switch (type) {
		case "goose":
			return "#fff4c2";
		case "bridge":
			return "#dff1ff";
		case "inn":
			return "#ffe3d3";
		case "dice":
			return "#e7ddff";
		case "well":
			return "#d8f4f2";
		case "maze":
			return "#eee0ff";
		case "prison":
			return "#e7e7e7";
		case "skull":
			return "#f5d8dc";
		default:
			return "#fffdf7";
	}
}

export function drawBoard( ctx: CanvasRenderingContext2D, board: GooseCell[], cellSize: number) {
	ctx.save();

	ctx.textBaseline = "middle";
	ctx.textAlign = "center";

	board.forEach((cell) => {
		const position = getPosition(cell.number, cellSize);

		if (!position) { return; }

		const { x, y } = position;

		ctx.fillStyle = getCellBackground(cell.type);

		ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);

		ctx.save();

		ctx.strokeStyle = CELL_BORDER;
		ctx.lineWidth = 3;
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
		ctx.globalAlpha = 0.8;

		drawPencilLine(ctx, x + 2, y + 2, x + cellSize - 2, y + 2, cell.number);

		drawPencilLine(ctx, x + cellSize - 2, y + 2, x + cellSize - 2, y + cellSize - 2, cell.number + 20);

		drawPencilLine(ctx, x + cellSize - 2, y + cellSize - 2, x + 2, y + cellSize - 2, cell.number + 40);

		drawPencilLine(ctx, x + 2, y + cellSize - 2, x + 2, y + 2, cell.number + 60);

		ctx.restore();

		ctx.save();

		ctx.fillStyle = "#51483e";
		ctx.font = `bold ${Math.max(12, cellSize * 0.17)}px Arial`;

		ctx.textAlign = "left";
		ctx.textBaseline = "top";

		ctx.fillText(String(cell.number), x + cellSize * 0.08, y + cellSize * 0.07);

		ctx.restore();

		const emoji = getCellEmoji(cell.type);

		if (!emoji) { return; }

		ctx.save();

		ctx.font = `${cellSize * 0.58}px Arial`;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";

		ctx.globalAlpha = 0.9;

		ctx.fillText(emoji, x + cellSize / 2, y + cellSize / 2 + cellSize * 0.04);

		ctx.restore();
	});

	const finish = getPosition(63, cellSize);

	if (finish) {
		drawFinish(ctx, cellSize);		
	}

	ctx.restore();
}

function drawFinish(
	ctx: CanvasRenderingContext2D,
	cellSize: number
) {
	const finish = getPosition(63, cellSize);

	if (!finish) {
		return;
	}

	const centerX = finish.x + cellSize / 2;
	const centerY = finish.y + cellSize / 2;

	ctx.save();

	ctx.fillStyle = "#fff1a8";
	ctx.globalAlpha = 0.65;

	ctx.fillRect(finish.x + 3, finish.y + 3, cellSize - 6, cellSize - 6);

	ctx.globalAlpha = 1;

	ctx.font = `${cellSize * 0.58}px Arial`;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	ctx.fillText("👑", centerX, centerY + cellSize * 0.04);

	ctx.font = `${cellSize * 0.16}px Arial`;

	ctx.fillText("✨", centerX - cellSize * 0.32, centerY - cellSize * 0.28);

	ctx.fillText("✨", centerX + cellSize * 0.32, centerY - cellSize * 0.18);

	ctx.restore();
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
		const position = getPosition( players[0].position, cellSize);

		if (!position) { return;}

		const centerX = position.x + cellSize / 2;

		const centerY = position.y + cellSize * 0.65;

		const radius = players.length === 1 ? cellSize * 0.22 : cellSize * 0.19;

		players.forEach((player, index) => {
			let offsetX = 0;
			let offsetY = 0;

			if (players.length === 2) {
				offsetX = index === 0 ? -radius * 0.8 : radius * 0.8;
			} else if (players.length === 3) {
				const positions = [
					[0, -radius],
					[-radius, radius * 0.6],
					[radius, radius * 0.6],
				];

				offsetX = positions[index][0];
				offsetY = positions[index][1];
			} else {
				const angle = (index / players.length) * Math.PI * 2 - Math.PI / 2;
				const distance = radius * 1.35;

				offsetX = Math.cos(angle) * distance;
				offsetY = Math.sin(angle) * distance;
			}

			const x = centerX + offsetX;
			const y = centerY + offsetY;

			const color = PLAYER_COLORS[player.token] ?? "#777";

			ctx.save();

			ctx.beginPath();

			ctx.arc(x + 2, y + 3, radius, 0, Math.PI * 2);

			ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
			ctx.fill();

			ctx.beginPath();

			ctx.arc(x, y, radius, 0, Math.PI * 2);

			ctx.fillStyle = color;
			ctx.fill();

			ctx.beginPath();

			ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.28, 0, Math.PI * 2);

			ctx.fillStyle = "rgba(255, 255, 255, 0.45)";

			ctx.fill();

			ctx.fillStyle = player.token === 3 ? "#333" : "#fff";

			ctx.font =
				`bold ${cellSize * 0.18}px Arial`;

			ctx.textAlign = "center";
			ctx.textBaseline = "middle";

			ctx.fillText(String(player.token), x, y);

			ctx.restore();
		});
	});
}