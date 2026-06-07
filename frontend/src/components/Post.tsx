import React from 'react';
import skullLogo from '../assets/icons/skull_logo.png';
import { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";

interface PostProps {
  username: string;
  time: string;
  message: string;
  images?: string[]; // opcional como hay publicaciones de solo texto no vamos a crear el mismo componente 2 veces
  isHighlighted?: boolean;
  likes?: number;
}

export const Post: React.FC<PostProps> = ({ 
  username, 
  time, 
  message, 
  images = [], 
  isHighlighted = false,
  likes = 0, 
}) => {
  const displayedImages = images.slice(0, 3);
  const moreImages = images.length -3//hacemos esto pq solo modemos mostrar 3 imagenes para tener el contador y ver cuantas mas tenemos (hay q hace un carrusel de fotos)
	const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(likes??0);

  const handleLike = () => {
    if (liked) {
      setLikesCount(likesCount - 1);
    } else {
      setLikesCount(likesCount + 1);
    }
    setLiked(!liked);
  };
  return (
    <div className={`feed-post ${isHighlighted ? 'highlighted-post' : ''}`}>
      <div className='post-header'>
        <div className='small-logo'>
          <img src={skullLogo} alt="User logo" />
        </div>
        <div className='post-info'>
          <span className='username'>{username}</span>
          <span className='time'>{time}</span>
        </div>
      </div>
      
      <p className='post-message'>{message}</p>

      {images.length > 0 && (
        <div className='photo-gallery'>
          {displayedImages.map((img, index) => (
            <img key={index} src={img} alt={`Post content ${index}`} />
          ))}
          {moreImages > 0 && (
            <div className='more-photos'>+{moreImages}</div>
          )}
        </div>
      )}
      <div className='post-actions'>
        <button className="like-button" onClick={handleLike}>
          {liked ? <FaHeart className="liked" /> : <FaRegHeart />}
        </button>
        <span className='likes-count'>{likesCount}</span>
      </div>
    </div>
  );
};