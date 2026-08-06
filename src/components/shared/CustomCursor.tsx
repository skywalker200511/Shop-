import { useEffect, useRef } from 'react';

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const moveDot = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top = `${e.clientY}px`;
        dotRef.current.style.opacity = '1';
      }
    };

    const animateRing = () => {
      const dx = mousePos.current.x - ringPos.current.x;
      const dy = mousePos.current.y - ringPos.current.y;
      ringPos.current.x += dx * 0.28;
      ringPos.current.y += dy * 0.28;
      if (ringRef.current) {
        ringRef.current.style.left = `${ringPos.current.x}px`;
        ringRef.current.style.top = `${ringPos.current.y}px`;
      }
      rafRef.current = requestAnimationFrame(animateRing);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const isClickable = t.tagName === 'BUTTON' || t.tagName === 'A' || t.closest('button') || t.closest('a') || t.tagName === 'SELECT' || t.tagName === 'INPUT';
      if (dotRef.current && ringRef.current) {
        if (isClickable) {
          dotRef.current.style.width = '8px';
          dotRef.current.style.height = '8px';
          dotRef.current.style.background = '#E11D48';
          ringRef.current.style.width = '52px';
          ringRef.current.style.height = '52px';
          ringRef.current.style.borderColor = 'rgba(225, 29, 72, 0.6)';
          ringRef.current.style.background = 'rgba(225, 29, 72, 0.08)';
        } else {
          dotRef.current.style.width = '12px';
          dotRef.current.style.height = '12px';
          dotRef.current.style.background = '#E11D48';
          ringRef.current.style.width = '36px';
          ringRef.current.style.height = '36px';
          ringRef.current.style.borderColor = 'rgba(225, 29, 72, 0.5)';
          ringRef.current.style.background = 'transparent';
        }
      }
    };

    const handleMouseLeave = () => {
      if (dotRef.current) dotRef.current.style.opacity = '0';
      if (ringRef.current) ringRef.current.style.opacity = '0';
    };
    const handleMouseEnter = () => {
      if (dotRef.current) dotRef.current.style.opacity = '1';
      if (ringRef.current) ringRef.current.style.opacity = '1';
    };

    window.addEventListener('mousemove', moveDot);
    window.addEventListener('mouseover', handleMouseOver);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);
    rafRef.current = requestAnimationFrame(animateRing);

    return () => {
      window.removeEventListener('mousemove', moveDot);
      window.removeEventListener('mouseover', handleMouseOver);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="cursor-dot hidden sm:block"
        style={{ opacity: 0 }}
      />
      <div
        ref={ringRef}
        className="cursor-ring hidden sm:block"
        style={{ opacity: 0 }}
      />
    </>
  );
}
