import { ConnectFour } from 'games/connectFour/connectFour';
import { Goose } from 'games/goose/goose';
import { TicTacToe } from 'games/tictactoe/ticTacToe';
import { useNavigate } from 'react-router-dom';

import '../styles/pages/_games.scss';

export const games = [
  {
    id: 'tictactoe',
    name: 'Tres en raya',
    description: 'Este es el primer juego.',
    aspectRatio: 1,
    component: TicTacToe,
  },
  // {
  // 	id: "parchis",
  // 	name: "Parchis",
  // 	description: "This is the second game.",
  // 	aspectRatio: 16 / 9,
  // 	component: () => <div>Parchis Game Component</div>,
  // },
  {
    id: 'goose',
    name: 'La oca',
    description: 'Este es el tercer juego.',
    aspectRatio: 4 / 3,
    component: Goose,
  },
  {
    id: 'connectfour',
    name: 'Cuatro en raya',
    description: 'Este es el cuarto juego.',
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
