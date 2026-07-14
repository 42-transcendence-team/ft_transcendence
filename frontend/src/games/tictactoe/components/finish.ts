import type { Player } from "../useTicTacToe";

export function drawFinished(ctx: CanvasRenderingContext2D,
	size: number,
	winner: Player | null,
	isDraw: boolean
) {
	ctx.fillStyle = "rgba(0,0,0,0.5)";
	ctx.fillRect(0, 0, size, size);


	ctx.fillStyle = "white";
	ctx.font = "80px Arial";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	ctx.fillText(winner ? `Gana ${winner}` : isDraw ? "Empate" : "",
		size / 2,
		size / 2 - 80
	);

	ctx.fillStyle = "white";
	ctx.fillRect(size / 2 - 150, size / 2 + 30, 300, 100);

	ctx.fillStyle = "black";
	ctx.font = "50px Arial";

	ctx.fillText("Reiniciar", size / 2, size / 2 + 80);
}