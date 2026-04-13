import "@styles/_check-true-false.scss"

import { TwoFactorSettings } from "@components/TwoFactorSettings";
import { ModifyData } from "@components/ModifyData";
import { ModifyEmail } from "@components/ModifyEmail";
import { useLoaderData } from "react-router-dom";
import { ModifyPassword } from "@components/ModifyPassword";
import { DeleteAccount } from "@components/DeleteAccount";

export function Settings() {
	const user = useLoaderData()
	console.log(user); // NOTE - Borrar console.log
	console.log(user.active_2fa); // NOTE - Borrar console.log
	return (
		<>
			<ModifyData user={user} />
			<ModifyEmail user={user} />
			<ModifyPassword user={user} />
			<TwoFactorSettings active={user.active_2fa} />
			<DeleteAccount user={user} />
		</>
	);
}