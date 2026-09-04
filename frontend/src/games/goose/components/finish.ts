import type { GooseAction, GoosePlayerState } from '../useGoose';
import { type GooseAnimationContext, getPosition } from './actions';

export async function animateFinish(
  action: GooseAction,
  context: GooseAnimationContext,
): Promise<void> {
  if (action.to === undefined) {
    return;
  }

  const player = Object.values(context.state.players).find(
    (player) => player.token === action.token,
  );

  if (!player) {
    return;
  }

  console.log('animateFinish', action, player);
  player.position = action.to;

  context.state.message = action.payload ?? '¡Has llegado a la meta!';

  context.state.specialAnimation = {
    type: 'finish',
    progress: 0,
    token: action.token,
  };

  context.render();

  const duration = 2600;
  const startTime = performance.now();

  await new Promise<void>((resolve) => {
    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      context.state.specialAnimation = {
        type: 'finish',
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
  context.state.message = null;
  context.render();
}

export function drawFinishAnimation(
  ctx: CanvasRenderingContext2D,
  progress: number,
  players: Record<string, GoosePlayerState>,
  token: number,
  cellSize: number,
) {
  ctx.save();

  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const minDimension = Math.min(canvasWidth, canvasHeight);

  const player = Object.values(players).find(
    (player) => player.token === token,
  );

  let playerX = centerX;
  let playerY = centerY;

  if (player) {
    const position = getPosition(player.position, cellSize);

    if (position) {
      playerX = position.x + cellSize / 2;
      playerY = position.y + cellSize * 0.65;
    }
  }

  const fadeIn = Math.min(progress / 0.18, 1);
  const fadeOut = progress > 0.78 ? 1 - (progress - 0.78) / 0.22 : 1;
  const alpha = fadeIn * fadeOut;

  ctx.globalAlpha = alpha * 0.3;
  ctx.fillStyle = '#120f0b';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  const pulse = 0.85 + Math.sin(progress * Math.PI * 8) * 0.15;
  const haloRadius = minDimension * (0.1 + Math.min(progress * 1.5, 1) * 0.45);
  const gradient = ctx.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    haloRadius,
  );

  gradient.addColorStop(0, 'rgba(255, 230, 130, 0.35)');
  gradient.addColorStop(0.35, 'rgba(255, 200, 70, 0.16)');
  gradient.addColorStop(1, 'rgba(255, 190, 40, 0)');

  ctx.globalAlpha = alpha * pulse;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, haloRadius, 0, Math.PI * 2);
  ctx.fill();

  const rayProgress = Math.min(progress * 1.4, 1);

  ctx.globalAlpha = alpha * (1 - progress * 0.35) * 0.3;
  ctx.fillStyle = '#ffe38a';

  const rayCount = 16;

  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI * 2 + progress * 0.4;

    const innerRadius = minDimension * 0.12;
    const outerRadius = minDimension * (0.25 + rayProgress * 0.4);

    const spread = 0.025;

    ctx.beginPath();

    ctx.moveTo(
      centerX + Math.cos(angle - spread) * innerRadius,
      centerY + Math.sin(angle - spread) * innerRadius,
    );

    ctx.lineTo(
      centerX + Math.cos(angle) * outerRadius,
      centerY + Math.sin(angle) * outerRadius,
    );

    ctx.lineTo(
      centerX + Math.cos(angle + spread) * innerRadius,
      centerY + Math.sin(angle + spread) * innerRadius,
    );

    ctx.closePath();
    ctx.fill();
  }

  const sparkleCount = 24;

  for (let i = 0; i < sparkleCount; i++) {
    const angle = (i / sparkleCount) * Math.PI * 2 + i * 1.7;
    const distance = minDimension * (0.08 + ((i * 0.37) % 1) * 0.42);

    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;

    const sparklePhase = (progress * 2.5 + i * 0.13) % 1;
    const sparkleAlpha = Math.sin(sparklePhase * Math.PI);
    const size = minDimension * (0.008 + 0.018 * sparkleAlpha);

    ctx.globalAlpha = alpha * sparkleAlpha * 0.95;
    ctx.fillStyle = '#fff3b0';

    ctx.beginPath();
    ctx.moveTo(x, y - size * 2);
    ctx.lineTo(x + size * 0.55, y);
    ctx.lineTo(x, y + size * 2);
    ctx.lineTo(x - size * 0.55, y);
    ctx.closePath();
    ctx.fill();
  }

  const confettiCount = 45;

  for (let i = 0; i < confettiCount; i++) {
    const seed = i * 17.31;
    const x = (seed * 37) % canvasWidth;
    const fall = (progress * (0.7 + (seed % 0.5)) + (seed % 1)) % 1;
    const y = -canvasHeight * 0.1 + fall * canvasHeight * 1.2;
    const size = minDimension * 0.012;
    const rotation = progress * Math.PI * 4 + seed;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = alpha * 0.9;

    const confettiColors = [
      '#e53935',
      '#1e88e5',
      '#fdd835',
      '#43a047',
      '#8e24aa',
      '#fb8c00',
    ];

    ctx.fillStyle = confettiColors[i % confettiColors.length];
    ctx.fillRect(-size / 2, -size, size, size * 2);
    ctx.restore();
  }

  const impactProgress = Math.min(progress / 0.35, 1);

  ctx.globalAlpha = alpha * (1 - impactProgress) * 0.9;
  ctx.strokeStyle = '#ffe38a';
  ctx.lineWidth = minDimension * 0.012;

  ctx.beginPath();

  ctx.arc(
    playerX,
    playerY,
    minDimension * 0.05 + impactProgress * minDimension * 0.35,
    0,
    Math.PI * 2,
  );

  ctx.stroke();

  if (progress > 0.18) {
    const textProgress = Math.min((progress - 0.18) / 0.25, 1);

    const textAlpha = Math.sin(textProgress * Math.PI * 0.5);
    const textScale = 0.75 + textProgress * 0.25;

    ctx.globalAlpha = alpha * textAlpha;
    ctx.translate(centerX, centerY);
    ctx.scale(textScale, textScale);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${minDimension * 0.075}px Arial`;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';

    ctx.fillText('¡META!', 0, -minDimension * 0.025 + minDimension * 0.012);
    ctx.fillStyle = '#ffe38a';
    ctx.fillText('¡META!', 0, -minDimension * 0.025);

    ctx.font = `bold ${minDimension * 0.035}px Arial`;
    ctx.fillStyle = '#fff8e7';

    ctx.fillText('¡HAS GANADO!', 0, minDimension * 0.065);
  }

  ctx.restore();
}
