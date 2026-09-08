import "../../styles/components/advancedSearch/_searchBar.scss"
import { FiSearch } from "react-icons/fi";
import { useState } from 'react';

type SearchBarProps = {
  onSearch: (query: string) => void
  isActive?: boolean
  onClose?: () => void
}

export const SearchBar = ({ onSearch, isActive, onClose }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState<string>('')

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement> ) => {
    setSearchQuery(event.target.value);
  }
  
  const handleButtonClick = () => {
    if (isActive && onClose) {
      onClose()
      return
    }

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
    <div className="privHeader__functions--searchBar">
      <input 
        id="header-search-input"
        value={searchQuery}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="privHeader__functions--searchBar__input" 
        type="text" 
        placeholder="Buscar..." 
      />
      <button className="searchBar__button" type="button" onClick={handleButtonClick}
        onPointerDown={(event) => event.stopPropagation()}
        >
        <FiSearch className="searchBar__icon" />
      </button>
    </div>
  );
};