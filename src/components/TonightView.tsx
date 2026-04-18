import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { getMoonPhase, getVisiblePlanets, getMeteorShowers, getConstellations, getSeason } from '../utils/astronomy';
import type { ISSPosition } from '../hooks/useISS';

interface TonightViewProps {
  userLat: number;
  userLon: number;
  city: string;
  iss: ISSPosition;
}

function MoonCard() {
  const now = new Date();
  const moon = getMoonPhase(now);
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass rounded-2xl p-6 glass-hover col-span-1 sm:col-span-2 cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-secondary uppercase tracking-widest mb-2">🌙 Moon Tonight</div>
          <h3 className="text-2xl font-black text-light-text mb-1">{moon.phaseName}</h3>
          <div className="text-4xl mb-3">{moon.emoji}</div>
          <p className="text-muted-text text-sm leading-relaxed max-w-md">{moon.description}</p>
        </div>
        <div className="flex-shrink-0 text-center">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15"
                fill="none"
                stroke={moon.illumination > 50 ? '#fcd34d' : '#94a3b8'}
                strokeWidth="3"
                strokeDasharray={`${(moon.illumination / 100) * 94.2} 94.2`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-black text-light-text">{moon.illumination}%</span>
              <span className="text-xs text-muted-text">lit</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-text">
            <div>Age: {Math.round(moon.ageInDays)} days</div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-white/10"
          >
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="glass rounded-xl p-3">
                <div className="text-lg mb-1">🌑</div>
                <div className="text-xs text-muted-text">New Moon</div>
                <div className="text-light-text font-semibold text-xs">{getNextNewMoon(now)}</div>
              </div>
              <div className="glass rounded-xl p-3">
                <div className="text-lg mb-1">🌕</div>
                <div className="text-xs text-muted-text">Full Moon</div>
                <div className="text-light-text font-semibold text-xs">{getNextFullMoon(now)}</div>
              </div>
              <div className="glass rounded-xl p-3">
                <div className="text-lg mb-1">⭐</div>
                <div className="text-xs text-muted-text">Best for stars</div>
                <div className="text-light-text font-semibold text-xs">After {moon.illumination > 50 ? '2 AM' : '10 PM'}</div>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-text">Tap to collapse</p>
          </motion.div>
        )}
      </AnimatePresence>
      {!expanded && <p className="mt-3 text-xs text-muted-text">Tap for more details</p>}
    </motion.div>
  );
}

function ISSCard({ iss }: { iss: ISSPosition }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass rounded-2xl p-6 glass-hover relative overflow-hidden"
    >
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs text-emerald-400 font-medium">LIVE</span>
      </div>
      <div className="text-xs font-semibold text-secondary uppercase tracking-widest mb-2">🛸 ISS Position</div>

      {iss.loading ? (
        <div className="flex items-center gap-2 text-muted-text text-sm mt-4">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Tracking satellite...
        </div>
      ) : iss.error ? (
        <p className="text-red-400 text-sm mt-2">{iss.error}</p>
      ) : (
        <>
          <div className={`text-lg font-bold mb-2 ${iss.visible ? 'text-emerald-400' : 'text-light-text'}`}>
            {iss.visible ? '👁️ Potentially visible now!' : '🌍 Over the other side of Earth'}
          </div>
          <p className="text-muted-text text-sm leading-relaxed mb-4">
            {iss.visible
              ? `The ISS is currently ${iss.distanceKm.toLocaleString()} km from you and it's nighttime — look for a fast-moving bright dot crossing the sky! It travels at ${iss.velocity.toLocaleString()} km/h.`
              : `The ISS is currently ${iss.distanceKm.toLocaleString()} km away. It orbits Earth every 90 minutes, so it could pass over within the hour. Check NASA's Spot the Station for exact pass times.`
            }
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="glass rounded-lg p-2 text-center">
              <div className="text-muted-text mb-1">Altitude</div>
              <div className="font-bold text-light-text">{iss.altitude} km</div>
            </div>
            <div className="glass rounded-lg p-2 text-center">
              <div className="text-muted-text mb-1">Speed</div>
              <div className="font-bold text-light-text">{iss.velocity.toLocaleString()} km/h</div>
            </div>
          </div>
          <div className="mt-3 text-xs text-muted-text flex items-center gap-1">
            <span>📍</span>
            <span>ISS lat: {iss.latitude.toFixed(2)}°, lon: {iss.longitude.toFixed(2)}°</span>
          </div>
          <a
            href="https://spotthestation.nasa.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-xs text-secondary hover:underline"
          >
            NASA Spot the Station for exact pass times →
          </a>
        </>
      )}
    </motion.div>
  );
}

function PlanetsCard({ lat }: { lat: number }) {
  const planets = getVisiblePlanets(new Date(), lat);
  const [selected, setSelected] = useState<string | null>(null);
  const selectedPlanet = planets.find(p => p.name === selected);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="glass rounded-2xl p-6 glass-hover col-span-1 sm:col-span-2"
    >
      <div className="text-xs font-semibold text-secondary uppercase tracking-widest mb-2">🪐 Visible Planets</div>
      <h3 className="text-xl font-bold text-light-text mb-4">What planets can you see tonight?</h3>

      <div className="grid grid-cols-5 gap-2 mb-4">
        {planets.map(planet => (
          <button
            key={planet.name}
            onClick={() => setSelected(selected === planet.name ? null : planet.name)}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200 ${
              planet.visible
                ? selected === planet.name
                  ? 'bg-primary/30 border border-primary/50'
                  : 'glass-hover glass border border-white/10'
                : 'opacity-40 glass border border-white/5'
            }`}
          >
            <span className="text-2xl">{planet.emoji}</span>
            <span className="text-xs font-medium text-light-text">{planet.name}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
              planet.visible ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
            }`}>
              {planet.visible ? 'visible' : 'hidden'}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {selectedPlanet && (
          <motion.div
            key={selectedPlanet.name}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/10 pt-4"
          >
            <div className="flex items-start gap-4">
              <span className="text-4xl">{selectedPlanet.emoji}</span>
              <div>
                <h4 className={`font-bold text-lg ${selectedPlanet.color}`}>{selectedPlanet.name}</h4>
                <div className="flex gap-3 text-xs text-muted-text mb-2">
                  <span>📍 {selectedPlanet.direction}</span>
                  <span>🕐 {selectedPlanet.bestTime}</span>
                  <span>✨ Mag {selectedPlanet.magnitude}</span>
                </div>
                <p className="text-muted-text text-sm leading-relaxed">{selectedPlanet.description}</p>
              </div>
            </div>
          </motion.div>
        )}
        {!selectedPlanet && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-muted-text">
            Tap a planet for details on how to find it tonight
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MeteorCard() {
  const showers = getMeteorShowers(new Date());
  const activeShowers = showers.filter(s => s.active);
  const upcomingShowers = showers.filter((s: any) => s.upcoming && !s.active);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass rounded-2xl p-6 glass-hover"
    >
      <div className="text-xs font-semibold text-secondary uppercase tracking-widest mb-2">☄️ Meteor Showers</div>
      {activeShowers.length > 0 ? (
        <>
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1 text-xs text-amber-300 font-semibold mb-3">
            🔥 ACTIVE NOW
          </div>
          {activeShowers.map(shower => (
            <div key={shower.name} className="mb-3">
              <h4 className="font-bold text-light-text">{shower.emoji} {shower.name}</h4>
              <div className="text-xs text-muted-text mb-1">Peak: {shower.peak} • Up to {shower.ratePerHour} meteors/hour</div>
              <p className="text-sm text-muted-text leading-relaxed">{shower.description}</p>
              <div className="mt-2 text-xs text-secondary">Look towards {shower.constellation}</div>
            </div>
          ))}
        </>
      ) : (
        <div>
          <p className="text-muted-text text-sm mb-3">No major meteor showers are active tonight. The sky is still beautiful — you may still see sporadic meteors throughout the night!</p>
          {upcomingShowers.length > 0 && (
            <div className="border-t border-white/10 pt-3">
              <div className="text-xs text-muted-text mb-2 font-medium">Coming soon:</div>
              {upcomingShowers.slice(0, 2).map(shower => (
                <div key={shower.name} className="flex items-center gap-2 text-sm py-1">
                  <span>{shower.emoji}</span>
                  <span className="text-light-text font-medium">{shower.name}</span>
                  <span className="text-muted-text text-xs">— peaks {shower.peak}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="mt-4 text-xs text-muted-text bg-white/5 rounded-xl p-3">
        💡 <strong className="text-light-text">Tip:</strong> Allow 20 minutes for your eyes to adjust to the dark. Lie on your back and look up — no telescope needed for meteors!
      </div>
    </motion.div>
  );
}

function ConstellationsCard({ lat }: { lat: number }) {
  const constellations = getConstellations(new Date());
  const season = getSeason(new Date());
  const [selected, setSelected] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="glass rounded-2xl p-6 glass-hover col-span-1 sm:col-span-2"
    >
      <div className="text-xs font-semibold text-secondary uppercase tracking-widest mb-2">✨ Constellations & Deep Sky</div>
      <h3 className="text-xl font-bold text-light-text mb-1">What to look for in {season}</h3>
      <p className="text-sm text-muted-text mb-4">
        {lat < 0 ? 'Southern Hemisphere view' : 'Northern Hemisphere view'} — these are best placed in the sky right now
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {constellations.map((c, i) => (
          <button
            key={c.name}
            onClick={() => setSelected(i)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
              selected === i
                ? 'bg-primary text-white shadow-lg'
                : 'glass border border-white/10 text-muted-text hover:text-light-text'
            }`}
          >
            {c.emoji} {c.name.split('(')[0].trim()}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3 }}
          className="bg-white/5 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <span className="text-4xl">{constellations[selected]?.emoji}</span>
            <div>
              <h4 className="font-bold text-light-text mb-1">{constellations[selected]?.name}</h4>
              <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">Best in {constellations[selected]?.season}</span>
              <p className="text-muted-text text-sm leading-relaxed mt-2">{constellations[selected]?.description}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

function TipsCard() {
  const tips = [
    { emoji: '👁️', tip: 'Dark adaptation takes 20–30 minutes. Avoid white lights — use red flashlights instead.', title: 'Dark Eyes' },
    { emoji: '📱', tip: 'Reduce your phone brightness and use night mode. White screens destroy your dark adaptation instantly!', title: 'Kill the Phone' },
    { emoji: '🗺️', tip: 'Use a star map app like Stellarium (free) to identify what you\'re seeing in real time.', title: 'Star Map App' },
    { emoji: '👓', tip: 'Binoculars reveal far more than the naked eye — craters on the moon, Jupiter\'s moons, star clusters.', title: 'Bring Binoculars' },
    { emoji: '🧥', tip: 'It\'s always colder than you think at 2 AM. Dress warmer than you think you need to.', title: 'Dress Warm' },
    { emoji: '🚗', tip: 'Drive 20–30 minutes from the city centre to dramatically improve sky darkness and double what you can see.', title: 'Escape Light Pollution' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="glass rounded-2xl p-6 glass-hover col-span-1 sm:col-span-2 lg:col-span-3"
    >
      <div className="text-xs font-semibold text-secondary uppercase tracking-widest mb-2">💡 Stargazer Tips</div>
      <h3 className="text-xl font-bold text-light-text mb-4">Make the most of tonight</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tips.map(t => (
          <div key={t.title} className="bg-white/5 rounded-xl p-4 flex gap-3">
            <span className="text-2xl flex-shrink-0">{t.emoji}</span>
            <div>
              <div className="font-semibold text-light-text text-sm mb-1">{t.title}</div>
              <p className="text-muted-text text-xs leading-relaxed">{t.tip}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// Simple date helpers
function getNextNewMoon(from: Date): string {
  const knownNewMoon = new Date('2024-01-11');
  const synodic = 29.53058867;
  const diffDays = (from.getTime() - knownNewMoon.getTime()) / 86400000;
  const phase = ((diffDays % synodic) + synodic) % synodic;
  const daysToNext = synodic - phase;
  const next = new Date(from.getTime() + daysToNext * 86400000);
  return next.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' });
}

function getNextFullMoon(from: Date): string {
  const knownNewMoon = new Date('2024-01-11');
  const synodic = 29.53058867;
  const diffDays = (from.getTime() - knownNewMoon.getTime()) / 86400000;
  const phase = ((diffDays % synodic) + synodic) % synodic;
  const halfSynodic = synodic / 2;
  const daysToFull = phase < halfSynodic ? halfSynodic - phase : synodic - phase + halfSynodic;
  const next = new Date(from.getTime() + daysToFull * 86400000);
  return next.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' });
}

export default function TonightView({ userLat, userLon: _userLon, city, iss }: TonightViewProps) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-full px-4 py-2 text-sm text-secondary mb-4">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            Live sky data — {timeStr} in {city}
          </div>
          <h1 className="text-4xl sm:text-6xl font-black mb-4 leading-tight">
            <span className="text-light-text">Tonight's</span>{' '}
            <span className="text-gradient">Sky Guide</span>
          </h1>
          <p className="text-muted-text text-lg max-w-2xl mx-auto leading-relaxed">
            Here's exactly what you can see in the sky tonight, explained in plain language.
            No astronomy degree required.
          </p>
        </motion.div>

        {/* Grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <MoonCard />
          <ISSCard iss={iss} />
          <PlanetsCard lat={userLat} />
          <MeteorCard />
          <ConstellationsCard lat={userLat} />
          <TipsCard />
        </div>

        {/* Footer credit */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center text-xs text-muted-text"
        >
          Weather data: <span className="text-secondary">Open-Meteo API</span> •
          ISS tracking: <span className="text-secondary">wheretheiss.at API</span> •
          Location: <span className="text-secondary">OpenStreetMap Nominatim</span>
        </motion.div>
      </div>
    </div>
  );
}
