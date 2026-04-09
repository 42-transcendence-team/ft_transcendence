import "@styles/_check-true-false.scss"

import { TwoFactorSettings } from "@components/TwoFactorSettings";
import { ModifyUserForm } from "@components/ModifyUserForm";
import { useLoaderData } from "react-router-dom";

export function Settings() {
	const user = useLoaderData()
	console.log(user);
	return (
		<>
			<ModifyUserForm user={user} />
			<TwoFactorSettings active={user.twoFactorEnabled} />
		</>
	);
}