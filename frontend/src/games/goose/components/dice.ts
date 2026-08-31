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

	if (!dots) {
		return;
	}

	ctx.fillStyle = "#4a4036";

	for (const [px, py] of dots) {
		ctx.beginPath();

		ctx.arc( x + size * px, y + size * py, size * 0.07, 0, Math.PI * 2);

		ctx.fill();
	}
}