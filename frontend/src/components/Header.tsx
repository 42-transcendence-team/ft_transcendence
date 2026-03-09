import { NavLink } from "react-router-dom";

export const Header = () => {
  return (
    <nav>
      {/* Privada */}
      <NavLink to="/">Home</NavLink>

      {/* Auth */}
      <NavLink to="/login">Login</NavLink>
      <NavLink to="/register">Register</NavLink>
      <NavLink to="/forgot-password">Forgot password</NavLink>

      {/* Info */}
      <NavLink to="/about">About</NavLink>
      <NavLink to="/contact">Contact</NavLink>
      <NavLink to="/developers">Developers</NavLink>
      <NavLink to="/faq">FAQ</NavLink>

	  {/* Legal */}
      <NavLink to="/cookies">Cookies</NavLink>
	  <NavLink to="/privacy-policy">Privacy Policy</NavLink>
    </nav>
  );
};
