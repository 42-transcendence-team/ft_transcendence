import { Button } from "./button";

export function drawMenu(
	ctx: CanvasRenderingContext2D,
	size: number,
	buttons: Button[],
	mouse: { x:number; y:number }
) {

	ctx.fillStyle = "black";
	ctx.font = "80px Arial";
	ctx.textAlign = "center";
	ctx.fillText(
		"Tic Tac Toe",
		size / 2,
		150
	);

	for (const button of buttons) {
		button.update(mouse);
		button.draw(ctx);
	}
}