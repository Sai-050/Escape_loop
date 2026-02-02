import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "px-6 py-3 font-mono font-bold uppercase tracking-wider transition-all duration-200 transform active:scale-95 focus:outline-none";
  
  const variants = {
    primary: "bg-terminal-green text-black hover:bg-white hover:text-black border border-terminal-green hover:shadow-[0_0_15px_rgba(0,255,65,0.7)]",
    danger: "bg-transparent text-neon-red border border-neon-red hover:bg-neon-red hover:text-black hover:shadow-[0_0_15px_rgba(255,0,0,0.7)]",
    outline: "bg-transparent text-terminal-green border border-terminal-green hover:bg-terminal-green/10"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
