import type { ReactNode } from "react";
import "@styles/components/gameView.scss";

interface GameViewProps {
	children: ReactNode;
	aspectRatio?: string;
}

export default function GameView(props: GameViewProps) {
	const { children, aspectRatio = "16 / 9" } = props;
	return (
		<div className="game-view">
			<div
				className="game-view__content"
				style={{ aspectRatio }}
			>
				{children}
			</div>
		</div>
	);
}