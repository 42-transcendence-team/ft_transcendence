import { type ReactNode, useId } from 'react';

type InformationalPageLayoutProps = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  className?: string;
};

export function InformationalPageLayout({
  eyebrow,
  title,
  subtitle,
  children,
  className,
}: InformationalPageLayoutProps) {
  /*
   * useId genera un identificador estable y único para relacionar
   * semánticamente la sección con su título mediante aria-labelledby.
   */
  const titleId = useId();

  const pageClasses = ['information-page', className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <section className={pageClasses} aria-labelledby={titleId}>
      <div className="information-page__shell">
        <header className="information-page__header">
          {eyebrow && <p className="information-page__eyebrow">{eyebrow}</p>}

          <h1 id={titleId} className="information-page__title">
            {title}
          </h1>

          <p className="information-page__subtitle">{subtitle}</p>
        </header>

        <div className="information-page__content">{children}</div>
      </div>
    </section>
  );
}
