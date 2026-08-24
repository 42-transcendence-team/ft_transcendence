import React, { useRef, useCallback, useEffect } from "react";
import { useTicTacToe } from "./useTicTacToe";
import { drawBoard } from "./components/board";

// TODO - Ponerlo bonico y hacer alguna animacion 

export function TicTacToe() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { play, line, draw: isDraw, gameState, backendBoard } = useTicTacToe();

    const mouseRef = useRef({ x: -1, y: -1, clicked: false });

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        if (gameState.status !== "PLAY" && gameState.status !== "FINISH") {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        const size = canvas.width;
        const cell = size / 3;

        ctx.clearRect(0, 0, size, size);

        drawBoard(ctx, backendBoard, cell);

        if (line) {
            const start = line[0];
            const end = line[2];
            ctx.strokeStyle = "red";
            ctx.lineWidth = 15;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(start[1] * cell + cell / 2, start[0] * cell + cell / 2);
            ctx.lineTo(end[1] * cell + cell / 2, end[0] * cell + cell / 2);
            ctx.stroke();
        }

    }, [backendBoard, line, gameState, isDraw]);

    useEffect(() => {
        draw();
    }, [draw]);

    useEffect(() => {
        if (gameState.status !== "MENU" && gameState.status !== "LOBBY") return;

        let animationFrameId: number;
        const renderLoop = () => {
            draw();
            animationFrameId = requestAnimationFrame(renderLoop);
        };

        renderLoop();
        return () => cancelAnimationFrame(animationFrameId);
    }, [gameState.status, draw]);

    const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
    };

    function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
        const { x, y } = getCanvasCoords(e);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const cell = canvas.width / 3;
        const col = Math.floor(x / cell);
        const row = Math.floor(y / cell);

        play(row, col);
    }

    function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
        const { x, y } = getCanvasCoords(e);
        mouseRef.current.x = x;
        mouseRef.current.y = y;
    }

    function handleMouseLeave() {
        mouseRef.current.x = -1;
        mouseRef.current.y = -1;
        mouseRef.current.clicked = false;
    }

    return (
		<>
			<canvas
				ref={canvasRef}
				width={900}
				height={900}
				onClick={handleClick}
				onMouseMove={handleMouseMove}
				onMouseLeave={handleMouseLeave}
				onMouseDown={() => { mouseRef.current.clicked = true; }}
				onMouseUp={() => { mouseRef.current.clicked = false; }}
				style={{ width: "100%", height: "100%", display: "block", position: "absolute", top: 0, left: 0 }}
			/>
		</>
    );
}