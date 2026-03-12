import logo from "../assets/icons/24_logo.png"

export const Footer = () => {
	return (
		<footer>

			<nav>
				<ul>
					<li><a href="/about">About</a></li>
					<li><a href="/cookies">Cookies</a></li>
					<li><a href="/faq">F.A.Q.</a></li>
					<li><a href="/contact">Contact</a></li>
					<li><a href="/developers">Developers</a></li>
					<li><a href="/privacy-policy">Privacy Policy</a></li>
				</ul>
			</nav>

			<div>
				<img src={logo} alt="Twenty Four logo" width="80" />
				<span>Twenty Four</span>
			</div>
		</footer>
	)
}
