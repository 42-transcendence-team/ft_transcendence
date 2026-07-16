import "@styles/components/_gameView.scss";

import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { GameProvider, useGame } from '../context/gameContext';
import { games } from './Games';
import { useOutletContext } from "react-router-dom";

export default function GameView() {
    const { user } = useOutletContext<{ user: any }>();

    const { gameType, gameId } = useParams<{ gameType: string; gameId: string }>();
    
    const game = games.find(g => g.id === gameType);

    if (!game) {
        return <p>Juego no encontrado: {gameType}</p>;
    }

    return (
        <GameProvider user={user}>
            <GameViewContent game={game} gameId={gameId} />
        </GameProvider>
    );
}

function GameViewContent({ game, gameId }: { game: any; gameId?: string }) {
    const { leaveGame, joinGame } = useGame(); 
    const location = useLocation();
    
    const GameComponent = game.component;
    const aspectRatio = game.aspectRatio;
    const containerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (gameId) {
            console.log(`Uniéndose a la sala: ${gameId}`);
            joinGame(gameId);
        }
    }, [gameId, joinGame]);

    useEffect(() => {
        const currentPath = location.pathname;

        return () => {
            const nextPath = window.location.pathname;

            if (nextPath === currentPath) return;

            if (nextPath.startsWith(currentPath)) {
                console.log(`Entrando a una sala derivada: ${nextPath}. Manteniendo conexión...`);
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
        <div ref={containerRef} className="game-view" 
        style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div
                className="game-view__content"
                style={{
                    width: size.width,
                    height: size.height,
                }}
            >
                <GameComponent />
            </div>
        </div>
    );
}