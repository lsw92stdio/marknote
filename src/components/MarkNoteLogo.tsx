import React from 'react';

interface MarkNoteLogoProps {
  className?: string;
  accentColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const MarkNoteLogo: React.FC<MarkNoteLogoProps> = ({
  className = '',
  accentColor = '#2563eb',
  size = 'md',
}) => {
  const dimensions =
    size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';

  const iconSizes =
    size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5.5 h-5.5' : 'w-4.5 h-4.5';

  return (
    <div
      className={`relative flex items-center justify-center rounded-xl shadow-xs transition-transform duration-200 hover:scale-105 shrink-0 ${dimensions} ${className}`}
      style={{
        background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
      }}
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${iconSizes} text-white drop-shadow-xs`}
      >
        {/* Stylized M Vector with Markdown Arrow accent */}
        <path
          d="M6 24V8L13 16L20 8V24"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Note Corner Dot / Down Arrow Accent */}
        <path
          d="M26 12L26 21M26 21L23 18M26 21L29 18"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
