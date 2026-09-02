import type { GooseAnimationContext } from "./actions";
import type { GooseAction } from "../useGoose";
import { wait } from "./actions";

export async function animateWell(action: GooseAction,context: GooseAnimationContext): Promise<void> {
	const player = Object.values(context.state.players).find(
		(player) => player.token === action.token,
	);

	if (!player) return;

	const duration = 1500;
	const startTime = performance.now();

	context.state.message = action.payload ?? "Caes en el pozo y pierdes turnos hasta que otro jugador caiga aquí";

	context.state.specialAnimation = {
		type: "well",
		progress: 0,
		token: action.token,
	};

	context.render();

	await new Promise<void>((resolve) => {
		function animate(currentTime: number) {
			const elapsed = currentTime - startTime;

			const progress = Math.min(elapsed / duration, 1);

			context.state.specialAnimation = {
				type: "well",
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

export function drawWellAnimation(ctx: CanvasRenderingContext2D,
	progress: number, x: number, y: number, cellSize: number) {
	ctx.save();

	const canvasWidth = ctx.canvas.width;
	const canvasHeight = ctx.canvas.height;

	const alpha = Math.sin(progress * Math.PI);

	const maxRadius = Math.sqrt(
		Math.pow(Math.max(x, canvasWidth - x), 2) +
		Math.pow(Math.max(y, canvasHeight - y), 2),
	);

	const wellProgress = Math.min(progress * 1.25, 1);

	const radius = cellSize * 0.15 + (maxRadius - cellSize * 0.15) * wellProgress;

	const centerY = y - cellSize * 0.25;

	ctx.globalAlpha = alpha * 0.45;
	ctx.fillStyle = "#171411";

	ctx.fillRect(0, 0, canvasWidth, canvasHeight);

	ctx.globalAlpha = alpha;
	ctx.fillStyle = "#15110f";

	ctx.beginPath();
	ctx.ellipse(x, centerY, radius, radius * 0.72, 0, 0, Math.PI * 2);
	ctx.fill();

	ctx.strokeStyle = "#4a4036";
	ctx.lineWidth = Math.max(cellSize * 0.025, radius * 0.015);

	ctx.beginPath();
	ctx.ellipse(x, centerY, radius, radius * 0.72, 0, 0, Math.PI * 2);
	ctx.stroke();

	const spiralCount = 5;

	for (let s = 0; s < spiralCount; s++) {
		const offset = (s / spiralCount) * Math.PI * 2;

		ctx.globalAlpha = alpha * (0.25 + (1 - progress) * 0.45);

		ctx.strokeStyle = "#6b6258";
		ctx.lineWidth = Math.max(cellSize * 0.018, radius * 0.008);

		ctx.beginPath();

		const turns = 2.2;
		const points = 100;

		for (let i = 0; i < points; i++) {
			const t = i / (points - 1);

			const angle = t * Math.PI * 2 * turns + progress * Math.PI * 5 + offset;

			const spiralRadius = radius * 0.92 * t;

			const px = x + Math.cos(angle) * spiralRadius;

			const py = centerY + Math.sin(angle) * spiralRadius * 0.72;

			if (i === 0) {
				ctx.moveTo(px, py);
			} else {
				ctx.lineTo(px, py);
			}
		}

		ctx.stroke();
	}

	for (let i = 0; i < 6; i++) {
		const waveProgress = (progress * 1.8 + i / 6) % 1;

		const waveRadius = radius * (0.1 + waveProgress * 0.9);

		ctx.globalAlpha = alpha * (1 - waveProgress) * 0.45;
		ctx.lineWidth = Math.max(cellSize * 0.015, radius * 0.006);

		ctx.strokeStyle = "#8a8075";

		ctx.beginPath();
		ctx.ellipse(x, centerY, waveRadius, waveRadius * 0.72, 0, 0, Math.PI * 2,);
		ctx.stroke();
	}

	ctx.restore();
}