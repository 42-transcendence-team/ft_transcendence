import { NavLink } from "react-router-dom";

export const Header = () => {
	return (
		<>
			<NavLink to='/'>Home</NavLink>
			<NavLink to='/login'>Login</NavLink>
			<p>Esto sera una barra de navegacion</p>
		</>
	)
}