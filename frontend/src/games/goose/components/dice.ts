import { animateMove, animateSpecialEffect, wait } from "./actions";
import type { GooseAnimationContext } from "./actions";
import type { GooseAction } from "../useGoose";

export function drawDice(ctx: CanvasRenderingContext2D,
	dice1: number | null, dice2: number | null,
	canvasWidth: number, canvasHeight: number,
) {
	if (dice1 === null) {
		return;
	}

	const size = Math.min(canvasWidth, canvasHeight) * 0.1;
	const gap = size * 0.2;

	if (dice2 === null) {
		const x = (canvasWidth - size) / 2;
		const y = canvasHeight * 0.88;

		drawDie(ctx, dice1, x, y, size);
		return;
	}

	const totalWidth = size * 2 + gap;
	const startX = (canvasWidth - totalWidth) / 2;
	const y = canvasHeight * 0.88;

	drawDie(ctx, dice1, startX, y, size);
	drawDie(ctx, dice2, startX + size + gap, y, size);
}

function drawDie( ctx: CanvasRenderingContext2D, value: number, x: number, y: number, size: number) {
	ctx.save();

	ctx.fillStyle = "#fffdf7";
	ctx.strokeStyle = "#4a4036";
	ctx.lineWidth = 4;

	ctx.beginPath();

	ctx.roundRect(x, y, size, size, size * 0.15);

	ctx.fill();
	ctx.stroke();

	drawDots(ctx, value, x, y, size);

	ctx.restore();
}

function drawDots( ctx: CanvasRenderingContext2D,
	value: number, x: number, y: number, size: number,
) {
	const positions: Record<number, [number, number][]> = {
		1: [[0.5, 0.5]],

		2: [
			[0.25, 0.25],
			[0.75, 0.75],
		],

		3: [
			[0.25, 0.25],
			[0.5, 0.5],
			[0.75, 0.75],
		],

		4: [
			[0.25, 0.25],
			[0.75, 0.25],
			[0.25, 0.75],
			[0.75, 0.75],
		],

		5: [
			[0.25, 0.25],
			[0.75, 0.25],
			[0.5, 0.5],
			[0.25, 0.75],
			[0.75, 0.75],
		],

		6: [
			[0.25, 0.25],
			[0.75, 0.25],
			[0.25, 0.5],
			[0.75, 0.5],
			[0.25, 0.75],
			[0.75, 0.75],
		],
	};

	const dots = positions[value];

	if (!dots) { return; }

	ctx.fillStyle = "#4a4036";

	for (const [px, py] of dots) {
		ctx.beginPath();
		ctx.arc( x + size * px, y + size * py, size * 0.07, 0, Math.PI * 2);
		ctx.fill();
	}
}

export function drawDiceAnimation(ctx: CanvasRenderingContext2D,
	progress: number, _x: number, _y: number) {
	ctx.save();

	const canvasWidth = ctx.canvas.width;
	const canvasHeight = ctx.canvas.height;

	const centerX = canvasWidth / 2;
	const centerY = canvasHeight / 2;

	const minDimension = Math.min(canvasWidth, canvasHeight);
	const alpha = Math.sin(progress * Math.PI);

	ctx.globalAlpha = alpha * 0.18;
	ctx.fillStyle = "#181512";
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);

	const sparkCount = 18;

	for (let i = 0; i < sparkCount; i++) {
		const angle = (i / sparkCount) * Math.PI * 2 + progress * 2;

		const distance = minDimension * (0.10 + progress * 0.32);

		const x = centerX + Math.cos(angle) * distance;
		const y = centerY + Math.sin(angle) * distance;

		const size = minDimension * 0.008;

		ctx.globalAlpha = alpha * (1 - progress) * 0.8;
		ctx.fillStyle = "#f5d98b";

		ctx.beginPath();
		ctx.arc(x, y, size, 0, Math.PI * 2);
		ctx.fill();
	}

	const entrance = Math.min(progress / 0.45, 	1);
	const bounce = Math.sin( 	entrance * Math.PI);

	const separation = minDimension * 0.17;
	const dieSize = minDimension * 0.14;

	const dieY = centerY - bounce * minDimension * 0.08;

	const die1X = centerX - separation * (1 - entrance);
	const die2X = centerX + separation * (1 - entrance);

	const rotation1 = (1 - entrance) * Math.PI * 2;
	const rotation2 = -(1 - entrance) * Math.PI * 2.5;

	const rolling = progress < 0.65;

	const dice1 = rolling ? Math.floor(Math.random() * 6) + 1 : 6;
	const dice2 = rolling ? Math.floor(Math.random() * 6) + 1 : 5;

	drawAnimatedDie(ctx, dice1, die1X, dieY, dieSize, rotation1, alpha);
	drawAnimatedDie(ctx, dice2, die2X, dieY, dieSize, rotation2, alpha);

	if (progress > 0.55) {
		const resultProgress = Math.min((progress - 0.55) / 0.25, 1);
		const resultAlpha = Math.sin(resultProgress * Math.PI * 0.5);

		ctx.globalAlpha = alpha * resultAlpha * 0.9;
		ctx.font = `bold ${minDimension * 0.055}px Arial`;

		ctx.textAlign = "center";
		ctx.textBaseline = "middle";

		ctx.fillStyle = "#fff8e7";

		ctx.fillText(`${dice1 + dice2}`, centerX, centerY + minDimension * 0.15);
	}

	ctx.restore();
}

function drawAnimatedDie(ctx: CanvasRenderingContext2D,
	value: number, x: number, y: number, size: number, rotation: number, alpha: number) {
	ctx.save();

	ctx.translate(x, y);
	ctx.rotate(rotation);

	ctx.globalAlpha = alpha * 0.95;

	ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
	ctx.beginPath();
	ctx.roundRect(-size / 2 + size * 0.025, -size / 2 + size * 0.04, size, size, size * 0.12);
	ctx.fill();

	ctx.fillStyle = "#f5f0df";
	ctx.beginPath();
	ctx.roundRect(-size / 2, -size / 2, size, size, size * 0.12);
	ctx.fill();

	ctx.strokeStyle = "#4a4036";
	ctx.lineWidth = size * 0.035;
	ctx.stroke();

	const dotRadius = size * 0.075;
	const offset = size * 0.24;

	const positions: Record<number, [number, number][]> = {
		1: [[0, 0]],

		2: [
			[-1, -1],
			[1, 1],
		],

		3: [
			[-1, -1],
			[0, 0],
			[1, 1],
		],

		4: [
			[-1, -1],
			[1, -1],
			[-1, 1],
			[1, 1],
		],

		5: [
			[-1, -1],
			[1, -1],
			[0, 0],
			[-1, 1],
			[1, 1],
		],

		6: [
			[-1, -1],
			[-1, 0],
			[-1, 1],
			[1, -1],
			[1, 0],
			[1, 1],
		],
	};

	ctx.fillStyle = "#302b27";

	for (const [dx, dy] of positions[value]) {
		ctx.beginPath();
		ctx.arc(dx * offset, dy * offset, dotRadius, 0, Math.PI * 2);
		ctx.fill();
	}

	ctx.restore();
}

export async function animateDice(action: GooseAction, context: GooseAnimationContext): Promise<void> {
	if (action.from === undefined || action.to === undefined) {
		return;
	}

	context.state.message = action.payload ?? "De dados a dados";

	await animateSpecialEffect("dice", action, context);
	await animateMove(action, context);
	await wait(400);

	context.state.message = null;
	context.render();
}