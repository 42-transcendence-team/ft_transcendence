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
	return (
		<div className="game-menu">
			<button 
				onClick={() => {
					createGame(gameState.game_type, "local")
					console.log("Game type: ", gameState.game_type);
				}}
				className="game-menu__button"
			>
					Local
			</button>
			<button 
				onClick={() => {
					createGame(gameState.game_type, "online")
					setGameStatus("LOBBY");
				}}
				className="game-menu__button"
			>
					Online
			</button>
						<button 
				onClick={() => { setGameStatus("JOIN"); }}
				className="game-menu__button"
			>
					Unirse
			</button>
		</div>
	)
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
	const [code, setCode] = useState(gameState.game_id || "");

	return (
		<div className="game-menu">
			<h2 className="game-menu__title">Unirse a una partida</h2>
			<input
				type="text"
				placeholder="Código de la partida"
				value={code || ""}
				onChange={(e) => { setCode(e.target.value); }}
				className="game-menu__input"
			/>
			<button 
				onClick={() => joinGame(code)}
				className="game-menu__button"
			>
					Unirse a la partida
			</button>
			<button 
				onClick={() => returnMenu()}
				className="game-menu__button"
			>
					Volver
			</button>
		</div>
	)
}

function GameViewFinish() {
	const { returnMenu, gameState } = useGame();
	const winner = gameState.players.find(player => player.token === gameState.winner);

	return (
		<div className="game-menu">
			{ gameState.winner ? (
				<h2 className="game-menu__title">¡El jugador {winner?.username} ha ganado!</h2>
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

function GameViewContent({ game, gameId, gameType }: { game: any; gameId?: string; gameType?: string; }) {
    const { gameState, leaveGame, setGameType, isMyTurn } = useGame();
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
                leaveGame(gameId);
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

				{gameState.status === "PLAY" && !isMyTurn && gameState.mode === "online" && (
					<GameViewWait />
				)}

				{ gameState.status === 'MENU' && ( <GameViewMenu /> ) }

				{ gameState.status === 'LOBBY' && ( <GameViewLobby /> ) }
				
				{ gameState.status === 'JOIN' && ( <GameViewJoin /> ) }
				
				{ gameState.status === 'FINISH' && ( <GameViewFinish /> ) }
            </div>
        </div>
    );
}