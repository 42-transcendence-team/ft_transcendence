import { useCallback, useEffect, useRef } from "react";
import { useTicTacToe } from "./useTicTacToe";
import { drawBoard } from "./components/board";
import { drawFinished } from "./components/finish";
import { Button } from "./components/button";

export function TicTacToe() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { board, play, winner, line, draw: isDraw, reset, startGame, gameState} = useTicTacToe();

    const mouseRef = useRef({ x: 0, y: 0, clicked: false });
    const buttons = useRef<Button[] | null>(null);

    if (!buttons.current) {
        buttons.current = [
            new Button(250, 250, 400, 90, "Local", () => startGame("local")),
            new Button(250, 400, 400, 90, "Crear sala", () => startGame("online_create")),
            new Button(250, 550, 400, 90, "Unirse", () => startGame("online_join")),
        ];
    }

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const size = canvas.width;
        const cell = size / 3;

        ctx.clearRect(0, 0, size, size);

        if (gameState === "menu") {
            for (const button of buttons.current ?? []) {
                button.update(mouseRef.current);
                button.draw(ctx);
            }
            return;
        }

        drawBoard(ctx, board, cell);

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

        if (gameState === "finished") {
            drawFinished(ctx, size, winner, isDraw);
        }
    }, [board, winner, line, gameState, isDraw]);

    useEffect(() => {
        draw();
    }, [draw]);

    useEffect(() => {
        if (gameState !== "menu") return;

        let animationFrameId: number;
        const renderLoop = () => {
            draw();
            animationFrameId = requestAnimationFrame(renderLoop);
        };
        
        renderLoop();
        return () => cancelAnimationFrame(animationFrameId);
    }, [gameState, draw]);

    function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        if (gameState === "menu") {
            for (const button of buttons.current ?? []) {
                button.click();
            }
            return;
        }

        if (gameState === "finished") {
            const buttonX = canvas.width / 2 - 150;
            const buttonY = canvas.height / 2 + 30;

            if (x >= buttonX && x <= buttonX + 300 &&
                y >= buttonY && y <= buttonY + 100 ) {
                reset();
            }
            return;
        }

        const cell = canvas.width / 3;
        const col = Math.floor(x / cell);
        const row = Math.floor(y / cell);

        play(row, col);
    }

    function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        mouseRef.current.x = (e.clientX - rect.left) * scaleX;
        mouseRef.current.y = (e.clientY - rect.top) * scaleY;
    }

    return (
        <canvas
            ref={canvasRef}
            width={900}
            height={900}
            onClick={handleClick}
            onMouseMove={handleMouseMove}
            onMouseDown={() => { mouseRef.current.clicked = true; }}
            onMouseUp={() => { mouseRef.current.clicked = false; }}
            style={{ width: "100%", height: "100%", display: "block", cursor: "pointer" }}
        />
    );
}