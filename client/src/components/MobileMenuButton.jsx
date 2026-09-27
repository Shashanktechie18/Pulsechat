import React from 'react';

const MobileMenuButton = ({ onClick, isOpen }) => {
  return (
    <button
      className="d-md-none btn btn-success position-fixed"
      onClick={onClick}
      style={{
        top: '10px',
        left: '10px',
        zIndex: 1060,
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        border: 'none',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}
      aria-label="Toggle menu"
    >
      <div className="hamburger-icon">
        <span 
          className={`hamburger-line ${isOpen ? 'rotate-45' : ''}`}
          style={{
            display: 'block',
            width: '20px',
            height: '2px',
            backgroundColor: 'white',
            margin: '3px auto',
            transform: isOpen ? 'rotate(45deg) translate(6px, 6px)' : 'none'
          }}
        ></span>
        <span 
          className={`hamburger-line ${isOpen ? 'opacity-0' : ''}`}
          style={{
            display: 'block',
            width: '20px',
            height: '2px',
            backgroundColor: 'white',
            margin: '3px auto',
            opacity: isOpen ? '0' : '1'
          }}
        ></span>
        <span 
          className={`hamburger-line ${isOpen ? 'rotate-minus-45' : ''}`}
          style={{
            display: 'block',
            width: '20px',
            height: '2px',
            backgroundColor: 'white',
            margin: '3px auto',
            transform: isOpen ? 'rotate(-45deg) translate(6px, -6px)' : 'none'
          }}
        ></span>
      </div>
    </button>
  );
};

export default MobileMenuButton;