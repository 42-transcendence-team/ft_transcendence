import "../../styles/components/advancedSearch/_searchBar.scss"
import { FiSearch } from "react-icons/fi";
import { useState } from 'react';

type SearchBarProps = {
  onSearch: (query: string) => void
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState<string>('')

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement> ) => {
    setSearchQuery(event.target.value);
  }
  
  const handleButtonClick = () => {
    const cleanQuery = searchQuery.trim()

    onSearch(cleanQuery)
    setSearchQuery("")
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleButtonClick();
    }
  };

  return (
    <div className="searchBar">
      <input 
        id="header-search-input"
        value={searchQuery}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="searchBar__input" 
        type="text" 
        placeholder="Buscar..." 
      />
      <button className="searchBar__button" type="button" onClick={handleButtonClick}
        >
        <FiSearch className="searchBar__icon" />
      </button>
    </div>
  );
};