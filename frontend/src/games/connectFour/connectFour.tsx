import { useCallback, useEffect, useRef } from "react";
import { useConnectFour } from "./useConnectFour";
import { drawBoard, drawWinningLine } from "./components/board";
import { CONNECT_FOUR_COLUMNS, CONNECT_FOUR_ROWS } from "./useConnectFour";

export function ConnectFour() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { play, line, backendBoard } = useConnectFour();

	const mouseRef = useRef({ x: -1, y: -1 });

	const draw = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const width = canvas.width;
		const height = canvas.height;

		ctx.clearRect(0, 0, width, height);

		const cellWidth = width / CONNECT_FOUR_COLUMNS;
		const cellHeight = height / CONNECT_FOUR_ROWS;

		drawBoard(ctx, backendBoard, cellWidth, cellHeight);

		if (line) {
			drawWinningLine(ctx, line, cellWidth, cellHeight);
		}

	}, [backendBoard, line]);


	useEffect(() => {
		draw();
	}, [draw]);


	const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
		const canvas = canvasRef.current;
		if (!canvas) return { x: 0, y: 0 };

		const rect = canvas.getBoundingClientRect();

		return {
			x: (e.clientX - rect.left) * (canvas.width / rect.width),
			y: (e.clientY - rect.top) * (canvas.height / rect.height),
		};
	};


	function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
		const { x } = getCanvasCoords(e);

		const column = Math.floor(
			x / (canvasRef.current!.width / CONNECT_FOUR_COLUMNS)
		);

		play(column);
	}


	function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
		const { x, y } = getCanvasCoords(e);

		mouseRef.current.x = x;
		mouseRef.current.y = y;
	}


	function handleMouseLeave() {
		mouseRef.current.x = -1;
		mouseRef.current.y = -1;
	}


	return (
		<canvas
			ref={canvasRef}
			width={1050}
			height={900}
			onClick={handleClick}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			style={{ width: "100%", height: "100%", display: "block", position: "absolute", top: 0, left: 0 }}
		/>
	);
}