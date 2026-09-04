import { FiMail, FiMessageSquare, FiPhone, FiShield } from 'react-icons/fi';

import { InformationalPageLayout } from '../components/information/InformationalPageLayout';

/*
 * Estos datos son genéricos de forma intencionada.
 * Sustitúyelos por los canales reales antes de publicar la aplicación.
 */
const contactMethods = [
  {
    title: 'Consultas generales',
    description:
      'Preguntas sobre el proyecto, sus funciones o el equipo de desarrollo.',
    icon: FiMessageSquare,
    links: [
      {
        label: 'contact@twentyfour.example',
        href: 'mailto:contact@twentyfour.example',
        icon: FiMail,
      },
      {
        label: '+34 900 000 000',
        href: 'tel:+34900000000',
        icon: FiPhone,
      },
    ],
  },
  {
    title: 'Solicitudes sobre privacidad',
    description:
      'Consultas sobre el acceso, la rectificación o la eliminación de datos personales.',
    icon: FiShield,
    links: [
      {
        label: 'privacy@twentyfour.example',
        href: 'mailto:privacy@twentyfour.example',
        icon: FiMail,
      },
    ],
  },
  {
    title: 'Avisos de seguridad',
    description:
      'Comunicación responsable de vulnerabilidades u otros problemas de seguridad.',
    icon: FiShield,
    links: [
      {
        label: 'security@twentyfour.example',
        href: 'mailto:security@twentyfour.example',
        icon: FiMail,
      },
    ],
  },
];

export const Contact = () => {
  return (
    <InformationalPageLayout
      eyebrow="Ayuda"
      title="Contacto"
      subtitle="Ponte en contacto con el equipo de Twenty Four."
      className="information-page--contact"
    >
      <div className="contact-grid">
        {contactMethods.map((method) => {
          const MethodIcon = method.icon;

          return (
            <article className="contact-card" key={method.title}>
              <span className="contact-card__icon">
                <MethodIcon aria-hidden="true" />
              </span>

              <h2 className="contact-card__title">{method.title}</h2>

              <p className="contact-card__description">{method.description}</p>

              <div className="contact-card__links">
                {method.links.map((link) => {
                  const LinkIcon = link.icon;

                  return (
                    <a key={link.href} href={link.href}>
                      <LinkIcon aria-hidden="true" />
                      {link.label}
                    </a>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>

      <div className="information-callout">
        <div>
          <h2>Atención de un proyecto estudiantil</h2>
          <p>
            Twenty Four está mantenido por un equipo de estudiantes. Los tiempos
            de respuesta pueden variar.
          </p>
        </div>
      </div>
    </InformationalPageLayout>
  );
};
