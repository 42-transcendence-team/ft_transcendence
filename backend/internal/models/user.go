package models

import (
	"time"

	"gorm.io/gorm"
)

//NOTE - El Email va a ser unico siempre, en caso de que exista, incluso aunque se borre la cuenta no se va poder crear otra nueva con el mismo.
// Lo dejo asi pensando que quizá en un futuro se implemente una funcionalidad de recuperar cuenta que requiera el email.

//NOTE - El Login es unico siempre que la cuenta no este borrada, en caso de que se borre otra persona podra usar este

type User struct {
	gorm.Model

	Login     string  `gorm:"not null;uniqueIndex:idx_login_active,where:deleted_at IS NULL"` // Nickname unico de la cuenta (Ej: Login 42)
	Email     *string `gorm:"uniqueIndex"`                                                    // Correo electronico unico asociado
	Password  string  `gorm:"not null"`                                                       // Contraseña de acceso a la cuenta
	Active2FA bool    `gorm:"not null; default:false"`                                        // Si el usuario tiene 2FA activado o no
	Secret2FA *string `gorm:"null"`                                                           // Clave secreta que se genera al activar la 2FA
	Role      string  `gorm:"not null"`                                                       // Rol del usuario (Ej: 42, bh, normie...)
	OAuth     string  `gorm:"not null; default:'local'"`                                      // Proveedor de autenticacion OAuth
	OAuthID   *int    `gorm:"null"`                                                           // ID del usuario en el proveedor de autenticacion OAuth

	Name     string    `gorm:"not null"` // Nombre de usuario
	Surname  string    `gorm:"not null"` // Apellido de usuario
	Birthday time.Time `gorm:"not null"` // Fecha de cunmpleaños del usuario

	Status uint   // En el caso de que este online que estado quiere mostrar (Ej: 0 = offline, 1 = online, 2 = ausente...)
	State  string // Estado del usuario like WhatsApp (Ej: "En una reunión", "Cago en todo", ...)

	Friends []*User `gorm:"many2many:user_friends;"` // Relación de amigos entre usuarios (muchos a muchos)
}
