import React from 'react';

/**
 * GrainOverlay renders an SVG fractal noise atmospheric texture
 * positioned above the background but below interactive UI elements.
 */
export const GrainOverlay: React.FC = () => {
  return (
    <div 
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-10 opacity-40 mix-blend-overlay overflow-hidden"
    >
      <svg className="w-full h-full opacity-[0.08]">
        <filter id="consensus-grain-noise">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.9" 
            numOctaves="4" 
            stitchTiles="stitch" 
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#consensus-grain-noise)" />
      </svg>
    </div>
  );
};
