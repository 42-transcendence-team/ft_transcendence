import type { GooseAction } from '../useGoose';
import type { GooseAnimationContext } from './actions';
import { animateMove, wait } from './actions';

interface FlyingGoose {
  x: number;
  y: number;
  size: number;
  delay: number;
  phase: number;
}

const GOOSE_FLOCK: FlyingGoose[] = [
  { x: 0.0, y: 0.15, size: 0.24, delay: 0.0, phase: 0.0 },
  { x: 0.14, y: 0.23, size: 0.18, delay: 0.04, phase: 1.2 },
  { x: 0.28, y: 0.15, size: 0.2, delay: 0.08, phase: 2.4 },

  { x: 0.07, y: 0.36, size: 0.16, delay: 0.06, phase: 0.8 },
  { x: 0.2, y: 0.31, size: 0.14, delay: 0.1, phase: 2.0 },
  { x: 0.34, y: 0.36, size: 0.17, delay: 0.14, phase: 3.0 },

  { x: 0.13, y: 0.48, size: 0.28, delay: 0.02, phase: 1.5 },
  { x: 0.3, y: 0.5, size: 0.22, delay: 0.09, phase: 2.8 },
  { x: 0.45, y: 0.46, size: 0.18, delay: 0.16, phase: 4.0 },

  { x: 0.06, y: 0.62, size: 0.17, delay: 0.12, phase: 0.5 },
  { x: 0.22, y: 0.65, size: 0.14, delay: 0.18, phase: 1.8 },
  { x: 0.37, y: 0.6, size: 0.16, delay: 0.22, phase: 3.2 },

  { x: 0.12, y: 0.77, size: 0.12, delay: 0.16, phase: 1.0 },
  { x: 0.27, y: 0.82, size: 0.1, delay: 0.23, phase: 2.2 },
  { x: 0.42, y: 0.76, size: 0.13, delay: 0.28, phase: 3.5 },
];

export function drawFlyingGeese(
  ctx: CanvasRenderingContext2D,
  progress: number,
  canvasWidth: number,
  canvasHeight: number,
) {
  const flockWidth = canvasWidth * 1.5;

  const flockX = -canvasWidth * 0.65 + progress * (canvasWidth + flockWidth);

  for (const goose of GOOSE_FLOCK) {
    const size = canvasWidth * goose.size;

    const baseX = flockX + goose.x * flockWidth;

    const baseY = canvasHeight * goose.y;

    const bob = Math.sin(progress * Math.PI * 8 + goose.phase) * size * 0.08;

    const wobble = Math.sin(progress * Math.PI * 5 + goose.phase) * size * 0.04;

    const x = baseX + wobble;
    const y = baseY + bob;

    const rotation = Math.sin(progress * Math.PI * 6 + goose.phase) * 0.08;

    ctx.save();

    ctx.translate(x, y);
    ctx.rotate(rotation);

    ctx.font = `${size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillText('🪿', 0, 0);

    ctx.restore();
  }
}

export async function animateGoose(
  action: GooseAction,
  context: GooseAnimationContext,
): Promise<void> {
  if (action.from === undefined || action.to === undefined) {
    return;
  }

  const player = Object.values(context.state.players).find(
    (player) => player.token === action.token,
  );

  if (!player) {
    return;
  }

  context.state.message =
    action.payload ?? 'De oca a oca y tiro porque me toca';

  context.render();

  await animateFlyingGeese(context);

  animateMove(action, context);

  context.render();

  await wait(700);

  context.state.message = null;

  context.render();
}

async function animateFlyingGeese(
  context: GooseAnimationContext,
): Promise<void> {
  const duration = 1400;
  const startTime = performance.now();

  await new Promise<void>((resolve) => {
    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;

      const progress = Math.min(elapsed / duration, 1);

      context.state.gooseAnimation = progress;

      context.render();

      if (progress < 1) {
        requestAnimationFrame(animate);
        return;
      }

      context.state.gooseAnimation = null;

      context.render();

      resolve();
    }

    requestAnimationFrame(animate);
  });
}
