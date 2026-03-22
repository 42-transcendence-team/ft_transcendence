import { NavLink } from "react-router-dom";
import "../styles/components/_userMenu.scss"


export const UserMenu = () => {
  return (
    <div className="userMenu">
      <button className="userMenu__button" type="button">
        <span className="userMenu__icon">-</span>
      </button>

      <div className="userMenu__dropdown">
		<button>Perfil</button>
		<button>Configuración</button>
		<button>Cerrar sesión</button>
	  </div>
    </div>
  );
};