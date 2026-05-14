import { useEffect, useState } from "react";

export function useFormErrors(duration : number = 5000) {
	const [formErrors, setFormErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		if (Object.keys(formErrors).length > 0) {
			const timer = setTimeout(() => {
				setFormErrors({});
			}, duration);
			return () => clearTimeout(timer);
		}
	}, [formErrors]);

	return { formErrors, setFormErrors };
}