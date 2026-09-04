import type React from 'react';
import skullLogo from '../assets/icons/skull_logo.png';
import '../styles/components/_feedPost.scss';

interface PostProps {
  username: string;
  time: string;
  message: string;

  // Opcional: como hay publicaciones de solo texto,
  // no vamos a crear el mismo componente dos veces.
  images?: string[];

  isHighlighted?: boolean;
}

export const Post: React.FC<PostProps> = ({
  username,
  time,
  message,
  images = [],
  isHighlighted = false,
}) => {
  const displayedImages = images.slice(0, 3);

  // Hacemos esto porque solo podemos mostrar tres imágenes para
  // tener el contador y ver cuántas más hay.
  // Queda pendiente hacer un carrusel de fotos.
  const moreImages = images.length - 3;

  // Construye el bloque BEM del post y añade el modificador
  // visual cuando la publicación está destacada.
  const postClassName = [
    'feed-post',
    isHighlighted ? 'feed-post--highlighted' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={postClassName}>
      <div className="feed-post__header">
        <div className="feed-post__avatar">
          <img
            className="feed-post__avatar-image"
            src={skullLogo}
            alt="Avatar del usuario"
          />
        </div>

        <div className="feed-post__info">
          <span className="feed-post__username">{username}</span>

          <span className="feed-post__time">{time}</span>
        </div>
      </div>

      <p className="feed-post__message">{message}</p>

      {images.length > 0 && (
        <div className="feed-post__gallery">
          {displayedImages.map((image, index) => (
            <img
              key={index}
              className="feed-post__gallery-image"
              src={image}
              alt={`Contenido de la publicación ${index + 1}`}
            />
          ))}

          {moreImages > 0 && (
            <div className="feed-post__more">+{moreImages}</div>
          )}
        </div>
      )}
    </div>
  );
};
