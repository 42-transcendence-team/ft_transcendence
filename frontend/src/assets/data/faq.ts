export type FAQEntry = {
	question: string;
	answer: string;
};

export type FAQGroup = {
	id: string;
	title: string;
	items: FAQEntry[];
};

export const faqGroups: FAQGroup[] = [
	{
		id: "account",
		title: "Cuenta",
		items: [
			{
				question: "¿Cómo creo una cuenta?",
				answer:
					"Completa el formulario de registro con un nombre de usuario válido, una dirección de correo electrónico, una contraseña segura y la información personal solicitada.",
			},
			{
				question: "¿Por qué debo ser mayor de 18 años?",
				answer:
					"Twenty Four actualmente requiere que los usuarios tengan al menos 18 años antes de crear una cuenta.",
			},
			{
				question: "¿Puedo cambiar mi información personal?",
				answer:
					"Sí. La información personal y de seguridad admitida puede actualizarse desde los ajustes de la cuenta.",
			},
			{
				question: "¿Cómo elimino mi cuenta?",
				answer:
					"Abre la zona de peligro en los ajustes de la cuenta. Se te pedirán tu contraseña y, si está activada, un código de autenticación de dos factores (2FA).",
			},
		],
	},
	{
		id: "security",
		title: "Login and security",
		items: [
			{
				question: "What is two-factor authentication?",
				answer:
					"Two-factor authentication adds a temporary verification code to the normal password login process.",
			},
			{
				question: "Why has my session expired?",
				answer:
					"Sessions have a limited duration and may also end after logout or when the server invalidates them.",
			},
			{
				question: "Can Twenty Four read my password?",
				answer:
					"No. Passwords are stored as secure hashes rather than plain text.",
			},
		],
	},
	{
		id: "profiles",
		title: "Profiles and friends",
		items: [
			{
				question: "Can I change my avatar or banner?",
				answer:
					"Yes. You can upload, replace or remove the avatar and banner associated with your own profile.",
			},
			{
				question: "Who can see my profile?",
				answer:
					"Authenticated users can currently access user profiles. More detailed profile privacy controls are not yet available.",
			},
			{
				question: "How do friend requests work?",
				answer:
					"A friendship is created after another user accepts a pending friend request.",
			},
		],
	},
	{
		id: "posts",
		title: "Posts and files",
		items: [
			{
				question: "What can I publish?",
				answer:
					"A post may contain text and one supported file. At least one of those elements is required.",
			},
			{
				question: "Which files are supported?",
				answer:
					"Posts support JPEG, PNG, WebP and PDF files. Avatars and banners support JPEG, PNG and WebP images.",
			},
			{
				question: "What is the maximum file size?",
				answer:
					"The current maximum size is 5 MB for each uploaded file.",
			},
			{
				question: "Can I delete another user's content?",
				answer:
					"No. Users can only delete posts and comments that they created themselves.",
			},
		],
	},
	{
		id: "support",
		title: "Support",
		items: [
			{
				question: "What should I do if something does not work?",
				answer:
					"Use the contact details on the Contact page and include a short description of the problem and the steps that caused it.",
			},
		],
	},
];
