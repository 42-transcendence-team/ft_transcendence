import type { GooseAnimationContext } from "./actions";
import type { GooseAction } from "../useGoose";
import { wait, animateSpecialEffect, animateMove } from "./actions";

export async function animateBridge(action: GooseAction, context: GooseAnimationContext): Promise<void> {
	if (action.from === undefined || action.to === undefined) {
		return;
	}

	context.state.message =	action.payload ?? "De puente a puente";

	await animateSpecialEffect("bridge", action, context);
	await animateMove(action, context);
	await wait(400);

	context.state.message = null;
	context.render();
}

export function drawBridgeAnimation(ctx: CanvasRenderingContext2D,
	progress: number, _x: number, _y: number) {
	ctx.save();

	const canvasWidth = ctx.canvas.width;
	const canvasHeight = ctx.canvas.height;

	const centerX = canvasWidth / 2;
	const centerY = canvasHeight / 2;

	const minDimension = Math.min(
		canvasWidth,
		canvasHeight,
	);

	const alpha = Math.sin(progress * Math.PI);
	const riverProgress = Math.min(progress * 1.8, 1);
	const riverHeight = canvasHeight * 0.28 * riverProgress;
	const riverY = centerY + canvasHeight * 0.08 - riverHeight / 2;

	ctx.globalAlpha = alpha * 0.75;

	ctx.fillStyle = "#314d5c";
	ctx.fillRect(0, riverY, canvasWidth, riverHeight);
	ctx.lineWidth = minDimension * 0.008;
	ctx.lineCap = "round";

	const waveCount = 9;

	for (let i = 0; i < waveCount; i++) {
		const waveY = riverY + riverHeight * (0.15 + (i / waveCount) * 0.75);
		const offset = Math.sin(progress * Math.PI * 4 + i) * canvasWidth * 0.025;

		ctx.globalAlpha = alpha * 0.35;
		ctx.strokeStyle = "#91b7c4";
		ctx.beginPath();

		for (let x = -canvasWidth * 0.1; x < canvasWidth * 1.1; x += canvasWidth * 0.12) {
			const waveOffset =
				Math.sin(x * 0.025 + progress * Math.PI * 3 + i) * minDimension * 0.008;

			if (x === -canvasWidth * 0.1) {
				ctx.moveTo(x + offset, waveY + waveOffset);
			} else {
				ctx.lineTo(x + offset, waveY + waveOffset);
			}
		}

		ctx.stroke();
	}

	ctx.globalAlpha = alpha * 0.9;

	ctx.fillStyle = "#4e6543";

	ctx.fillRect(0, riverY - minDimension * 0.025, canvasWidth, minDimension * 0.025);
	ctx.fillRect(0, riverY + riverHeight, canvasWidth, minDimension * 0.025);

	const bridgeProgress = Math.min(Math.max((progress - 0.15) / 0.65, 0), 1);

	const bridgeWidth = minDimension * 0.52;
	const bridgeHeight = minDimension * 0.12;
	const bridgeLeft = centerX - bridgeWidth / 2;
	const bridgeTop = centerY - bridgeHeight / 2;

	ctx.globalAlpha = alpha * bridgeProgress * 0.35;
	ctx.fillStyle = "#16120f";
	ctx.beginPath();
	ctx.roundRect(
		bridgeLeft + minDimension * 0.015,
		bridgeTop + minDimension * 0.025,
		bridgeWidth,
		bridgeHeight,
		minDimension * 0.015,
	);

	ctx.fill();

	const plankCount = 11;

	for (let i = 0; i < plankCount; i++) {
		const plankProgress = Math.min(Math.max(bridgeProgress * plankCount - i, 0), 1);

		if (plankProgress <= 0) {
			continue;
		}

		const plankWidth = bridgeWidth / plankCount * 0.92;
		const gap = bridgeWidth / plankCount * 0.08;

		const plankX =
			bridgeLeft +
			i *
				(bridgeWidth /
					plankCount) +
			gap / 2;

		const drop = (1 - plankProgress) * minDimension * 0.12;

		const rotation = (1 - plankProgress) * (i % 2 === 0 ? -0.12 : 0.12);

		ctx.save();

		ctx.translate(
			plankX + plankWidth / 2,
			bridgeTop + bridgeHeight / 2 - drop,
		);

		ctx.rotate(rotation);
		ctx.globalAlpha = alpha * plankProgress;

		ctx.fillStyle = i % 2 === 0 ? "#8b5e3c" : "#765035";

		ctx.beginPath();
		ctx.roundRect(-plankWidth / 2, -bridgeHeight / 2, plankWidth, bridgeHeight, minDimension * 0.008);
		ctx.fill();

		ctx.strokeStyle = "#4b3425";
		ctx.lineWidth = minDimension * 0.004;
		ctx.stroke();

		ctx.restore();
	}

	if (bridgeProgress > 0.3) {
		const ropeProgress = Math.min((bridgeProgress - 0.3) / 0.7, 1);

		ctx.globalAlpha = alpha * ropeProgress * 0.85;
		ctx.strokeStyle = "#d0b47b";
		ctx.lineWidth = minDimension * 0.012;
		ctx.lineCap = "round";

		ctx.beginPath();

		ctx.moveTo(bridgeLeft, bridgeTop - bridgeHeight * 0.65);

		ctx.quadraticCurveTo(
			centerX, bridgeTop - bridgeHeight * 0.15,
			centerX, bridgeTop - bridgeHeight * 0.65,
		);

		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(centerX, bridgeTop - bridgeHeight * 0.65);

		ctx.quadraticCurveTo(
			centerX + bridgeWidth * 0.20,
			bridgeTop - bridgeHeight * 0.15,
			bridgeLeft + bridgeWidth,
			bridgeTop - bridgeHeight * 0.65,
		);

		ctx.stroke();

		ctx.lineWidth = minDimension * 0.007;

		for (let i = 0; i <= 4; i++) {
			const supportX = bridgeLeft + (i / 4) * bridgeWidth;

			ctx.beginPath();

			ctx.moveTo( supportX, bridgeTop - bridgeHeight * 0.62);
			ctx.lineTo(supportX, bridgeTop + bridgeHeight * 0.50);
			ctx.stroke();
		}
	}

	if (progress > 0.65) {
		const shineProgress = (progress - 0.65) / 0.35;

		ctx.globalAlpha = alpha * Math.sin(shineProgress * Math.PI, ) * 0.35;

		const gradient = ctx.createLinearGradient(bridgeLeft, 0, bridgeLeft + bridgeWidth, 0);

		gradient.addColorStop(0, "rgba(255,255,255,0)");
		gradient.addColorStop(0.5, "rgba(255,248,210,0.9)");
		gradient.addColorStop(1, "rgba(255,255,255,0)");

		ctx.fillStyle = gradient;
		ctx.fillRect(bridgeLeft, bridgeTop, bridgeWidth, bridgeHeight);
	}

	ctx.restore();
}