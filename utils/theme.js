// src/utils/theme.js
// Import this in components and use inline styles

export const ABBK_COLORS = {
  red: '#E63946',
  darkred: '#C1121F',
  black: '#1A1A1A',
  gray: '#6C757D',
  light: '#F8F9FA',
};

// Tailwind-compatible class names
export const ABBK_CLASSES = {
  // Backgrounds
  bgRed: 'bg-[#E63946]',
  bgDarkRed: 'bg-[#C1121F]',
  bgBlack: 'bg-[#1A1A1A]',
  
  // Text
  textRed: 'text-[#E63946]',
  textDarkRed: 'text-[#C1121F]',
  textBlack: 'text-[#1A1A1A]',
  textGray: 'text-[#6C757D]',
  
  // Borders
  borderRed: 'border-[#E63946]',
  borderDarkRed: 'border-[#C1121F]',
  
  // Hovers
  hoverBgRed: 'hover:bg-[#E63946]',
  hoverBgDarkRed: 'hover:bg-[#C1121F]',
  hoverTextRed: 'hover:text-[#E63946]',
};

// Button styles
export const ABBK_BUTTON_STYLES = {
  primary: `bg-[#E63946] hover:bg-[#C1121F] text-white font-medium px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg`,
  secondary: `bg-gray-200 hover:bg-gray-300 text-[#1A1A1A] font-medium px-6 py-3 rounded-lg transition-all`,
  outline: `border-2 border-[#E63946] text-[#E63946] hover:bg-[#E63946] hover:text-white font-medium px-6 py-3 rounded-lg transition-all`,
};

// Card styles
export const ABBK_CARD_STYLES = {
  default: `bg-white rounded-xl shadow-lg border-l-4 border-[#E63946] p-6`,
  dark: `bg-gray-800 rounded-xl shadow-lg border-l-4 border-[#C1121F] p-6`,
};