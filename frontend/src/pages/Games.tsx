import { ConnectFour } from 'games/connectFour/connectFour';
import { Goose } from 'games/goose/goose';
import { TicTacToe } from 'games/tictactoe/ticTacToe';
import { useNavigate } from 'react-router-dom';

import '../styles/pages/_games.scss';

export const games = [
  {
    id: 'tictactoe',
    name: 'Tres en raya',
    aspectRatio: 1,
    component: TicTacToe,
  },
  {
    id: 'goose',
    name: 'La oca',
    aspectRatio: 4 / 3,
    component: Goose,
  },
  {
    id: 'connectfour',
    name: 'Cuatro en raya',
    aspectRatio: 4 / 3,
    component: ConnectFour,
  },
];

export const Games = () => {
  const navigate = useNavigate();

  function handleJoinGame(gameId: string) {
    console.log(`Joining game ${gameId}`);
    navigate(`/app/games/${gameId}`);
  }

  function displayGameList() {
    return (
      <ul className="game-list">
        {games.map((game) => (
          <li key={game.id} className="game-item">
            <h2>{game.name}</h2>
            <p>{game.description}</p>
            <button type="button" onClick={() => handleJoinGame(game.id)}>
              Unirse a la partida
            </button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <>
      <h1>Juegos</h1>
      {displayGameList()}
    </>
  );
};
