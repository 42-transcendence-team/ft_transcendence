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
"Completa el formulario de registro con un nombre de usuario válido, una dirección de correo electrónico, una contraseña segura y los datos personales solicitados.",
			},
			{
				question: "¿Por qué debo tener al menos 18 años?",
				answer:
					"Actualmente, Twenty Four exige que los usuarios tengan al menos 18 años para crear una cuenta.",
			},
			{
				question: "¿Puedo cambiar mis datos personales?",
				answer:
					"Sí. Los datos personales y de seguridad admitidos pueden actualizarse desde los ajustes de la cuenta.",
			},
			{
				question: "¿Cómo elimino mi cuenta?",
				answer:
"Abre la zona de peligro en los ajustes de la cuenta. Se te pedirá la contraseña y, si está activada, un código de autenticación en dos pasos.",
			},
		],
	},
	{
		id: "security",
		title: "Inicio de sesión y seguridad",
		items: [
			{
				question: "¿Qué es la autenticación en dos pasos?",
				answer:
					"La autenticación en dos pasos añade un código de verificación temporal al inicio de sesión habitual con contraseña.",
			},
			{
				question: "¿Por qué ha caducado mi sesión?",
				answer:
					"Las sesiones tienen una duración limitada y también pueden finalizar al cerrar sesión o cuando el servidor las invalida.",
			},
			{
				question: "¿Puede Twenty Four leer mi contraseña?",
				answer:
					"No. Las contraseñas se almacenan como resúmenes criptográficos seguros, no como texto sin cifrar.",
			},
		],
	},
	{
		id: "profiles",
		title: "Perfiles y amigos",
		items: [
			{
				question: "¿Puedo cambiar mi avatar o mi imagen de cabecera?",
				answer:
					"Sí. Puedes subir, sustituir o eliminar el avatar y la imagen de cabecera de tu perfil.",
			},
			{
				question: "¿Quién puede ver mi perfil?",
				answer:
					"Actualmente, los usuarios identificados pueden acceder a los perfiles. Todavía no hay disponibles controles de privacidad más detallados.",
			},
			{
				question: "¿Cómo funcionan las solicitudes de amistad?",
				answer:
					"La amistad se establece cuando otro usuario acepta una solicitud de amistad pendiente.",
			},
		],
	},
	{
		id: "posts",
		title: "Publicaciones y archivos",
		items: [
			{
				question: "¿Qué puedo publicar?",
				answer:
					"Una publicación puede contener texto y un archivo compatible. Debe incluir al menos uno de estos elementos.",
			},
			{
				question: "¿Qué tipos de archivo son compatibles?",
				answer:
					"Las publicaciones admiten archivos JPEG, PNG, WebP y PDF. Los avatares y las imágenes de cabecera admiten JPEG, PNG y WebP.",
			},
			{
				question: "¿Cuál es el tamaño máximo de los archivos?",
				answer:
					"El tamaño máximo actual es de 5 MB por cada archivo subido.",
			},
			{
				question: "¿Puedo eliminar el contenido de otro usuario?",
				answer:
					"No. Los usuarios solo pueden eliminar las publicaciones y los comentarios que hayan creado ellos mismos.",
			},
		],
	},
	{
		id: "support",
		title: "Ayuda",
		items: [
			{
				question: "¿Qué debo hacer si algo no funciona?",
				answer:
					"Utiliza los datos de la página de contacto e incluye una breve descripción del problema y los pasos que lo provocaron.",
			},
		],
	},
];
