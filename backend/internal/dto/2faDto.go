package dto

type TwoFAEnable struct {
	Id uint `json:"id" binding:"required"`
}

type TwoFASetup struct {
	Id uint   `json:"id" binding:"required"`
	QR string `json:"qr"`
}

type TwoFADisable struct {
	Id uint `json:"id" binding:"required"`
}

type TwoFAVerify struct {
	Id   uint   `json:"id"`
	Code string `json:"code" binding:"required"`
}

type TwoFALogin struct {
	Id        uint   `json:"id"`
	TempToken string `json:"tempToken"`
	Code      string `json:"code" binding:"required"`
}
