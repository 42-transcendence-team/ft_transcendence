import {
  type GooseAction,
  type GoosePlayerState,
  useGoose,
} from 'games/goose/useGoose';
import { useCallback, useEffect, useRef } from 'react';
import {
  type GooseAnimationState,
  getPosition,
  playActions,
} from './components/actions';
import { drawBoard, drawPlayers } from './components/board';
import { drawBridgeAnimation } from './components/bridge';
import { drawDice, drawDiceAnimation } from './components/dice';
import { drawFinishAnimation } from './components/finish';
import { drawFlyingGeese } from './components/goose';
import { drawInnAnimation } from './components/inn';
import { drawMazeAnimation } from './components/maze';
import { drawPrisonAnimation } from './components/prision';
import { drawSkullAnimation } from './components/skull';
import { drawWellAnimation } from './components/well';

export function drawMessage(
  ctx: CanvasRenderingContext2D,
  message: string,
  canvasWidth: number,
  canvasHeight: number,
) {
  ctx.save();

  const boxWidth = canvasWidth * 0.65;
  const boxHeight = canvasHeight * 0.08;

  const x = (canvasWidth - boxWidth) / 2;
  const y = canvasHeight * 0.76;

  ctx.fillStyle = 'rgba(255, 253, 247, 0.95)';
  ctx.strokeStyle = '#4a4036';
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.roundRect(x, y, boxWidth, boxHeight, boxHeight * 0.3);

  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#4a4036';
  ctx.font = `bold ${canvasWidth * 0.025}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillText(message, canvasWidth / 2, y + boxHeight / 2, boxWidth * 0.9);

  ctx.restore();
}

function drawSpecialAnimation(
  ctx: CanvasRenderingContext2D,
  animation: NonNullable<GooseAnimationState['specialAnimation']>,
  players: Record<string, GoosePlayerState>,
  cellSize: number,
) {
  const player = Object.values(players).find(
    (player) => player.token === animation.token,
  );
  if (!player) {
    return;
  }

  const position = getPosition(player.position, cellSize);
  if (!position) {
    return;
  }

  const x = position.x + cellSize / 2;
  const y = position.y + cellSize * 0.65;

  switch (animation.type) {
    case 'bridge':
      drawBridgeAnimation(ctx, animation.progress, x, y, cellSize);
      break;

    case 'dice':
      drawDiceAnimation(ctx, animation.progress, x, y, cellSize);
      break;

    case 'maze':
      drawMazeAnimation(ctx, animation.progress, x, y);
      break;

    case 'skull':
      drawSkullAnimation(ctx, animation.progress, x, y);
      break;

    case 'inn':
      drawInnAnimation(ctx, animation.progress, x, y);
      break;

    case 'well':
      drawWellAnimation(ctx, animation.progress, x, y, cellSize);
      break;

    case 'prison':
      drawPrisonAnimation(
        ctx,
        animation.progress,
        ctx.canvas.width,
        ctx.canvas.height,
      );
      break;
    case 'finish':
      drawFinishAnimation(
        ctx,
        animation.progress,
        players,
        animation.token,
        cellSize,
      );
      break;
  }
}

export function Goose() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { board, rollDice, gameState } = useGoose();
  const animationStateRef = useRef<GooseAnimationState | null>(null);
  const lastActionsRef = useRef<GooseAction[] | null>(null);
  const isAnimatingRef = useRef(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cellSize = canvas.width / 9;

    drawBoard(ctx, board, cellSize);

    const animationState = animationStateRef.current;

    const players = animationState?.players ?? gameState.playerstate ?? {};

    drawPlayers(ctx, players, cellSize);

    if (animationState?.gooseAnimation != null) {
      drawFlyingGeese(
        ctx,
        animationState.gooseAnimation,
        canvas.width,
        canvas.height,
      );
    }

    if (animationState?.specialAnimation) {
      drawSpecialAnimation(
        ctx,
        animationState.specialAnimation,
        players,
        cellSize,
      );
    }

    if (animationState) {
      drawDice(
        ctx,
        animationState.dice1,
        animationState.dice2,
        canvas.width,
        canvas.height,
      );
    }

    if (animationState?.message) {
      drawMessage(ctx, animationState.message, canvas.width, canvas.height);
    }
  }, [board, gameState.playerstate]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const actions = gameState.actions;

    if (!actions || actions.length === 0) {
      return;
    }

    if (lastActionsRef.current === actions) {
      return;
    }

    if (isAnimatingRef.current) {
      return;
    }

    lastActionsRef.current = actions;

    isAnimatingRef.current = true;

    const players = structuredClone(gameState.playerstate ?? {});

    for (const action of actions) {
      if (
        action.type !== 'move' ||
        action.from === undefined ||
        action.token === undefined
      ) {
        continue;
      }

      const player = Object.values(players).find(
        (player) => player.token === action.token,
      );

      if (!player) {
        continue;
      }

      player.position = action.from;

      break;
    }

    animationStateRef.current = {
      players,
      dice1: null,
      dice2: null,
      message: null,
      gooseAnimation: null,
      specialAnimation: null,
    };

    playActions(actions, {
      state: animationStateRef.current,
      render: draw,
    })
      .then(() => {
        animationStateRef.current = null;
        draw();
      })
      .finally(() => {
        isAnimatingRef.current = false;
      });
  }, [gameState.actions, gameState.playerstate, draw]);

  function handleClick() {
    if (isAnimatingRef.current) {
      return;
    }
    rollDice();
  }

  return (
    <canvas
      ref={canvasRef}
      width={1000}
      height={900}
      onClick={handleClick}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    />
  );
}
