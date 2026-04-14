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

	Limit int `form:"limit"`
	Page  int `form:"page"`
}

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
	Id       uint   `form:"id"`
	Password string `form:"password" binding:"required"`
	Code     string `form:"code"`
}

// Settings de usuario
type ModifyInputEmail struct {
	Code string

	Email       string
	VerifyEmail string
}

type UserModifyEmail struct {
	Code string `json:"code"`

	Email       string `json:"email" binding:"required,email"`
	VerifyEmail string `json:"verify_email" binding:"required,email"`
}

type ModifyInputData struct {
	Code string

	Name     string
	Surname  string
	Birthday time.Time
}

type UserModifyData struct {
	Code string `json:"code"`

	Name     string `json:"name"`
	Surname  string `json:"surname"`
	Birthday string `json:"birthday"`
}

type ModifyInputPass struct {
	Code string

	Password         string
	VerifyPassword   string
	PreviousPassword string
}

type UserModifyPass struct {
	Code string `json:"code"`

	Password         string `json:"password" binding:"required"`
	VerifyPassword   string `json:"verify_password" binding:"required"`
	PreviousPassword string `json:"previous_password" binding:"required"`
}

// DTOs para 2FA
type UserSecret2FA struct {
	Id        uint    `form:"id"`
	Secret2FA *string `form:"secret_2fa"`
}

type User2FAStatus struct {
	Id        uint `form:"id"`
	Active2FA bool `form:"active_2fa"`
}

type UserRemove2FA struct {
	Id uint `form:"id"`
}
