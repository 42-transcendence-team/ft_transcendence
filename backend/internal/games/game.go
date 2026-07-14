package games

import "encoding/json"

type GameEngine interface {
	Init()                                                        // Inicializa el tablero/estado del juego
	ProcessMove(userID uint, actionPayload json.RawMessage) error // Procesa una jugada
	GetState() interface{}                                        // Devuelve el estado actual serializado para el front
	IsFinished() bool                                             // Indica si la partida ha terminado
}
