// textInput.ts
export class TextInput {
    x: number;
    y: number;
    width: number;
    height: number;
    placeholder: string;
    value = "";
    focused = false;
    maxLength = 10;

    constructor(x: number, y: number, width: number, height: number, placeholder = "Código") {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.placeholder = placeholder;

        window.addEventListener("keydown", this.onKeyDown);
    }

    private onKeyDown = (e: KeyboardEvent) => {
        if (!this.focused) return;

        if (e.key === "Backspace") {
            this.value = this.value.slice(0, -1);
        } else if (e.key.length === 1 && this.value.length < this.maxLength) {
            if (/^[a-zA-Z0-9]$/.test(e.key)) {
                this.value += e.key;
            }
        }
    };

    update(mouse: { x: number; y: number; clicked: boolean }) {
        if (mouse.clicked) {
            this.focused =
                mouse.x >= this.x &&
                mouse.x <= this.x + this.width &&
                mouse.y >= this.y &&
                mouse.y <= this.y + this.height;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = "#1e293b";
        ctx.strokeStyle = this.focused ? "#6366f1" : "#475569";
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, 12);
        ctx.fill();
        ctx.stroke();

        ctx.font = "bold 32px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (this.value) {
            ctx.fillStyle = "#ffffff";
            ctx.fillText(this.value, this.x + this.width / 2, this.y + this.height / 2);
        } else {
            ctx.fillStyle = "#64748b";
            ctx.fillText(this.placeholder, this.x + this.width / 2, this.y + this.height / 2);
        }
    }
}