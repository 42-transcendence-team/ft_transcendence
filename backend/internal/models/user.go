package models

import (
	"time"

	"gorm.io/gorm"
)

// NOTE: El email será siempre único. Aunque se elimine una cuenta, no se podrá
// crear otra con la misma dirección. Se mantiene así por si en el futuro se
// implementa una recuperación de cuenta que requiera el email.

// NOTE: El login es único mientras la cuenta no esté eliminada. Si se elimina,
// otra persona podrá utilizarlo.

type User struct {
	gorm.Model

	Login     string  `gorm:"not null;uniqueIndex:idx_login_active,where:deleted_at IS NULL"` // Nickname único de la cuenta (ej.: login de 42)
	Email     *string `gorm:"uniqueIndex"`                                                    // Correo electrónico único asociado
	Password  string  `gorm:"not null"`                                                       // Contraseña de acceso a la cuenta
	Active2FA bool    `gorm:"not null; default:false"`                                        // Si el usuario tiene 2FA activado o no
	Secret2FA *string `gorm:"null"`                                                           // Clave secreta que se genera al activar la 2FA
	Role      string  `gorm:"not null"`                                                       // Rol del usuario (Ej: 42, bh, normie...)
	OAuth     string  `gorm:"not null; default:'local'"`                                      // Proveedor de autenticacion OAuth
	OAuthID   *int    `gorm:"null"`                                                           // ID del usuario en el proveedor de autenticacion OAuth

	Name       string    `gorm:"not null"`                                      // Nombre del usuario
	Surname    string    `gorm:"not null"`                                      // Apellido del usuario
	Birthday   time.Time `gorm:"not null"`                                      // Fecha de cumpleaños del usuario
	AvatarPath *string   `gorm:"type:varchar(255)" json:"avatarPath,omitempty"` // Ruta relativa del avatar; nil si utiliza la imagen predeterminada
	BannerPath *string   `gorm:"type:varchar(255)" json:"bannerPath,omitempty"` // Ruta relativa del banner; nil si utiliza el fondo predeterminado

	Status uint   // Estado de presencia que muestra el usuario (ej.: 0 = offline, 1 = online, 2 = ausente...)
	State  string // Mensaje de estado similar al de WhatsApp (ej.: "En una reunión", "Cago en todo", ...)

	Friends []*User     `gorm:"many2many:user_friends;"` // Relación de amigos entre usuarios (muchos a muchos)
	Chats   []*ChatRoom `gorm:"many2many:user_rooms;"`   // Relación de salas de chat a las que pertenece el usuario (muchos a muchos)
}
