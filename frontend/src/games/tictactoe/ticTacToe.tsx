import React, { useRef, useCallback, useEffect, useState } from "react";
import { useTicTacToe } from "./useTicTacToe";
import { drawBoard } from "./components/board";
import { drawFinished } from "./components/finish";
import { Button } from "./components/button";
import { drawCreateRoom, drawJoinRoom } from "./components/lobby";
import { TextInput } from "./components/input";


export function TicTacToe() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { play, winner, line, draw: isDraw, reset, startGame, gameState, backendBoard, joinGame } = useTicTacToe();

    const [ onlineScreen, setOnlineScreen ] = useState<"NONE" | "CREATE" | "JOIN">("NONE");
    const [ errorMessage, setErrorMessage ] = useState("");

    const mouseRef = useRef({ x: -1, y: -1, clicked: false });

    const buttonsMenu = useRef<Button[] | null>(null);
    const buttonBack = useRef<Button | null>(null);
    const buttonCopy = useRef<Button | null>(null);
    const buttonSubmitJoin = useRef<Button | null>(null);
    const textInputJoin = useRef<TextInput | null>(null);

    if (!buttonsMenu.current) {
        buttonsMenu.current = [
            new Button(250, 250, 400, 90, "Local", () => startGame("local")),
            new Button(250, 400, 400, 90, "Crear sala", () => {
                startGame("online");
                setOnlineScreen("CREATE");
            }),
            new Button(250, 550, 400, 90, "Unirse", () => {
                setOnlineScreen("JOIN");
                setErrorMessage("");
            }),
        ];

        buttonBack.current = new Button(350, 750, 200, 70, "Volver", () => {
			setOnlineScreen("NONE");
            reset();
        });

        buttonCopy.current = new Button(325, 520, 250, 70, "Copiar", () => {
            if (gameState.game_id) {
                navigator.clipboard.writeText(gameState.game_id);
            }
        });

        textInputJoin.current = new TextInput(250, 320, 400, 90, "CÓDIGO");
        
        buttonSubmitJoin.current = new Button(300, 520, 300, 80, "Entrar", () => {
            const code = textInputJoin.current?.value.trim();
            if (!code) {
                setErrorMessage("Introduce un código válido");
                return;
            }
            joinGame(code);
        });
    }

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const size = canvas.width;
        const cell = size / 3;

        ctx.clearRect(0, 0, size, size);

        if (gameState.status === "MENU" || gameState.status === "WAITING") {
            if (onlineScreen === "CREATE" && buttonBack.current && buttonCopy.current) {
                drawCreateRoom(
                    ctx,
                    size,
                    String(gameState.game_id || "Cargando..."),
                    buttonBack.current,
                    buttonCopy.current,
                    mouseRef.current
                );
                return;
            }

            if (onlineScreen === "JOIN" && buttonBack.current && buttonSubmitJoin.current && textInputJoin.current) {
                drawJoinRoom(
                    ctx,
                    size,
                    textInputJoin.current,
                    buttonSubmitJoin.current,
                    buttonBack.current,
                    { ...mouseRef.current, clicked: mouseRef.current.clicked },
                    errorMessage
                );
                return;
            }

            for (const button of buttonsMenu.current ?? []) {
                button.update(mouseRef.current);
                button.draw(ctx);
            }
            return;
        }

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

        if (gameState.status === "FINISHED") {
            drawFinished(ctx, size, winner, isDraw);
        }
    }, [backendBoard, winner, line, gameState, isDraw, onlineScreen, errorMessage]);

    useEffect(() => {
        draw();
    }, [draw]);

    useEffect(() => {
        if (gameState.status !== "MENU" && gameState.status !== "WAITING") return;

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

        if (gameState.status === "MENU" || gameState.status === "WAITING") {
            if (onlineScreen === "CREATE") {
                buttonCopy.current?.click();
                buttonBack.current?.click();
                return;
            }

            if (onlineScreen === "JOIN") {
                buttonSubmitJoin.current?.click();
                buttonBack.current?.click();
                return;
            }

            for (const button of buttonsMenu.current ?? []) {
                button.click();
            }
            return;
        }

        if (gameState.status === "FINISHED") {
            const buttonX = canvas.width / 2 - 150;
            const buttonY = canvas.height / 2 + 30;

            if (x >= buttonX && x <= buttonX + 300 && y >= buttonY && y <= buttonY + 100) {
                setOnlineScreen("NONE");
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
			{/* <div className="game-menu">
				<button 
					onClick={() => console.log("Button clicked!")}
					style={{ pointerEvents: "auto", padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
				>
						Hola
				</button>
			</div> */}
		</>
    );
}