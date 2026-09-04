import { Footer } from '@components/Footer';
import { Header } from '@components/Header';
import { Outlet, useLocation } from 'react-router-dom';

import '../styles/components/_publicLayout.scss';

export function PublicLayout() {
  // Layout común para todas las páginas públicas (footer, header...)
  // Es en las páginas donde se modifica el body dependiendo de que se muestre en estas.
  const location = useLocation();

  const authPages = ['/login', '/register', '/42register', '/forgot-password'];

  const isAuthPage =
    authPages.includes(location.pathname) ||
    location.pathname.startsWith('/reset-password/');

  return (
    <div className="public-layout">
      {!isAuthPage && <Header />}

      <main className="public-layout__content">
        {isAuthPage ? (
          <section className="auth-page">
            <Outlet />
          </section>
        ) : (
          <Outlet />
        )}
      </main>

      <Footer />
    </div>
  );
}
