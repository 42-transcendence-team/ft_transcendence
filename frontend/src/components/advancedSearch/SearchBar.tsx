import "../../styles/components/_searchBar.scss"
import { FiSearch } from "react-icons/fi";
import { useState } from 'react';

type SearchBarProps = {
  onSearch: (query: string) => void
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState('')

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement> ) => {
    setSearchQuery(event.target.value);
  }
  
  const handleButtonClick = () => {
    const cleanQuery = searchQuery.trim()
    if (cleanQuery === "")
      return
    onSearch(cleanQuery)
  }

  return (
    <div className="searchBar">
      <input 
        value={searchQuery}
        onChange={handleInputChange}
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