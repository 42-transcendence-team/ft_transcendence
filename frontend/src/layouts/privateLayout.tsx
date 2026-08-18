import { Outlet } from "react-router-dom";
import { Footer } from "@components/Footer";
import { PrivHeader } from "@components/PrivHeader";
import { SearchFilters } from "@components/advancedSearch/SearchFilters";
import { useAdvancedSearch } from "@components/advancedSearch/useAdvancedSearch";
import { AdvancedSearchPanel } from "@components/advancedSearch/AdvancedSearchPanel";

import { PrivateLeftPanel } from "@components/layout/PrivateLeftPanel";
import { NotifyComp } from "@components/notifyComp";
import { MiniProfile } from "@components/miniProfile";
import { PrivateRightPanel } from "@components/layout/PrivateRightPanel";
import { PrivateMainContent } from "@components/layout/PrivateMainContent";

import "../styles/components/_privateLayout.scss";

export function PrivateLayout() {
  const search = useAdvancedSearch();

  return (
    <div className="privateLayout">
      <PrivateLeftPanel>
        <div className="leftPanel__wrapper">
          <div className="leftPanel__section leftPanel__section--top">
            <SearchFilters
              selectedRelations={search.relations}
              onRelationsChange={search.handleRelationsChange}
              selectedSort={search.sort}
              onSortChange={search.handleSortChange}
            />
          </div>

          <div className="leftPanel__section leftPanel__section--middle">
            <NotifyComp />
          </div>

          <div className="leftPanel__section leftPanel__section--bottom">
            <MiniProfile />
          </div>
        </div>
      </PrivateLeftPanel>

      <PrivHeader onSearch={search.handleSearch} />

      <PrivateMainContent>
        {search.hasSearched ? (
          <AdvancedSearchPanel search={search} />
        ) : (
          <Outlet />
        )}
      </PrivateMainContent>

      <footer className="privateLayout__footer">
        <Footer />
      </footer>

      <PrivateRightPanel />
    </div>
  );
}