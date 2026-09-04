import { Link } from 'react-router-dom';
import NotFoundPepe from '../assets/img/NotFound404.png';
import '../styles/pages/_notFound.scss';

export const NotFound = () => {
  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <img src={NotFoundPepe} alt="NotFoundPepe" className="notfound-img" />
        <Link to="/" className="home-button">
          Go back to home
        </Link>
      </div>
    </div>
  );
};
