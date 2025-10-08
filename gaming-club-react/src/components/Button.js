import React from 'react';

const Button = ({ 
  children, 
  href, 
  onClick, 
  type = 'button', 
  className = '', 
  ...props 
}) => {
  const buttonClass = `btn ${className}`.trim();
  
  if (href) {
    return (
      <a href={href} className={buttonClass} {...props}>
        {children}
      </a>
    );
  }
  
  return (
    <button type={type} className={buttonClass} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

export default Button;