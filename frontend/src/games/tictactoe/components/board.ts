function drawPencilLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  seed: number,
) {
  const steps = 12;
  const horizontal = Math.abs(x2 - x1) > Math.abs(y2 - y1);
  const startOffset = (((seed * 17) % 7) - 3) * 1.2;
  const endOffset = (((seed * 31) % 7) - 3) * 1.2;

  ctx.beginPath();

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;

    let x = x1 + (x2 - x1) * t;
    let y = y1 + (y2 - y1) * t;

    const globalOffset = startOffset * (1 - t) + endOffset * t;
    const noise = ((seed * 37 + i * 17) % 7) - 3;
    const localOffset = noise * 0.35;

    if (horizontal) {
      y += globalOffset + localOffset;
    } else {
      x += globalOffset + localOffset;
    }

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.stroke();
}

export function drawBoard(ctx: CanvasRenderingContext2D, cell: number) {
  ctx.save();

  ctx.strokeStyle = '#333';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = 0.75;

  for (let i = 1; i < 3; i++) {
    const position = cell * i;

    drawPencilLine(ctx, position, 0, position, cell * 3, i);
    drawPencilLine(ctx, 0, position, cell * 3, position, i + 10);
  }

  ctx.restore();
}

export function drawWinningLine(
  ctx: CanvasRenderingContext2D,
  start: [number, number],
  end: [number, number],
  cell: number,
) {
  const x1 = start[1] * cell + cell / 2;
  const y1 = start[0] * cell + cell / 2;

  const x2 = end[1] * cell + cell / 2;
  const y2 = end[0] * cell + cell / 2;

  const dx = x2 - x1;
  const dy = y2 - y1;

  const length = Math.hypot(dx, dy);

  const ux = dx / length;
  const uy = dy / length;

  const px = -uy;
  const py = ux;

  ctx.save();

  ctx.strokeStyle = '#e59b32';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const strokes = 3;

  for (let i = 0; i < strokes; i++) {
    const offset = (i - 1) * 6;

    const startTrim = length * (0.015 + i * 0.01);

    const endTrim = length * (0.015 + (2 - i) * 0.01);

    const startVariation = Math.sin(i * 12.7) * 5;

    const endVariation = Math.sin(i * 21.4) * 5;

    const sx = x1 + ux * startTrim + px * (offset + startVariation);

    const sy = y1 + uy * startTrim + py * (offset + startVariation);

    const ex = x2 - ux * endTrim + px * (offset + endVariation);

    const ey = y2 - uy * endTrim + py * (offset + endVariation);

    const curve = Math.sin(i * 17.3) * 5;

    const mx = (sx + ex) / 2 + px * curve;

    const my = (sy + ey) / 2 + py * curve;

    ctx.beginPath();

    ctx.lineWidth = 9 - i;

    ctx.globalAlpha = 0.9 - i * 0.03;

    ctx.moveTo(sx, sy);

    ctx.quadraticCurveTo(mx, my, ex, ey);

    ctx.stroke();
  }

  ctx.restore();
}
