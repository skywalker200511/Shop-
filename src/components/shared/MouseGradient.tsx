import { useEffect, useRef } from 'react';

export function MouseGradient() {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (overlayRef.current) {
        overlayRef.current.style.background = `radial-gradient(700px circle at ${e.clientX}px ${e.clientY}px, rgba(225, 29, 72, 0.04), transparent 50%)`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={overlayRef}
      className="pointer-events-none fixed inset-0 z-[31] transition-none"
    />
  );
}
