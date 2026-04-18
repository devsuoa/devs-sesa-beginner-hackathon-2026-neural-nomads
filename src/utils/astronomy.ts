/**
 * Astronomy calculations using the astronomy-engine library (NASA/JPL derived)
 * for accurate real-time planet positions, and known astronomical constants
 * for moon phases and meteor shower dates.
 */
import * as Astronomy from 'astronomy-engine';

export interface MoonData {
  phase: number;
  phaseName: string;
  illumination: number;
  emoji: string;
  description: string;
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
  altitude?: number; // degrees above horizon
}

export interface MeteorShower {
  name: string;
  active: boolean;
  peak: string;
  ratePerHour: number;
  description: string;
  constellation: string;
  emoji: string;
  upcoming?: boolean;
}

export interface DayScore {
  date: Date;
  dayName: string;
  moonScore: number;
  weatherScore: number;
  totalScore: number;
  cloudCover: number;
  moonIllumination: number;
  recommendation: string;
  label: 'Best' | 'Good' | 'Fair' | 'Poor';
}

// ── Moon Phase (accurate via astronomy-engine) ──────────────────────────────

export function getMoonPhase(date: Date): MoonData {
  const illum = Astronomy.Illumination(Astronomy.Body.Moon, date);
  const phase = illum.phase_fraction; // 0–1 (0=new, 0.5=full)

  // Accurate illumination from phase fraction: 50*(1 - cos(phase*2π))
  const simpleIllum = Math.round(50 * (1 - Math.cos(phase * 2 * Math.PI)));

  // Age in days since last new moon
  const lastNew = Astronomy.SearchMoonPhase(0, date, -30);
  const ageInDays = lastNew ? (date.getTime() - lastNew.date.getTime()) / 86400000 : phase * 29.53;

  let phaseName: string;
  let emoji: string;
  let description: string;

  if (phase < 0.03 || phase > 0.97) {
    phaseName = 'New Moon';
    emoji = '🌑';
    description = "You couldn't ask for better — the moon is completely dark tonight. No moonlight washing out the sky, so you can see incredibly faint objects like galaxies and nebulae with binoculars.";
  } else if (phase < 0.12) {
    phaseName = 'Waxing Crescent';
    emoji = '🌒';
    description = "A thin sliver of moon sets a couple of hours after sunset. Once it dips below the horizon, the rest of the night is beautifully dark for stargazing.";
  } else if (phase < 0.25) {
    phaseName = 'First Quarter';
    emoji = '🌓';
    description = "Half the moon is lit and it sets around midnight. The evening is a bit bright, but after midnight the skies darken up nicely for serious stargazing.";
  } else if (phase < 0.48) {
    phaseName = 'Waxing Gibbous';
    emoji = '🌔';
    description = "The moon is getting bright — it'll dominate the evening sky and make fainter objects harder to spot. Good night for planets and bright star clusters though.";
  } else if (phase < 0.52) {
    phaseName = 'Full Moon';
    emoji = '🌕';
    description = "Full moon tonight! It's gorgeous to look at — try a telescope on the craters along the terminator line. But for deep-sky objects, the moonlight is pretty overwhelming.";
  } else if (phase < 0.63) {
    phaseName = 'Waning Gibbous';
    emoji = '🌖';
    description = "Moon rises a few hours after sunset, so early evening is actually decent for stargazing before it comes up. After that it gets pretty bright.";
  } else if (phase < 0.77) {
    phaseName = 'Last Quarter';
    emoji = '🌗';
    description = "Half moon rises around midnight — so the whole evening before that is dark and excellent. Get out early and enjoy several hours of dark sky.";
  } else {
    phaseName = 'Waning Crescent';
    emoji = '🌘';
    description = "Thin crescent doesn't rise until the small hours before dawn. Almost the whole night is dark — great conditions tonight.";
  }

  return { phase, phaseName, illumination: simpleIllum, emoji, description, ageInDays };
}

// ── Moon Score ───────────────────────────────────────────────────────────────

export function getMoonScore(illumination: number): number {
  return Math.max(0, Math.round(10 * (1 - illumination / 100)));
}

// ── Real Planet Positions (astronomy-engine) ─────────────────────────────────

export function getVisiblePlanets(date: Date, lat: number, lon: number = 174.76): Planet[] {
  const observer = new Astronomy.Observer(lat, lon, 0);

  const planetDefs: Array<{
    body: Astronomy.Body;
    name: string;
    emoji: string;
    color: string;
    description: string;
  }> = [
    {
      body: Astronomy.Body.Venus,
      name: 'Venus',
      emoji: '♀️',
      color: 'text-yellow-200',
      description: "The brightest thing in the sky after the Moon — you can't miss it. Venus is so bright it can actually cast faint shadows on a moonless night. It never wanders far from the Sun, so catch it low on the horizon near sunrise or sunset.",
    },
    {
      body: Astronomy.Body.Jupiter,
      name: 'Jupiter',
      emoji: '♃',
      color: 'text-orange-200',
      description: "Look for a steady, cream-coloured beacon that doesn't twinkle — that's Jupiter. Through binoculars you can see four tiny dots lined up beside it: Io, Europa, Ganymede and Callisto. The same moons Galileo spotted in 1610.",
    },
    {
      body: Astronomy.Body.Saturn,
      name: 'Saturn',
      emoji: '♄',
      color: 'text-yellow-400',
      description: "Saturn is the pale golden 'star' that never quite twinkles. Even a cheap department-store telescope will show you the rings — it's the moment that turns kids (and adults) into astronomy obsessives.",
    },
    {
      body: Astronomy.Body.Mars,
      name: 'Mars',
      emoji: '♂️',
      color: 'text-red-400',
      description: "Distinctly reddish-orange — once you know what you're looking for, Mars is unmistakable. It gets much brighter every 26 months at opposition. Currently it's visible as a steady orange star, not twinkling like the others.",
    },
    {
      body: Astronomy.Body.Mercury,
      name: 'Mercury',
      emoji: '☿',
      color: 'text-slate-300',
      description: "Mercury is the planet most people have never seen, even though it's visible with the naked eye. You'll need to look very close to the horizon in the 20 minutes before full darkness — it moves fast and is gone before you know it.",
    },
  ];

  return planetDefs.map(def => {
    try {
      const equator = Astronomy.Equator(def.body, date, observer, true, true);
      const horizon = Astronomy.Horizon(date, observer, equator.ra, equator.dec, 'normal');
      const altitude = horizon.altitude;
      const azimuth = horizon.azimuth;

      // Illumination magnitude approximation
      const illum = Astronomy.Illumination(def.body, date);
      const magnitude = Math.round(illum.mag * 10) / 10;

      // Visible if above 10° elevation (practical limit with horizon obstructions)
      const visible = altitude > 10;

      // Cardinal direction from azimuth
      const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'];
      const direction = dirs[Math.round(azimuth / 45) % 8];

      // Best time to view (when it's highest in sky)
      const transit = Astronomy.SearchHourAngle(def.body, observer, 0, date, 1);
      const bestTime = transit
        ? transit.time.date.toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit', hour12: true })
        : 'check tonight';

      return {
        ...def,
        visible,
        direction: `${direction} (${Math.round(azimuth)}°)`,
        bestTime: visible ? `Best at ${bestTime} — ${Math.round(altitude)}° altitude` : 'Below horizon tonight',
        magnitude,
        altitude: Math.round(altitude),
      };
    } catch {
      // If calculation fails, mark as not calculable
      return {
        ...def,
        visible: false,
        direction: 'Calculating...',
        bestTime: 'Data unavailable',
        magnitude: 0,
        altitude: 0,
      };
    }
  });
}

// ── Meteor Showers (real annual dates) ──────────────────────────────────────

export function getMeteorShowers(date: Date): MeteorShower[] {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const d = month * 100 + day;

  const showers: MeteorShower[] = [
    { name: 'Quadrantids', active: d >= 101 && d <= 105, upcoming: d >= 1226 || d <= 101, peak: 'Jan 3–4', ratePerHour: 120, description: 'One of the strongest showers of the year but has a very narrow peak — often just a few hours of high rates. Blue-tinted meteors from a dead comet called 2003 EH1.', constellation: 'Boötes', emoji: '☄️' },
    { name: 'Lyrids', active: d >= 416 && d <= 425, upcoming: d >= 410 && d <= 416, peak: 'Apr 22–23', ratePerHour: 20, description: 'Debris trail from Comet Thatcher, which last visited the inner solar system in 1861. Occasional bright fireballs are the highlight.', constellation: 'Lyra', emoji: '⭐' },
    { name: 'Eta Aquariids', active: d >= 501 && d <= 510, upcoming: d >= 425 && d <= 501, peak: 'May 6–7', ratePerHour: 50, description: "Halley's Comet sheds these every year. Actually better from the Southern Hemisphere because the radiant point rises high — lucky for us.", constellation: 'Aquarius', emoji: '🌠' },
    { name: 'Perseids', active: d >= 811 && d <= 813, upcoming: d >= 801 && d <= 811, peak: 'Aug 11–13', ratePerHour: 100, description: "The most popular meteor shower in the world — warm summer nights (northern), reliable rates, and occasional fireballs that light up the whole sky. Worth setting an alarm.", constellation: 'Perseus', emoji: '🌟' },
    { name: 'Orionids', active: d >= 1020 && d <= 1022, upcoming: d >= 1015 && d <= 1020, peak: 'Oct 21–22', ratePerHour: 25, description: "Also from Halley's Comet. Swift meteors that often leave glowing trails behind them for a second or two.", constellation: 'Orion', emoji: '🔭' },
    { name: 'Leonids', active: d >= 1117 && d <= 1118, upcoming: d >= 1112 && d <= 1117, peak: 'Nov 17–18', ratePerHour: 15, description: 'Normally modest, but every 33 years it turns into a storm — thousands per hour. The 1966 storm produced 40 meteors per *second*. Next storm due around 2031.', constellation: 'Leo', emoji: '🦁' },
    { name: 'Geminids', active: d >= 1213 && d <= 1215, upcoming: d >= 1207 && d <= 1213, peak: 'Dec 13–14', ratePerHour: 150, description: 'Arguably the best shower of the year — more meteors than Perseids, and they\'re slower so easier to see. The only major shower from an asteroid (3200 Phaethon), not a comet.', constellation: 'Gemini', emoji: '✨' },
    { name: 'Ursids', active: d >= 1222 && d <= 1223, upcoming: d >= 1218 && d <= 1222, peak: 'Dec 22–23', ratePerHour: 10, description: 'A quiet shower right around the solstice — worth a look if you\'re outside on a clear winter night and can find Ursa Minor (near the North Star).', constellation: 'Ursa Minor', emoji: '🐻' },
  ];

  return showers;
}

// ── Day Score ────────────────────────────────────────────────────────────────

export function calculateDayScore(date: Date, cloudCover: number, lightPollutionIndex = 3): DayScore {
  const moon = getMoonPhase(date);
  const moonScore = getMoonScore(moon.illumination);
  const weatherScore = Math.max(0, Math.round(10 * (1 - cloudCover / 100)));
  const totalScore = Math.max(0, Math.min(10, Math.round(
    moonScore * 0.35 + weatherScore * 0.55 + (10 - lightPollutionIndex) * 0.10
  )));

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const isToday = date.toDateString() === new Date().toDateString();

  let label: 'Best' | 'Good' | 'Fair' | 'Poor';
  let recommendation: string;

  if (totalScore >= 7) {
    label = 'Best';
    recommendation = cloudCover < 20
      ? 'Near-perfect skies tonight. Pack the telescope and head somewhere dark.'
      : 'Moon is playing nice. Some cloud but should clear — worth the trip.';
  } else if (totalScore >= 5) {
    label = 'Good';
    recommendation = cloudCover > 50
      ? 'Decent night — patchy cloud but the dark moon helps a lot. Check again closer to the time.'
      : 'Good conditions. Not perfect, but bring binoculars and you\'ll have fun.';
  } else if (totalScore >= 3) {
    label = 'Fair';
    recommendation = moon.illumination > 60
      ? 'Moon is quite bright — stick to planets and the moon itself. Skip the galaxy hunting.'
      : 'Mostly cloudy. Maybe worth a quick look, but don\'t drive far for this one.';
  } else {
    label = 'Poor';
    recommendation = cloudCover > 80
      ? 'Heavy cloud tonight. Best stayed home — try the telescope in the backyard another night.'
      : 'Full moon and patchy cloud. Not ideal at all.';
  }

  return {
    date,
    dayName: isToday ? 'Tonight' : dayNames[date.getDay()],
    moonScore,
    weatherScore,
    totalScore,
    cloudCover,
    moonIllumination: moon.illumination,
    recommendation,
    label,
  };
}

// ── Constellations ───────────────────────────────────────────────────────────

export function getConstellations(date: Date) {
  const season = getSeason(date);
  return [
    {
      name: 'Southern Cross (Crux)',
      description: "The Southern Cross is the most recognisable constellation in the Southern Hemisphere — it's literally on our flag. Look south for four bright stars forming a cross. The long axis points roughly toward the South Celestial Pole. No southern star sits right at the pole (unlike Polaris in the north), so Kiwis use this cross to find south.",
      emoji: '✚',
      season: 'Autumn/Winter',
    },
    {
      name: 'Orion the Hunter',
      description: "Orion appears upside-down from New Zealand compared to how people see it in the Northern Hemisphere — so Rigel is at the top, not the bottom. Look for the three-star belt: that's the most recognisable line in the night sky. The whole constellation is enormous and contains some amazing nebulae.",
      emoji: '⚔️',
      season: 'Summer',
    },
    {
      name: 'Scorpius',
      description: "A gorgeous S-shaped arc of stars curving across the winter sky. The heart of the scorpion is Antares — a red supergiant so large that if you put it where our Sun is, it would swallow Mercury, Venus, Earth, and Mars whole. Look for the reddish-orange tinge.",
      emoji: '🦂',
      season: 'Winter',
    },
    {
      name: 'Sagittarius (The Teapot)',
      description: "The teapot shape of Sagittarius sits right at the heart of the Milky Way. When you stare at it, you're looking toward the galactic centre — about 26,000 light-years away. On a dark night, the fuzzy 'steam' rising from the teapot spout is actually the densest part of our galaxy.",
      emoji: '🏹',
      season: 'Winter',
    },
    {
      name: 'Centaurus',
      description: "Contains the closest star system to Earth: Alpha Centauri, just 4.37 light-years away. What looks like a single bright star is actually three stars — Alpha Centauri A, B, and the tiny red dwarf Proxima Centauri (the actual closest). Also home to Omega Centauri, the largest globular cluster you can see without a telescope.",
      emoji: '🐎',
      season: 'Autumn/Winter',
    },
    {
      name: 'Milky Way Band',
      description: "On a moonless night away from city lights, you can see the actual band of our galaxy arching across the sky — billions of stars blurring together into a glowing river of light. NZ is genuinely one of the best places in the world to see it. July and August are peak season. Stare at it for a while — your eyes will pick out more and more detail.",
      emoji: '🌌',
      season: 'Winter',
    },
    {
      name: 'Magellanic Clouds',
      description: "Two fuzzy patches near the Southern Cross that look like detached bits of Milky Way. They're not — they're entire satellite galaxies orbiting ours. The Large Magellanic Cloud (LMC) is about 160,000 light-years away; the Small one about 200,000. Completely invisible from the Northern Hemisphere.",
      emoji: '☁️',
      season: 'All year',
    },
    {
      name: 'Canopus',
      description: "The second brightest star in the night sky — right here in our backyard. Canopus is circumpolar from New Zealand, meaning it never sets below our horizon. Ancient Polynesian navigators used it to find latitude. It's 310 light-years away and pumps out 10,000 times more light than our Sun.",
      emoji: '⭐',
      season: 'All year',
    },
  ].sort((a, b) => {
    const aPri = a.season.includes(season) || a.season === 'All year' ? 0 : 1;
    const bPri = b.season.includes(season) || b.season === 'All year' ? 0 : 1;
    return aPri - bPri;
  });
}

export function getSeason(date: Date): string {
  const m = date.getMonth() + 1;
  if (m >= 12 || m <= 2) return 'Summer';
  if (m >= 3 && m <= 5) return 'Autumn';
  if (m >= 6 && m <= 8) return 'Winter';
  return 'Spring';
}
