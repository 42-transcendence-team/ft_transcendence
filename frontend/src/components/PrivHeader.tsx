
import { Link } from "react-router-dom";

import "../styles/components/_privHeader.scss"
import logo from "../assets/icons/24_logo.png"
import { SearchBar } from "./SearchBar.tsx";
import { UserMenu } from "./UserMenu";

export function PrivHeader() {
	return (
		<header className="privHeader privateLayout__header">
			<div className="privHeader__left">
				<Link to="/app" className="privHeader__logo">
					<img src={logo} alt="logo" className="privHeader__logo-img" />
					<span className="privHeader__logo-text">Twenty Four</span>
				</Link>
			</div>
			<div className="privHeader__center">
				<SearchBar />
			</div>
			<div className="privHeader__right">
				<UserMenu />
			</div>
		</header>
	);
}