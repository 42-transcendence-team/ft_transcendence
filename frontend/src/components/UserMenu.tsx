import "../styles/components/_userMenu.scss"
import { FiUser, FiSettings, FiLogOut, FiMenu } from "react-icons/fi";
import { useState  } from "react";
import { Logout } from "api/Logout";
import { useAuth } from "@components/auth-router/AuthContext";


export const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const { refreshAuth } = useAuth();
  
  const handleLogoutClick = async () => {
    try {
      await Logout()
      await refreshAuth();
      console.log("Logout click");
    } catch (error) {
      console.log("logout ERROR", error);
    }
  };
  
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
        <button 
          className="userMenu__item userMenu__item--logout" 
          type="button"
          onClick={handleLogoutClick}
        >
          <FiLogOut className="userMenu__item-icon" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    )}
    </div>
  );
};