package dto

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

type UserDelete struct {
	Id uint `form:"id"`
}

type UserModify struct {
	Id        uint   `form:"id"`
	Login     string `form:"login"`
	Email     string `form:"email"`
	Name      string `form:"name"`
	Surname   string `form:"surname"`
	Role      string `form:"role"`
	Secret2FA string `form:"secret_2fa"`
	Active2FA bool   `form:"active_2fa"`
}

// Hasta aqui en principio estan hechas para las pruebas

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
