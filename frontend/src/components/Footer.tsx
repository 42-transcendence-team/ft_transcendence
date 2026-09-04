import { AppBrand } from '@components/AppBrand';
import { NavLink } from 'react-router-dom';
import '../styles/components/_footer.scss';

type FooterProps = {
  onBrandActivate?: () => void;
};

export const Footer = ({ onBrandActivate }: FooterProps) => {
  return (
    <div className="footer desktop-footer">
      <nav className="footer__nav" aria-label="Navegación del pie de página">
        <ul className="footer__list">
          <li>
            <NavLink to="/about">Sobre nosotros</NavLink>
          </li>

          <li>
            <NavLink to="/cookies">Cookies</NavLink>
          </li>

          <li>
            <NavLink to="/faq">Preguntas frecuentes</NavLink>
          </li>

          <li>
            <NavLink to="/contact">Contacto</NavLink>
          </li>

          <li>
            <NavLink to="/developers">Desarrolladores</NavLink>
          </li>

          <li>
            <NavLink to="/privacy-policy">Privacidad</NavLink>
          </li>
        </ul>
      </nav>

      <AppBrand
        className="footer__brand"
        logoSize="small"
        textSize="small"
        tone="light"
        bold
        onActivate={onBrandActivate}
      />
    </div>
  );
};
