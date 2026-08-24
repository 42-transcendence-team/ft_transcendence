import { AppBrand } from "@components/AppBrand";
import { UserMenu } from "./UserMenu";
import { Link } from "react-router-dom";
import { SearchBar } from "./advancedSearch/SearchBar";

import "../styles/components/_privHeader.scss"

type PrivHeaderProps = {
  onSearch: (query: string) => void;
  onBrandActivate: () => void;
}


export function PrivHeader({
  onSearch,
  onBrandActivate,
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
