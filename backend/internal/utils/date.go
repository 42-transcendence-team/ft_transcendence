package utils

import "time"

func CalculateAge(birthday time.Time) int {
	now := time.Now()
	age := now.Year() - birthday.Year()

	if now.Month() < birthday.Month() || (now.Month() == birthday.Month() && now.Day() < birthday.Day()) {
		age--
	}

	return age
}
