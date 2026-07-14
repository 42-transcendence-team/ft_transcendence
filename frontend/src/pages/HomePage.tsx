import { Link } from "react-router-dom";

export const HomePage = () => {
	return (
		<section className="home-page">
			<header className="home-page__header">
				<h2>HOME</h2>

				<Link
					className="home-page__new-post-button"
					to="/app/posts/new"
				>
					Nuevo post
				</Link>
			</header>
		</section>
	);
};