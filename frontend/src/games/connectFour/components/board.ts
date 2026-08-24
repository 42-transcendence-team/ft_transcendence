import { CONNECT_FOUR_COLUMNS, CONNECT_FOUR_ROWS } from "../useConnectFour";
import type { ConnectFourBoard } from "../useConnectFour";

export function drawBoard(
	ctx: CanvasRenderingContext2D,
	board: ConnectFourBoard,
	cellWidth: number,
	cellHeight: number
) {
	ctx.save();

	ctx.lineWidth = 1;
	ctx.lineCap = "butt";
	ctx.strokeStyle = "black";

	for (let row = 0; row < CONNECT_FOUR_ROWS; row++) {
		for (let col = 0; col < CONNECT_FOUR_COLUMNS; col++) {

			const x = col * cellWidth;
			const y = row * cellHeight;

			ctx.strokeRect(x, y, cellWidth, cellHeight);

			const player = board[row][col];

			if (!player) continue;

			ctx.beginPath();
			ctx.arc(
				x + cellWidth / 2,
				y + cellHeight / 2,
				Math.min(cellWidth, cellHeight) * 0.4,
				0,
				Math.PI * 2
			);

			ctx.fillStyle = player === "R" ? "red" : "yellow";
			ctx.fill();
		}
	}

	ctx.restore();
}

export function drawWinningLine(
	ctx: CanvasRenderingContext2D,
	line: [number, number][],
	cellWidth: number,
	cellHeight: number
) {
	ctx.save();

	const start = line[0];
	const end = line[line.length - 1];

	ctx.strokeStyle = "green";
	ctx.lineWidth = 10;
	ctx.lineCap = "round";

	ctx.beginPath();

	ctx.moveTo(
		start[1] * cellWidth + cellWidth / 2,
		start[0] * cellHeight + cellHeight / 2
	);

	ctx.lineTo(
		end[1] * cellWidth + cellWidth / 2,
		end[0] * cellHeight + cellHeight / 2
	);

	ctx.stroke();

	ctx.restore();
}