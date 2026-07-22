import { Button } from "./button";
import { TextInput } from "./input";

export function drawCreateRoom(
    ctx: CanvasRenderingContext2D,
    size: number,
    gameId: string,
    backButton: Button,
    copyButton: Button,
    mouse: { x: number; y: number }
) {
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 50px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Sala Creada", size / 2, 120);

    ctx.fillStyle = "#64748b";
    ctx.font = "22px Arial";
    ctx.fillText("Comparte este código con tu amigo:", size / 2, 170);

    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.roundRect(size / 2 - 160, 210, 320, 80, 16);
    ctx.fill();

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 40px monospace";
    ctx.fillText(gameId || "Cargando...", size / 2, 252);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "20px Arial";
    ctx.fillText("Esperando al rival...", size / 2, 340);

    copyButton.update(mouse);
    copyButton.draw(ctx);

    backButton.update(mouse);
    backButton.draw(ctx);
}

export function drawJoinRoom(
    ctx: CanvasRenderingContext2D,
    size: number,
    input: TextInput,
    joinButton: Button,
    backButton: Button,
    mouse: { x: number; y: number; clicked: boolean },
    errorMessage: string
) {
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 50px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Unirse a Sala", size / 2, 120);

    ctx.fillStyle = "#64748b";
    ctx.font = "22px Arial";
    ctx.fillText("Ingresa el código de la partida:", size / 2, 170);

    input.update(mouse);
    input.draw(ctx);

    if (errorMessage) {
        ctx.fillStyle = "#ef4444";
        ctx.font = "18px Arial";
        ctx.fillText(errorMessage, size / 2, 335);
    }

    joinButton.update(mouse);
    joinButton.draw(ctx);

    backButton.update(mouse);
    backButton.draw(ctx);
}