import React from 'react';
import '../styles/components/_button1.scss'
import { Link } from 'react-router-dom';
interface Button1Props {
  onClick?: () => void;
  label?: string;
  to?: string;
}

export const Button1: React.FC<Button1Props> = ({ onClick, label = "Share", to }) => {
  if (to) {
    return (
      <div className='action-buttons'>
        <Link to={to} className='share-btn'>
          {label}
        </Link>
      </div>
    );
  }
  return (
    <div className='action-buttons'>
      <button className='share-btn' onClick={onClick}>
        {label}
      </button>
    </div>
  );
};