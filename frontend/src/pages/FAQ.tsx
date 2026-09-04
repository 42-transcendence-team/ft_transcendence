import { faqGroups } from '../assets/data/faq';
import { FAQItem } from '../components/information/FAQItem';
import { InformationalPageLayout } from '../components/information/InformationalPageLayout';

export const FAQ = () => {
  return (
    <InformationalPageLayout
      eyebrow="Ayuda"
      title="Preguntas frecuentes"
      subtitle="Respuestas rápidas sobre cuentas, perfiles, publicaciones y seguridad."
      className="information-page--faq"
    >
      <div className="faq-groups">
        {faqGroups.map((group) => (
          <section
            className="faq-group"
            key={group.id}
            aria-labelledby={`faq-${group.id}`}
          >
            <h2 className="faq-group__title" id={`faq-${group.id}`}>
              {group.title}
            </h2>

            <div className="faq-group__items">
              {group.items.map((item) => (
                <FAQItem
                  key={item.question}
                  question={item.question}
                  answer={<p>{item.answer}</p>}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </InformationalPageLayout>
  );
};
