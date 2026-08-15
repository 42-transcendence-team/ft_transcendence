export const calculateAge = (birthDateString: string): number => {
	const today = new Date()
	const birthDate = new Date(birthDateString)

	let age = today.getFullYear() - birthDate.getFullYear()

	const monthDiff = today.getMonth() - birthDate.getMonth()
	const dayDiff = today.getDate() - birthDate.getDate()

	// Si todavía no ha cumplido años este año, restamos 1
	if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
		age--
	}

	return age
}