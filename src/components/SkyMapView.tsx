import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameState {
  ship: { x: number; y: number; vx: number; vy: number; angle: number };
  camera: { x: number; y: number };
  keys: { up: boolean; down: boolean; left: boolean; right: boolean };
  particles: Array<{ x: number; y: number; vx: number; vy: number; life: number }>;
  nearestConstellation: string | null;
  selectedConstellation: string | null;
}

// Constellation star map (Southern Hemisphere, normalized 0-1 world coords)
const CONSTELLATIONS = [
  {
    name: 'Southern Cross',
    emoji: '✚',
    x: 0.5, y: 0.4,
    stars: [
      { x: -0.02, y: -0.03 }, { x: 0.01, y: -0.01 },
      { x: 0.02, y: 0.02 }, { x: -0.01, y: 0.03 }
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0]],
  },
  {
    name: 'Centaurus',
    emoji: '🐎',
    x: 0.45, y: 0.5,
    stars: [
      { x: 0, y: 0 }, { x: 0.05, y: -0.02 }, { x: -0.04, y: 0.03 },
      { x: 0.03, y: 0.04 }, { x: -0.02, y: -0.04 },
    ],
    lines: [[0, 1], [0, 2], [0, 3], [1, 4]],
  },
  {
    name: 'Scorpius',
    emoji: '🦂',
    x: 0.7, y: 0.45,
    stars: [
      { x: 0, y: 0 }, { x: -0.03, y: 0.01 }, { x: -0.05, y: 0 },
      { x: -0.06, y: -0.02 }, { x: -0.04, y: -0.04 }, { x: -0.01, y: -0.05 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]],
  },
  {
    name: 'Sagittarius',
    emoji: '🏹',
    x: 0.75, y: 0.5,
    stars: [
      { x: 0, y: 0 }, { x: 0.04, y: -0.02 }, { x: 0.05, y: 0.01 },
      { x: 0.02, y: 0.04 }, { x: -0.03, y: 0.02 }, { x: -0.04, y: -0.01 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]],
  },
  {
    name: 'Orion',
    emoji: '⚔️',
    x: 0.35, y: 0.3,
    stars: [
      { x: 0, y: 0 }, { x: 0.03, y: -0.04 }, { x: -0.03, y: -0.04 },
      { x: 0.02, y: 0.04 }, { x: -0.02, y: 0.04 }, { x: 0.04, y: 0.02 },
    ],
    lines: [[0, 1], [0, 2], [0, 3], [0, 4], [1, 5], [2, 5]],
  },
  {
    name: 'Canis Major',
    emoji: '🐕',
    x: 0.3, y: 0.4,
    stars: [
      { x: 0, y: 0 }, { x: 0.03, y: -0.02 }, { x: 0.04, y: 0.02 },
      { x: 0.01, y: 0.03 },
    ],
    lines: [[0, 1], [0, 2], [0, 3]],
  },
  {
    name: 'Taurus',
    emoji: '🐂',
    x: 0.28, y: 0.25,
    stars: [
      { x: 0, y: 0 }, { x: 0.03, y: -0.03 }, { x: -0.02, y: -0.02 },
      { x: 0.02, y: 0.03 }, { x: -0.03, y: 0.02 },
    ],
    lines: [[0, 1], [0, 2], [0, 3], [0, 4]],
  },
  {
    name: 'Gemini',
    emoji: '👯',
    x: 0.4, y: 0.22,
    stars: [
      { x: 0, y: 0 }, { x: 0.04, y: 0 }, { x: -0.02, y: -0.03 },
      { x: 0.05, y: -0.02 }, { x: 0.02, y: 0.04 },
    ],
    lines: [[0, 1], [0, 2], [1, 3], [1, 4]],
  },
  {
    name: 'Leo',
    emoji: '🦁',
    x: 0.55, y: 0.25,
    stars: [
      { x: 0, y: 0 }, { x: 0.03, y: -0.02 }, { x: 0.05, y: 0 },
      { x: 0.04, y: 0.02 }, { x: 0.02, y: 0.04 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  {
    name: 'Virgo',
    emoji: '👧',
    x: 0.65, y: 0.3,
    stars: [
      { x: 0, y: 0 }, { x: 0.04, y: -0.03 }, { x: 0.05, y: 0.01 },
      { x: 0.02, y: 0.04 }, { x: -0.02, y: 0.03 },
    ],
    lines: [[0, 1], [0, 2], [1, 3], [2, 4]],
  },
  {
    name: 'Aquarius',
    emoji: '⚱️',
    x: 0.75, y: 0.35,
    stars: [
      { x: 0, y: 0 }, { x: 0.03, y: -0.02 }, { x: 0.04, y: 0 },
      { x: 0.02, y: 0.03 }, { x: -0.02, y: 0.02 },
    ],
    lines: [[0, 1], [0, 2], [0, 3], [3, 4]],
  },
  {
    name: 'Pisces',
    emoji: '🐟',
    x: 0.8, y: 0.25,
    stars: [
      { x: 0, y: 0 }, { x: 0.03, y: -0.03 }, { x: -0.03, y: -0.02 },
      { x: 0.02, y: 0.03 }, { x: -0.02, y: 0.04 },
    ],
    lines: [[0, 1], [0, 2], [1, 3], [2, 4]],
  },
  {
    name: 'Canopus',
    emoji: '⭐',
    x: 0.25, y: 0.55,
    stars: [{ x: 0, y: 0 }],
    lines: [],
  },
];

const CONSTELLATIONS_INFO: Record<string, { description: string; season: string }> = {
  'Southern Cross': {
    description: 'The most iconic constellation of the Southern Hemisphere. Four bright stars form a cross; the long axis points toward the South Celestial Pole. Use it to find south!',
    season: 'Autumn/Winter',
  },
  Centaurus: {
    description: 'Home to Alpha Centauri, the closest star system to Earth at just 4.37 light-years away. Also contains Omega Centauri, the largest globular cluster visible to the naked eye.',
    season: 'Winter',
  },
  Scorpius: {
    description: 'A beautiful S-shaped arc arching across the winter sky. The heart is Antares — a red supergiant so enormous it would swallow Earth\'s entire orbit if placed where the Sun is.',
    season: 'Winter',
  },
  Sagittarius: {
    description: 'The Teapot constellation sits right at the heart of the Milky Way. When you gaze at it, you\'re staring toward the galactic centre — 26,000 light-years away.',
    season: 'Winter',
  },
  Orion: {
    description: 'Appears upside-down from New Zealand. Look for the three-star belt — the most recognisable line in the entire sky. The Orion Nebula sits just below it.',
    season: 'Summer',
  },
  'Canis Major': {
    description: 'Contains Sirius, the brightest star in the night sky. Often mistaken for a planet because it\'s so bright and doesn\'t twinkle like other stars.',
    season: 'Summer',
  },
  Taurus: {
    description: 'Home to the Pleiades (the Seven Sisters) star cluster — one of the most beautiful naked-eye sights in the sky. Visible as a tiny dipper of stars.',
    season: 'Summer',
  },
  Gemini: {
    description: 'The Twins constellation. Look for the two brightest stars Castor and Pollux marking the twins\' heads. An easy pattern to spot in the summer night sky.',
    season: 'Summer',
  },
  Leo: {
    description: 'A prominent spring constellation shaped like a crouching lion. The brightest star Regulus marks the lion\'s heart. Easy to spot in the western sky after sunset.',
    season: 'Spring',
  },
  Virgo: {
    description: 'The Maiden constellation. Contains Spica, a bright blue star. Virgo is part of the spring triangle of bright stars in the evening sky.',
    season: 'Spring',
  },
  Aquarius: {
    description: 'The Water Carrier. A sprawling constellation best viewed from darker sites. During May and June, the Eta Aquariid meteor shower appears to radiate from this region.',
    season: 'Autumn',
  },
  Pisces: {
    description: 'The Fishes constellation. Smaller and fainter than many others, but home to interesting deep-sky objects for binoculars and telescopes.',
    season: 'Autumn',
  },
  Canopus: {
    description: 'The second-brightest star in the entire night sky. Circumpolar from New Zealand — it never sets below the horizon. Ancient Polynesian navigators used it for navigation.',
    season: 'All year',
  },
};

export default function SkyMapView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>({
    ship: { x: 0.5, y: 0.5, vx: 0, vy: 0, angle: -Math.PI / 2 },
    camera: { x: 0, y: 0 },
    keys: { up: false, down: false, left: false, right: false },
    particles: [],
    nearestConstellation: null,
    selectedConstellation: null,
  });

  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect && (canvas.width !== rect.width || canvas.height !== rect.height)) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    const state = gameStateRef.current;
    const SHIP_SPEED = 0.003;
    const SHIP_ROT_SPEED = 0.1;
    const DRAG = 0.95;
    const INTERACTION_RADIUS = 0.08;

    // Keyboard handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') state.keys.up = true;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') state.keys.down = true;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') state.keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') state.keys.right = true;
      if (e.key === ' ' && state.nearestConstellation) {
        setSelected(state.nearestConstellation);
        state.selectedConstellation = state.nearestConstellation;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') state.keys.up = false;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') state.keys.down = false;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') state.keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') state.keys.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Touch/mouse controls
    let touchDir = { x: 0, y: 0 };
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      touchDir.x = (touch.clientX - rect.left) / rect.width - 0.5;
      touchDir.y = (touch.clientY - rect.top) / rect.height - 0.5;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      touchDir.x = (touch.clientX - rect.left) / rect.width - 0.5;
      touchDir.y = (touch.clientY - rect.top) / rect.height - 0.5;
    };

    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);

    // Game loop
    let animId: number;
    const gameLoop = () => {
      // Update ship
      if (state.keys.up) {
        state.ship.vx += Math.cos(state.ship.angle) * SHIP_SPEED;
        state.ship.vy += Math.sin(state.ship.angle) * SHIP_SPEED;
      }
      if (state.keys.down) {
        state.ship.vx -= Math.cos(state.ship.angle) * SHIP_SPEED * 0.5;
        state.ship.vy -= Math.sin(state.ship.angle) * SHIP_SPEED * 0.5;
      }
      if (state.keys.left) state.ship.angle -= SHIP_ROT_SPEED;
      if (state.keys.right) state.ship.angle += SHIP_ROT_SPEED;

      // Touch thrust
      if (touchDir.x !== 0 || touchDir.y !== 0) {
        const mag = Math.hypot(touchDir.x, touchDir.y);
        if (mag > 0.1) {
          const a = Math.atan2(touchDir.y, touchDir.x);
          state.ship.angle = a;
          state.ship.vx += Math.cos(a) * SHIP_SPEED;
          state.ship.vy += Math.sin(a) * SHIP_SPEED;
          if (state.keys.up) {
            state.ship.vx += Math.cos(a) * SHIP_SPEED * 0.5;
            state.ship.vy += Math.sin(a) * SHIP_SPEED * 0.5;
          }
        }
      }

      // Drag
      state.ship.vx *= DRAG;
      state.ship.vy *= DRAG;

      // Position
      state.ship.x += state.ship.vx;
      state.ship.y += state.ship.vy;

      // Wrap around
      if (state.ship.x < 0) state.ship.x += 1;
      if (state.ship.x > 1) state.ship.x -= 1;
      if (state.ship.y < 0) state.ship.y += 1;
      if (state.ship.y > 1) state.ship.y -= 1;

      // Camera follow
      state.camera.x = state.ship.x - 0.5;
      state.camera.y = state.ship.y - 0.5;

      // Particles
      state.particles = state.particles.filter(p => p.life > 0);
      state.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.01;
      });

      // Thrust particles
      if (state.keys.up) {
        const angle = state.ship.angle + Math.PI;
        for (let i = 0; i < 2; i++) {
          state.particles.push({
            x: state.ship.x + Math.cos(angle) * 0.015,
            y: state.ship.y + Math.sin(angle) * 0.015,
            vx: Math.cos(angle) * 0.003 + (Math.random() - 0.5) * 0.002,
            vy: Math.sin(angle) * 0.003 + (Math.random() - 0.5) * 0.002,
            life: 1,
          });
        }
      }

      // Check proximity to constellations
      let nearest: { name: string; dist: number } | null = null;
      for (const c of CONSTELLATIONS) {
        const dx = c.x - state.ship.x;
        const dy = c.y - state.ship.y;
        const dist = Math.hypot(dx, dy);
        if (dist < INTERACTION_RADIUS) {
          if (!nearest || dist < nearest.dist) {
            nearest = { name: c.name, dist };
          }
        }
      }
      state.nearestConstellation = nearest ? (nearest as any).name : null;

      // Drawing
      ctx.fillStyle = '#080d1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Background stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      for (let i = 0; i < 200; i++) {
        const x = ((i * 7919) % 1000) / 1000;
        const y = ((i * 7919 * 2) % 750) / 750;
        const sx = (x - state.camera.x) * canvas.width;
        const sy = (y - state.camera.y) * canvas.height;
        if (sx > -10 && sx < canvas.width + 10 && sy > -10 && sy < canvas.height + 10) {
          const size = 0.5 + ((i % 3) * 0.3);
          ctx.fillRect(sx, sy, size, size);
        }
      }

      // Constellations
      CONSTELLATIONS.forEach(c => {
        const cx = (c.x - state.camera.x) * canvas.width;
        const cy = (c.y - state.camera.y) * canvas.height;

        // Lines
        ctx.strokeStyle = state.nearestConstellation === c.name ? 'rgba(167, 139, 250, 0.6)' : 'rgba(167, 139, 250, 0.2)';
        ctx.lineWidth = 2;
        c.lines.forEach(([i, j]) => {
          const s1 = c.stars[i];
          const s2 = c.stars[j];
          ctx.beginPath();
          ctx.moveTo(cx + s1.x * 150, cy + s1.y * 150);
          ctx.lineTo(cx + s2.x * 150, cy + s2.y * 150);
          ctx.stroke();
        });

        // Stars
        c.stars.forEach(star => {
          const sx = cx + star.x * 150;
          const sy = cy + star.y * 150;
          const r = state.nearestConstellation === c.name ? 4 : 2.5;
          ctx.fillStyle = state.nearestConstellation === c.name ? '#fbbf24' : '#e0e7ff';
          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fill();
        });

        // Label
        ctx.font = state.nearestConstellation === c.name ? 'bold 12px Outfit' : '11px Outfit';
        ctx.fillStyle = state.nearestConstellation === c.name ? '#fbbf24' : '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText(`${c.emoji} ${c.name}`, cx, cy - 60);

        // Glow when near
        if (state.nearestConstellation === c.name) {
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(cx, cy, 80, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Particles
      state.particles.forEach(p => {
        const px = (p.x - state.camera.x) * canvas.width;
        const py = (p.y - state.camera.y) * canvas.height;
        ctx.fillStyle = `rgba(34, 211, 238, ${p.life * 0.5})`;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Ship
      const sx = (state.ship.x - state.camera.x) * canvas.width;
      const sy = (state.ship.y - state.camera.y) * canvas.height;

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(state.ship.angle);

      // Body
      ctx.fillStyle = '#a78bfa';
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(-8, -6);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-8, 6);
      ctx.closePath();
      ctx.fill();

      // Cockpit
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.arc(6, 0, 3, 0, Math.PI * 2);
      ctx.fill();

      // Thrust flame
      if (state.keys.up) {
        ctx.fillStyle = 'rgba(34, 211, 238, 0.7)';
        ctx.beginPath();
        ctx.moveTo(-4, 0);
        ctx.lineTo(-14, -3);
        ctx.lineTo(-14, 3);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(249, 115, 22, 0.5)';
        ctx.beginPath();
        ctx.moveTo(-4, 0);
        ctx.lineTo(-18, -2);
        ctx.lineTo(-18, 2);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();

      // HUD
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px Outfit';
      ctx.fillText('ARROW KEYS / WASD to pilot | SPACE to interact', 10, 25);
      ctx.fillText(`📍 ${(state.ship.x * 100).toFixed(0)}%, ${(state.ship.y * 100).toFixed(0)}%`, 10, 45);
      if (state.nearestConstellation) {
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`⚡ PRESS SPACE to visit ${state.nearestConstellation}`, canvas.width / 2 - 150, canvas.height - 20);
      }

      animId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const selectedInfo = selected ? CONSTELLATIONS_INFO[selected] : null;

  return (
    <div className="min-h-screen w-full relative">
      <canvas
        ref={canvasRef}
        className="w-full h-screen block cursor-crosshair"
      />

      {/* Info Panel */}
      <AnimatePresence>
        {selectedInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:w-96 card p-5 max-w-md"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Constellation</p>
                <h3 className="text-white font-bold text-xl">{selected}</h3>
              </div>
              <button
                onClick={() => {
                  setSelected(null);
                  gameStateRef.current.selectedConstellation = null;
                }}
                className="text-slate-500 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-3">{selectedInfo.description}</p>
            <span className="pill pill-primary text-[10px]">Best viewed: {selectedInfo.season}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
