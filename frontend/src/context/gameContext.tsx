import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from '././webSocketContext';
import { useNavigate } from 'react-router-dom';

export type GameStatus = 'MENU' | 'PLAY' | 'FINISH' | 'JOIN' | 'WAIT' | 'LOBBY' | 'IDLE';

export type GameMode = 'local' | 'online' | 'join';

interface Player {
    id: string;
    login?: string;
}

export interface GameState {
    game_id: string;
    game_type: string;
    status: GameStatus;
    players: Player[];
    winner?: string | number;
    board?: unknown;
    last_dice_roll?: number;
    turn?: unknown;
}

interface GameContextType {
    gameState: GameState;
    setGameStatus: (status: GameStatus) => void;
    setGameType: (gameType: GameState['game_type']) => void;
    returnMenu: () => void;
    createGame: (gameType: GameState['game_type'], mode: GameMode ) => void;
    joinGame: (gameId: string) => void;
    makeMove: (moveData: any) => void;
    rollDice: () => void;
    leaveGame: (gameId: string) => void;
}

const initialGameState: GameState = {
	game_id: '',
	game_type: '',
	status: 'MENU',
	players: [],
	board: null,
	winner: undefined,
	last_dice_roll: undefined,
	turn: undefined,
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children, user }: { children: React.ReactNode; user: any }) {
    const { send, subscribe } = useWebSocket();
    const [ gameState, setGameState ] = useState<GameState>(initialGameState);
    const navigate = useNavigate();

	const gameStateRef = useRef(gameState);
    useEffect(() => {
        gameStateRef.current = gameState;
    }, [gameState]);

    useEffect(() => {
        if (!user?.id) {
            setGameState(initialGameState);
            return;
        }

        const unsubscribeGameUpdate = subscribe("game_update", (message: any) => {
            console.log('Received game_update message:', message);
			if (!message.status) return;
			setGameState(prevState => ({
				...prevState,
				board: message.state?.board ?? prevState.board,
				status: message.status,
				winner: message.state?.winner ?? prevState.winner,
				last_dice_roll: message.state?.last_dice_roll ?? prevState.last_dice_roll,
				turn: message.state?.turn ?? prevState.turn,
			}));
        });

        const unsubscribeGameCreated = subscribe("game_created", (message: any) => {
            if (!message.payload) return;
            
            const { game_id, game_type, state, status } = message.payload;
            
            const slug = game_type.toLowerCase(); 

			setGameState({
				game_id: game_id,
				game_type: game_type,
				status: status,
				players: [],
				board: state.board,
			});

            navigate(`/app/games/${slug}/${game_id}`, { replace: true });
        });

		const unsubscribeGameFinished = subscribe("game_finished", (message: any) => {
				setGameState(prevState => ({
					...prevState,
					board: message.state?.board ?? prevState.board,
					status: message.status,
					winner: message.winner ?? prevState.winner	,
					last_dice_roll: message.state?.last_dice_roll ?? prevState.last_dice_roll,
					turn: message.state?.turn ?? prevState.turn,
					winning_line: message.winning_line ?? null,
				}));
		});

        return () => {
            unsubscribeGameUpdate();
            unsubscribeGameCreated();
			unsubscribeGameFinished();
        };
    }, [user?.id, subscribe]);

    useEffect(() => {
       if (gameState.status === 'IDLE' || !gameState.game_id || !user) return;

        const handleBeforeUnload = () => {
            send({
                type: "game",
                payload: {
                    action: "leave",
                    game_id: gameState.game_id,
                },
            });
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [gameState.game_id, user, send]);

	useEffect(() => {
		console.log('Current gameState:', gameState);
	}, [gameState]);

    const setGameStatus = useCallback((status: GameStatus) => {
        setGameState(prevState => ({
            ...prevState,
            status: status,
        }));
    }, []);

    const setGameType = useCallback((gameType: GameState['game_type']) => {
        setGameState(prevState => ({
            ...prevState,
            game_type: gameType,
        }));
    }, []);

    const returnMenu = useCallback(() => {
        const gameType = gameState.game_type.toLowerCase();

        console.log(`Returning to menu for game type: ${gameType}`);

        setGameState({
            ...initialGameState,
            game_type: gameType.toUpperCase(),
        });

        setGameType(gameType.toUpperCase());

        navigate(`/app/games/${gameType}`, { replace: true });
    }, [navigate, gameState.game_type]);

    const createGame = useCallback((gameType: GameState['game_type'], mode: GameMode) => {
        if (!user) return;
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

		const currentStatus = gameStateRef.current.status;
		const currentRoomId = gameStateRef.current.game_id;

		if (!gameId || gameId.trim() === "") {
			console.error("Invalid game ID provided for joining.");
			return;
		}

		if (currentStatus === "WAIT" && String(currentRoomId) === String(gameId)) {
			return;
		}

		navigate(`/app/games/${gameStateRef.current.game_type.toLowerCase()}/${gameId}`, { replace: true });

		setGameState(prevState => ({
			...prevState,
			status: "WAIT",
			game_id: gameId,
		}));

		send({
			type: "game",
			payload: {
				action: "join",
				game_id: gameId,
			},
		});
	}, [user, send]);

    const makeMove = useCallback((moveData: any) => {
        if (!user || !gameState.game_id) return;
        send({
            type: "game",
            payload: {
                action: "make_move",
                game_id: gameState.game_id,
                payload: moveData,
            },
        });
    }, [user, gameState.game_id, send]);

    const rollDice = useCallback(() => {
        if (!user || !gameState.game_id) return;
        send({
            type: "game",
            payload: {
                action: "roll_dice",
                game_id: gameState.game_id,
            },
        });
    }, [user, gameState.game_id, send]);

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
    }, [user, send]);

    return (
        <GameContext.Provider value={{ gameState, createGame, joinGame, makeMove, rollDice, 
            leaveGame, setGameStatus, returnMenu, setGameType }}>
            {children}
        </GameContext.Provider>
    );
}

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) throw new Error("useGame debe usarse dentro de GameProvider");
    return context;
};