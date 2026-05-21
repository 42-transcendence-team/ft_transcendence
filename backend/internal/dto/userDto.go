package dto

import "time"

// Esta es la peticion para busqueda, no esta terminada
type UserFilter struct {
	Id      uint   `form:"id"`
	Login   string `form:"login"`
	Email   string `form:"email"`
	Name    string `form:"name"`
	Surname string `form:"surname"`
	Role    string `form:"role"`

	Q        string `form:"q"` // Texto a buscar
	Relation string `form:"relation"`
	Sort     string `form:"sort"`  // Como lo voy a ordenar?
	Limit    int    `form:"limit"` // Cuantos resultados por pagina
	Page     int    `form:"page"`  // que pagina quieres ?
}

type UserSearch struct {
	Id         uint   `json:"id"`
	Login      string `json:"login"`
	AvatarURL  string `json:"avatar_url"`
	Status     string `json:"status"`
	Relation   string `json:"relation"`
	CanSendReq string `json:"can-send-request"`
}

/*posibles valores de relation
none
friends
pending_sent
pending_received
blocked_by_me
blocked_me
*/

// Respuesta para los datos necesarios en Settings
type UserResponse struct {
	Login     string    `json:"login"`
	Email     *string   `json:"email,omitempty"`
	Name      string    `json:"name"`
	Surname   string    `json:"surname"`
	Birthday  time.Time `json:"birthday"`
	Active2FA bool      `json:"active_2fa"`
}

type UserDelete struct {
	Id       uint    `json:"id"`
	Password string  `json:"password" binding:"required"`
	Code     *string `json:"code"`
}

// Settings de usuario
type ModifyInputEmail struct {
	Code *string

	Email       string
	VerifyEmail string
}

type UserModifyEmail struct {
	Code *string `json:"code"`

	Email       string `json:"email" binding:"required,email"`
	VerifyEmail string `json:"verify_email" binding:"required,email,eqfield=Email"`
}

type ModifyInputData struct {
	Code *string

	Name     *string
	Surname  *string
	Birthday *time.Time
}

type UserModifyData struct {
	Code *string `json:"code"`

	Name     *string `json:"name"`
	Surname  *string `json:"surname"`
	Birthday *string `json:"birthday"`
}

type ModifyInputPass struct {
	Code *string

	Password         string
	VerifyPassword   string
	PreviousPassword string
}

type UserModifyPass struct {
	Code *string `json:"code"`

	Password         string `json:"password" binding:"required"`
	VerifyPassword   string `json:"verify_password" binding:"required,eqfield=Password"`
	PreviousPassword string `json:"previous_password" binding:"required"`
}

// DTOs para 2FA
type UserSecret2FA struct {
	Id        uint    `json:"id"`
	Secret2FA *string `json:"secret_2fa"`
}

type User2FAStatus struct {
	Id        uint `json:"id"`
	Active2FA bool `json:"active_2fa"`
}

type UserRemove2FA struct {
	Id uint `json:"id"`
}
