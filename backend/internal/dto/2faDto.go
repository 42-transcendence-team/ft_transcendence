package dto

type TwoFAEnable struct {
	Id    uint   `json:"id" binding:"required"`
	Login string `json:"login" binding:"required"`
}

type TwoFASetup struct {
	Id uint   `json:"id" binding:"required"`
	QR string `json:"qr"`
}

type TwoFADisable struct {
	Id uint `json:"id" binding:"required"`
}

type TwoFAVerify struct {
	Id   uint   `json:"id" binding:"required"`
	Code string `json:"code" binding:"required"`
}
