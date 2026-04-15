import "../styles/components/_searchBar.scss"
import { FiSearch } from "react-icons/fi";


export const SearchBar = () => {
  return (
    <div className="searchBar">
      <input
        className="searchBar__input" 
        type="text" 
        placeholder="Buscar..." 
      />
      <button className="searchBar__button" type="button">
        <FiSearch className="searchBar__icon" />
      </button>
    </div>
  );
};