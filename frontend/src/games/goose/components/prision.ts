import type { GooseAnimationContext } from "./actions";
import type { GooseAction } from "../useGoose";
import { wait } from "./actions";

export async function animatePrison(action: GooseAction, context: GooseAnimationContext): Promise<void> {
	const duration = 1600;
	const startTime = performance.now();

	context.state.message = action.payload ?? "Caes en la cárcel y pierdes turnos hasta que otro jugador caiga aquí";

	context.state.specialAnimation = {
		type: "prison",
		progress: 0,
		token: action.token,
	};

	context.render();

	await new Promise<void>((resolve) => {
		function animate(currentTime: number) {
			const elapsed = currentTime - startTime;

			const progress = Math.min(elapsed / duration, 1);

			context.state.specialAnimation = {
				type: "prison",
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

export function drawPrisonAnimation(ctx: CanvasRenderingContext2D,
	progress: number, canvasWidth: number, canvasHeight: number) {
	ctx.save();
	let visibleProgress: number;

	if (progress < 0.25) {
		visibleProgress = progress / 0.25;
	} else if (progress < 0.75) {
		visibleProgress = 1;
	} else {
		visibleProgress = 1 - (progress - 0.75) / 0.25;
	}

	visibleProgress = Math.max(0, Math.min(1, visibleProgress));

	ctx.globalAlpha = visibleProgress * 0.35;
	ctx.fillStyle = "#000";

	ctx.fillRect(0, 0, canvasWidth, canvasHeight);

	const barCount = 13;
	const spacing = canvasWidth / barCount;

	let shake = 0;

	if (progress >= 0.25 && progress <= 0.75) {
		shake = Math.sin((progress - 0.25) * Math.PI * 12) * canvasWidth * 0.004;
	}

	ctx.lineWidth = canvasWidth * 0.012;
	ctx.strokeStyle = "#302b27";

	for (let i = 0; i <= barCount; i++) {
		const x = i * spacing + shake;

		const topY = -(canvasHeight * (1 - visibleProgress));

		const bottomY = canvasHeight + canvasHeight * (1 - visibleProgress);

		ctx.globalAlpha = visibleProgress * 0.95;

		ctx.beginPath();

		ctx.moveTo(x, topY);
		ctx.lineTo(x, bottomY);

		ctx.stroke();
	}

	const horizontalBars = 5;

	for (let i = 0; i < horizontalBars; i++) {
		const y = (i + 1) * (canvasHeight / (horizontalBars + 1));

		ctx.globalAlpha = visibleProgress * 0.8;

		ctx.beginPath();

		ctx.moveTo(0, y);
		ctx.lineTo(canvasWidth, y);

		ctx.stroke();
	}

	ctx.restore();
}