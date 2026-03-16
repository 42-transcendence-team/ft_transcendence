package dto

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
	Id      uint   `form:"id"`
	Login   string `form:"login"`
	Email   string `form:"email"`
	Name    string `form:"name"`
	Surname string `form:"surname"`
	Role    string `form:"role"`
}
