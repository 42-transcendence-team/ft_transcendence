package utils

import (
	"golang.org/x/crypto/bcrypt"
)

// esto lo pille de ahi -> https://gowebexamples.com/password-hashing/
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func IsStrongPassword(password string) bool {

	var hasUpper bool
	var hasLower bool
	var hasNumber bool
	var hasSymbol bool

	for _, c := range password {

		switch {
		case 'A' <= c && c <= 'Z':
			hasUpper = true
		case 'a' <= c && c <= 'z':
			hasLower = true
		case '0' <= c && c <= '9':
			hasNumber = true
		default:
			hasSymbol = true
		}
	}

	return hasUpper && hasLower && hasNumber && hasSymbol
}
