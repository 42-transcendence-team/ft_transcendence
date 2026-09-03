import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useWebSocket } from '././webSocketContext';
import { useNavigate } from 'react-router-dom';

export type GameStatus = 'MENU' | 'PLAY' | 'FINISH' | 'JOIN' | 'WAIT' | 'LOBBY' | 'IDLE' | 'RECONNECTING' | 'TIMEOUT';

export type GameMode = 'local' | 'online' | 'join';

type PlayerType = "player" | "viewer";

interface Player {
    id: number;
    username: string;
    type: PlayerType;
    token: number;
}

export interface GameState {
    game_id: number;
    game_type: string;
    status: GameStatus;
    players: Player[];
    winner?: number;
    board?: unknown;
    last_dice_roll?: number;
    turn?: number;
    mode?: GameMode;
    error?: string;
    playerstate?: Record<string, any>;
    actions?: any[];
}

interface GameContextType {
    gameState: GameState;
    isMyTurn: boolean
	myPlayer?: Player;
	isPlayer: boolean;
	isViewer: boolean;
	winnerPlayer?: Player;
	currentTurnPlayer?: Player;
    setGameStatus: (status: GameStatus) => void;
    setGameType: (gameType: GameState['game_type']) => void;
    returnMenu: () => void;
    createGame: (gameType: GameState['game_type'], mode: GameMode, players: number ) => void;
    joinGame: (gameId: number) => void;
    makeMove: (moveData: any) => void;
    rollDice: () => void;
    leaveGame: (gameId: number) => void;
}

const initialGameState: GameState = {
	game_id: 0,
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

    const myPlayer = useMemo(
		() => gameState.players.find(p => p.id === user?.id),
		[gameState.players, user?.id]
	);

	const currentTurnPlayer = useMemo(
		() => gameState.players.find(p => p.token === gameState.turn),
		[gameState.players, gameState.turn]
	);

	const winnerPlayer = useMemo(
		() => gameState.players.find(p => p.token === gameState.winner),
		[gameState.players, gameState.winner]
	);

	const isPlayer = myPlayer?.type === "player";
	const isViewer = myPlayer?.type === "viewer";
	const isMyTurn = !!isPlayer && myPlayer?.token === gameState.turn;

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
			if (!message.status) return;
			setGameState(prevState => ({
				...prevState,
				board: message.state?.board ?? prevState.board,
                players: message.state?.players ?? prevState.players,
				status: message.status,
				winner: message.state?.winner ?? prevState.winner,
				last_dice_roll: message.state?.last_dice_roll ?? prevState.last_dice_roll,
				turn: message.state?.turn ?? prevState.turn,
                mode: message.state?.mode ?? prevState.mode,
                playerstate: message.state?.playerstate ?? prevState.playerstate,
                actions: message.state?.actions ?? prevState.actions,
			}));
        });

        const unsubscribeGameCreated = subscribe("game_created", (message: any) => {
            if (!message.state) return;
            
            const { id, type, board } = message.state;
            
            const slug = type.toLowerCase(); 

			setGameState({
				game_id: id,
				game_type: type,
				status: message.status,
				players: [],
				board: board,
			});

            navigate(`/app/games/${slug}/${id}`, { replace: true });
        });

		const unsubscribeGameFinished = subscribe("game_finished", (message: any) => {
				setGameState(prevState => ({
					...prevState,
					board: message.state?.board ?? prevState.board,
					status: message.status,
					winner: message.state?.winner ?? prevState.winner	,
					last_dice_roll: message.state?.last_dice_roll ?? prevState.last_dice_roll,
					turn: message.state?.turn ?? prevState.turn,
					winning_line: message.winning_line ?? null,
                    playerstate: message.state?.playerstate ?? prevState.playerstate,
                    actions: message.state?.actions ?? prevState.actions,
				}));
		});

		const unsuscribePlayerDisconnected = subscribe("player_disconnected", (message: any) => {
			console.log('Received player_disconnected message:', message);
			setGameState(prevState => ({
				...prevState,
				status: message.status,
			}));
		});

		const unsubscribePlayerTimeout = subscribe("player_timeout", (message: any) => {
			console.log('Received player_timeout message:', message);
			setGameState(prevState => ({
				...prevState,
				status: message.status,
			}));
		});

        const unsubscribeGameJoined = subscribe("game_join_error", (message: any) => {
            setGameState(prevState => ({
                ...prevState,
                error: message.error,
                status: message.status,
            }));
        });

        const unsubscribeGameJoinedSuccess = subscribe("game_joined", (message: any) => {
            if (!message.state?.id) {
                console.error("Game ID is missing in the game_joined message.");
                return;
            }
            setGameState(prevState => ({
                ...prevState,
                game_id: message.state?.id ?? prevState.game_id,
                game_type: message.state?.type ?? prevState.game_type,
                board: message.state?.board ?? prevState.board,
                players: message.state?.players ?? prevState.players,
                status: message.status,
                winner: message.state?.winner ?? prevState.winner,
                last_dice_roll: message.state?.last_dice_roll ?? prevState.last_dice_roll,
                turn: message.state?.turn ?? prevState.turn,
                mode: message.state?.mode ?? prevState.mode,
            }));
            const slug = gameStateRef.current.game_type.toLowerCase();
            const gameId = message.state?.id ?? gameStateRef.current.game_id;
            console.log(`Navigating to game page: /app/games/${slug}/${gameId}`);
            navigate(`/app/games/${slug}/${gameId}`, { replace: true });
        });

        return () => {
            unsubscribeGameJoined();
            unsubscribeGameUpdate();
            unsubscribeGameCreated();
			unsubscribeGameFinished();
			unsubscribePlayerTimeout();
            unsubscribeGameJoinedSuccess();
			unsuscribePlayerDisconnected();
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

    const createGame = useCallback((gameType: GameState['game_type'], mode: GameMode, players: number) => {
        if (!user) return;
        console.log(`Creating game of type: ${gameType} with mode: ${mode} and players: ${players}`);
        send({
            type: "game",
            payload: {
                action: "create",
                game_type: gameType,
                mode: mode,
                players: players
            },
        });
    }, [user, send]);

    const joinGame = useCallback((gameId: number) => {
		if (!user) return;

		if (!gameId || gameId === 0) {
			console.error("Invalid game ID provided for joining.");
			return;
		}

		send({
			type: "game",
			payload: {
				action: "join",
				game_id: gameId,
				game_type: gameStateRef.current.game_type,
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

    const leaveGame = useCallback((gameId: number) => {
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
            leaveGame, setGameStatus, returnMenu, setGameType, isMyTurn, isPlayer, isViewer,
			winnerPlayer, currentTurnPlayer, myPlayer }}>
            {children}
        </GameContext.Provider>
    );
}

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) throw new Error("useGame debe usarse dentro de GameProvider");
    return context;
};