package services

import (
	"backend/internal/dto"
	"backend/internal/repository"
	"bytes"
	"encoding/base64"
	"image/png"
	"os"
	"strings"

	"github.com/pquerna/otp/totp"
)

type TwoFAService struct {
	UserRepo *repository.UserRepository
}

func New2FAService(userRepo *repository.UserRepository) *TwoFAService {
	return &TwoFAService{UserRepo: userRepo}
}

// Falta hacer todas las validaciones para ejecutar esto, como por ejemplo que el usuario exista, que no tenga ya 2FA habilitado, etc...
func (s *TwoFAService) Enable2FA(request dto.TwoFAEnable) (*dto.TwoFASetup, error) {
	key, err := totp.Generate(totp.GenerateOpts{
		Issuer:      "tuentifour",
		AccountName: request.Login,
	})
	if err != nil {
		return nil, err
	}
	var buf bytes.Buffer
	img, err := key.Image(200, 200)
	if err != nil {
		return nil, err
	}
	err = png.Encode(&buf, img)
	if err != nil {
		return nil, err
	}
	qrBase64 := base64.StdEncoding.EncodeToString(buf.Bytes())
	// Devolver el qr generado para vincularlo con el front y el usuario pueda validarlo
	// Ahora mismo el secreto se devuelve y guarda en la BD directamente, deberia ser en cache hasta que se valide.
	newKey := key.Secret()
	user, err := s.UserRepo.UpdateSecret2FA(dto.UserSecret2FA{
		Id:        request.Id,
		Secret2FA: &newKey,
	})
	if err != nil || user == 0 {
		return nil, err
	}
	// Guarda el QR generado en una imagen y crea la carpeta test
	os.Mkdir("./test", 0755)
	os.WriteFile("./test/qr.png", buf.Bytes(), 0755)

	return &dto.TwoFASetup{QR: qrBase64}, nil
}

// Falta hacer todas las validaciones para ejecutar esto, como por ejemplo que el usuario exista, que no tenga ya 2FA habilitado, etc...
func (s *TwoFAService) Verify2FA(request dto.TwoFAVerify) (bool, error) {
	passcode := strings.TrimSpace(request.Code)
	secret, err := s.UserRepo.Get2FASecret(request.Id)
	if err != nil {
		return false, err
	}
	valid := totp.Validate(passcode, secret)
	if valid {
		s.UserRepo.UpdateActive2FA(dto.User2FAStatus{
			Id:        request.Id,
			Active2FA: true,
		})
	}
	return valid, nil
}

// Falta hacer todas las validaciones para ejecutar esto, como por ejemplo que el usuario exista, que no tenga ya 2FA habilitado, etc...
func (s *TwoFAService) Disable2FA(request dto.TwoFADisable) (int64, error) {
	rows, err := s.UserRepo.Remove2FA(dto.UserRemove2FA{
		Id: request.Id,
	})
	if err != nil {
		return 0, err
	}
	if rows == 0 {
		return 0, nil
	}
	return rows, nil
}
