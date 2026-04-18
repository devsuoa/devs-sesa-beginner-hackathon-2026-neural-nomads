import { useMemo } from 'react';

export default function StarField() {
  const stars = useMemo(() =>
    Array.from({ length: 140 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      s: Math.random() * 2 + 0.5,
      o: Math.random() * 0.6 + 0.15,
      d: Math.random() * 4 + 2,
      delay: Math.random() * 6,
    })), []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#04081a] via-[#080d1a] to-[#080d1a]" />
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-purple-900/8 blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-900/6 blur-3xl" />
      {stars.map(s => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.s, height: s.s,
            opacity: s.o,
            animation: `twinkle ${s.d}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
