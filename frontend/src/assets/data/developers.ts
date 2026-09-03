export type DeveloperData = {
	id: string;
	name: string;
	surname: string;
	role: string;
	description: string;
	avatarSrc?: string;
	githubUrl?: string;
	linkedinUrl?: string;
	portfolioUrl?: string;
};

/*
 * Los identificadores no dependen de las iniciales porque hay dos
 * integrantes llamados provisionalmente "A.".
 *
 * Sustituye los nombres, descripciones y enlaces antes de publicar.
 */
export const developers: DeveloperData[] = [
	{
		id: "developer-01",
		name: "smeixoei",
		surname: "",
		role: "Desarrollador",
		description:
			"Participó en el diseño, el desarrollo y la revisión de Twenty Four.",
	},
	{
		id: "developer-02",
		name: "abarrio-",
		surname: "",
		role: "Desarrollador",
		description:
			"Participó en el diseño, el desarrollo y la revisión de Twenty Four.",
	},
	{
		id: "developer-03",
		name: "davidga2",
		surname: "",
		role: "Desarrollador",
		description:
			"Participó en el diseño, el desarrollo y la revisión de Twenty Four.",
	},
	{
		id: "developer-04",
		name: "igvisera",
		surname: "",
		role: "Desarrollador",
		description:
			"Participó en el diseño, el desarrollo y la revisión de Twenty Four.",
	},
	{
		id: "developer-05",
		name: "ancarvaj",
		surname: "",
		role: "Desarrollador",
		description:
			"Participó en el diseño, el desarrollo y la revisión de Twenty Four.",
	},
];
