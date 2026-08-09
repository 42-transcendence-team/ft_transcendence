import "@styles/components/_gameView.scss";

import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { GameProvider, useGame } from '../context/gameContext';
import { games } from './Games';
import { useOutletContext } from "react-router-dom";

// TODO - Ponerlo bonico en general, quiza añadir un boton para volver a la lista de juegos, y un boton para salir de la partida

export default function GameView() {
    const { user } = useOutletContext<{ user: any }>();

    const { gameType, gameId } = useParams<{ gameType: string; gameId: string }>();
    
    const game = games.find(g => g.id === gameType);

    if (!game) {
        return <p>Juego no encontrado: {gameType}</p>;
    }

    return (
        <GameProvider user={user}>
            <GameViewContent game={game} gameId={gameId} gameType={gameType} />
        </GameProvider>
    );
}

function GameViewMenu() {
	const { gameState, createGame, setGameStatus } = useGame();
	const [playerSelection, setPlayerSelection] = useState<"local" | "online" | null>(null);

	const isMultiPlayerGame = gameState.game_type === "GOOSE";

	const create = (mode: "local" | "online", numPlayers: number = 2) => {
		createGame(gameState.game_type, mode, numPlayers);

		if (mode === "online") {
			setGameStatus("LOBBY");
		}
	};

	if (playerSelection !== null) {
		return (
			<div className="game-menu">
				<h3 className="game-menu__subtitle">Numero de Jugadores</h3>
				<div className="game-menu__player">
				{[2, 3, 4, 5, 6].map((numPlayers) => (
					<button
						key={numPlayers}
						onClick={() => {
							create(playerSelection, numPlayers);
							setPlayerSelection(null);
						}}
						className="game-menu__button"
					>
						{numPlayers}
					</button>
				))}
				</div>

				<button
					onClick={() => setPlayerSelection(null)}
					className="game-menu__button"
				>
					Volver
				</button>
			</div>
		);
	}

	return (
		<div className="game-menu">
			<button
				onClick={() => {
					if (isMultiPlayerGame) {
						setPlayerSelection("local");
					} else {
						create("local");
					}
				}}
				className="game-menu__button"
			>
				Local
			</button>

			<button
				onClick={() => {
					if (isMultiPlayerGame) {
						setPlayerSelection("online");
					} else {
						create("online");
					}
				}}
				className="game-menu__button"
			>
				Online
			</button>

			<button
				onClick={() => setGameStatus("JOIN")}
				className="game-menu__button"
			>
				Unirse
			</button>
		</div>
	);
}

function GameViewLobby() {
	const { gameState, returnMenu } = useGame();
	return (
		<div className="game-menu">
			<h2 className="game-menu__title">Esperando a que otro jugador se una...</h2>
			<h3 className="game-menu__subtitle">Código de la partida: {gameState.game_id}</h3>
			<button 
				onClick={() => returnMenu()}
				className="game-menu__button"
			>
					Volver
			</button>
		</div>
	)
}

function GameViewJoin() {
	const { gameState, joinGame, returnMenu } = useGame();
	const [code, setCode] = useState( gameState.game_id ? String(gameState.game_id) : "");

	return (
		<div className="game-menu">
			<h2 className="game-menu__title">Unirse a una partida</h2>
			<input
				type="text"
				placeholder="Código de la partida"
				value={code}
				onChange={(e) => setCode(e.target.value)}
				className={`game-menu__input ${
					gameState.error ? "game-menu__input--error" : ""
				}`}
			/>
			{gameState.error && (
				<div className="game-menu__error" >
					{gameState.error}
				</div>
			)}
			<button onClick={() => joinGame(Number(code))} className="game-menu__button" >
				Unirse a la partida
			</button>
			<button onClick={returnMenu} className="game-menu__button" >
				Volver
			</button>
		</div>
	);
}

function getWinnerName() {
	const { gameState, winnerPlayer } = useGame();
	if (!gameState.winner) return null;

	if (gameState.mode === "local") {
		return gameState.winner === 1 ? "X" : "O";
	}

	return winnerPlayer?.username || "Jugador desconocido";
}

function GameViewFinish() {
	const { returnMenu, gameState } = useGame();
	const winner = getWinnerName();

	return (
		<div className="game-menu">
			{ gameState.winner ? (
				<h2 className="game-menu__title">¡El jugador {winner} ha ganado!</h2>
			) : (
				<h2 className="game-menu__title">¡Empate!</h2>
			)}
			<button 
				onClick={() => returnMenu()}
				className="game-menu__button"
			>
					Fin del juego
			</button>
		</div>
	)
}

// TODO - Ponerlo bonico
function GameViewWait() {
	return (
		<div className="game-menu">
			<h2 className="game-menu__title">Esperando al turno del oponente...</h2>
		</div>
	)
}

function getPlayerName() {
	const { gameState } = useGame();
	let player = gameState.players.find(p => p.token === gameState.turn);
	if (!player) return "Jugador desconocido";

	if (gameState.mode === "local") {
		return player.id === 1 ? "X" : "O";
	}

	return player.username || "Jugador desconocido";
}

function GameViewViewer() {
	const { returnMenu } = useGame();
	// TODO - Vista para espectadores de partida, donde diga turno y boton para salir
	return (
		<div className="game-menu">
			<h2 className="game-menu__title">Turno del jugador {getPlayerName()}</h2>
			<button 
				onClick={() => returnMenu()}
				className="game-menu__button"
			>
					Volver al menú
			</button>
		</div>
	)
}

function GameViewTimeout() {
	const { returnMenu } = useGame();
	return (
		<div className="game-menu">
			<h2 className="game-menu__title">El jugador ha perdido por abandono.</h2>
			<button 
				onClick={() => returnMenu()}
				className="game-menu__button"
			>
					Volver al menú
			</button>
		</div>
	)
}

function GameViewReconnecting() {
	return (
		<div className="game-menu">
			<h2 className="game-menu__title">Esperando a que el jugador se reconecte...</h2>
		</div>
	)
}

function GameViewContent({ game, gameId, gameType }: { game: any; gameId?: string; gameType?: string; }) {
    const { gameState, leaveGame, setGameType, isMyTurn, isPlayer, isViewer } = useGame();
    const location = useLocation();
    
    const GameComponent = game.component;
    const aspectRatio = game.aspectRatio;
    const containerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

	useEffect(() => {
		if (gameType) {
			setGameType(gameType.toUpperCase());
		}
	}, [gameType, setGameType]);

    useEffect(() => {
        const currentPath = location.pathname;

        return () => {
            const nextPath = window.location.pathname;

            if (nextPath === currentPath) return;

            if (nextPath.startsWith(currentPath)) {
                return;
            }
            if (gameId) {
                leaveGame(Number(gameId));
            }
        };
    }, [location.pathname, leaveGame, gameId]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const resize = () => {
            const { width, height } = container.getBoundingClientRect();
            let gameWidth = width;
            let gameHeight = width / aspectRatio;

            if (gameHeight > height) {
                gameHeight = height;
                gameWidth = height * aspectRatio;
            }

            setSize({ width: gameWidth, height: gameHeight });
        };

        resize();
        const observer = new ResizeObserver(resize);
        observer.observe(container);

        return () => observer.disconnect();
    }, [aspectRatio]);

    return (
        <div ref={containerRef} className="game-view" >
            <div
                className="game-view__content"
                style={{ width: size.width, height: size.height}}
            >
                <GameComponent />

				{isViewer && gameState.status === "PLAY" && <GameViewViewer />}

				{gameState.status === "PLAY" && !isMyTurn && isPlayer && gameState.mode === "online" && (
					<GameViewWait />
				)}

				{ gameState.status === 'MENU' && ( <GameViewMenu /> ) }

				{ gameState.status === 'LOBBY' && ( <GameViewLobby /> ) }
				
				{ gameState.status === 'JOIN' && ( <GameViewJoin /> ) }
				
				{ gameState.status === 'FINISH' && ( <GameViewFinish /> ) }

				{ gameState.status === 'TIMEOUT' && ( <GameViewTimeout /> ) }

				{ gameState.status === 'RECONNECTING' && ( <GameViewReconnecting /> ) }
            </div>
        </div>
    );
}