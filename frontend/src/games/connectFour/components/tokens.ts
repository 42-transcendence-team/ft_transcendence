const PIECE_COLORS = {
  R: '#e53935',
  Y: '#fdd835',
};

export function drawPiece({
  ctx,
  x,
  y,
  width,
  height,
  type,
  preview = false,
}: {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'R' | 'Y';
  preview?: boolean;
}) {
  const radius = Math.min(width, height) * 0.32;

  ctx.save();

  ctx.fillStyle = PIECE_COLORS[type];

  ctx.globalAlpha = preview ? 0.35 : 1;

  ctx.strokeStyle = '#333';
  ctx.lineWidth = 4;

  ctx.beginPath();

  const points = 24;

  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2;

    const variation = 1 + Math.sin(i * 4.7) * 0.025;

    const px = x + Math.cos(angle) * radius * variation;

    const py = y + Math.sin(angle) * radius * variation;

    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }

  ctx.closePath();

  ctx.fill();
  ctx.stroke();

  ctx.restore();
}
