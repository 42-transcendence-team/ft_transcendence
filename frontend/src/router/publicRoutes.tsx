import { About } from '@pages/About';
import { Conditions } from '@pages/Conditions';
import { Contact } from '@pages/Contact';
import { Cookies } from '@pages/Cookies';
import { Developers } from '@pages/Developers';
import { FAQ } from '@pages/FAQ';
import { ForgotPassword } from '@pages/ForgotPassword';
import { PrivacyPolicy } from '@pages/PrivacyPolicy';
import { ResetPassword } from '@pages/ResetPassword';
import { PublicLayout } from 'layouts/publicLayout';

export const PublicRoutes = {
  element: <PublicLayout />,
  children: [
    { path: 'about', element: <About /> },
    { path: 'faq', element: <FAQ /> },
    { path: 'developers', element: <Developers /> },
    { path: 'cookies', element: <Cookies /> },
    { path: 'contact', element: <Contact /> },
    { path: 'privacy-policy', element: <PrivacyPolicy /> },
    { path: 'forgot-password', element: <ForgotPassword /> },
    { path: 'reset-password/:token', element: <ResetPassword /> },
    { path: 'terms', element: <Conditions /> },
  ],
};
