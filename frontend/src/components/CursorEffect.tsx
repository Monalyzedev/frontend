import { useEffect, useState } from 'react';

const CursorEffect = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, opacity: number}>>([]);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Créer une nouvelle particule
      const newParticle = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
        opacity: 1
      };
      
      setParticles(prev => [...prev.slice(-8), newParticle]);
    };

    window.addEventListener('mousemove', updateMousePosition);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);

  // Animation des particules
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          opacity: particle.opacity - 0.1
        })).filter(particle => particle.opacity > 0)
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Curseur principal avec effet de pulsation */}
      <div
        className="fixed pointer-events-none z-50 mix-blend-difference"
        style={{
          left: mousePosition.x - 8,
          top: mousePosition.y - 8,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
      </div>
      
      {/* Traînée de particules */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="fixed pointer-events-none z-40"
          style={{
            left: particle.x - 3,
            top: particle.y - 3,
            transform: 'translate(-50%, -50%)',
            opacity: particle.opacity,
          }}
        >
          <div className="w-2 h-2 bg-violet-600 rounded-full blur-sm"></div>
        </div>
      ))}
      
      {/* Effet de halo qui suit avec du retard */}
      <div
        className="fixed pointer-events-none z-30 transition-all duration-300 ease-out mix-blend-screen"
        style={{
          left: mousePosition.x - 16,
          top: mousePosition.y - 16,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-violet-500 rounded-full opacity-30 blur-md"></div>
      </div>
    </>
  );
};

export default CursorEffect;