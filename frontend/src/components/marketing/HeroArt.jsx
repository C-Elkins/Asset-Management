import React, { useEffect, useRef, useState } from 'react';

// Tasteful, lightweight SVG art for the hero area
export const HeroArt = () => {
  const [coords, setCoords] = useState({ y1: 50, y2: 80, y3: 20 });
  const rafRef = useRef(null);

  useEffect(() => {
    let t = 0;
    const animate = () => {
      t += 0.008;
      const y1 = 50 + Math.sin(t) * 4;
      const y2 = 80 + Math.cos(t * 0.8) * 6;
      const y3 = 20 + Math.sin(t * 1.2 + 1) * 5;
      setCoords({ y1, y2, y3 });
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <svg width="100%" height="180" viewBox="0 0 800 180" fill="none" aria-hidden="true" style={{ opacity: 0.9 }}>
      <defs>
        <linearGradient id="grad1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--primary, #2563eb)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--primary, #2563eb)" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="grad2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="800" height="180" fill="url(#grad1)" />
      <path d={`M 0 100 C 150 80, 300 ${coords.y1}, 450 70 S 650 90, 800 80`} stroke="var(--primary, #2563eb)" strokeOpacity="0.35" strokeWidth="2" fill="none" />
      <path d={`M 0 110 C 140 ${coords.y2}, 280 60, 420 ${coords.y3} S 700 120, 800 100`} stroke="#10b981" strokeOpacity="0.3" strokeWidth="2" fill="none" />
      <g opacity="0.5">
        {Array.from({ length: 18 }).map((_, i) => (
          <circle key={i} cx={20 + i * 44} cy={60 + (i % 3) * 14} r={i % 2 ? 1.2 : 1.8} fill="currentColor" />
        ))}
      </g>
    </svg>
  );
};

export default HeroArt;
