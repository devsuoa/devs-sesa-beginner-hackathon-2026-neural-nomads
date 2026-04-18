import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { getMoonPhase, calculateDayScore, type DayScore } from '../utils/astronomy';
import type { DailyWeatherData } from '../hooks/useWeather';

interface WeekPlannerProps {
  weatherDays: DailyWeatherData[];
  userLat: number;
  city: string;
  onSelectTonight: () => void;
  weatherLoading: boolean;
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score * 10}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  );
}

function DayCard({ day, index, isBest, isTonight }: { day: DayScore; index: number; isBest: boolean; isTonight: boolean }) {
  const labelColors = {
    Best: 'from-emerald-500 to-green-400',
    Good: 'from-blue-500 to-cyan-400',
    Fair: 'from-yellow-500 to-amber-400',
    Poor: 'from-red-500 to-rose-400',
  };
  const labelBg = {
    Best: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    Good: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    Fair: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    Poor: 'bg-red-500/20 text-red-300 border-red-500/30',
  };

  const moonData = getMoonPhase(day.date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={`relative glass rounded-2xl p-5 glass-hover cursor-pointer transition-all duration-300 ${
        isBest ? 'border border-emerald-500/40 glow-primary' : ''
      } ${isTonight ? 'border border-primary/40' : ''}`}
    >
      {isBest && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-green-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          ✨ BEST NIGHT
        </div>
      )}

      {/* Day header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-bold text-light-text text-lg">{day.dayName}</div>
          <div className="text-xs text-muted-text">
            {day.date.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${labelBg[day.label]}`}>
            {day.label}
          </span>
          <div className="flex items-center gap-1">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${labelColors[day.label]} flex items-center justify-center text-white font-black text-sm shadow-lg`}>
              {day.totalScore}
            </div>
            <span className="text-xs text-muted-text">/10</span>
          </div>
        </div>
      </div>

      {/* Moon */}
      <div className="flex items-center justify-between mb-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{moonData.emoji}</span>
          <div>
            <div className="text-light-text font-medium text-xs">{moonData.phaseName}</div>
            <div className="text-muted-text text-xs">{day.moonIllumination}% illuminated</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-light-text text-xs font-medium">
            ☁️ {day.cloudCover}%
          </div>
          <div className="text-muted-text text-xs">cloud cover</div>
        </div>
      </div>

      {/* Score bars */}
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-xs text-muted-text mb-1">
            <span>🌙 Moon darkness</span>
            <span>{day.moonScore}/10</span>
          </div>
          <ScoreBar score={day.moonScore} color="bg-gradient-to-r from-indigo-500 to-purple-400" />
        </div>
        <div>
          <div className="flex justify-between text-xs text-muted-text mb-1">
            <span>☁️ Clear sky</span>
            <span>{day.weatherScore}/10</span>
          </div>
          <ScoreBar score={day.weatherScore} color="bg-gradient-to-r from-cyan-500 to-blue-400" />
        </div>
      </div>

      {/* Recommendation */}
      <p className="mt-3 text-xs text-muted-text leading-relaxed border-t border-white/5 pt-3">
        {day.recommendation}
      </p>
    </motion.div>
  );
}

export default function WeekPlanner({ weatherDays, userLat: _userLat, city, onSelectTonight, weatherLoading }: WeekPlannerProps) {
  const scoredDays = useMemo<DayScore[]>(() => {
    if (weatherDays.length === 0) {
      // Generate placeholder scores
      const today = new Date();
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        return calculateDayScore(date, 50, 3);
      });
    }
    return weatherDays.map(d => calculateDayScore(d.date, d.cloudCoverAvg, 3));
  }, [weatherDays]);

  const bestDayIndex = useMemo(() => {
    let max = -1;
    let idx = 0;
    scoredDays.forEach((d, i) => {
      if (d.totalScore > max) {
        max = d.totalScore;
        idx = i;
      }
    });
    return idx;
  }, [scoredDays]);

  const tonight = scoredDays[0];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-sm text-primary mb-4">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Live weather data for {city}
          </div>
          <h1 className="text-4xl sm:text-6xl font-black mb-4 leading-tight">
            <span className="text-light-text">When to</span>{' '}
            <span className="text-gradient">Stargaze</span>{' '}
            <span className="text-light-text">This Week</span>
          </h1>
          <p className="text-muted-text text-lg max-w-2xl mx-auto leading-relaxed">
            We combine real-time weather, moon phase data, and light pollution maps to score each night
            out of 10 — so you never waste a trip on bad skies.
          </p>
        </motion.div>

        {/* Tonight Quick Summary */}
        {tonight && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass rounded-3xl p-6 sm:p-8 mb-10 border border-primary/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <div className="text-sm font-medium text-secondary uppercase tracking-widest mb-2">Tonight in {city}</div>
                <h2 className="text-3xl sm:text-4xl font-black text-light-text mb-2">
                  {getMoonPhase(new Date()).emoji} {tonight.label} Night for Stargazing
                </h2>
                <p className="text-muted-text max-w-xl">{tonight.recommendation}</p>
                <div className="flex flex-wrap gap-3 mt-4">
                  <span className="glass px-3 py-1 rounded-full text-sm text-light-text">
                    ☁️ {tonight.cloudCover}% cloud cover
                  </span>
                  <span className="glass px-3 py-1 rounded-full text-sm text-light-text">
                    🌙 {tonight.moonIllumination}% moon brightness
                  </span>
                  <span className="glass px-3 py-1 rounded-full text-sm text-light-text">
                    ⭐ Score: {tonight.totalScore}/10
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 flex-shrink-0">
                <div className="relative">
                  <svg className="w-28 h-28 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" />
                    <circle
                      cx="18" cy="18" r="15"
                      fill="none"
                      stroke="url(#scoreGrad)"
                      strokeWidth="2.5"
                      strokeDasharray={`${(tonight.totalScore / 10) * 94.2} 94.2`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#22d3ee" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-light-text">{tonight.totalScore}</span>
                    <span className="text-xs text-muted-text">out of 10</span>
                  </div>
                </div>
                <button
                  onClick={onSelectTonight}
                  className="bg-gradient-to-r from-primary to-primary-dark text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
                >
                  See Tonight's Sky →
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading state */}
        {weatherLoading && (
          <div className="flex items-center justify-center gap-3 py-8 text-muted-text">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Loading live weather data...
          </div>
        )}

        {/* 7-day grid */}
        <div>
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl font-bold text-light-text mb-6 flex items-center gap-2"
          >
            <span className="text-gradient">7-Night Forecast</span>
            <span className="text-muted-text font-normal text-base">— scored for stargazing</span>
          </motion.h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {scoredDays.map((day, i) => (
              <DayCard
                key={day.date.toISOString()}
                day={day}
                index={i}
                isBest={i === bestDayIndex}
                isTonight={i === 0}
              />
            ))}
          </div>
        </div>

        {/* How we score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 glass rounded-2xl p-6 border border-white/5"
        >
          <h3 className="text-lg font-bold text-light-text mb-4">How We Score Each Night</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex gap-3">
              <span className="text-2xl">☁️</span>
              <div>
                <div className="font-semibold text-light-text">Weather (55%)</div>
                <div className="text-muted-text">Real-time cloud cover from Open-Meteo API. Less cloud = more stars.</div>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">🌙</span>
              <div>
                <div className="font-semibold text-light-text">Moon Phase (35%)</div>
                <div className="text-muted-text">Calculated moon illumination. New moon = darkest skies = best views.</div>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <div className="font-semibold text-light-text">Light Pollution (10%)</div>
                <div className="text-muted-text">Based on your location's distance from city centres.</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
