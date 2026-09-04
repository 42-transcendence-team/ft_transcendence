import { FiExternalLink, FiGithub, FiLinkedin } from 'react-icons/fi';

import skullLogo from '../../assets/icons/skull_logo.png';

type DeveloperCardProps = {
  name: string;
  surname?: string;
  role: string;
  description: string;
  avatarSrc?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
};

export function DeveloperCard({
  name,
  surname,
  role,
  description,
  avatarSrc,
  githubUrl,
  linkedinUrl,
  portfolioUrl,
}: DeveloperCardProps) {
  const fullName = [name, surname].filter(Boolean).join(' ');

  return (
    <article className="developer-card">
      <div className="developer-card__avatar-frame">
        <img
          className="developer-card__avatar"
          src={avatarSrc ?? skullLogo}
          alt={`${fullName}: imagen de perfil`}
          onError={(event) => {
            /*
             * Aunque posteriormente se añada una fotografía real,
             * una ruta rota seguirá mostrando la calavera común.
             */
            event.currentTarget.onerror = null;
            event.currentTarget.src = skullLogo;
          }}
        />
      </div>

      <div className="developer-card__content">
        <h2 className="developer-card__name">{fullName}</h2>

        <p className="developer-card__role">{role}</p>

        <p className="developer-card__description">{description}</p>
      </div>

      {(githubUrl || linkedinUrl || portfolioUrl) && (
        <div
          className="developer-card__links"
          aria-label={`${fullName}: enlaces`}
        >
          {githubUrl && (
            <a href={githubUrl} target="_blank" rel="noreferrer">
              <FiGithub aria-hidden="true" />
              GitHub
            </a>
          )}

          {linkedinUrl && (
            <a href={linkedinUrl} target="_blank" rel="noreferrer">
              <FiLinkedin aria-hidden="true" />
              LinkedIn
            </a>
          )}

          {portfolioUrl && (
            <a href={portfolioUrl} target="_blank" rel="noreferrer">
              <FiExternalLink aria-hidden="true" />
              Sitio web
            </a>
          )}
        </div>
      )}
    </article>
  );
}
