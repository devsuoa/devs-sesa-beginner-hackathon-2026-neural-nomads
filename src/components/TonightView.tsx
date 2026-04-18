import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getMoonPhase, getVisiblePlanets, getMeteorShowers, getConstellations, getSeason } from '../utils/astronomy';
import type { ISSPosition } from '../hooks/useISS';
import MoonVisual from './MoonVisual';

interface TonightViewProps {
  userLat: number;
  userLon: number;
  city: string;
  iss: ISSPosition;
}


/* ─── Moon Card ─── */
function MoonCard() {
  const moon = getMoonPhase(new Date());

  const nextNewMoon = getNextEventDate(0);
  const nextFullMoon = getNextEventDate(0.5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 glass-hover col-span-1 sm:col-span-2 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
      <div className="text-xs font-semibold text-secondary uppercase tracking-widest mb-3">🌙 Moon Phase Tonight</div>

      <div className="flex flex-col sm:flex-row gap-6 items-start">
        {/* Moon visual */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <MoonVisual size={130} animate={true} />
        </div>

        {/* Info */}
        <div className="flex-1">
          <h3 className="text-2xl font-black text-light-text mb-1">{moon.phaseName}</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="bg-amber-500/15 border border-amber-500/25 text-amber-300 text-xs px-2.5 py-1 rounded-full font-medium">
              {moon.illumination}% illuminated
            </span>
            <span className="bg-white/8 border border-white/10 text-muted-text text-xs px-2.5 py-1 rounded-full">
              Day {Math.round(moon.ageInDays)} of 29.5
            </span>
          </div>
          <p className="text-muted-text text-sm leading-relaxed mb-4">{moon.description}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-lg mb-1">🌑</div>
              <div className="text-xs text-muted-text mb-0.5">Next New Moon</div>
              <div className="text-sm font-bold text-light-text">{nextNewMoon}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-lg mb-1">🌕</div>
              <div className="text-xs text-muted-text mb-0.5">Next Full Moon</div>
              <div className="text-sm font-bold text-light-text">{nextFullMoon}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Moonrise tip */}
      <div className="mt-4 pt-4 border-t border-white/8 flex items-start gap-2 text-xs text-muted-text">
        <span className="text-amber-400 text-base flex-shrink-0">💡</span>
        <span>
          {moon.illumination < 25
            ? 'Dark sky conditions tonight — ideal for deep sky objects, Milky Way, and faint nebulae.'
            : moon.illumination < 60
            ? 'Moderate moonlight. Great for planets, the moon itself, and bright star clusters.'
            : 'Bright moon tonight. Focus on lunar observation and the planets — the moonlight is too bright for faint objects.'}
        </span>
      </div>
    </motion.div>
  );
}

/* ─── ISS Card ─── */
function ISSCard({ iss }: { iss: ISSPosition }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass rounded-2xl p-6 glass-hover relative overflow-hidden"
    >
      {/* Live indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-bold text-emerald-400">LIVE</span>
      </div>

      <div className="absolute bottom-0 right-0 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="text-xs font-semibold text-secondary uppercase tracking-widest mb-3">🛸 International Space Station</div>

      {iss.loading ? (
        <div className="flex items-center gap-2 text-muted-text text-sm h-20">
          <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
          Tracking ISS position…
        </div>
      ) : (
        <>
          {/* Status badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold mb-3 ${
            iss.visible
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-white/8 text-muted-text border border-white/10'
          }`}>
            {iss.visible ? '👁️ Potentially visible now!' : '🌍 Currently below your horizon'}
          </div>

          <p className="text-muted-text text-sm leading-relaxed mb-4">
            {iss.visible
              ? `The ISS is only ${iss.distanceKm.toLocaleString()} km away right now! Scan the sky for a bright, fast-moving point of light — it crosses the sky in about 6 minutes and outshines most stars.`
              : `The ISS is ${iss.distanceKm.toLocaleString()} km away. It orbits Earth every 90 minutes at ${iss.velocity.toLocaleString()} km/h — faster than a bullet. It'll be back soon!`
            }
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: 'Altitude', value: `${iss.altitude} km`, icon: '📡' },
              { label: 'Speed', value: `${iss.velocity.toLocaleString()} km/h`, icon: '⚡' },
              { label: 'Distance', value: `${iss.distanceKm.toLocaleString()} km`, icon: '📍' },
            ].map(s => (
              <div key={s.label} className="bg-white/5 rounded-xl p-2 text-center">
                <div className="text-sm mb-1">{s.icon}</div>
                <div className="text-xs font-bold text-light-text">{s.value}</div>
                <div className="text-[10px] text-muted-text">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ISS position */}
          <div className="flex items-center gap-1.5 text-xs text-muted-text mb-3">
            <span>📡</span>
            <span>ISS position: {iss.latitude.toFixed(2)}°, {iss.longitude.toFixed(2)}°</span>
            <span className="ml-auto opacity-50">Updated {tick}s ago</span>
          </div>

          <a
            href="https://spotthestation.nasa.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-secondary hover:text-secondary/80 transition-colors font-medium"
          >
            <span>🚀</span>
            NASA Spot the Station — exact pass times for your location →
          </a>
        </>
      )}
    </motion.div>
  );
}

/* ─── Planets Card ─── */
function PlanetsCard({ lat, lon }: { lat: number; lon: number }) {
  const planets = getVisiblePlanets(new Date(), lat, lon);
  const [selected, setSelected] = useState<string | null>('Venus');
  const selectedPlanet = planets.find(p => p.name === selected);
  const visible = planets.filter(p => p.visible);
  const hidden = planets.filter(p => !p.visible);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass rounded-2xl p-6 glass-hover col-span-1 sm:col-span-2"
    >
      <div className="text-xs font-semibold text-secondary uppercase tracking-widest mb-2">🪐 Planets Visible Tonight</div>
      <h3 className="text-xl font-bold text-light-text mb-1">{visible.length} planet{visible.length !== 1 ? 's' : ''} in tonight's sky</h3>
      <p className="text-muted-text text-xs mb-4">Tap a planet for detailed viewing instructions</p>

      {/* Horizon dial */}
      <div className="relative h-24 mb-4 bg-gradient-to-t from-[#0F172A] to-transparent rounded-xl overflow-hidden border border-white/5">
        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
        {/* Horizon label */}
        <div className="absolute bottom-2 left-3 text-[10px] text-muted-text">HORIZON</div>
        {/* Mountain silhouette */}
        <svg className="absolute bottom-0 left-0 right-0 w-full h-16" viewBox="0 0 600 64" preserveAspectRatio="none">
          <path d="M0,64 L0,40 L60,30 L120,50 L200,15 L280,40 L360,20 L440,45 L520,25 L600,35 L600,64 Z" fill="#1e293b" />
        </svg>
        {/* Planet dots */}
        {visible.map((planet, i) => {
          const positions = [
            { left: '15%', bottom: '60%' },
            { left: '35%', bottom: '70%' },
            { left: '55%', bottom: '55%' },
            { left: '72%', bottom: '65%' },
            { left: '85%', bottom: '48%' },
          ];
          const pos = positions[i % positions.length];
          return (
            <button
              key={planet.name}
              onClick={() => setSelected(planet.name)}
              style={pos}
              className="absolute transform -translate-x-1/2 translate-y-1/2 flex flex-col items-center gap-0.5 group"
            >
              <div className={`w-3 h-3 rounded-full shadow-lg transition-transform group-hover:scale-125 ${
                selected === planet.name ? 'ring-2 ring-white scale-125' : ''
              }`}
                style={{
                  backgroundColor: planet.name === 'Venus' ? '#fef3c7'
                    : planet.name === 'Jupiter' ? '#fed7aa'
                    : planet.name === 'Saturn' ? '#fde68a'
                    : planet.name === 'Mars' ? '#fca5a5'
                    : '#e2e8f0',
                  boxShadow: `0 0 8px 2px ${
                    planet.name === 'Venus' ? 'rgba(254,243,199,0.6)'
                    : planet.name === 'Jupiter' ? 'rgba(253,215,170,0.5)'
                    : planet.name === 'Saturn' ? 'rgba(253,230,138,0.4)'
                    : planet.name === 'Mars' ? 'rgba(252,165,165,0.5)'
                    : 'rgba(226,232,240,0.3)'}`,
                }}
              />
              <span className="text-[9px] text-white/70 font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{planet.name}</span>
            </button>
          );
        })}
      </div>

      {/* Planet buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {visible.map(p => (
          <button
            key={p.name}
            onClick={() => setSelected(p.name)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
              selected === p.name
                ? 'bg-primary/30 border-primary/50 text-white'
                : 'glass border-white/10 text-muted-text hover:text-light-text'
            }`}
          >
            <span>{p.emoji}</span><span>{p.name}</span>
            <span className="text-[10px] text-emerald-400">✓</span>
          </button>
        ))}
        {hidden.map(p => (
          <button
            key={p.name}
            onClick={() => setSelected(p.name)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium opacity-40 glass border border-white/5 text-muted-text"
          >
            <span>{p.emoji}</span><span>{p.name}</span>
          </button>
        ))}
      </div>

      {/* Planet detail */}
      <AnimatePresence mode="wait">
        {selectedPlanet && (
          <motion.div
            key={selectedPlanet.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="bg-white/5 rounded-xl p-4"
          >
            <div className="flex items-start gap-3 mb-2">
              <span className="text-3xl">{selectedPlanet.emoji}</span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className={`font-bold text-base ${selectedPlanet.color}`}>{selectedPlanet.name}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    selectedPlanet.visible
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}>
                    {selectedPlanet.visible ? '● visible tonight' : '● not visible tonight'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-text mt-1">
                  {selectedPlanet.visible && (
                    <>
                      <span>📍 {selectedPlanet.direction}</span>
                      <span>🕐 {selectedPlanet.bestTime}</span>
                    </>
                  )}
                  <span>✨ Magnitude {selectedPlanet.magnitude}</span>
                </div>
              </div>
            </div>
            <p className="text-muted-text text-sm leading-relaxed">{selectedPlanet.description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Meteor Card ─── */
function MeteorCard() {
  const showers = getMeteorShowers(new Date());
  const active = showers.filter(s => s.active);
  const upcoming = (showers as any[]).filter(s => s.upcoming && !s.active);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass rounded-2xl p-6 glass-hover"
    >
      <div className="text-xs font-semibold text-secondary uppercase tracking-widest mb-2">☄️ Meteor Showers</div>

      {active.length > 0 ? (
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full">
            🔥 ACTIVE NOW — {active[0].ratePerHour} meteors/hour
          </div>
          {active.map(s => (
            <div key={s.name}>
              <h4 className="font-bold text-light-text text-base mb-1">{s.emoji} {s.name}</h4>
              <div className="text-xs text-muted-text mb-2">Peaks: {s.peak} · Radiates from {s.constellation}</div>
              <p className="text-sm text-muted-text leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <h4 className="font-bold text-light-text mb-2">No major shower active tonight</h4>
          <p className="text-muted-text text-sm mb-3">
            You can still see sporadic meteors — Earth constantly sweeps up debris. On average, you'll spot 5–10 per hour from a dark site.
          </p>
          {upcoming.length > 0 && (
            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-xs font-semibold text-primary mb-2">Coming up soon:</div>
              {upcoming.slice(0, 2).map((s: any) => (
                <div key={s.name} className="flex items-center justify-between text-sm py-1.5 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2">
                    <span>{s.emoji}</span>
                    <span className="text-light-text font-medium">{s.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-text">Peaks {s.peak}</div>
                    <div className="text-xs text-secondary">{s.ratePerHour}/hr at peak</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Viewing tip */}
      <div className="mt-4 bg-primary/10 border border-primary/20 rounded-xl p-3 text-xs text-muted-text">
        <strong className="text-primary">🎯 Viewing tip:</strong> Lie flat on your back. Let your eyes adjust for 20 minutes. No telescope — use your full field of view. Away from any light sources.
      </div>
    </motion.div>
  );
}

/* ─── Constellations Card ─── */
function ConstellationsCard({ lat }: { lat: number }) {
  const constellations = getConstellations(new Date());
  const season = getSeason(new Date());
  const [idx, setIdx] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="glass rounded-2xl p-6 glass-hover col-span-1 sm:col-span-2"
    >
      <div className="text-xs font-semibold text-secondary uppercase tracking-widest mb-1">✨ Constellations & Deep Sky</div>
      <h3 className="text-xl font-bold text-light-text mb-1">
        {lat < 0 ? '🇳🇿 Southern Hemisphere' : '🌐 Northern Hemisphere'} — {season} sky
      </h3>
      <p className="text-muted-text text-xs mb-4">Objects best placed in the sky tonight — no telescope needed for most!</p>

      {/* Scroll tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {constellations.map((c, i) => (
          <button
            key={c.name}
            onClick={() => setIdx(i)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              idx === i
                ? 'bg-primary text-white border-primary shadow-lg'
                : 'glass border-white/10 text-muted-text hover:text-light-text'
            }`}
          >
            {c.emoji} {c.name.split('(')[0].trim()}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.25 }}
          className="bg-white/5 border border-white/8 rounded-xl p-4"
        >
          <div className="flex gap-4">
            <span className="text-4xl">{constellations[idx]?.emoji}</span>
            <div>
              <h4 className="font-bold text-light-text mb-1">{constellations[idx]?.name}</h4>
              <span className="text-[10px] text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                Best in {constellations[idx]?.season}
              </span>
              <p className="text-muted-text text-sm leading-relaxed mt-2">{constellations[idx]?.description}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Matariki NZ special */}
      <div className="mt-4 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🌟</span>
          <div>
            <h4 className="font-bold text-light-text text-sm mb-1">Matariki — NZ's Star Cluster</h4>
            <p className="text-xs text-muted-text leading-relaxed">
              The Pleiades (Matariki in te reo Māori) rises in the pre-dawn sky each June, marking the Māori New Year.
              One of the most beautiful naked-eye clusters — find 6–7 stars in a tiny dipper shape.
              Matariki was officially adopted as a NZ public holiday in 2022, celebrating indigenous astronomy and culture.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Tonight Conditions Card ─── */
function ConditionsCard({ city }: { city: string }) {
  const now = new Date();
  const moon = getMoonPhase(now);

  const conditions = [
    {
      label: 'Limiting Magnitude',
      value: moon.illumination < 20 ? '6.5+' : moon.illumination < 50 ? '5.5' : '4.5',
      sub: moon.illumination < 20 ? 'Excellent — naked eye deep sky' : moon.illumination < 50 ? 'Good — most stars visible' : 'Reduced by moonlight',
      icon: '⭐',
      color: moon.illumination < 20 ? 'text-emerald-400' : moon.illumination < 50 ? 'text-blue-400' : 'text-amber-400',
    },
    {
      label: 'Bortle Scale',
      value: '4-5',
      sub: 'Rural/suburban fringe typical',
      icon: '💡',
      color: 'text-cyan-400',
    },
    {
      label: 'Seeing',
      value: 'Good',
      sub: 'Atmospheric stability tonight',
      icon: '🔭',
      color: 'text-primary',
    },
    {
      label: 'Transparency',
      value: moon.illumination < 30 ? 'Excellent' : 'Good',
      sub: 'Sky clarity for deep objects',
      icon: '🌌',
      color: moon.illumination < 30 ? 'text-emerald-400' : 'text-blue-400',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass rounded-2xl p-6 glass-hover"
    >
      <div className="text-xs font-semibold text-secondary uppercase tracking-widest mb-2">📊 Sky Conditions</div>
      <h3 className="text-xl font-bold text-light-text mb-4">Observing conditions for {city}</h3>

      <div className="space-y-3">
        {conditions.map(c => (
          <div key={c.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">{c.icon}</span>
              <div>
                <div className="text-sm font-medium text-light-text">{c.label}</div>
                <div className="text-xs text-muted-text">{c.sub}</div>
              </div>
            </div>
            <div className={`font-black text-lg ${c.color}`}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-muted-text bg-white/5 rounded-xl p-3">
        🌌 <strong className="text-light-text">Bortle Scale:</strong> A measure of sky darkness from 1 (perfect dark) to 9 (inner city). Most NZ suburbs are 5–6. Drive to a dark reserve for 2–3.
      </div>
    </motion.div>
  );
}

/* ─── Tips Card ─── */
function TipsCard() {
  const tips = [
    { emoji: '👁️', title: 'Dark Adaptation', tip: 'Your eyes take 20–30 minutes to fully adapt. Avoid any white lights during this time — even a brief phone check resets the clock.' },
    { emoji: '📱', title: 'Night Mode Only', tip: 'Switch your phone to night/red mode (iOS: Settings → Accessibility → Display → Colour Filters). Red light preserves your night vision.' },
    { emoji: '🗺️', title: 'Use Stellarium', tip: 'Stellarium (free app) shows your real sky in real time. Point your phone up and identify anything you can see instantly.' },
    { emoji: '👓', title: 'Binoculars First', tip: 'A good pair of 10×50 binoculars reveals more than a cheap telescope. Jupiter\'s moons, star clusters, and lunar craters all pop.' },
    { emoji: '🧥', title: 'Layer Up', tip: 'Standing still at 2 AM is surprisingly cold. Bring twice as many layers as you think you need — hypothermia ends stargazing sessions.' },
    { emoji: '🚗', title: 'Find the Dark', tip: 'Light pollution is the biggest obstacle. Driving 30–45 minutes from the CBD can increase how many stars you see from ~200 to 3,000+.' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="glass rounded-2xl p-6 glass-hover col-span-1 sm:col-span-2 lg:col-span-3"
    >
      <div className="text-xs font-semibold text-secondary uppercase tracking-widest mb-2">💡 Stargazer's Field Guide</div>
      <h3 className="text-xl font-bold text-light-text mb-4">Make the most of tonight</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tips.map(t => (
          <div key={t.title} className="bg-white/5 rounded-xl p-4 flex gap-3 hover:bg-white/8 transition-colors">
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

/* ─── Helpers ─── */
function getNextEventDate(targetPhase: number): string {
  const knownNewMoon = new Date('2024-01-11');
  const synodic = 29.53058867;
  const now = new Date();
  const diffDays = (now.getTime() - knownNewMoon.getTime()) / 86400000;
  const currentPhase = ((diffDays % synodic) + synodic) % synodic;
  const targetDays = targetPhase * synodic;
  const daysTo = targetDays > currentPhase ? targetDays - currentPhase : synodic - currentPhase + targetDays;
  const next = new Date(now.getTime() + daysTo * 86400000);
  return next.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' });
}

/* ─── Main ─── */
export default function TonightView({ userLat, userLon, city, iss }: TonightViewProps) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit', hour12: true });
  const moon = getMoonPhase(now);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-full px-4 py-1.5 text-sm text-secondary mb-4">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            Live sky conditions · {timeStr} · {city}
          </div>
          <h1 className="text-4xl sm:text-6xl font-black mb-3 leading-tight">
            <span className="text-light-text">Tonight in </span>
            <span className="text-gradient">Your Sky</span>
          </h1>
          <p className="text-muted-text text-lg max-w-2xl mx-auto">
            Everything you can see right now, explained in plain English. {moon.emoji} {moon.phaseName} · {moon.illumination}% illuminated.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <MoonCard />
          <ISSCard iss={iss} />
          <PlanetsCard lat={userLat} lon={userLon} />
          <MeteorCard />
          <ConditionsCard city={city} />
          <ConstellationsCard lat={userLat} />
          <TipsCard />
        </div>

        {/* Data credits */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="mt-8 text-center text-xs text-muted-text space-x-2"
        >
          <span>Data sources:</span>
          <span className="text-secondary">Open-Meteo API</span>
          <span>·</span>
          <span className="text-secondary">wheretheiss.at</span>
          <span>·</span>
          <span className="text-secondary">OpenStreetMap Nominatim</span>
          <span>·</span>
          <span className="text-secondary">JPL Horizons orbital mechanics</span>
        </motion.div>
      </div>
    </div>
  );
}
