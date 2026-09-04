import { FiAlertCircle, FiDatabase, FiLock, FiShield } from 'react-icons/fi';

import { InformationalPageLayout } from '../components/information/InformationalPageLayout';
import { InformationSection } from '../components/information/InformationSection';

const informationCategories = [
  {
    title: 'Datos de la cuenta',
    items: [
      'Nombre de usuario',
      'Dirección de correo electrónico',
      'Nombre y apellidos',
      'Fecha de nacimiento',
      'Resumen criptográfico de la contraseña',
      'Configuración de la autenticación en dos pasos',
    ],
  },
  {
    title: 'Datos del perfil',
    items: [
      'Avatar e imagen de cabecera',
      'Mensaje de estado',
      'Estado de conexión',
      'Contador de visitas al perfil',
    ],
  },
  {
    title: 'Contenido generado por los usuarios',
    items: [
      'Publicaciones',
      'Imágenes y archivos PDF subidos',
      'Comentarios',
      'Me gusta y no me gusta',
    ],
  },
  {
    title: 'Datos sociales',
    items: ['Solicitudes de amistad', 'Amistades', 'Usuarios bloqueados'],
  },
];

const purposes = [
  'Crear y gestionar las cuentas de usuario.',
  'Identificar a los usuarios y mantener sesiones seguras.',
  'Ofrecer perfiles, amistades y funciones sociales.',
  'Almacenar y mostrar el contenido generado por los usuarios.',
  'Permitir la autenticación en dos pasos y la gestión de las cuentas.',
  'Mantener la estabilidad de la aplicación e investigar incidencias técnicas.',
];

const securityMeasures = [
  'Contraseñas protegidas mediante bcrypt.',
  'Cookies de autenticación HttpOnly.',
  'Protección de cookies mediante SameSite.',
  'Cookies seguras en producción.',
  'Autenticación TOTP opcional en dos pasos.',
  'Validación de las sesiones en el servidor.',
  'Restricciones en los tipos y tamaños de los archivos subidos.',
  'Validación del tipo MIME según el contenido de los archivos subidos.',
];

export const PrivacyPolicy = () => {
  return (
    <InformationalPageLayout
      eyebrow="Información legal"
      title="Política de privacidad"
      subtitle="Cómo recopila, utiliza y protege Twenty Four los datos personales."
      className="information-page--privacy"
    >
      <div className="information-callout information-callout--warning">
        <FiAlertCircle aria-hidden="true" />

        <div>
          <h2>Estado actual del proyecto</h2>
          <p>
            Este aviso describe el funcionamiento actual de Twenty Four. Los
            datos de contacto y las normas de conservación deben revisarse antes
            de publicar la aplicación en producción.
          </p>
        </div>
      </div>

      <InformationSection title="1. ¿Quién es el responsable?">
        <div className="information-contact">
          <p>
            <strong>Equipo de desarrollo de Twenty Four</strong>
          </p>

          <a href="mailto:privacy@twentyfour.example">
            privacy@twentyfour.example
          </a>

          <a href="tel:+34900000000">+34 900 000 000</a>
        </div>
      </InformationSection>

      <InformationSection title="2. Datos que recopilamos">
        <div className="privacy-grid">
          {informationCategories.map((category) => (
            <article className="privacy-card" key={category.title}>
              <h3>{category.title}</h3>

              <ul className="information-list">
                {category.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="information-inline information-inline--spaced">
          <FiDatabase aria-hidden="true" />

          <p>
            También pueden procesarse registros técnicos, sucesos de
            autenticación y métricas de funcionamiento cuando estén activados
            los servicios de supervisión correspondientes.
          </p>
        </div>
      </InformationSection>

      <InformationSection title="3. Para qué utilizamos estos datos">
        <ul className="information-list information-list--checks">
          {purposes.map((purpose) => (
            <li key={purpose}>{purpose}</li>
          ))}
        </ul>
      </InformationSection>

      <InformationSection title="4. Datos visibles para otros usuarios">
        <p>
          Los usuarios identificados pueden ver la información mostrada en tu
          perfil y tu actividad, incluidos tu nombre de usuario, nombre, avatar,
          imagen de cabecera, estado, publicaciones, comentarios y reacciones.
        </p>

        <p>
          Tu contraseña, su resumen criptográfico, tu dirección de correo
          electrónico y tus credenciales de autenticación en dos pasos no forman
          parte de la información pública del perfil.
        </p>
      </InformationSection>

      <InformationSection title="5. Dónde se almacenan los datos">
        <div className="information-grid information-grid--two">
          <article className="information-card">
            <h3 className="information-card__title">PostgreSQL</h3>
            <p className="information-card__text">
              Datos de las cuentas, contenido y relaciones entre usuarios.
            </p>
          </article>

          <article className="information-card">
            <h3 className="information-card__title">Redis</h3>
            <p className="information-card__text">
              Sesiones, datos temporales de autenticación, estado de conexión y
              contadores temporales.
            </p>
          </article>

          <article className="information-card">
            <h3 className="information-card__title">Archivos persistentes</h3>
            <p className="information-card__text">
              Avatares, imágenes de cabecera y archivos adjuntos a
              publicaciones.
            </p>
          </article>

          <article className="information-card">
            <h3 className="information-card__title">
              Servicios de supervisión
            </h3>
            <p className="information-card__text">
              Registros de la aplicación y métricas de funcionamiento cuando la
              supervisión está activada.
            </p>
          </article>
        </div>
      </InformationSection>

      <InformationSection title="6. Seguridad">
        <div className="information-inline">
          <FiLock aria-hidden="true" />

          <p>
            Twenty Four aplica medidas técnicas destinadas a proteger las
            cuentas y la información subida.
          </p>
        </div>

        <ul className="information-list information-list--checks">
          {securityMeasures.map((measure) => (
            <li key={measure}>{measure}</li>
          ))}
        </ul>

        <p className="information-note">
          Ningún servicio en línea puede garantizar una seguridad absoluta.
        </p>
      </InformationSection>

      <InformationSection title="7. Conservación de datos y eliminación de cuentas">
        <p>
          Los usuarios pueden solicitar la eliminación de su cuenta desde los
          ajustes. Es necesario confirmar la contraseña y, si está activada,
          introducir un código de autenticación en dos pasos.
        </p>

        <p>
          La política definitiva para producción deberá especificar cómo se
          conservan o eliminan el contenido relacionado, los archivos subidos,
          los registros de funcionamiento y las copias de seguridad. Este aviso
          no afirma que todos los registros relacionados se borren
          inmediatamente.
        </p>
      </InformationSection>

      <InformationSection title="8. Tus derechos">
        <p>
          De acuerdo con la legislación aplicable, los usuarios pueden solicitar
          el acceso, la rectificación o la eliminación de sus datos personales,
          así como su limitación, oposición o portabilidad cuando corresponda.
        </p>

        <p>
          Las solicitudes pueden enviarse a{' '}
          <a href="mailto:privacy@twentyfour.example">
            privacy@twentyfour.example
          </a>
          .
        </p>
      </InformationSection>

      <InformationSection title="9. Requisito de edad">
        <p>Twenty Four está destinado a usuarios mayores de 18 años.</p>
      </InformationSection>

      <InformationSection title="10. Terceros">
        <div className="information-inline">
          <FiShield aria-hidden="true" />

          <p>
            Twenty Four no incluye actualmente redes publicitarias, píxeles de
            seguimiento de redes sociales ni plataformas externas de análisis.
          </p>
        </div>
      </InformationSection>

      <InformationSection title="11. Cambios en esta política">
        <p>
          Esta política podrá actualizarse cuando cambien la aplicación, su
          infraestructura o sus prácticas de tratamiento de datos personales.
        </p>

        <p className="information-meta">Última actualización: julio de 2026</p>
      </InformationSection>
    </InformationalPageLayout>
  );
};
