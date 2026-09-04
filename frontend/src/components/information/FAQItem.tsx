import type { ReactNode } from 'react';
import { FiChevronDown } from 'react-icons/fi';

type FAQItemProps = {
  question: string;
  answer: ReactNode;
};

export function FAQItem({ question, answer }: FAQItemProps) {
  return (
    /*
     * Se usa <details> en vez de controlar cada pregunta con useState.
     * El navegador ya proporciona apertura, cierre y navegación por teclado.
     */
    <details className="faq-item">
      <summary className="faq-item__summary">
        <span>{question}</span>

        <FiChevronDown className="faq-item__icon" aria-hidden="true" />
      </summary>

      <div className="faq-item__answer">{answer}</div>
    </details>
  );
}
