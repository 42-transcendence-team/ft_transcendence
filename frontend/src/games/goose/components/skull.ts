import type { GooseAnimationContext } from "./actions";
import type { GooseAction } from "../useGoose";
import { wait, animateSpecialEffect } from "./actions";

export async function animateSkull(action: GooseAction, context: GooseAnimationContext): Promise<void> {
	if (action.from === undefined || action.to === undefined) {
		return;
	}

	context.state.message = action.payload ?? "La calavera te devuelve al inicio";

	await animateSpecialEffect("skull", action, context);

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

export function drawSkullAnimation(ctx: CanvasRenderingContext2D,
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

	ctx.globalAlpha = alpha * 0.45;
	ctx.fillStyle = "#100d0b";
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);

	const pulse = Math.sin(progress * Math.PI * 8) * 0.5 + 0.5;

	ctx.globalAlpha = alpha * pulse * 0.12;
	ctx.fillStyle = "#7a1717";
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);

	const crackProgress = Math.min(progress * 1.5, 1);

	ctx.strokeStyle = "#5c4b40";
	ctx.lineWidth = Math.max(2, minDimension * 0.008);
	ctx.lineCap = "round";
	ctx.lineJoin = "round";

	const cracks = [
		[
			[0.50, 0.50],
			[0.43, 0.43],
			[0.39, 0.34],
			[0.30, 0.28],
			[0.25, 0.18],
		],
		[
			[0.50, 0.50],
			[0.57, 0.43],
			[0.63, 0.35],
			[0.70, 0.31],
			[0.78, 0.20],
		],
		[
			[0.50, 0.50],
			[0.44, 0.56],
			[0.37, 0.61],
			[0.31, 0.70],
			[0.22, 0.78],
		],
		[
			[0.50, 0.50],
			[0.57, 0.57],
			[0.65, 0.61],
			[0.73, 0.69],
			[0.83, 0.78],
		],
		[
			[0.50, 0.50],
			[0.49, 0.40],
			[0.47, 0.31],
			[0.49, 0.20],
		],
		[
			[0.50, 0.50],
			[0.51, 0.60],
			[0.50, 0.70],
			[0.53, 0.81],
		],
	];

	for (let crackIndex = 0; crackIndex < cracks.length; crackIndex++) {
		const crack = cracks[crackIndex];
		const delay = crackIndex * 0.06;

		const localProgress = Math.max(0, Math.min(1, (crackProgress - delay) / (1 - delay)));

		if (localProgress <= 0) {
			continue;
		}

		const points = Math.max( 2, Math.ceil(localProgress * crack.length),);

		ctx.globalAlpha = alpha * (0.5 + localProgress * 0.5);
		ctx.beginPath();

		for (let i = 0; i < points; i++) {
			const point =crack[i];
			const px =canvasWidth * point[0];
			const py =canvasHeight * point[1];

			if (i === 0) {
				ctx.moveTo(px, py);
			} else {
				ctx.lineTo(px, py);
			}
		}

		const exactPoint = localProgress * (crack.length - 1);
		const segment = Math.floor(exactPoint);
		const segmentProgress = exactPoint - segment;

		if (segment >= 0 && segment < crack.length - 1) {
			const a = crack[segment];
			const b = crack[segment + 1];

			const px = canvasWidth * (a[0] + (b[0] - a[0]) * segmentProgress);
			const py = canvasHeight * (a[1] + (b[1] - a[1]) * segmentProgress);

			ctx.lineTo(px, py);
		}

		ctx.stroke();
	}

	const secondaryCracks = [
		[
			[0.43, 0.43],
			[0.34, 0.39],
			[0.28, 0.42],
		],
		[
			[0.57, 0.43],
			[0.66, 0.39],
			[0.73, 0.43],
		],
		[
			[0.44, 0.56],
			[0.38, 0.52],
			[0.32, 0.54],
		],
		[
			[0.56, 0.57],
			[0.63, 0.53],
			[0.69, 0.56],
		],
	];

	ctx.globalAlpha = alpha * 0.65;

	ctx.lineWidth = Math.max(1.5, minDimension * 0.005);

	for (const crack of secondaryCracks) {
		ctx.beginPath();

		for (let i = 0; i < crack.length; i++) {
			const point = crack[i];
			const px = canvasWidth * point[0];
			const py = canvasHeight * point[1];

			if (i === 0) {
				ctx.moveTo(px, py);
			} else {
				ctx.lineTo(px, py);
			}
		}

		ctx.stroke();
	}

	const skullProgress = Math.min( Math.max((progress - 0.10) / 0.45, 0), 1);

	const skullScale = 0.55 + skullProgress * 0.45;
	const skullWidth = minDimension * 0.24 * skullScale;
	const skullHeight = minDimension * 0.27 * skullScale;

	const shake = progress > 0.25 &&
		progress < 0.75 ? Math.sin( progress * Math.PI * 24, ) * minDimension * 0.006 : 0;

	const skullX = centerX + shake;
	const skullY = centerY;

	ctx.globalAlpha = alpha * skullProgress;

	const glowRadius = skullWidth * 0.85;
	const gradient =
		ctx.createRadialGradient(skullX, skullY, 0, skullX, skullY, glowRadius);

	gradient.addColorStop(0, "rgba(180, 20, 20, 0.35)");
	gradient.addColorStop(1, "rgba(180, 20, 20, 0)");

	ctx.fillStyle = gradient;

	ctx.beginPath();

	ctx.arc(skullX, skullY, glowRadius, 0, Math.PI * 2);
	ctx.fill();

	ctx.fillStyle = "#ded8c9";

	ctx.beginPath();

	ctx.moveTo( skullX - skullWidth * 0.43, skullY - skullHeight * 0.18);

	ctx.quadraticCurveTo( skullX - skullWidth * 0.46, skullY - skullHeight * 0.50,
		skullX, skullY - skullHeight * 0.52);

	ctx.quadraticCurveTo( skullX + skullWidth * 0.46, skullY - skullHeight * 0.50,
		skullX + skullWidth * 0.43, skullY - skullHeight * 0.18);

	ctx.lineTo(skullX + skullWidth * 0.34, skullY + skullHeight * 0.22);
	ctx.lineTo(skullX + skullWidth * 0.20, skullY + skullHeight * 0.38);
	ctx.lineTo(skullX - skullWidth * 0.20, skullY + skullHeight * 0.38);
	ctx.lineTo(skullX - skullWidth * 0.34, skullY + skullHeight * 0.22);

	ctx.closePath();
	ctx.fill();
	ctx.fillStyle = "#171311";
	ctx.beginPath();
	ctx.ellipse(
		skullX - skullWidth * 0.20,
		skullY - skullHeight * 0.17,
		skullWidth * 0.13,
		skullHeight * 0.15,
		-0.15,
		0,
		Math.PI * 2,
	);

	ctx.fill();
	ctx.beginPath();
	ctx.ellipse( skullX + skullWidth * 0.20, skullY - skullHeight * 0.17,
		skullWidth * 0.13, skullHeight * 0.15, 0.15, 0, Math.PI * 2);

	ctx.fill();
	ctx.beginPath();
	ctx.moveTo(skullX, skullY - skullHeight * 0.04);

	ctx.lineTo( skullX - skullWidth * 0.07, skullY + skullHeight * 0.12);
	ctx.lineTo( skullX + skullWidth * 0.07, skullY + skullHeight * 0.12);
	ctx.closePath();
	ctx.fill();
	ctx.fillStyle = "#c7c0b2";
	ctx.beginPath();
	ctx.roundRect(
		skullX - skullWidth * 0.20,
		skullY + skullHeight * 0.16,
		skullWidth * 0.40,
		skullHeight * 0.23,
		skullWidth * 0.04,
	);

	ctx.fill();
	ctx.fillStyle = "#171311";

	const teeth = 6;

	for (let i = 0; i < teeth; i++) {
		const toothWidth = skullWidth * 0.055;
		const toothHeight = skullHeight * 0.10;
		const toothX = skullX - skullWidth * 0.14 + i * skullWidth * 0.055;

		ctx.fillRect(toothX, skullY + skullHeight * 0.20, toothWidth, toothHeight);
	}

	if (progress > 0.70) {
		const flashProgress = (progress - 0.70) / 0.30;

		ctx.globalAlpha = alpha * flashProgress * 0.20;
		ctx.fillStyle = "#ffffff";
		ctx.beginPath();

		ctx.arc(centerX, centerY, minDimension * (0.12 + flashProgress * 0.20), 0, Math.PI * 2);

		ctx.fill();
	}

	ctx.restore();
}