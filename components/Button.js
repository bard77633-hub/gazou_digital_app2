import { html } from '../react-utils.js';

export const Button = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300",
    secondary: "bg-slate-200 text-slate-800 hover:bg-slate-300 disabled:bg-slate-100",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 disabled:border-blue-300 disabled:text-blue-300"
  };

  return html`
    <button 
      className=${`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      ...${props}
    >
      ${children}
    </button>
  `;
};