import "@styles/_check-true-false.scss"

import { useState } from "react";
import { CheckTrueFalse } from "@components/Check-true-false";
import { Modal2FA } from "@components/Modal2FA";

export function Settings() {
	const [active2FA, setActive2FA] = useState(false);

	return (
		<>
			<CheckTrueFalse 
				id="2fa-active"
				label="Activar autenticación de dos factores (2FA)"
				checked={active2FA}
				onChange={setActive2FA}
			/>
			<Modal2FA checked={active2FA} onChange={setActive2FA}/>
		</>
	);
}