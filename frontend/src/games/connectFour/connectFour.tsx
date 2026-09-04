import { useCallback, useEffect, useRef } from 'react';
import { drawBoard, drawWinningLine } from './components/board';
import { drawPiece } from './components/tokens';
import {
  CONNECT_FOUR_COLUMNS,
  CONNECT_FOUR_ROWS,
  useConnectFour,
} from './useConnectFour';

function getPieceFromTurn(turn: number): 'R' | 'Y' {
  return turn % 2 === 0 ? 'Y' : 'R';
}

export function ConnectFour() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { play, line, backendBoard, gameState } = useConnectFour();
  const mouseRef = useRef({ x: -1, y: -1 });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const cellWidth = width / CONNECT_FOUR_COLUMNS;
    const cellHeight = height / CONNECT_FOUR_ROWS;

    drawBoard(ctx, backendBoard, cellWidth, cellHeight);

    backendBoard.forEach((row, rowIndex) => {
      row.forEach((value, columnIndex) => {
        if (!value) {
          return;
        }

        const x = columnIndex * cellWidth + cellWidth / 2;
        const y = rowIndex * cellHeight + cellHeight / 2;

        drawPiece({
          ctx,
          x,
          y,
          width: cellWidth,
          height: cellHeight,
          type: value,
        });
      });
    });

    if (gameState.status === 'PLAY' && mouseRef.current.x >= 0) {
      const column = Math.floor(mouseRef.current.x / cellWidth);

      if (column >= 0 && column < CONNECT_FOUR_COLUMNS) {
        let row = -1;

        for (let r = CONNECT_FOUR_ROWS - 1; r >= 0; r--) {
          if (!backendBoard[r]?.[column]) {
            row = r;
            break;
          }
        }

        if (row >= 0) {
          const x = column * cellWidth + cellWidth / 2;
          const y = row * cellHeight + cellHeight / 2;

          drawPiece({
            ctx,
            x,
            y,
            width: cellWidth,
            height: cellHeight,
            type: getPieceFromTurn(gameState.turn),
            preview: true,
          });
        }
      }
    }

    if (line) {
      drawWinningLine(ctx, line, cellWidth, cellHeight);
    }
  }, [backendBoard, line, gameState.status, gameState.turn]);

  useEffect(() => {
    draw();
  }, [draw]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return { x: 0, y: 0 };
    }

    const rect = canvas.getBoundingClientRect();

    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    if (gameState.status !== 'PLAY') {
      return;
    }

    const { x } = getCanvasCoords(e);

    const cellWidth = canvasRef.current!.width / CONNECT_FOUR_COLUMNS;

    const column = Math.floor(x / cellWidth);

    if (column < 0 || column >= CONNECT_FOUR_COLUMNS) {
      return;
    }

    play(column);
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const { x, y } = getCanvasCoords(e);

    mouseRef.current.x = x;
    mouseRef.current.y = y;

    draw();
  }

  function handleMouseLeave() {
    mouseRef.current.x = -1;
    mouseRef.current.y = -1;

    draw();
  }

  return (
    <canvas
      ref={canvasRef}
      width={1050}
      height={900}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
        cursor: gameState.status === 'PLAY' ? 'pointer' : 'default',
      }}
    />
  );
}
