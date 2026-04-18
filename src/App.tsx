import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import StarField from './components/StarField';
import Header from './components/Header';
import WeekPlanner from './components/WeekPlanner';
import TonightView from './components/TonightView';
import { useLocation } from './hooks/useLocation';
import { useWeather } from './hooks/useWeather';
import { useISS } from './hooks/useISS';

type View = 'planner' | 'tonight';

export default function App() {
  const [view, setView] = useState<View>('planner');
  const location = useLocation();
  const weather = useWeather(location.lat, location.lon);
  const iss = useISS(location.lat, location.lon);

  return (
    <div className="relative min-h-screen font-outfit">
      <StarField />

      <div className="relative z-10">
        <Header
          view={view}
          onViewChange={setView}
          city={location.city}
          country={location.country}
        />

        <AnimatePresence mode="wait">
          {view === 'planner' ? (
            <motion.div
              key="planner"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.4 }}
            >
              <WeekPlanner
                weatherDays={weather.days}
                userLat={location.lat}
                city={location.city}
                onSelectTonight={() => setView('tonight')}
                weatherLoading={weather.loading}
              />
            </motion.div>
          ) : (
            <motion.div
              key="tonight"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4 }}
            >
              <TonightView
                userLat={location.lat}
                userLon={location.lon}
                city={location.city}
                iss={iss}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
