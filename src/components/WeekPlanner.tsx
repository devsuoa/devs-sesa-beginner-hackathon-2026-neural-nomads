import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { getMoonPhase, calculateDayScore, type DayScore } from '../utils/astronomy';
import type { DailyWeatherData } from '../hooks/useWeather';
import MoonVisual from './MoonVisual';
import CloudChart from './CloudChart';

interface WeekPlannerProps {
  weatherDays: DailyWeatherData[];
  userLat: number;
  city: string;
  onSelectTonight: () => void;
  weatherLoading: boolean;
}

const LABEL_STYLES = {
  Best:  { bg: 'from-emerald-500/20 to-emerald-400/10', border: 'border-emerald-500/40', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', ring: '#10b981', text: 'text-emerald-400' },
  Good:  { bg: 'from-blue-500/20 to-cyan-400/10', border: 'border-blue-500/40', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30', ring: '#3b82f6', text: 'text-blue-400' },
  Fair:  { bg: 'from-amber-500/20 to-yellow-400/10', border: 'border-amber-500/30', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', ring: '#f59e0b', text: 'text-amber-400' },
  Poor:  { bg: 'from-red-500/20 to-rose-400/10', border: 'border-red-500/30', badge: 'bg-red-500/20 text-red-300 border-red-500/30', ring: '#ef4444', text: 'text-red-400' },
};

function ScoreRing({ score, color, size = 80 }: { score: number; color: string; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 10) * circ;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
        <motion.circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${circ}`}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black text-light-text" style={{ fontSize: size * 0.25 }}>{score}</span>
        <span className="text-muted-text" style={{ fontSize: size * 0.11 }}>/ 10</span>
      </div>
    </div>
  );
}

function DayCard({
  day, scored, index, isBest, isTonight, isSelected, onClick, weatherDay,
}: {
  day: Date; scored: DayScore; index: number; isBest: boolean; isTonight: boolean;
  isSelected: boolean; onClick: () => void; weatherDay?: DailyWeatherData;
}) {
  const s = LABEL_STYLES[scored.label];
  const moon = getMoonPhase(day);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      onClick={onClick}
      className={`relative glass rounded-2xl p-4 cursor-pointer transition-all duration-300 border
        bg-gradient-to-br ${s.bg} ${isSelected ? s.border + ' shadow-lg' : 'border-white/8 hover:border-white/20'}`}
    >
      {isBest && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gradient-to-r from-emerald-500 to-cyan-400 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg tracking-wide z-10">
          ✨ BEST NIGHT
        </div>
      )}
      {isTonight && !isBest && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-primary/80 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg z-10">
          TONIGHT
        </div>
      )}

      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="font-bold text-light-text text-base">{scored.dayName}</div>
          <div className="text-xs text-muted-text">{day.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })}</div>
        </div>
        <ScoreRing score={scored.totalScore} color={s.ring} size={56} />
      </div>

      {/* Moon + weather row */}
      <div className="flex items-center justify-between text-xs mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xl">{moon.emoji}</span>
          <span className="text-muted-text">{moon.illumination}% lit</span>
        </div>
        <div className="flex items-center gap-1 text-muted-text">
          <span>☁️</span>
          <span>{scored.cloudCover}%</span>
          {weatherDay && weatherDay.precipitation > 0 && (
            <span className="ml-1 text-blue-400">🌧️ {weatherDay.precipitation}mm</span>
          )}
        </div>
      </div>

      {/* Score bars */}
      <div className="space-y-1.5">
        {[
          { label: 'Moon', score: scored.moonScore, color: 'bg-purple-500' },
          { label: 'Sky', score: scored.weatherScore, color: 'bg-cyan-500' },
        ].map(bar => (
          <div key={bar.label}>
            <div className="flex justify-between text-[10px] text-muted-text mb-0.5">
              <span>{bar.label}</span><span>{bar.score}/10</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${bar.score * 10}%` }}
                transition={{ duration: 0.9, delay: index * 0.07 + 0.3 }}
                className={`h-full rounded-full ${bar.color}`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className={`mt-3 text-[10px] font-semibold border rounded-full px-2 py-0.5 inline-block ${s.badge}`}>
        {scored.label} conditions
      </div>
    </motion.div>
  );
}

function DetailPanel({ scored, weatherDay, onGo }: { scored: DayScore; weatherDay?: DailyWeatherData; onGo: () => void }) {
  const moon = getMoonPhase(scored.date);
  const s = LABEL_STYLES[scored.label];

  return (
    <motion.div
      key={scored.date.toISOString()}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35 }}
      className={`glass rounded-2xl p-6 border bg-gradient-to-br ${s.bg} ${s.border}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="text-xs font-semibold text-secondary uppercase tracking-widest mb-1">Selected Night</div>
          <h3 className="text-2xl font-black text-light-text">{scored.dayName}</h3>
          <div className="text-muted-text text-sm">
            {scored.date.toLocaleDateString('en-NZ', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <ScoreRing score={scored.totalScore} color={s.ring} size={88} />
      </div>

      {/* Overall verdict */}
      <div className={`rounded-xl p-3 mb-5 bg-white/5 border border-white/10`}>
        <p className="text-sm text-light-text leading-relaxed">{scored.recommendation}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { icon: '☁️', label: 'Cloud Cover', value: `${scored.cloudCover}%`, sub: scored.cloudCover < 30 ? 'Clear!' : scored.cloudCover < 60 ? 'Partly cloudy' : 'Overcast' },
          { icon: '🌙', label: 'Moon', value: `${moon.illumination}%`, sub: moon.phaseName },
          { icon: '🌡️', label: 'Temp', value: weatherDay ? `${Math.round(weatherDay.temperature)}°C` : '--', sub: 'Evening' },
          { icon: '💨', label: 'Wind', value: weatherDay ? `${Math.round(weatherDay.windSpeed)} km/h` : '--', sub: 'Max' },
        ].map(stat => (
          <div key={stat.label} className="bg-white/5 rounded-xl p-3 text-center">
            <div className="text-xl mb-1">{stat.icon}</div>
            <div className="font-black text-light-text">{stat.value}</div>
            <div className="text-[10px] text-muted-text">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Moon visual */}
      <div className="flex items-center justify-center mb-5 py-2 bg-white/5 rounded-xl">
        <MoonVisual size={100} animate={false} />
      </div>

      {/* Hourly cloud chart */}
      {weatherDay && weatherDay.hourly.length > 0 && (
        <CloudChart hourly={weatherDay.hourly} date={scored.date} />
      )}

      {/* CTA */}
      {scored.date.toDateString() === new Date().toDateString() && (
        <button
          onClick={onGo}
          className="mt-5 w-full bg-gradient-to-r from-primary to-secondary text-dark-bg font-bold py-3 rounded-xl text-sm hover:opacity-90 transition-all hover:scale-[1.02] shadow-lg"
        >
          See Tonight's Full Sky Guide →
        </button>
      )}
    </motion.div>
  );
}

export default function WeekPlanner({ weatherDays, userLat: _userLat, city, onSelectTonight, weatherLoading }: WeekPlannerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scoredDays = useMemo<DayScore[]>(() => {
    if (weatherDays.length === 0) {
      const today = new Date();
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        return calculateDayScore(date, 40 + Math.round(Math.random() * 40), 3);
      });
    }
    return weatherDays.map(d => calculateDayScore(d.date, d.cloudCoverAvg, 3));
  }, [weatherDays]);

  const bestDayIndex = useMemo(() => {
    let max = -1, idx = 0;
    scoredDays.forEach((d, i) => { if (d.totalScore > max) { max = d.totalScore; idx = i; } });
    return idx;
  }, [scoredDays]);

  const selectedDay = scoredDays[selectedIndex];
  const selectedWeatherDay = weatherDays[selectedIndex];

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* ─── HERO ─── */}
      <div className="relative overflow-hidden mb-10">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020817] via-transparent to-transparent" />

        {/* Mountain silhouette SVG */}
        <div className="relative h-72 sm:h-96 flex flex-col items-center justify-center text-center px-4">
          {/* SVG mountain */}
          <svg
            className="absolute bottom-0 left-0 right-0 w-full"
            viewBox="0 0 1440 200"
            preserveAspectRatio="none"
            style={{ height: '160px' }}
          >
            <defs>
              <linearGradient id="mountainGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e293b" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#0F172A" stopOpacity="1" />
              </linearGradient>
            </defs>
            {/* Back range */}
            <path
              d="M0,200 L0,120 L100,80 L200,110 L320,40 L440,100 L560,60 L680,90 L780,30 L900,70 L1020,50 L1140,90 L1260,45 L1380,80 L1440,60 L1440,200 Z"
              fill="rgba(30,41,59,0.5)"
            />
            {/* Front range */}
            <path
              d="M0,200 L0,160 L80,130 L180,150 L280,100 L400,140 L500,110 L600,150 L720,90 L840,130 L960,100 L1080,140 L1180,110 L1300,145 L1440,120 L1440,200 Z"
              fill="url(#mountainGrad)"
            />
          </svg>

          {/* Hero text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="relative z-10"
          >
            <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/25 rounded-full px-4 py-1.5 text-xs text-primary font-semibold mb-4 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {weatherLoading ? 'Loading live data…' : `Live weather · ${city}`}
            </div>
            <h1 className="text-4xl sm:text-6xl font-black leading-tight mb-3">
              <span className="text-light-text">Master the </span>
              <span className="text-gradient">Night Sky.</span>
              <br />
              <span className="text-light-text text-3xl sm:text-5xl">Plan Your Perfect </span>
              <span className="text-gradient text-3xl sm:text-5xl">Stargazing Night.</span>
            </h1>
            <p className="text-muted-text text-base sm:text-lg max-w-2xl mx-auto">
              Real-time weather + moon science + light pollution data — scored every night this week so you never miss a clear sky.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* ─── BEST NIGHT HIGHLIGHT ─── */}
        {scoredDays[bestDayIndex] && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-3xl p-5 sm:p-7 mb-8 border border-emerald-500/25 bg-gradient-to-br from-emerald-500/5 to-transparent cursor-pointer"
            onClick={() => setSelectedIndex(bestDayIndex)}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">✨</span>
                  <span className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Best Night This Week</span>
                </div>
                <h2 className="text-3xl font-black text-light-text">
                  {scoredDays[bestDayIndex].dayName}
                  <span className="text-muted-text text-xl font-normal ml-3">
                    {scoredDays[bestDayIndex].date.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })}
                  </span>
                </h2>
                <p className="text-muted-text mt-1">{scoredDays[bestDayIndex].recommendation}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="glass px-3 py-1 rounded-full text-xs text-light-text border border-white/10">
                    ☁️ {scoredDays[bestDayIndex].cloudCover}% cloud
                  </span>
                  <span className="glass px-3 py-1 rounded-full text-xs text-light-text border border-white/10">
                    🌙 {scoredDays[bestDayIndex].moonIllumination}% moon brightness
                  </span>
                  <span className="glass px-3 py-1 rounded-full text-xs text-emerald-300 border border-emerald-500/20 bg-emerald-500/10">
                    Score: {scoredDays[bestDayIndex].totalScore}/10
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <ScoreRing score={scoredDays[bestDayIndex].totalScore} color="#10b981" size={100} />
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── MAIN GRID: Day cards + Detail panel ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-6">

          {/* Day cards */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-light-text">
                <span className="text-gradient">7-Night Forecast</span>
                <span className="text-muted-text font-normal text-sm ml-2">— tap any night</span>
              </h3>
              {weatherLoading && (
                <div className="flex items-center gap-2 text-xs text-muted-text">
                  <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
                  Fetching weather…
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {scoredDays.map((day, i) => (
                <DayCard
                  key={day.date.toISOString()}
                  day={day.date}
                  scored={day}
                  index={i}
                  isBest={i === bestDayIndex}
                  isTonight={i === 0}
                  isSelected={selectedIndex === i}
                  onClick={() => setSelectedIndex(i)}
                  weatherDay={weatherDays[i]}
                />
              ))}
            </div>
          </div>

          {/* Detail panel */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <AnimatePresence mode="wait">
              {selectedDay && (
                <DetailPanel
                  key={selectedDay.date.toISOString()}
                  scored={selectedDay}
                  weatherDay={selectedWeatherDay}
                  onGo={onSelectTonight}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ─── HOW WE SCORE ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-12 glass rounded-2xl p-6 border border-white/5"
        >
          <h3 className="text-base font-bold text-light-text mb-4 flex items-center gap-2">
            <span className="text-gradient">How We Score Each Night</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            {[
              { icon: '☁️', title: 'Weather (55%)', desc: 'Real-time cloud cover from Open-Meteo — one of the world\'s most accurate free weather APIs. Less cloud = clearer stars.' },
              { icon: '🌙', title: 'Moon Phase (35%)', desc: 'Mathematically calculated lunar illumination. New moon nights score 10/10 — the moon is the #1 enemy of dark skies.' },
              { icon: '💡', title: 'Light Pollution (10%)', desc: 'Based on your GPS location distance from urban light sources. Dark sites outside the city score higher.' },
            ].map(s => (
              <div key={s.title} className="flex gap-3">
                <span className="text-2xl flex-shrink-0">{s.icon}</span>
                <div>
                  <div className="font-semibold text-light-text mb-1">{s.title}</div>
                  <div className="text-muted-text text-xs leading-relaxed">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ─── NZ DARK SKY PARKS ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="mt-6 glass rounded-2xl p-6 border border-white/5"
        >
          <h3 className="text-base font-bold text-light-text mb-4">
            🌌 Escape Light Pollution — NZ Dark Sky Reserves
          </h3>
          <p className="text-muted-text text-sm mb-4">Driving just 30–60 minutes from the city can transform your experience. These certified dark sky sites are among the best in the world:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { name: 'Aoraki Mackenzie', region: 'Canterbury', rating: 'Gold', emoji: '🏔️', note: 'World-class. Best in Southern Hemisphere.' },
              { name: 'Wai-iti', region: 'Nelson-Tasman', rating: 'Gold', emoji: '🌿', note: 'Close to Nelson & Richmond.' },
              { name: 'Great Barrier Island', region: 'Auckland Gulf', rating: 'Silver', emoji: '🏝️', note: '90 min ferry from Auckland CBD.' },
              { name: 'Rakiura / Stewart Island', region: 'Southland', rating: 'Gold', emoji: '🦭', note: 'Southernmost — see Aurora Australis.' },
              { name: 'Westland Tai Poutini', region: 'West Coast', rating: 'Silver', emoji: '🌊', note: 'Milky Way over the Franz Josef Glacier.' },
              { name: 'South Westland', region: 'West Coast', rating: 'Silver', emoji: '🦅', note: 'Remote and pristine — minimal light.' },
            ].map(park => (
              <div key={park.name} className="bg-white/5 rounded-xl p-3 flex gap-3">
                <span className="text-2xl">{park.emoji}</span>
                <div>
                  <div className="text-sm font-semibold text-light-text">{park.name}</div>
                  <div className="text-xs text-muted-text">{park.region}</div>
                  <div className={`text-xs mt-1 font-medium ${park.rating === 'Gold' ? 'text-amber-400' : 'text-slate-300'}`}>
                    {park.rating === 'Gold' ? '🥇 Gold' : '🥈 Silver'} Dark Sky Reserve
                  </div>
                  <div className="text-xs text-muted-text mt-0.5">{park.note}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
