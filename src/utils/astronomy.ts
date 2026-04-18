// Astronomy calculations for moon phase, planet visibility, meteor showers

export interface MoonData {
  phase: number; // 0-1 (0=new, 0.5=full)
  phaseName: string;
  illumination: number; // 0-100%
  emoji: string;
  description: string;
  riseTime: string;
  setTime: string;
  ageInDays: number;
}

export interface Planet {
  name: string;
  emoji: string;
  visible: boolean;
  direction: string;
  bestTime: string;
  magnitude: number;
  description: string;
  color: string;
}

export interface MeteorShower {
  name: string;
  active: boolean;
  peak: string;
  ratePerHour: number;
  description: string;
  constellation: string;
  emoji: string;
}

export interface ISSPass {
  risesAt: string;
  duration: number;
  maxElevation: number;
  direction: string;
}

export interface DayScore {
  date: Date;
  dayName: string;
  moonScore: number;    // 0-10 (10 = no moon = best)
  weatherScore: number; // 0-10 (10 = clear skies = best)
  totalScore: number;
  cloudCover: number;   // %
  moonIllumination: number; // %
  recommendation: string;
  label: 'Best' | 'Good' | 'Fair' | 'Poor';
}

// Moon phase calculation (based on known new moon reference)
export function getMoonPhase(date: Date): MoonData {
  const knownNewMoon = new Date('2024-01-11T11:57:00Z');
  const synodicPeriod = 29.53058867;

  const diffMs = date.getTime() - knownNewMoon.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const rawPhase = ((diffDays % synodicPeriod) + synodicPeriod) % synodicPeriod;
  const phase = rawPhase / synodicPeriod; // 0-1
  const ageInDays = rawPhase;

  // Illumination formula
  const illumination = Math.round(50 * (1 - Math.cos(2 * Math.PI * phase)));

  let phaseName: string;
  let emoji: string;
  let description: string;

  if (phase < 0.02 || phase > 0.98) {
    phaseName = 'New Moon';
    emoji = '🌑';
    description = 'The moon is not visible tonight — perfect for stargazing! No moonlight to wash out faint stars and deep-sky objects.';
  } else if (phase < 0.1) {
    phaseName = 'Waxing Crescent';
    emoji = '🌒';
    description = 'A thin crescent sets early in the evening. Great conditions for stargazing after 9 PM.';
  } else if (phase < 0.23) {
    phaseName = 'First Quarter';
    emoji = '🌓';
    description = 'Half moon visible in the evening sky, setting around midnight. Decent stargazing after it sets.';
  } else if (phase < 0.48) {
    phaseName = 'Waxing Gibbous';
    emoji = '🌔';
    description = 'Bright moon dominates the evening sky. Light pollution from the moon will reduce visibility.';
  } else if (phase < 0.52) {
    phaseName = 'Full Moon';
    emoji = '🌕';
    description = 'Full moon tonight — beautiful to observe the lunar surface, but stargazing is significantly hampered by moonlight.';
  } else if (phase < 0.65) {
    phaseName = 'Waning Gibbous';
    emoji = '🌖';
    description = 'Bright moon rises after midnight. Evening hours before moonrise offer good stargazing.';
  } else if (phase < 0.77) {
    phaseName = 'Last Quarter';
    emoji = '🌗';
    description = 'Half moon rises around midnight. Evenings are dark and excellent for stargazing.';
  } else if (phase < 0.9) {
    phaseName = 'Waning Crescent';
    emoji = '🌘';
    description = 'Thin crescent rises before dawn. Most of the night offers dark, clear skies for stargazing.';
  } else {
    phaseName = 'New Moon (approaching)';
    emoji = '🌑';
    description = 'Nearly new moon — excellent dark sky conditions throughout the night.';
  }

  // Approximate rise/set times based on phase
  const moonRiseHour = Math.round((phase * 24 + 18) % 24);
  const moonSetHour = Math.round((moonRiseHour + 12) % 24);
  const riseTime = `${moonRiseHour.toString().padStart(2, '0')}:${Math.round(Math.random() * 59).toString().padStart(2, '0')}`;
  const setTime = `${moonSetHour.toString().padStart(2, '0')}:${Math.round(Math.random() * 59).toString().padStart(2, '0')}`;

  return { phase, phaseName, illumination, emoji, description, riseTime, setTime, ageInDays };
}

// Score moon: lower illumination = better score
export function getMoonScore(illumination: number): number {
  return Math.round(10 * (1 - illumination / 100));
}

// Get currently active meteor showers
export function getMeteorShowers(date: Date): MeteorShower[] {
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();
  const dateNum = month * 100 + day; // e.g. 112 = Jan 12

  const showers: MeteorShower[] = [
    {
      name: 'Quadrantids',
      active: dateNum >= 101 && dateNum <= 105,
      peak: 'January 3-4',
      ratePerHour: 120,
      description: 'One of the strongest meteor showers, with bright blue meteors originating near the Big Dipper.',
      constellation: 'Boötes',
      emoji: '☄️',
    },
    {
      name: 'Lyrids',
      active: dateNum >= 416 && dateNum <= 425,
      peak: 'April 22-23',
      ratePerHour: 20,
      description: 'Ancient meteor shower creating bright, fast meteors with occasional fireballs.',
      constellation: 'Lyra',
      emoji: '⭐',
    },
    {
      name: 'Eta Aquariids',
      active: dateNum >= 501 && dateNum <= 510,
      peak: 'May 6-7',
      ratePerHour: 50,
      description: 'Debris from Halley\'s Comet, producing swift meteors best seen from the Southern Hemisphere.',
      constellation: 'Aquarius',
      emoji: '🌠',
    },
    {
      name: 'Perseids',
      active: dateNum >= 811 && dateNum <= 813,
      peak: 'August 11-13',
      ratePerHour: 100,
      description: 'The most popular meteor shower — prolific, reliable and with warm summer nights. A true crowd pleaser!',
      constellation: 'Perseus',
      emoji: '🌟',
    },
    {
      name: 'Orionids',
      active: dateNum >= 1020 && dateNum <= 1022,
      peak: 'October 21-22',
      ratePerHour: 25,
      description: 'Also from Halley\'s Comet, these meteors appear to radiate from near Orion\'s belt.',
      constellation: 'Orion',
      emoji: '🔭',
    },
    {
      name: 'Leonids',
      active: dateNum >= 1117 && dateNum <= 1118,
      peak: 'November 17-18',
      ratePerHour: 15,
      description: 'Can produce meteor storms once every 33 years. Usually modest but can show bright fireballs.',
      constellation: 'Leo',
      emoji: '🦁',
    },
    {
      name: 'Geminids',
      active: dateNum >= 1213 && dateNum <= 1215,
      peak: 'December 13-14',
      ratePerHour: 150,
      description: 'The most prolific and reliable annual meteor shower, with colorful, slow-moving meteors visible all night.',
      constellation: 'Gemini',
      emoji: '✨',
    },
    {
      name: 'Ursids',
      active: dateNum >= 1222 && dateNum <= 1223,
      peak: 'December 22-23',
      ratePerHour: 10,
      description: 'A Christmas meteor shower peaking right around the winter solstice, best seen from the Northern Hemisphere.',
      constellation: 'Ursa Minor',
      emoji: '🐻',
    },
  ];

  // Also add upcoming showers (within next 30 days)
  return showers.map(shower => {
    // Check if upcoming within 2 months
    const isUpcoming = !shower.active && (
      (shower.name === 'Perseids' && month >= 7 && month <= 8) ||
      (shower.name === 'Geminids' && month >= 11 && month <= 12) ||
      (shower.name === 'Eta Aquariids' && month >= 4 && month <= 5) ||
      (shower.name === 'Lyrids' && month === 4)
    );
    return { ...shower, upcoming: isUpcoming };
  });
}

// Planet visibility based on approximate positions (simplified)
export function getVisiblePlanets(date: Date, lat: number): Planet[] {
  const month = date.getMonth() + 1;

  // Simplified planet visibility calendar for Southern Hemisphere (NZ)
  // In a real app, this would use proper orbital mechanics
  const planets: Planet[] = [
    {
      name: 'Venus',
      emoji: '♀️',
      visible: true, // Venus is almost always visible as morning or evening star
      direction: month >= 3 && month <= 8 ? 'West (Evening Star)' : 'East (Morning Star)',
      bestTime: month >= 3 && month <= 8 ? 'After sunset, look West' : 'Before sunrise, look East',
      magnitude: -4.2,
      description: 'The brightest object in the night sky after the Moon! Venus is impossible to miss — it\'s the dazzling "star" that appears just after sunset or before dawn. At magnitude -4.2, it\'s bright enough to cast shadows.',
      color: 'text-yellow-200',
    },
    {
      name: 'Jupiter',
      emoji: '♃',
      visible: [3, 4, 5, 6, 7, 8, 9, 10].includes(month),
      direction: 'Northeast',
      bestTime: 'Midnight to 3 AM',
      magnitude: -2.5,
      description: 'King of planets! Jupiter shines like a brilliant cream-coloured beacon. With even basic binoculars you can see its four Galilean moons — the same moons Galileo discovered in 1610.',
      color: 'text-orange-200',
    },
    {
      name: 'Saturn',
      emoji: '♄',
      visible: [5, 6, 7, 8, 9, 10, 11].includes(month),
      direction: 'East to Northeast',
      bestTime: '10 PM to 2 AM',
      magnitude: 0.8,
      description: 'Saturn and its iconic rings are visible in binoculars, but even a small telescope reveals the rings clearly. Look for a steady golden "star" — it doesn\'t twinkle like real stars do.',
      color: 'text-yellow-400',
    },
    {
      name: 'Mars',
      emoji: '♂️',
      visible: [11, 12, 1, 2, 3].includes(month),
      direction: 'Northwest',
      bestTime: 'Just after sunset',
      magnitude: -1.2,
      description: 'The Red Planet lives up to its name — look for a distinctly reddish-orange "star" that doesn\'t twinkle. Mars reaches opposition every 26 months, when it\'s closest and brightest.',
      color: 'text-red-400',
    },
    {
      name: 'Mercury',
      emoji: '☿',
      visible: [3, 4, 9, 10].includes(month),
      direction: month <= 6 ? 'West after sunset' : 'East before sunrise',
      bestTime: '20-30 mins after sunset or before sunrise',
      magnitude: -1.0,
      description: 'Mercury is tricky to spot as it never strays far from the Sun. Look very low on the horizon in twilight — it\'s a fast-moving, pinkish star close to the horizon.',
      color: 'text-gray-300',
    },
  ];

  // Adjust for southern hemisphere
  if (lat < 0) {
    planets.forEach(p => {
      p.direction = p.direction.replace('North', 'South').replace('Northeast', 'Northwest');
    });
  }

  return planets;
}

// Calculate stargazing score for a given day
export function calculateDayScore(
  date: Date,
  cloudCover: number,
  lightPollutionIndex: number = 3
): DayScore {
  const moonData = getMoonPhase(date);
  const moonScore = getMoonScore(moonData.illumination);
  const weatherScore = Math.round(10 * (1 - cloudCover / 100));

  // Light pollution reduces score (1=rural, 10=city center)
  const lightPollutionPenalty = lightPollutionIndex * 0.3;

  const totalScore = Math.max(0, Math.round(
    (moonScore * 0.35 + weatherScore * 0.55 + (10 - lightPollutionIndex) * 0.1) - lightPollutionPenalty * 0.2
  ));

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  let label: 'Best' | 'Good' | 'Fair' | 'Poor';
  let recommendation: string;

  if (totalScore >= 7) {
    label = 'Best';
    recommendation = 'Excellent conditions! Pack your telescope and head out.';
  } else if (totalScore >= 5) {
    label = 'Good';
    recommendation = 'Good night for stargazing. Bring binoculars!';
  } else if (totalScore >= 3) {
    label = 'Fair';
    recommendation = 'Partial cloud cover or moonlight. Worth a look for bright objects.';
  } else {
    label = 'Poor';
    recommendation = 'Not ideal — clouds or bright moon. Try another night.';
  }

  return {
    date,
    dayName: date.toDateString() === new Date().toDateString() ? 'Tonight' : dayNames[date.getDay()],
    moonScore,
    weatherScore,
    totalScore,
    cloudCover,
    moonIllumination: moonData.illumination,
    recommendation,
    label,
  };
}

// Format time nicely
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit', hour12: true });
}

// Get season for Southern Hemisphere
export function getSeason(date: Date): string {
  const month = date.getMonth() + 1;
  if (month >= 12 || month <= 2) return 'Summer';
  if (month >= 3 && month <= 5) return 'Autumn';
  if (month >= 6 && month <= 8) return 'Winter';
  return 'Spring';
}

// What constellations are visible this time of year (Southern Hemisphere focus)
export function getConstellations(date: Date): Array<{ name: string; description: string; emoji: string; season: string }> {
  const season = getSeason(date);
  const all = [
    { name: 'Southern Cross (Crux)', description: 'The Southern Cross is the most iconic constellation in the Southern Hemisphere — it\'s even on the New Zealand flag! Look south for four bright stars forming a cross shape.', emoji: '✚', season: 'Autumn/Winter' },
    { name: 'Orion', description: 'The Hunter is visible upside-down from New Zealand! Look for the distinctive three-star belt. Rigel and Betelgeuse are its two brightest stars.', emoji: '⚔️', season: 'Summer' },
    { name: 'Scorpius', description: 'The Scorpion arcs beautifully across the winter sky. Antares, a giant red star at its heart, is one of the largest stars visible to the naked eye.', emoji: '🦂', season: 'Winter' },
    { name: 'Sagittarius', description: 'Known as "The Teapot," Sagittarius sits at the heart of the Milky Way. When you look at it, you\'re gazing towards the very centre of our galaxy.', emoji: '🏹', season: 'Winter' },
    { name: 'Centaurus', description: 'Contains Alpha Centauri — the closest star system to our Sun at just 4.37 light-years away. Nearby is Omega Centauri, the largest globular cluster visible to the naked eye.', emoji: '🐎', season: 'Autumn/Winter' },
    { name: 'The Milky Way', description: 'From dark New Zealand skies, the Milky Way is a spectacular river of stars stretching across the sky. Best seen June-August from a dark site away from city lights.', emoji: '🌌', season: 'Winter' },
    { name: 'Large Magellanic Cloud', description: 'A satellite galaxy of our Milky Way, visible as a fuzzy patch in dark skies. It\'s one of our closest galactic neighbours at about 160,000 light-years away.', emoji: '☁️', season: 'All year' },
    { name: 'Canopus', description: 'The second-brightest star in the night sky, Canopus is circumpolar from New Zealand — it never sets! It\'s 310 light-years away and 10,000 times more luminous than our Sun.', emoji: '⭐', season: 'All year' },
  ];

  // Filter and sort by season relevance
  return all.sort((a, b) => {
    const aMatch = a.season.includes(season) || a.season === 'All year' ? 0 : 1;
    const bMatch = b.season.includes(season) || b.season === 'All year' ? 0 : 1;
    return aMatch - bMatch;
  });
}
