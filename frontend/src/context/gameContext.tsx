import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '././webSocketContext';
import { useNavigate } from 'react-router-dom';

export type GameStatus = 'MENU' |'PLAYING' | 'FINISHED' | 'JOINING' | 'WAITING' | 'LOBBY' | 'IDLE';

export type GameMode = 'local' | 'online_create' | 'online_join';

interface Player {
    id: string;
    login?: string;
    color?: string;
}

export interface GameState {
    game_id: number;
    game_type: string;
    status: GameStatus;
    players: Player[];
    current_turn: string;
    winner_id?: string;
    board_state: any; 
    last_dice_roll?: number;
}

interface GameContextType {
    gameState: GameState | null;
    gameStatus: GameStatus;
    createGame: (gameType: GameState['game_type'], mode: GameMode ) => void;
    joinGame: (gameId: string) => void;
    makeMove: (moveData: any) => void;
    rollDice: () => void;
    leaveGame: (gameId: string) => void;
}

const initialGameState: GameState = {
	game_id: 0,
	game_type: '',
	status: 'MENU',
	players: [],
	current_turn: '',
	board_state: null,
	winner_id: undefined,
	last_dice_roll: undefined,
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children, user }: { children: React.ReactNode; user: any }) {
    const { send, subscribe } = useWebSocket();
    const [ gameState, setGameState ] = useState<GameState>(initialGameState);
    const [ gameStatus, setGameStatus ] = useState<GameStatus>('IDLE');
    const [ gameId, setGameId ] = useState<number | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user?.id) {
            setGameState(initialGameState);
            setGameId(null);
            setGameStatus('MENU');
            return;
        }

        const unsubscribeGameUpdate = subscribe("game_update", (message: any) => {
            if (!message.payload) return;
            
            const payload: GameState = message.payload;
            setGameState(payload);
            setGameId(payload.game_id);
            if (payload.status) setGameStatus(payload.status);
        });

        const unsubscribeGameCreated = subscribe("game_created", (message: any) => {
            if (!message.payload) return;
            
            const { game_id, game_type } = message.payload;
            
            const slug = game_type.toLowerCase(); 

			setGameState({
				game_id: game_id,
				game_type: game_type,
				status: 'PLAYING',
				players: [],
				current_turn: '',
				board_state: null,
			});

			console.log('gameState after game_created:', gameState);
            setGameId(game_id);
            setGameStatus('PLAYING');            
            navigate(`/app/games/${slug}/${game_id}`);
        });

		const unsubscribeGameFinished = subscribe("game_finished", (message: any) => {
			if (!message.payload) return;

			const { game_id, winner_id } = message.payload;

			if (gameId === game_id) {
				setGameStatus('FINISHED');
				setGameState(prevState => ({
					...prevState,
					winner_id: winner_id,
				}));
			}
		});

        return () => {
            unsubscribeGameUpdate();
            unsubscribeGameCreated();
			unsubscribeGameFinished();
        };
    }, [user?.id, subscribe]);

    useEffect(() => {
        if (gameStatus === 'IDLE' || !gameId || !user) return;

        const handleBeforeUnload = () => {
            send({
                type: "game",
                payload: {
                    action: "leave",
                    game_id: gameId,
                },
            });
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [gameStatus, gameId, user, send]);

    const createGame = useCallback((gameType: GameState['game_type'], mode: GameMode) => {
        if (!user) return;
        setGameStatus('LOBBY');
        send({
            type: "game",
            payload: {
                action: "create",
                game_type: gameType,
                mode: mode
            },
        });
    }, [user, send]);

    const joinGame = useCallback((gameId: string) => {
        if (!user) return;
        send({
            type: "game",
            payload: {
                action: "join",
                game_id: gameId,
            },
        });
        setGameStatus('LOBBY');
    }, [user, send]);

    const makeMove = useCallback((moveData: any) => {
        if (!user || !gameId) return;
        console.log(`Enviando movimiento: ${JSON.stringify(moveData)} para el juego ${gameId}`);
        send({
            type: "game",
            payload: {
                action: "make_move",
                game_id: gameId,
                payload: moveData,
            },
        });
    }, [user, gameId, send]);

    const rollDice = useCallback(() => {
        if (!user || !gameId) return;
        send({
            type: "game",
            payload: {
                action: "roll_dice",
                game_id: gameId,
            },
        });
    }, [user, gameId, send]);

    const leaveGame = useCallback((gameId: string) => {
        if (!user) return;
        console.log(`El usuario ${user.id} está abandonando el juego ${gameId}`);
        send({
            type: "game",
            payload: {
                action: "leave",
                game_id: gameId,
            },
        });
        setGameState(initialGameState);
        setGameId(null);
        setGameStatus('MENU');
    }, [user, send]);

    return (
        <GameContext.Provider value={{ gameState, gameStatus, createGame, joinGame, makeMove, rollDice, leaveGame }}>
            {children}
        </GameContext.Provider>
    );
}

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) throw new Error("useGame debe usarse dentro de GameProvider");
    return context;
};