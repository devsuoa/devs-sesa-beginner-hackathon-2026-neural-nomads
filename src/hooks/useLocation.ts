import { useState, useEffect } from 'react';

export interface LocationData {
  lat: number;
  lon: number;
  city: string;
  country: string;
  loading: boolean;
  error: string | null;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationData>({
    lat: -36.8485, // Auckland default
    lon: 174.7633,
    city: 'Auckland',
    country: 'New Zealand',
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({ ...prev, loading: false, error: 'Geolocation not supported' }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || 'Your Location';
          const country = data.address?.country || '';
          setLocation({ lat: latitude, lon: longitude, city, country, loading: false, error: null });
        } catch {
          setLocation({
            lat: latitude,
            lon: longitude,
            city: 'Your Location',
            country: '',
            loading: false,
            error: null,
          });
        }
      },
      (err) => {
        console.warn('Geolocation denied:', err.message);
        setLocation(prev => ({ ...prev, loading: false, error: null })); // keep Auckland default
      },
      { timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  return location;
}
