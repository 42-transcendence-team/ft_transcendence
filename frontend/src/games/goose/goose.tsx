import { useCallback, useEffect, useRef } from "react";
import { useGoose, type GooseAction } from "games/goose/useGoose";
import { drawBoard, drawPlayers } from "./components/board";
import { drawDice } from "./components/dice";
import { playActions, type GooseAnimationState } from "./components/actions";

export function Goose() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const {board, rollDice, gameState} = useGoose();
	const animationStateRef = useRef<GooseAnimationState | null>(null);
	const lastActionsRef = useRef<GooseAction[] | null>(null);
	const isAnimatingRef = useRef(false);

	const draw = useCallback(() => {
		const canvas = canvasRef.current;

		if (!canvas) {
			return;
		}

		const ctx = canvas.getContext("2d");

		if (!ctx) {
			return;
		}

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const cellSize = canvas.width / 9;

		drawBoard(ctx, board, cellSize);

		const animationState = animationStateRef.current;

		const players = animationState?.players ?? gameState.playerstate ?? {};

		drawPlayers(ctx, players, cellSize);

		if (animationState) {
			drawDice(ctx, animationState.dice1, animationState.dice2, canvas.width, canvas.height);
		}
	}, [board,gameState.playerstate]);


	useEffect(() => {
		draw();
	}, [draw]);

	useEffect(() => {
		const actions = gameState.actions;

		if (!actions || actions.length === 0) {
			return;
		}
		if (
			lastActionsRef.current === actions
		) {
			return;
		}
		if (isAnimatingRef.current) {
			return;
		}

		lastActionsRef.current = actions;

		isAnimatingRef.current = true;

		const players =
			structuredClone(
				gameState.playerstate ?? {},
			);

		for (const action of actions) {
			if (action.from === undefined || action.token === undefined) {
				continue;
			}

			const player =
				Object.values(players)
					.find(
						(player) => player.token === action.token,
					);

			if (!player) {
				continue;
			}

			player.position =
				action.from;
		}

		animationStateRef.current = {
			players,
			dice1: null,
			dice2: null,
			message: null,
		};

		playActions(
			actions,
			{
				state: animationStateRef.current,
				render: draw,
			},
		)
			.then(() => {
				animationStateRef.current = null;
				draw();
			})
			.finally(() => {
				isAnimatingRef.current = false;
			});

	}, [gameState.actions,gameState.playerstate,draw]);

	function handleClick() {
		if (isAnimatingRef.current) {
			return;
		}
		rollDice();
	}

	return (
		<canvas ref={canvasRef} width={1000} height={900} onClick={handleClick}
			style={{width: "100%", height: "100%", display: "block", position: "absolute", top: 0, left: 0}}
		/>
	);
}