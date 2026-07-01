import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { register42User } from "../api/Register"
import { FormField } from "../components/FormField"
import { calculateAge } from "../utils/calculateAge"
import { get42UserInfo } from "../api/Register"
import { useEffect } from "react"
import logo from "../assets/icons/24_logo.png"

type FormFields = {
    login: string
    email: string
    password: string
    confirmPassword: string
    first_name: string
    last_name: string
    birthday: string
}

type FormErrors = Record<keyof Omit<FormFields, "termsAndConditions" | "privacyPolicy">, string>

const INITIAL_FORM_STATE: FormFields = {
    login: "",
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    birthday: "",
}

const INITIAL_ERRORS: FormErrors = {
    login: "",
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    birthday: ""
}

export default function Register42() {
    const [formData, setFormData] = useState<FormFields>(INITIAL_FORM_STATE)
    const [errors, setErrors] = useState<FormErrors>(INITIAL_ERRORS)
    const [serverMessage, setServerMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const navigate = useNavigate()

    const validateForm = (): boolean => {
        const newErrors = { ...INITIAL_ERRORS }
        const MAX_LENGTH = 42

        const regex = {
            username: /^[A-Za-z0-9_-]+$/,
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            name: /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s-]+$/,
            password: /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,64}$/
        }

        if (!formData.login.trim()) {
            newErrors.login = "Login is required."
        } else if (!regex.username.test(formData.login)) {
            newErrors.login = "Only letters, numbers, hyphens and underscores are allowed."
        } else if (formData.login.length > MAX_LENGTH) {
            newErrors.login = `Maximum length is ${MAX_LENGTH} characters.`
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required."
        } else if (!regex.email.test(formData.email)) {
            newErrors.email = "Enter a valid email address."
        }

        if (!formData.password) {
            newErrors.password = "Password is required."
        } else if (!regex.password.test(formData.password)) {
            newErrors.password = "Password must be between 8 and 64 characters and include at least one uppercase letter, one number and one symbol."
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "You must confirm your password."
        } else if (formData.confirmPassword !== formData.password) {
            newErrors.confirmPassword = "Passwords do not match."
        }

        ;(["first_name", "last_name"] as const).forEach((field) => {
            const val = formData[field].trim()
            if (!val) {
                newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`
            } else if (!regex.name.test(val)) {
                newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} can only contain letters.`
            } else if (val.length > MAX_LENGTH) {
                newErrors[field] = `Maximum length is ${MAX_LENGTH} characters.`
            }
        })

        if (!formData.birthday) {
            newErrors.birthday = "Birthday is required."
        } else {
            const birthDate = new Date(formData.birthday)
            if (Number.isNaN(birthDate.getTime())) {
                newErrors.birthday = "Enter a valid birthday."
            } else {
                const age = calculateAge(formData.birthday)
                if (age < 18) newErrors.birthday = "You must be at least 18 years old to register."
                else if (age > 150) newErrors.birthday = "Age cannot be greater than 150 years."
            }
        }

        setErrors(newErrors)
        return Object.values(newErrors).every((err) => err === "")
    }

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        setServerMessage("")

        if (!validateForm()) return

        try {
            setIsSubmitting(true)
            await register42User(formData)
            setServerMessage("User created successfully.")
            navigate("/app")
        } catch (error) {
 			if (
				typeof error === "object" &&
				error !== null &&
				"status" in error
			) {
				const apiError = error as { status: number }

				if (apiError.status === 400) {
					setServerMessage("Invalid request.")
					return
				}

				if (apiError.status === 422) {
					setServerMessage("Some fields are invalid. Please check the form.")
					return
				}

				if (apiError.status === 409) {
					setServerMessage("Username or email already exists.")
					return
				}
			}
            setServerMessage("An error occurred. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

	useEffect(() => {
		get42UserInfo()
			.then((data) => {
				setFormData((prev) => ({
					...prev,
					login: data.login ?? "",
					email: data.email ?? "",
					first_name: data.first_name ?? "",
					last_name: data.last_name ?? "",
				}))
			})
			.catch(() => {
				setServerMessage(
					"An error occurred while fetching 42 user info."
				)
			})
	}, [])

    const accountFields = [
        { id: "login", label: "Login", type: "text", placeholder: "Login" },
        { id: "email", label: "Email", type: "email", placeholder: "Email" },
        { id: "password", label: "Password", type: "password", placeholder: "Password" },
        { id: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "Repeat Password" },
    ]

    const personalFields = [
        { id: "first_name", label: "First Name", type: "text", placeholder: "First Name" },
        { id: "last_name", label: "Last Name", type: "text", placeholder: "Last Name" },
        { id: "birthday", label: "Birthday", type: "date", placeholder: "" },
    ]

    return (
        <div className="auth-card">
            <div className="auth-card__header">
				<NavLink to="/login" className="auth-card__homeLink">
					<img className="auth-card__logo" src={logo} alt="Twenty Four logo" />
					<h1 className="auth-card__title">Twenty Four</h1>
				</NavLink>
            </div>
            <form className="auth-form" onSubmit={handleSubmit}>
                <h3 className="auth-form__section-title">ACCOUNT DATA</h3>
                <div className="auth-form__group">
                    {accountFields.map((field) => (
                        <FormField
                            key={field.id}
                            id={field.id}
                            name={field.id}
                            label={field.label}
                            type={field.type}
                            className="form-field"
                            value={formData[field.id as keyof FormFields] as string}
                            onChange={(value) => {
                                setFormData(prev => ({ ...prev, [field.id]: value }))
                            }}
                            error={errors[field.id as keyof FormErrors]}
                            placeholder={field.placeholder}
                        />
                    ))}
                </div>

                <h3 className="auth-form__section-title">PERSONAL DATA</h3>
                <div className="auth-form__group auth-form__group--personal">
                    {personalFields.map((field) => (
                        <FormField
                            key={field.id}
                            id={field.id}
                            name={field.id}
                            label={field.label}
                            type={field.type}
                            className="form-field"
                            value={formData[field.id as keyof FormFields] as string}
                            onChange={(value) => {
                                setFormData(prev => ({ ...prev, [field.id]: value }))
                            }}
                            error={errors[field.id as keyof FormErrors]}
                            placeholder={field.placeholder}
                        />
                    ))}
                </div>

                <p className="auth-form__info">
                    Al countinuar, aceptas los <NavLink to="/terms">Terminos y Condiciones</NavLink> y la <NavLink to="/privacy-policy">Política de Privacidad</NavLink>.
                </p>
                <button className="auth-form__submit" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Registering..." : "Create Now"}
                </button>

                {serverMessage && <p className="auth-form__server-message">{serverMessage}</p>}
            </form>
        </div>
    )
}