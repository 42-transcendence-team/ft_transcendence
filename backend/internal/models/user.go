package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model

	Login    string `gorm:"uniqueIndex;not null"` // Nickname unico de la cuenta (Ej: Login 42)
	Email    string `gorm:"uniqueIndex"`          // Correo electronico unico asociado
	Password string `gorm:"not null"`             // Contraseña de acceso a la cuenta
	Role     string `gorm:"not null"`             // Rol del usuario (Ej: 42, bh, normie...)

	Name     string    `gorm:"not null"` // Nombre de usuario
	Surname  string    `gorm:"not null"` // Apellido de usuario
	Birthday time.Time `gorm:"not null"` // Fecha de cunmpleaños del usuario
	Age      uint8     `gorm:"not null"` // Edad del usuario

	Status uint   // En el caso de que este online que estado quiere mostrar (Ej: 0 = offline, 1 = online, 2 = ausente...)
	State  string // Estado del usuario like WhatsApp (Ej: "En una reunión", "Cago en todo", ...)

	Friends []*User `gorm:"many2many:user_friends;"` // Relación de amigos entre usuarios (muchos a muchos)
}
