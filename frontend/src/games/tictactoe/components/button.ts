export class Button {
	x: number;
	y: number;
	width: number;
	height: number;
	text: string;

	hover = false;
	onClick: () => void;

	constructor(
		x: number,
		y: number,
		width: number,
		height: number,
		text: string,
		onClick: () => void,
	) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.text = text;
		this.onClick = onClick;
	}

	update(mouse: { x: number; y: number }) {
		this.hover =
			mouse.x >= this.x &&
			mouse.x <= this.x + this.width &&
			mouse.y >= this.y &&
			mouse.y <= this.y + this.height;
	}

	click() {
		if (this.hover) {
			this.onClick();
		}
	}

	draw(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = this.hover ? "#6366f1" : "#4f46e5";

		ctx.beginPath();
		ctx.roundRect(
			this.x,
			this.y,
			this.width,
			this.height,
			20
		);
		ctx.fill();


		ctx.fillStyle = "white";
		ctx.font = "45px Arial";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";

		ctx.fillText(
			this.text,
			this.x + this.width / 2,
			this.y + this.height / 2
		);
	}
}