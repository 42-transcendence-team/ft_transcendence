import { NavLink } from "react-router-dom";
import "../styles/components/_searchBar.scss"


export const SearchBar = () => {
  return (
    <div className="searchBar">
      <input
        className="searchBar__input" 
        type="text" 
        placeholder="Buscar..." 
      />
      <button className="searchBar__button" type="button">
        <span className="searchBar__icon">🔍</span>
      </button>
    </div>
  );
};