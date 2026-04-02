package dto

type RegisterRequest struct {
	Login              string `json:"login" binding:"required"`
	Email              string `json:"email" binding:"required,email"`
	Password           string `json:"password" binding:"required,min=8"`
	ConfirmPassword    string `json:"confirmPassword" binding:"required,eqfield=Password"`
	Name               string `json:"name" binding:"required"`
	Surname            string `json:"surname" binding:"required"`
	Birthday           string `json:"birthday" binding:"required"` // en el front poner que la fecha tiene que ser yyyy-mm-dd esto no se si habria que cambiarlo para q sea dd-mm-aaaa
	TermsAndConditions bool   `json:"termsAndConditions" binding:"required,eq=true"`
	PrivacyPolicy      bool   `json:"privacyPolicy" binding:"required,eq=true"`
}

type LoginRequest struct {
	Identifier string `json:"identifier" binding:"required"`
	Password   string `json:"password" biding:"required"`
}
