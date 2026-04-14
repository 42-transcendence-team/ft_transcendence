import "@styles/_check-true-false.scss"

import { TwoFactorSettings } from "@components/TwoFactorSettings";
import { ModifyData } from "@components/ModifyData";
import { ModifyEmail } from "@components/ModifyEmail";
import { useLoaderData, useRevalidator } from "react-router-dom";
import { ModifyPassword } from "@components/ModifyPassword";
import { DeleteAccount } from "@components/DeleteAccount";

export function Settings() {
	const user = useLoaderData()
	const revalidator = useRevalidator();

	return (
		<>
			<ModifyData user={user} onUpdate={() => revalidator.revalidate()}/>
			<ModifyEmail user={user} onUpdate={() => revalidator.revalidate()}/>
			<ModifyPassword user={user}/>
			<TwoFactorSettings active={user.active_2fa} />
			<DeleteAccount user={user} />
		</>
	);
}