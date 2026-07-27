
import { Link } from "react-router-dom";

import "../styles/components/_privHeader.scss"
import logo from "../assets/icons/24_logo.png"
import { UserMenu } from "./UserMenu";
import { SearchBar } from "./advancedSearch/SearchBar";

type PrivHeaderProps = {
  onSearch: (query: string) => void;
}


export function PrivHeader({ onSearch }: PrivHeaderProps) {

	return (
		<header className="privHeader privateLayout__header">
			<div className="privHeader__left">
				<Link to="/app/profile/a" className="privHeader__logo">
					<img src={logo} alt="logo" className="privHeader__logo-img" />
					<span className="privHeader__logo-text">Twenty Four</span>
				</Link>
			</div>
			<div className="privHeader__center">
				<SearchBar onSearch={onSearch} />
			</div>
			<div>
				<Link to="/app/games" className="privHeader__games-link">
					Games
				</Link>
			</div>
			<div className="privHeader__right">
				<UserMenu />
			</div>
		</header>
	);
}
