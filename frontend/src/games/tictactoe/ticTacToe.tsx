import type React from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { drawBoard, drawWinningLine } from './components/board';
import { drawPiece } from './components/tokens';
import { useTicTacToe } from './useTicTacToe';

// TODO - Ponerlo bonico y hacer alguna animacion

function getPieceFromTurn(turn: number): 'X' | 'O' {
  return turn % 2 === 0 ? 'O' : 'X';
}

export function TicTacToe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { play, line, gameState, backendBoard } = useTicTacToe();
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

    const size = canvas.width;
    const cell = size / 3;

    ctx.clearRect(0, 0, size, size);

    drawBoard(ctx, cell);

    backendBoard.forEach((row, rowIndex) => {
      row.forEach((value, columnIndex) => {
        if (!value) {
          return;
        }

        const x = columnIndex * cell + cell / 2;
        const y = rowIndex * cell + cell / 2;

        drawPiece({ ctx, x, y, size: cell, type: value });
      });
    });

    if (
      gameState.status === 'PLAY' &&
      mouseRef.current.x >= 0 &&
      mouseRef.current.y >= 0
    ) {
      const column = Math.floor(mouseRef.current.x / cell);

      const row = Math.floor(mouseRef.current.y / cell);

      if (row >= 0 && row < 3 && column >= 0 && column < 3) {
        if (!backendBoard[row][column]) {
          const x = column * cell + cell / 2;
          const y = row * cell + cell / 2;

          drawPiece({
            ctx,
            x,
            y,
            size: cell,
            type: getPieceFromTurn(gameState.turn),
            preview: true,
          });
        }
      }
    }

    if (line) {
      drawWinningLine(ctx, line[0], line[2], cell);
    }
  }, [backendBoard, line, gameState.status, gameState.turn]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    if (gameState.status !== 'MENU' && gameState.status !== 'LOBBY') {
      return;
    }

    let animationFrameId: number;

    const renderLoop = () => {
      draw();

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState.status, draw]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return { x: 0, y: 0 };
    }

    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;

    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    if (gameState.status !== 'PLAY') {
      return;
    }

    const { x, y } = getCanvasCoords(e);

    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const cell = canvas.width / 3;
    const column = Math.floor(x / cell);
    const row = Math.floor(y / cell);

    if (backendBoard[row]?.[column]) {
      return;
    }

    play(row, column);
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
      width={900}
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
