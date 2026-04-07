package dto

import "time"

// Hay que modificar todo esto, era solo de prueba y como "Chuleta" para toquetear al usuario
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

type UserResponse struct {
	Id        uint      `json:"id"`
	Login     string    `json:"login"`
	Email     *string   `json:"email,omitempty"`
	Name      string    `json:"name"`
	Surname   string    `json:"surname"`
	Birthday  time.Time `json:"birthday"`
	Active2FA bool      `json:"active_2fa"`
}

type UserDelete struct {
	Id   uint   `form:"id"`
	Code string `form:"code"`
}

type ModifyInput struct {
	Code string

	Email            string
	VerifyEmail      string
	Password         string
	VerifyPassword   string
	PreviousPassword string
	Name             string
	Surname          string
	Birthday         time.Time
}

type UserModify struct {
	Code string `form:"code"`

	Email            string `form:"email"`
	VerifyEmail      string `form:"verify_email"`
	Password         string `form:"password"`
	VerifyPassword   string `form:"verify_password"`
	PreviousPassword string `form:"previous_password"`

	Name     string `form:"name"`
	Surname  string `form:"surname"`
	Birthday string `form:"birthday"`
}

// Hasta aqui en principio estan hechas para las pruebas

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
