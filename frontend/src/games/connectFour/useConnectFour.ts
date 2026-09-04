import { type GameState, useGame } from 'context/gameContext';
import { useState } from 'react';

export const CONNECT_FOUR_ROWS = 6;
export const CONNECT_FOUR_COLUMNS = 7;

type ConnectFourMode = 'local' | 'online' | 'join';

export type ConnectFourPlayer = 'R' | 'Y';

export type ConnectFourCell = ConnectFourPlayer | null;

export type ConnectFourBoard = ConnectFourCell[][];

export interface ConnectFourGameState extends GameState {
  board: number[][] | null;
  turn: number;
  winning_line?: [number, number][];
}

function mapCell(cell: number): ConnectFourPlayer | null {
  switch (cell) {
    case 1:
      return 'R';
    case 2:
      return 'Y';
    default:
      return null;
  }
}

export function createEmptyBoard(): ConnectFourBoard {
  return Array.from({ length: CONNECT_FOUR_ROWS }, () =>
    Array<ConnectFourCell>(CONNECT_FOUR_COLUMNS).fill(null),
  );
}

function mapBackendToFrontendBoard(
  backendBoard: number[][] | null,
): ConnectFourBoard {
  if (!backendBoard) {
    return createEmptyBoard();
  }
  return backendBoard.map((row) => row.map(mapCell));
}

export function useConnectFour() {
  const [mode, setMode] = useState<ConnectFourMode | null>(null);
  const { makeMove, gameState: rawGameState, returnMenu, joinGame } = useGame();

  const gameState = rawGameState as unknown as ConnectFourGameState;

  const backendBoard = mapBackendToFrontendBoard(gameState.board);
  const currentTurn: ConnectFourPlayer = gameState.turn === 2 ? 'Y' : 'R';

  const line = gameState.winning_line || null;

  const draw = gameState.status === 'FINISH' && !gameState.winner;

  function play(column: number) {
    if (gameState?.status !== 'PLAY') return;
    makeMove({ column });
  }

  function reset() {
    setMode(null);
    returnMenu();
  }

  return {
    mode,
    play,
    line,
    draw,
    gameState,
    backendBoard,
    reset,
    joinGame,
    currentTurn,
  };
}

export default useConnectFour;
