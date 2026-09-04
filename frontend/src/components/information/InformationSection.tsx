import type { ReactNode } from 'react';

type InformationSectionProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function InformationSection({
  title,
  children,
  className,
}: InformationSectionProps) {
  const sectionClasses = ['information-section', className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <section className={sectionClasses}>
      <h2 className="information-section__title">{title}</h2>

      <div className="information-section__body">{children}</div>
    </section>
  );
}
