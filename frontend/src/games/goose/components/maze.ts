import type { GooseAnimationContext } from "./actions";
import type { GooseAction } from "../useGoose";
import { wait, animateSpecialEffect } from "./actions";

export async function animateMaze(action: GooseAction, context: GooseAnimationContext): Promise<void> {
	if (action.from === undefined || action.to === undefined) {
		return;
	}

	context.state.message = action.payload ?? "Entras en el laberinto";

	await animateSpecialEffect("maze", action, context);

	const player = Object.values(context.state.players).find(
		(player) => player.token === action.token,
	);

	if (player) {
		player.position = action.to;
	}

	context.render();

	await wait(600);

	context.state.message = null;
	context.render();
}

export function drawMazeAnimation(ctx: CanvasRenderingContext2D,
	progress: number, _x: number, _y: number) {
	ctx.save();

	const canvasWidth = ctx.canvas.width;
	const canvasHeight = ctx.canvas.height;

	const centerX = canvasWidth / 2;
	const centerY = canvasHeight / 2;

	const minDimension = Math.min(canvasWidth, canvasHeight);

	const alpha = Math.sin(progress * Math.PI);
	const mazeProgress = progress < 0.65 ? progress / 0.65 : 1;

	ctx.globalAlpha = alpha * 0.35;
	ctx.fillStyle = "#15120f";

	ctx.fillRect(0, 0, canvasWidth, canvasHeight);

	const mazeSize = minDimension * (0.15 + mazeProgress * 0.85);

	const rings = 9;

	ctx.strokeStyle = "#8b8175";

	ctx.lineWidth =
		Math.max(
			2,
			minDimension * 0.012,
		);

	ctx.lineCap = "square";

	for (let i = 0; i < rings; i++) {
		const ringProgress = (i + 1) / rings;
		const size = mazeSize * ringProgress;
		const ringLeft = centerX - size / 2;
		const ringTop = centerY - size / 2;
		const ringRight = centerX + size / 2;
		const ringBottom = centerY + size / 2;
		const delay = i / rings * 0.25;
		const ringAlpha = Math.min(1, Math.max(0, (mazeProgress - delay) / (1 - delay)));

		ctx.globalAlpha = alpha * ringAlpha * 0.9;

		const opening = i % 4;
		const openingSize = size * 0.14;

		ctx.beginPath();

		switch (opening) {
			case 0:
				ctx.moveTo(ringLeft, ringTop);
				ctx.lineTo(centerX - openingSize, ringTop);
				ctx.moveTo(centerX + openingSize, ringTop);
				ctx.lineTo(ringRight, ringTop);
				ctx.lineTo(ringRight, ringBottom);
				ctx.lineTo(ringLeft, ringBottom);
				ctx.lineTo(ringLeft, ringTop);
				break;

			case 1:
				// Abertura derecha
				ctx.moveTo(ringLeft, ringTop);
				ctx.lineTo(ringRight, ringTop);
				ctx.lineTo(ringRight, centerY - openingSize);
				ctx.moveTo(ringRight, centerY + openingSize);
				ctx.lineTo(ringRight, ringBottom);
				ctx.lineTo(ringLeft, ringBottom);
				ctx.lineTo(ringLeft, ringTop);
				break;

			case 2:
				// Abertura abajo
				ctx.moveTo( ringLeft, ringTop);
				ctx.lineTo( ringRight, ringTop);
				ctx.lineTo( ringRight, ringBottom);
				ctx.lineTo( centerX + openingSize, ringBottom);
				ctx.moveTo( centerX - openingSize, ringBottom);
				ctx.lineTo( ringLeft, ringBottom);
				ctx.lineTo( ringLeft, ringTop);
				break;

			case 3:
				ctx.moveTo(ringLeft, centerY - openingSize);
				ctx.moveTo(ringLeft, centerY + openingSize);
				ctx.lineTo(ringLeft, ringBottom);
				ctx.lineTo(ringRight, ringBottom);
				ctx.lineTo(ringRight, ringTop);
				ctx.lineTo(ringLeft, ringTop);
				ctx.lineTo(ringLeft, centerY - openingSize);
				break;
		}

		ctx.stroke();
	}

	ctx.globalAlpha = alpha * 0.7;

	ctx.lineWidth = Math.max(2, minDimension * 0.009);

	for (let i = 1; i < 5; i++) {
		const offset = mazeSize * (-0.35 + i * 0.14);

		ctx.beginPath();
		ctx.moveTo(
			centerX - mazeSize * 0.42,
			centerY + offset,
		);

		ctx.lineTo(centerX + mazeSize * (i % 2 === 0 ? 0.18 : 0.42), centerY + offset);

		ctx.stroke();
		ctx.beginPath();

		ctx.moveTo(centerX + offset, centerY - mazeSize * 0.42);

		ctx.lineTo(centerX + offset, centerY + mazeSize * (i % 2 === 0 ? 0.18 : 0.42));
		ctx.stroke();
	}

	const pathProgress = (progress * 1.8) % 1;
	const pathRadius = mazeSize * (0.08 + pathProgress * 0.38);
	const pathAngle = pathProgress * Math.PI * 6;

	const pathX = centerX + Math.cos(pathAngle) * pathRadius;
	const pathY = centerY + Math.sin(pathAngle) * pathRadius;

	ctx.globalAlpha = alpha * (0.5 + pathProgress * 0.5);
	ctx.fillStyle = "#f5d98b";
	ctx.beginPath();
	ctx.arc(pathX, pathY, minDimension * 0.018, 0, Math.PI * 2);
	ctx.fill();
	ctx.globalAlpha = alpha * 0.18;
	ctx.beginPath();
	ctx.arc(pathX, pathY, minDimension * 0.055, 0, Math.PI * 2);
	ctx.fill();

	const centerScale = 0.4 + Math.sin(progress * Math.PI) * 0.6;

	ctx.globalAlpha = alpha * centerScale;
	ctx.fillStyle = "#f5d98b";
	ctx.beginPath();
	ctx.arc(centerX, centerY, minDimension * 0.025, 0, Math.PI * 2);
	ctx.fill();

	if (progress > 0.72) {
		const closeProgress = (progress - 0.72) / 0.28;

		ctx.globalAlpha = alpha * closeProgress * 0.35;
		ctx.fillStyle = "#0d0b09";
		ctx.beginPath();
		ctx.arc(centerX, centerY, closeProgress * minDimension * 0.30, 0, Math.PI * 2);
		ctx.fill();
	}

	ctx.restore();
}