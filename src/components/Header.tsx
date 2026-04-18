import { motion } from 'framer-motion';

interface HeaderProps {
  view: 'planner' | 'tonight';
  onViewChange: (view: 'planner' | 'tonight') => void;
  city: string;
  country: string;
}

export default function Header({ view, onViewChange, city, country }: HeaderProps) {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-3"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between glass rounded-2xl px-5 py-3">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl shadow-lg glow-primary">
              🔭
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-secondary animate-pulse" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-gradient leading-tight">StarGaze NZ</h1>
            <p className="text-xs text-muted-text leading-none">Your Personal Sky Guide</p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10">
          <button
            onClick={() => onViewChange('planner')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              view === 'planner'
                ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg'
                : 'text-muted-text hover:text-light-text'
            }`}
          >
            📅 Best Night
          </button>
          <button
            onClick={() => onViewChange('tonight')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              view === 'tonight'
                ? 'bg-gradient-to-r from-secondary-dark to-secondary text-dark-bg shadow-lg'
                : 'text-muted-text hover:text-light-text'
            }`}
          >
            🌙 Tonight's Sky
          </button>
        </div>

        {/* Location */}
        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-text">
          <span className="text-secondary">📍</span>
          <span className="font-medium text-light-text">{city}</span>
          {country && <span className="text-xs">{country}</span>}
        </div>
      </div>
    </motion.header>
  );
}
