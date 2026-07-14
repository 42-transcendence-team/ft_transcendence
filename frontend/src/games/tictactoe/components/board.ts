import type { Board } from "../useTicTacToe";

export function drawBoard(ctx: CanvasRenderingContext2D, board: Board, cell: number) {
	ctx.strokeStyle = "black";
	ctx.lineWidth = 2;

	ctx.beginPath();

	for (let i = 1; i < 3; i++) {
		ctx.moveTo(cell * i, 0);
		ctx.lineTo(cell * i, cell * 3);

		ctx.moveTo(0, cell * i);
		ctx.lineTo(cell * 3, cell * i);
	}

	ctx.stroke();

	board.forEach((row, r) => {
		row.forEach((value, c) => {
			if (!value) return;

			ctx.fillStyle = "black";
			ctx.font = `${cell * 0.7}px Arial`;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";

			ctx.fillText(value, c * cell + cell / 2, r * cell + cell / 2);
		});
	});
}