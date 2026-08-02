import { AppBrand } from "@components/AppBrand";
import { SearchBar } from "./SearchBar";
import { UserMenu } from "./UserMenu";

import "../styles/components/_privHeader.scss";

type PrivHeaderProps = {
	onSearch: (
		query: string,
	) => void | Promise<void>;

	onBrandActivate: () => void;
	searchResetKey: number;
};

export function PrivHeader({
	onSearch,
	onBrandActivate,
	searchResetKey,
}: PrivHeaderProps) {
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

			<div className="privHeader__center">
				<SearchBar
					onSearch={onSearch}
					resetKey={searchResetKey}
				/>
			</div>

			<div className="privHeader__right">
				<UserMenu />
			</div>
		</header>
	);
}
