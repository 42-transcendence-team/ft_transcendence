import { CONNECT_FOUR_COLUMNS, CONNECT_FOUR_ROWS } from "../useConnectFour";
import type { ConnectFourBoard } from "../useConnectFour";

export function drawPencilLine( ctx: CanvasRenderingContext2D,
	x1: number, y1: number, x2: number, y2: number, seed: number
) {
	const steps = 12;

	ctx.beginPath();

	for (let i = 0; i <= steps; i++) {
		const t = i / steps;

		let x = x1 + (x2 - x1) * t;
		let y = y1 + (y2 - y1) * t;

		const noise = ((seed * 37 + i * 17) % 7) - 3;

		const offset = noise * 0.6;

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

export function drawBoard( ctx: CanvasRenderingContext2D,
	board: ConnectFourBoard, cellWidth: number, cellHeight: number
) {
	const width = cellWidth * CONNECT_FOUR_COLUMNS;
	const height = cellHeight * CONNECT_FOUR_ROWS;

	ctx.save();

	ctx.fillStyle = "#f5efe2";
	ctx.fillRect(0, 0, width, height);

	ctx.strokeStyle = "#333";
	ctx.lineWidth = 5;
	ctx.lineCap = "round";
	ctx.lineJoin = "round";

	drawPencilLine(ctx, 3, 3, width - 3, 3, 1);

	drawPencilLine(ctx, width - 3, 3, width - 3, height - 3, 2);

	drawPencilLine(ctx, width - 3, height - 3, 3, height - 3, 3);

	drawPencilLine(ctx, 3, height - 3, 3, 3, 4);

	board.forEach((row, r) => {
		row.forEach((_value, c) => {
			const x = c * cellWidth + cellWidth / 2;
			const y = r * cellHeight + cellHeight / 2;

			drawHole(ctx, x, y, Math.min(cellWidth, cellHeight) * 0.36);
		});
	});

	ctx.restore();
}

function drawHole( ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
	ctx.save();

	ctx.fillStyle = "#e4dccb";
	ctx.strokeStyle = "#444";
	ctx.lineWidth = 3;

	ctx.beginPath();

	ctx.arc(x, y, radius, 0, Math.PI * 2);

	ctx.fill();
	ctx.stroke();

	ctx.restore();
}

export function drawWinningLine(ctx: CanvasRenderingContext2D,
	line: [number, number][], cellWidth: number, cellHeight: number
) {
	const start = line[0];
	const end = line[line.length - 1];

	const x1 = start[1] * cellWidth + cellWidth / 2;
	const y1 = start[0] * cellHeight + cellHeight / 2;
	const x2 = end[1] * cellWidth + cellWidth / 2;
	const y2 = end[0] * cellHeight + cellHeight / 2;

	ctx.save();

	ctx.strokeStyle = "#e59b32";
	ctx.lineCap = "round";
	ctx.lineJoin = "round";

	for (let i = 0; i < 3; i++) {
		ctx.lineWidth = 11 - i;

		ctx.globalAlpha = 0.9 - i * 0.03;

		const offset = (i - 1) * 5;

		const dx = x2 - x1;
		const dy = y2 - y1;

		const length = Math.hypot(dx, dy);

		const px = -dy / length;
		const py = dx / length;

		ctx.beginPath();

		ctx.moveTo(x1 + px * offset, y1 + py * offset);

		ctx.quadraticCurveTo(
			(x1 + x2) / 2 + px * offset + Math.sin(i * 7) * 5,
			(y1 + y2) / 2 + py * offset + Math.cos(i * 5) * 5,
			x2 + px * offset,
			y2 + py * offset
		);

		ctx.stroke();
	}

	ctx.restore();
}