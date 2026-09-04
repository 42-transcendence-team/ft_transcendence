import {
  FiActivity,
  FiArrowRight,
  FiFileText,
  FiMessageCircle,
  FiShield,
  FiUser,
  FiUsers,
} from 'react-icons/fi';
import { NavLink } from 'react-router-dom';

import { InformationalPageLayout } from '../components/information/InformationalPageLayout';
import { InformationSection } from '../components/information/InformationSection';

const capabilities = [
  {
    title: 'Crea tu perfil',
    description:
      'Personaliza tu identidad con un perfil, un avatar y una imagen de cabecera.',
    icon: FiUser,
  },
  {
    title: 'Conecta con tus amigos',
    description: 'Envía solicitudes y crea tu propia red de contactos.',
    icon: FiUsers,
  },
  {
    title: 'Comparte publicaciones y archivos',
    description: 'Publica textos, imágenes y documentos compatibles.',
    icon: FiFileText,
  },
  {
    title: 'Participa en la conversación',
    description:
      'Comenta las publicaciones y reacciona al contenido compartido.',
    icon: FiMessageCircle,
  },
  {
    title: 'Protege tu cuenta',
    description: 'Gestiona tu sesión, contraseña y autenticación en dos pasos.',
    icon: FiShield,
  },
  {
    title: 'Todo en un mismo lugar',
    description:
      'Accede a todas las funciones sociales e interactivas desde una misma aplicación.',
    icon: FiActivity,
  },
];

const principles = [
  {
    title: 'Usabilidad',
    description: 'Interfaces claras e interacciones previsibles.',
  },
  {
    title: 'Seguridad',
    description:
      'Protección de las cuentas y acceso controlado a los datos de los usuarios.',
  },
  {
    title: 'Trabajo en equipo',
    description:
      'Un proyecto conjunto diseñado y desarrollado por cinco personas.',
  },
];

export const About = () => {
  return (
    <InformationalPageLayout
      eyebrow="Twenty Four"
      title="Sobre Twenty Four"
      subtitle="Una plataforma social creada para conectar, compartir e interactuar."
      className="information-page--about"
    >
      <InformationSection title="¿Qué es Twenty Four?">
        <p>
          Twenty Four es una plataforma web social donde los usuarios pueden
          crear un perfil, conectar con otras personas y compartir contenido en
          un mismo lugar.
        </p>
      </InformationSection>

      <InformationSection title="¿Qué puedes hacer?">
        <div className="information-grid information-grid--three">
          {capabilities.map((capability) => {
            const Icon = capability.icon;

            return (
              <article className="information-card" key={capability.title}>
                <span className="information-card__icon">
                  <Icon aria-hidden="true" />
                </span>

                <h3 className="information-card__title">{capability.title}</h3>

                <p className="information-card__text">
                  {capability.description}
                </p>
              </article>
            );
          })}
        </div>
      </InformationSection>

      <InformationSection title="Creado como proyecto en equipo">
        <p>
          Twenty Four fue creado por un equipo de cinco desarrolladores como
          proyecto final del Common Core de 42.
        </p>
      </InformationSection>

      <InformationSection title="Nuestro enfoque">
        <div className="information-grid information-grid--three">
          {principles.map((principle) => (
            <article
              className="information-card information-card--compact"
              key={principle.title}
            >
              <h3 className="information-card__title">{principle.title}</h3>

              <p className="information-card__text">{principle.description}</p>
            </article>
          ))}
        </div>
      </InformationSection>

      <div className="information-callout information-callout--action">
        <div>
          <h2>Conoce a quienes están detrás del proyecto</h2>
          <p>
            Descubre más sobre el equipo que diseñó y desarrolló Twenty Four.
          </p>
        </div>

        <NavLink className="information-button" to="/developers">
          Conoce al equipo
          <FiArrowRight aria-hidden="true" />
        </NavLink>
      </div>
    </InformationalPageLayout>
  );
};
