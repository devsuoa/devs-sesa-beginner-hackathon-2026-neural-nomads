import { motion } from 'framer-motion';
import type { HourlyWeather } from '../hooks/useWeather';

interface Props {
  hourly: HourlyWeather[];
  date: Date;
}

export default function CloudChart({ hourly, date }: Props) {
  // Filter to evening hours of the selected date (18:00 - 06:00 next day)
  const relevantHours = hourly.filter(h => {
    const hDate = new Date(h.time);
    const hDay = hDate.getDate();
    const hHour = hDate.getHours();
    const targetDay = date.getDate();
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);

    return (hDay === targetDay && hHour >= 18) ||
           (hDay === nextDay.getDate() && hHour <= 6);
  }).slice(0, 13); // max 13 hours (6pm to 6am)

  if (relevantHours.length === 0) {
    return (
      <div className="text-center text-muted-text text-sm py-4">
        Hourly data not available
      </div>
    );
  }

  const maxCloud = 100;
  const chartHeight = 60;

  return (
    <div className="mt-4">
      <div className="text-xs text-muted-text mb-2 flex items-center gap-2">
        <span>☁️</span>
        <span>Cloud cover — evening to dawn</span>
      </div>
      <div className="flex items-end gap-0.5 h-16">
        {relevantHours.map((h, i) => {
          const hDate = new Date(h.time);
          const hour = hDate.getHours();
          const label = hour === 0 ? 'Mid' : hour === 6 ? '6AM' : hour % 3 === 0 ? `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'PM' : 'AM'}` : '';
          const barHeight = Math.max(4, (h.cloudCover / maxCloud) * chartHeight);
          const color = h.cloudCover < 25 ? '#22d3ee' : h.cloudCover < 50 ? '#8b5cf6' : h.cloudCover < 75 ? '#f59e0b' : '#ef4444';

          return (
            <div key={h.time} className="flex-1 flex flex-col items-center gap-1" title={`${hour}:00 — ${h.cloudCover}% cloud`}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: barHeight }}
                transition={{ delay: i * 0.04, duration: 0.5 }}
                className="w-full rounded-t-sm"
                style={{ backgroundColor: color, opacity: 0.8 }}
              />
              {label && (
                <span className="text-[9px] text-muted-text leading-none">{label}</span>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[9px] text-muted-text mt-1">
        <span className="text-cyan-400">■ Clear</span>
        <span className="text-purple-400">■ Some cloud</span>
        <span className="text-amber-400">■ Mostly cloudy</span>
        <span className="text-red-400">■ Overcast</span>
      </div>
    </div>
  );
}
