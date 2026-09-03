import type { GooseAnimationContext } from "./actions";
import type { GooseAction } from "../useGoose";
import { wait } from "./actions";

export async function animateInn(action: GooseAction, context: GooseAnimationContext): Promise<void> {
	const player = Object.values(context.state.players).find(
		(player) => player.token === action.token,
	);

	if (!player) return;

	const duration = 1500;
	const startTime = performance.now();

	context.state.message = action.payload ?? "Te quedas en la posada y pierdes un turno";

	context.state.specialAnimation = {
		type: "inn",
		progress: 0,
		token: action.token,
	};

	context.render();

	await new Promise<void>((resolve) => {
		function animate(currentTime: number) {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);

			context.state.specialAnimation = {
				type: "inn",
				progress,
				token: action.token,
			};

			context.render();

			if (progress < 1) {
				requestAnimationFrame(animate);
				return;
			}

			resolve();
		}

		requestAnimationFrame(animate);
	});

	context.state.specialAnimation = null;
	context.render();

	await wait(400);

	context.state.message = null;
	context.render();
}

export function drawInnAnimation(ctx: CanvasRenderingContext2D,
	progress: number, _x: number, _y: number) {
	ctx.save();

	const canvasWidth = ctx.canvas.width;
	const canvasHeight = ctx.canvas.height;

	const centerX = canvasWidth / 2;
	const centerY = canvasHeight / 2;

	const minDimension = Math.min(canvasWidth, canvasHeight);

	const alpha = Math.sin(progress * Math.PI);

	ctx.globalAlpha = alpha * 0.20;
	ctx.fillStyle = "#d9c9e8";
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);

	const maxRadius = Math.sqrt(
		Math.pow(canvasWidth / 2, 2) +
		Math.pow(canvasHeight / 2, 2),
	);

	const sceneProgress = Math.min(progress * 1.2, 1);

	const radius = minDimension * 0.08 + (maxRadius - minDimension * 0.08) * sceneProgress;

	ctx.globalAlpha = alpha * 0.12;
	ctx.fillStyle = "#fff8e7";

	ctx.beginPath();
	ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
	ctx.fill();

	const stars = [
		{ x: 0.12, y: 0.18, size: 0.018 },
		{ x: 0.25, y: 0.34, size: 0.012 },
		{ x: 0.40, y: 0.14, size: 0.014 },
		{ x: 0.58, y: 0.20, size: 0.018 },
		{ x: 0.76, y: 0.14, size: 0.013 },
		{ x: 0.88, y: 0.30, size: 0.018 },
		{ x: 0.16, y: 0.70, size: 0.013 },
		{ x: 0.30, y: 0.82, size: 0.018 },
		{ x: 0.70, y: 0.76, size: 0.014 },
		{ x: 0.84, y: 0.66, size: 0.018 },
	];

	for (let i = 0; i < stars.length; i++) {
		const star = stars[i];

		const twinkle = 0.65 + Math.sin(progress * Math.PI * 6 + i) * 0.35;

		const size = minDimension * star.size * twinkle;

		const x = canvasWidth * star.x;
		const y = canvasHeight * star.y;

		ctx.globalAlpha = alpha * twinkle * 0.9;

		ctx.fillStyle = "#fff8e7";

		ctx.beginPath();

		ctx.moveTo(x, y - size);
		ctx.lineTo(x + size * 0.35, y - size * 0.35);
		ctx.lineTo(x + size, y);
		ctx.lineTo(x + size * 0.35, y + size * 0.35);
		ctx.lineTo(x, y + size);
		ctx.lineTo(x - size * 0.35, y + size * 0.35);
		ctx.lineTo(x - size, y);
		ctx.lineTo(x - size * 0.35, y - size * 0.35);

		ctx.closePath();
		ctx.fill();
	}

	const moonSize = minDimension * 0.075 * (0.8 + sceneProgress * 0.4);
	const moonX = centerX + canvasWidth * 0.23;
	const moonY = centerY - canvasHeight * 0.22;

	ctx.globalAlpha = alpha * 0.95;

	ctx.fillStyle = "#fff4c7";

	ctx.beginPath();
	ctx.arc(moonX, moonY, moonSize, 0, Math.PI * 2);
	ctx.fill();

	ctx.globalCompositeOperation = "destination-out";

	ctx.beginPath();
	ctx.arc(moonX + moonSize * 0.35, moonY - moonSize * 0.15, moonSize * 0.92, 0, Math.PI * 2);
	ctx.fill();

	ctx.globalCompositeOperation = "source-over";

	const bedScale = 0.85 + Math.sin(progress * Math.PI) *	0.20;
	const bedWidth = minDimension * 0.32 * bedScale;
	const bedHeight = minDimension * 0.095 * bedScale;
	const headboardWidth = bedWidth * 0.10;
	const mattressY = centerY + bedHeight * 0.15;

	ctx.globalAlpha = alpha;

	ctx.fillStyle = "#6f472f";
	ctx.beginPath();
	ctx.roundRect(centerX - bedWidth / 2, centerY - bedHeight * 0.75, headboardWidth, bedHeight * 1.8, headboardWidth * 0.3);
	ctx.fill();

	ctx.fillStyle = "#8b5e3c";
	ctx.beginPath();
	ctx.roundRect(centerX - bedWidth / 2, mattressY, bedWidth, bedHeight, bedHeight * 0.25,);
	ctx.fill();

	ctx.fillStyle = "#fff8e7";
	ctx.beginPath();
	ctx.roundRect(centerX - bedWidth * 0.30, mattressY - bedHeight * 0.12, bedWidth * 0.62, bedHeight * 0.78, bedHeight * 0.2);
	ctx.fill();

	ctx.fillStyle = "#ffffff";
	ctx.beginPath();
	ctx.roundRect(centerX - bedWidth * 0.42, mattressY - bedHeight * 0.16, bedWidth * 0.24, bedHeight * 0.68, bedHeight * 0.2);
	ctx.fill();

	const personX = centerX + bedWidth * 0.10;
	const personY = mattressY + bedHeight * 0.20;
	const personRadius = bedHeight * 0.22;

	ctx.fillStyle = "#e6b89c";

	ctx.beginPath();
	ctx.arc(personX, personY, personRadius, 0, Math.PI * 2);
	ctx.fill();

	ctx.fillStyle = "#b88ac4";
	ctx.beginPath();
	ctx.roundRect(personX - bedWidth * 0.16, personY + personRadius * 0.35, bedWidth * 0.30, bedHeight * 0.40, bedHeight * 0.18);
	ctx.fill();

	const zPositions = [
		{
			x: centerX + bedWidth * 0.27,
			y: centerY - bedHeight * 0.75,
			scale: 0.035,
			delay: 0,
		},
		{
			x: centerX + bedWidth * 0.38,
			y: centerY - bedHeight * 1.05,
			scale: 0.055,
			delay: 0.18,
		},
		{
			x: centerX + bedWidth * 0.49,
			y: centerY - bedHeight * 1.40,
			scale: 0.075,
			delay: 0.36,
		},
	];

	ctx.font = "bold 40px Arial";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	for (let i = 0; i < zPositions.length; i++) {
		const z = zPositions[i];
		const localProgress = (progress - z.delay + 1) % 1;
		const float = Math.sin(localProgress * Math.PI) * minDimension * 0.025;
		const opacity = Math.sin(localProgress * Math.PI);
		const size = minDimension * z.scale;

		ctx.globalAlpha = alpha * opacity;
		ctx.font = `bold ${size}px Arial`;
		ctx.fillStyle = "#ffffff";
		ctx.fillText("Z", z.x, z.y - float);
	}

	const cloudAlpha = alpha * (0.15 + sceneProgress * 0.20);

	ctx.globalAlpha = cloudAlpha;
	ctx.fillStyle = "#ffffff";

	const cloudY = centerY + bedHeight * 0.95;
	const cloudSize = minDimension * 0.035;

	for (const offset of [-1, 0, 1]) {
		ctx.beginPath();
		ctx.arc(centerX + offset * cloudSize * 1.2, cloudY, cloudSize * (0.7 + Math.abs(offset) * 0.2), 0, Math.PI * 2);
		ctx.fill();
	}

	ctx.restore();
}