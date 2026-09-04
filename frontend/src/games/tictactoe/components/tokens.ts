type PieceType = 'X' | 'O';

interface DrawPieceOptions {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  size: number;
  type: PieceType;
  preview?: boolean;
}

function drawPencilStroke(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
) {
  ctx.beginPath();

  points.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });

  ctx.stroke();
}

function drawPencilX(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
) {
  const half = size * 0.27;

  const variation = size * 0.025;

  drawPencilStroke(ctx, [
    {
      x: x - half - variation,
      y: y - half,
    },
    {
      x: x - half * 0.35,
      y: y - half * 0.3,
    },
    {
      x: x + half * 0.35,
      y: y + half * 0.3,
    },
    {
      x: x + half + variation,
      y: y + half,
    },
  ]);

  // Segunda diagonal
  drawPencilStroke(ctx, [
    {
      x: x + half,
      y: y - half - variation,
    },
    {
      x: x + half * 0.3,
      y: y - half * 0.35,
    },
    {
      x: x - half * 0.35,
      y: y + half * 0.3,
    },
    {
      x: x - half - variation,
      y: y + half,
    },
  ]);
}

function drawPencilO(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
) {
  const radiusX = size * 0.27;
  const radiusY = size * 0.31;

  ctx.beginPath();

  const points = 24;

  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2;

    const variation =
      1 + Math.sin(angle * 3.0) * 0.025 + Math.sin(angle * 5.0) * 0.015;

    const px = x + Math.cos(angle) * radiusX * variation;

    const py = y + Math.sin(angle) * radiusY * variation;

    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }

  ctx.closePath();
  ctx.stroke();
}

export function drawPiece({
  ctx,
  x,
  y,
  size,
  type,
  preview = false,
}: DrawPieceOptions) {
  ctx.save();

  ctx.strokeStyle = type === 'X' ? '#d94b4b' : '#3f78c5';

  ctx.lineWidth = size * 0.045;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (preview) {
    ctx.globalAlpha = 0.25;
  }

  if (type === 'X') {
    drawPencilX(ctx, x, y, size);
  } else {
    drawPencilO(ctx, x, y, size);
  }

  ctx.restore();
}
