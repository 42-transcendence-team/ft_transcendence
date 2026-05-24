
import { Link } from "react-router-dom";

import "../styles/components/_privHeader.scss"
import logo from "../assets/icons/24_logo.png"
import { SearchBar } from "./advancedSearch/SearchBar.tsx";
import { UserMenu } from "./UserMenu";
import { searchUsers } from "../api/userSearch.tsx";

export function PrivHeader() {

	const handleHeaderSearch = async (query: string) => {
		const response = await searchUsers(query);
		console.log(response);
	}

	return (
		<header className="privHeader privateLayout__header">
			<div className="privHeader__left">
				<Link to="/app" className="privHeader__logo">
					<img src={logo} alt="logo" className="privHeader__logo-img" />
					<span className="privHeader__logo-text">Twenty Four</span>
				</Link>
			</div>
			<div className="privHeader__center">
				<SearchBar onSearch={handleHeaderSearch}/>
			</div>
			<div className="privHeader__right">
				<UserMenu />
			</div>
		</header>
	);
}