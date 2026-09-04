import { AppBrand } from "@components/AppBrand";
import { UserMenu } from "./UserMenu";
import { Link } from "react-router-dom";
import { SearchBar } from "./advancedSearch/SearchBar";
import { GrGamepad } from "react-icons/gr";

import "../styles/components/_privHeader.scss";

type PrivHeaderProps = {
	onSearch: (query: string) => void;
	onBrandActivate: () => void;
};

export function PrivHeader({ onSearch, onBrandActivate }: PrivHeaderProps) {
	return (
		<header className="privHeader privateLayout__header">
			<div className="privHeader__left">
				<AppBrand
					className="privHeader__brand"
					logoSize="medium"
					textSize="small"
					tone="light"
					bold
					onActivate={onBrandActivate}
				/>
			</div>
				<div className="privHeader__functions">
					<SearchBar onSearch={onSearch} />
					<div>
						<Link to="/app/games" className="privHeader__functions--games-link">
							<GrGamepad className="privHeader__functions--games-link-icon" />
							Juegos
						</Link>
					</div>
				</div>
			<div className="privHeader__right">
				<UserMenu />
			</div>
		</header>
	);
}
