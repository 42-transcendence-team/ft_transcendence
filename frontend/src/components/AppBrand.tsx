import type { MouseEvent } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@components/auth-router/AuthContext";
import logo from "../assets/icons/24_logo.png";

export type AppBrandSize = "small" | "medium"| "large";
export type AppBrandTone = "light" | "dark";

type AppBrandProps = {
	logoSize?: AppBrandSize;
	textSize?: AppBrandSize;
	bold?: boolean;
	tone?: AppBrandTone;
	onActivate?: () => void;
	className?: string;
};

export function AppBrand({
	logoSize = "medium",
	textSize = "medium",
	bold = false,
	tone = "dark",
	onActivate,
	className,
}: AppBrandProps) {
	const { authStatus } = useAuth();
	const destination = authStatus === "auth" ? "/app" : "/login";
 	const accessibleLabel = authStatus === "auth" ? "Go to Twenty Four home" : "Go to Twenty Four login";

	const classes = [
		"app-brand",
		`app-brand--${tone}`,
		`app-brand--logo-${logoSize}`,
		`app-brand--text-${textSize}`,
		bold ? "app-brand--bold" : "",
		className ?? "",
	].filter(Boolean).join(" ");

	const handleActivate = (event: MouseEvent<HTMLAnchorElement>) => {
		/*
		 * No ejecutamos efectos secundarios cuando el usuario abre
		 * el enlace en otra pestaña mediante Ctrl, Cmd o botón central.
		 * En una activación normal sí se limpia, por ejemplo, la búsqueda.
		 */
		const opensAnotherContext =
			event.button !== 0 ||
			event.ctrlKey ||
			event.metaKey ||
			event.shiftKey ||
			event.altKey;

		if (!opensAnotherContext)
			onActivate?.();
	};

	return (
		<NavLink
			to={destination}
			className={classes}
			aria-label={accessibleLabel}
			onClick={handleActivate}
		>
			<img
				className="app-brand__logo"
				src={logo}
				alt="Twenty Four Logo"
				aria-hidden="true"
			/>
			<span className="app-brand__name">Twenty Four</span>
		</NavLink>
	);
}
