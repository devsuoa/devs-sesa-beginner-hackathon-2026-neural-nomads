import { useState, useEffect } from 'react';

export interface ISSPosition {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  timestamp: number;
  visible: boolean;
  distanceKm: number;
  loading: boolean;
  error: string | null;
}

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isNighttime(_lat: number, lon: number): boolean {
  const now = new Date();
  const hour = now.getUTCHours() + lon / 15;
  const localHour = ((hour % 24) + 24) % 24;
  return localHour < 6 || localHour > 18;
}

export function useISS(userLat: number, userLon: number) {
  const [iss, setISS] = useState<ISSPosition>({
    latitude: 0,
    longitude: 0,
    altitude: 408,
    velocity: 27600,
    timestamp: 0,
    visible: false,
    distanceKm: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchISS = async () => {
      try {
        const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
        if (!res.ok) throw new Error('ISS API error');
        const data = await res.json();

        const distanceKm = getDistanceKm(userLat, userLon, data.latitude, data.longitude);
        // ISS is potentially visible when < 2000km and it's nighttime at the observer's location
        // and the ISS is over a lit area (approximate)
        const night = isNighttime(userLat, userLon);
        const visible = distanceKm < 2500 && night;

        setISS({
          latitude: data.latitude,
          longitude: data.longitude,
          altitude: Math.round(data.altitude),
          velocity: Math.round(data.velocity),
          timestamp: data.timestamp,
          visible,
          distanceKm: Math.round(distanceKm),
          loading: false,
          error: null,
        });
      } catch (err) {
        setISS(prev => ({ ...prev, loading: false, error: 'Could not fetch ISS position' }));
      }
    };

    fetchISS();
    const interval = setInterval(fetchISS, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [userLat, userLon]);

  return iss;
}
