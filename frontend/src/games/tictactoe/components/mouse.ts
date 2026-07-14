export class Mouse {
	x = 0;
	y = 0;

	pressed = false;
	clicked = false;

	constructor(canvas: HTMLCanvasElement) {
		canvas.addEventListener("mousemove", this.onMove);
		canvas.addEventListener("mousedown", this.onDown);
		canvas.addEventListener("mouseup", this.onUp);
	}

	private onMove = (e: MouseEvent) => {
		const canvas = e.currentTarget as HTMLCanvasElement;
		const rect = canvas.getBoundingClientRect();

		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;

		this.x = (e.clientX - rect.left) * scaleX;
		this.y = (e.clientY - rect.top) * scaleY;
	};

	private onDown = () => {
		this.pressed = true;
		this.clicked = true;
	};

	private onUp = () => {
		this.pressed = false;
	};

	endFrame() {
		this.clicked = false;
	}
}