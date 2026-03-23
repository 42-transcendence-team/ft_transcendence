import "../styles/components/_userMenu.scss"
import { FiUser, FiSettings, FiLogOut, FiMenu } from "react-icons/fi";
import { useState, useRef, useEffect  } from "react";


export const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="userMenu">
      <button 
        className="userMenu__button" 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FiMenu className="userMenu__icon"/>
      </button>
      {isOpen && (
      <div className="userMenu__dropdown">
        <button className="userMenu__item" type="button">
          <FiUser className="userMenu__item-icon"/>
          <span>Perfil</span> 
        </button>
        <button className="userMenu__item" type="button">
          <FiSettings className="userMenu__item-icon"/> 
          <span>Configuración</span>
        </button>
        <button className="userMenu__item userMenu__item--logout" type="button">
          <FiLogOut className="userMenu__item-icon" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    )}
    </div>
  );
};