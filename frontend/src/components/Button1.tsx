import React from 'react';
import '../styles/components/_button1.scss'

interface Button1Props {
  onClick?: () => void;
  label?: string;
}

export const Button1: React.FC<Button1Props> = ({ onClick, label = "Share" }) => {
  return (
    <div className='action-buttons'>
      <button className='share-btn' onClick={onClick}>
        {label}
      </button>
    </div>
  );
};