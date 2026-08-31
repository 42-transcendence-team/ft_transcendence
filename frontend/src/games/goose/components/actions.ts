import type { GooseAction, GoosePlayerState } from "../useGoose";

export interface GooseAnimationState {
	players: Record<string, GoosePlayerState>;
	dice1: number | null;
	dice2: number | null;
	message: string | null;
}

export interface GooseAnimationContext {
	state: GooseAnimationState;
	render: () => void;
}

const ANIMATION_DURATION = {
	roll: 100,
	movePerCell: 80,
	message: 900,
};

export function getPosition(number: number, cellSize: number) {
	if (number === 0) {
		return null;
	}

	const position = number - 1;

	const row = Math.floor(position / 9);
	const column = position % 9;

	const visualColumn = row % 2 === 0 ? column : 8 - column;

	return {x: visualColumn * cellSize, y: row * cellSize};
}

function wait(ms: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

function easeInOut(t: number): number {
	return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export async function playActions(actions: GooseAction[],context: GooseAnimationContext): Promise<void> {
	for (const action of actions) {
		await playAction(action, context);
	}
}

async function playAction(action: GooseAction, context: GooseAnimationContext): Promise<void> {
	switch (action.type) {
		case "roll":
			await animateRoll(action, context);
			break;

		case "move":
			await animateMove(action, context);
			break;
		case "goose":
			await animateGoose(action, context);
			break;
		case "bridge":
		case "dice":
		case "maze":
		case "skull":
		case "finish":
			await animateFinish(action, context);
			break;

		case "inn":
		case "well":
		case "prison":
		case "skip_turn":
			await showActionMessage(action, context);
			break;

		default:
			break;
	}
}

async function animateRoll(action: GooseAction, context: GooseAnimationContext): Promise<void> {
	const { state, render } = context;

	const hasDice1 = action.dice1 !== undefined;
	const hasDice2 = action.dice2 !== undefined;

	if (!hasDice1) {
		return;
	}

	state.dice1 = null;
	state.dice2 = null;
	render();

	await wait(50);

	const frames = 12;

	for (let i = 0; i < frames; i++) {
		state.dice1 = Math.floor(Math.random() * 6) + 1;

		if (hasDice2) {
			state.dice2 = Math.floor(Math.random() * 6) + 1;
		} else {
			state.dice2 = null;
		}

		render();

		await wait(50);
	}

	state.dice1 = action.dice1 ?? null;
	state.dice2 = action.dice2 ?? null;

	render();

	await wait(300);
}

async function animateMove(action: GooseAction, context: GooseAnimationContext): Promise<void> {
	if (action.from === undefined || action.to === undefined) {
		return;
	}

	const foundPlayer = Object.values(context.state.players)
		.find((player) => player.token === action.token);

	if (!foundPlayer) {
		return;
	}

	const player: GoosePlayerState = foundPlayer;

	const from = action.from;
	const to = action.to;
	const direction = from < to ? 1 : -1;
	const distance = Math.abs(to - from);

	player.position = from;
	context.render();

	for (let step = 0; step < distance; step++) {
		const start = from + step * direction;
		const end = start + direction;

		const startTime = performance.now();

		await new Promise<void>((resolve) => {
			function animate(currentTime: number) {
				const elapsed = currentTime - startTime;
				const rawProgress = Math.min(elapsed / ANIMATION_DURATION.movePerCell, 1);
				const progress = easeInOut(rawProgress);

				player.position = start + (end - start) * progress;

				context.render();

				if (rawProgress < 1) {
					requestAnimationFrame(animate);
					return;
				}

				player.position = end;
				context.render();

				resolve();
			}

			requestAnimationFrame(animate);
		});
	}

	player.position = to;
	context.render();
}

async function showActionMessage(action: GooseAction, context: GooseAnimationContext): Promise<void> {
	const message = action.payload ?? action.payload;

	if (!message) {
		return;
	}

	context.state.message = message;

	context.render();

	await wait(ANIMATION_DURATION.message);

	context.state.message = null;

	context.render();
}

async function animateFinish(action: GooseAction, context: GooseAnimationContext): Promise<void> {
	if (action.to === undefined) {
		return;
	}

	const player = Object.values(context.state.players).find(
		(player) => player.token === action.token,
	);

	if (!player) {
		return;
	}

	player.position = action.to;

	context.render();

	context.state.message =
		action.payload ?? "¡Has llegado a la meta!";

	context.render();

	await wait(1500);

	context.state.message = null;

	context.render();
}

async function animateGoose(action: GooseAction, context: GooseAnimationContext,): Promise<void> {
	if (action.from === undefined || action.to === undefined) {
		return;
	}

	const player = Object.values(context.state.players).find(
		(player) => player.token === action.token,
	);

	if (!player) {
		return;
	}

	await wait(150);

	context.state.message =
		action.payload ?? "¡De oca a oca y tiro porque me toca!";

	context.render();

	await wait(700);

	context.state.message = null;

	await animateMove(
		{
			...action,
			type: "move",
		},
		context,
	);
}