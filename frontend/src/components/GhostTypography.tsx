import React from 'react';

interface GhostTypographyProps {
  text: string;
  className?: string;
}

/**
 * Giant Ghost Typography Component
 * Renders Anton display font background copy (clamp(90px, 28vw, 380px))
 * at 0.05-0.10 opacity behind main content.
 */
export const GhostTypography: React.FC<GhostTypographyProps> = ({ text, className = '' }) => {
  return (
    <div 
      aria-hidden="true" 
      className={`fixed inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden select-none ${className}`}
    >
      <span className="giant-ghost-typography font-anton tracking-tight text-center transition-all duration-700">
        {text}
      </span>
    </div>
  );
};
