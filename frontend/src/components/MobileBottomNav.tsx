import { NavLink } from "react-router-dom";
import "@styles/components/_mobileBottomNav.scss";
import  new_post  from "../assets/icons/new_post.png";
import  chat  from "../assets/icons/chat.png";
import  home  from "../assets/icons/home.png";
import  skull  from "../assets/icons/skull_logo.png";
import  search  from "../assets/icons/search.png";

export const MobileBottomNav = () => {
  return (
    <nav className="mobileBottomNav">
      {/* 1. Inicio / Feed */}
      <NavLink 
        to="/app" // aqui iria la peticion para subir un post 
        className={
          ({ isActive }) => isActive 
          ? "mobileBottomNav__link active" : "mobileBottomNav__link"
        }
      >
        <img 
          src={home}
          alt="Home" 
          className="mobileBottomNav__icon-img" 
        />
      </NavLink>

      {/* 2. Búsqueda */}
      <NavLink 
        to="/XXXXXXX" // aqui iria la peticion para subir un post 
        className={
          ({ isActive }) => isActive 
          ? "mobileBottomNav__link active" : "mobileBottomNav__link"
        }
      >
        <img 
          src={search}
          alt="Home" 
          className="mobileBottomNav__icon-img" 
        />
      </NavLink>


      {/* 3. Botón Central (Añadir/Crear) */}
      <NavLink 
        to="/post" // aqui iria la peticion para subir un post 
        className={
          ({ isActive }) => isActive 
          ? "mobileBottomNav__link active" : "mobileBottomNav__link"
        }
      >
        <img 
          src={new_post}
          alt="New Post" 
          className="mobileBottomNav__icon-img" 
        />
      </NavLink>

      {/* 4. Mensajes / Chat */}
      <NavLink 
        to="/chat" // aqui iria la peticion para subir un post 
        className={
          ({ isActive }) => isActive 
          ? "mobileBottomNav__link active" : "mobileBottomNav__link"
        }
      >
        <img 
          src={chat}
          alt="Chat" 
          className="mobileBottomNav__icon-img" 
        />
      </NavLink>

      {/* 5. Perfil (Puedes sustituir el SVG por un <img src={tuAvatar} /> si lo prefieres) */}
      <NavLink 
        to="/profile" // aqui iria la peticion para subir un post 
        className={
          ({ isActive }) => isActive 
          ? "mobileBottomNav__link active" : "mobileBottomNav__link"
        }
      >
        <img 
          src={skull}
          alt="Perfil" 
          style={{ height: "39px", with: "39px" }}
          className="mobileBottomNav__icon-img" 
        />
      </NavLink>
    </nav>
  );
};