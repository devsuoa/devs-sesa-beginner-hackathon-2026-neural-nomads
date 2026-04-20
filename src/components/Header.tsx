import { motion } from 'framer-motion';
import CitySearch from './CitySearch';

type View = 'planner' | 'tonight' | 'skymap' | 'explorer';

interface HeaderProps {
  view: View;
  onViewChange: (view: View) => void;
  city: string;
  country: string;
  onCitySelect: (lat: number, lon: number, city: string, country: string) => void;
}

const VIEWS: { id: View; label: string; short: string; gradient: 'primary' | 'secondary' }[] = [
  { id: 'planner', label: 'Best Night', short: 'Best', gradient: 'primary' },
  { id: 'tonight', label: "Tonight's Sky", short: 'Tonight', gradient: 'secondary' },
  { id: 'skymap', label: 'Sky Map', short: 'Map', gradient: 'primary' },
  { id: 'explorer', label: 'Explorer', short: 'Explore', gradient: 'primary' },
];

function ViewToggle({ view, onViewChange }: { view: View; onViewChange: (v: View) => void }) {
  return (
    <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/8 w-full md:w-auto overflow-x-auto no-scrollbar">
      {VIEWS.map(v => {
        const active = view === v.id;
        const activeBg = v.gradient === 'secondary'
          ? 'bg-gradient-to-r from-secondary-dark to-secondary text-dark-bg shadow-md'
          : 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-md';
        return (
          <button
            key={v.id}
            onClick={() => onViewChange(v.id)}
            className={`flex-1 md:flex-none px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
              active ? activeBg : 'text-muted-text hover:text-light-text'
            }`}
          >
            <span className="sm:hidden">{v.short}</span>
            <span className="hidden sm:inline">{v.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function Header({ view, onViewChange, city, country: _country, onCitySelect }: HeaderProps) {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 px-2 sm:px-3 py-2 sm:py-3"
    >
      <div className="max-w-7xl mx-auto glass rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5">
        {/* Top row: logo + (desktop) toggle + city — 3-col grid keeps toggle visually centred */}
        <div className="flex md:grid md:grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 shrink-0 md:justify-self-start">
            <div className="relative shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-base sm:text-lg shadow-lg">
                🔭
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-secondary border border-dark-bg animate-pulse" />
            </div>
            <div className="hidden sm:block min-w-0">
              <div className="text-base font-black text-gradient leading-tight truncate">StarGaze</div>
              <div className="text-[10px] text-muted-text leading-none">Your Personal Sky Guide</div>
            </div>
          </div>

          {/* View toggle — true centre column */}
          <div className="hidden md:flex md:justify-self-center">
            <ViewToggle view={view} onViewChange={onViewChange} />
          </div>

          {/* City search — right */}
          <div className="flex justify-end ml-auto md:ml-0 md:justify-self-end min-w-0 flex-1 md:flex-none md:w-72 max-w-[60%] md:max-w-none">
            <CitySearch onSelectCity={onCitySelect} currentCity={city} />
          </div>
        </div>

        {/* Mobile-only view toggle row */}
        <div className="md:hidden mt-2">
          <ViewToggle view={view} onViewChange={onViewChange} />
        </div>
      </div>
    </motion.header>
  );
}
