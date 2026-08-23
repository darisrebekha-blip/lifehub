export interface WeatherData {
  city: string;
  country?: string;
  tempC: number;
  tempF: number;
  condition: string;
  iconSymbol: string; // Material symbol icon name
  humidity?: number;
  windSpeedKmH?: number;
}

export interface CitySearchResult {
  id: number;
  name: string;
  country?: string;
  admin1?: string; // State/Province
  latitude: number;
  longitude: number;
}

// Popular world cities for instant 1-tap selection
export const POPULAR_CITIES = [
  'Chennai',
  'New York',
  'London',
  'Tokyo',
  'Mumbai',
  'Dubai',
  'Paris',
  'Singapore',
  'Sydney',
  'Toronto',
  'San Francisco',
  'Bangalore',
  'Delhi',
  'Berlin',
  'Seoul'
];

/**
 * Search city suggestions using Open-Meteo Geocoding API
 */
export async function searchCities(query: string): Promise<CitySearchResult[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query.trim()
    )}&count=8&language=en&format=json`;
    const res = await fetch(geoUrl);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.results) return [];
    return data.results.map((r: any) => ({
      id: r.id,
      name: r.name,
      country: r.country,
      admin1: r.admin1,
      latitude: r.latitude,
      longitude: r.longitude
    }));
  } catch (err) {
    console.warn('City search error:', err);
    return [];
  }
}

/**
 * Fetch live real-time weather by latitude & longitude
 */
export async function fetchLiveWeatherByCoords(
  lat: number,
  lon: number,
  cityName: string,
  countryName?: string
): Promise<WeatherData> {
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) throw new Error('Failed to fetch weather data');
    const wData = await weatherRes.json();

    const current = wData.current;
    const tempC = Math.round(current.temperature_2m);
    const tempF = Math.round((tempC * 9) / 5 + 32);
    const humidity = current.relative_humidity_2m ? Math.round(current.relative_humidity_2m) : undefined;
    const windSpeedKmH = current.wind_speed_10m ? Math.round(current.wind_speed_10m) : undefined;
    const { condition, iconSymbol } = parseWeatherCode(current.weather_code);

    return {
      city: cityName,
      country: countryName,
      tempC,
      tempF,
      condition,
      iconSymbol,
      humidity,
      windSpeedKmH
    };
  } catch (err) {
    console.warn('Weather fetch error:', err);
    return {
      city: cityName,
      country: countryName,
      tempC: 28,
      tempF: 82,
      condition: 'Sunny',
      iconSymbol: 'wb_sunny'
    };
  }
}

/**
 * Fetch live weather automatically by city name
 */
export async function fetchWeatherForCity(cityName: string): Promise<WeatherData> {
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      cityName.trim()
    )}&count=1&language=en&format=json`;
    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) throw new Error('Failed to geocode location');
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error(`City "${cityName}" not found`);
    }

    const loc = geoData.results[0];
    const country = loc.country || '';
    const displayName = loc.name;

    return await fetchLiveWeatherByCoords(loc.latitude, loc.longitude, displayName, country);
  } catch (err) {
    console.warn('City lookup fallback:', err);
    return {
      city: cityName || 'Chennai',
      tempC: 28,
      tempF: 82,
      condition: 'Sunny',
      iconSymbol: 'wb_sunny'
    };
  }
}

/**
 * Fetch live weather for user's GPS coordinates with automatic reverse geocoding
 */
export async function fetchWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
  let resolvedCity = 'Current Location';
  let resolvedCountry = '';

  try {
    // Reverse geocode via BigDataCloud client-side free reverse geocoding
    const revUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const revRes = await fetch(revUrl);
    if (revRes.ok) {
      const revData = await revRes.json();
      resolvedCity = revData.city || revData.locality || revData.principalSubdivision || 'Current Location';
      resolvedCountry = revData.countryName || '';
    }
  } catch {
    // Fallback to coordinates
  }

  return await fetchLiveWeatherByCoords(lat, lon, resolvedCity, resolvedCountry);
}

/**
 * Convert WMO Weather Codes to Human-Readable conditions & icons
 */
function parseWeatherCode(code: number): { condition: string; iconSymbol: string } {
  if (code === 0) return { condition: 'Clear Sky', iconSymbol: 'wb_sunny' };
  if (code === 1) return { condition: 'Mainly Clear', iconSymbol: 'wb_sunny' };
  if (code === 2) return { condition: 'Partly Cloudy', iconSymbol: 'partly_cloudy_day' };
  if (code === 3) return { condition: 'Overcast', iconSymbol: 'cloud' };
  if (code === 45 || code === 48) return { condition: 'Foggy', iconSymbol: 'foggy' };
  if (code >= 51 && code <= 55) return { condition: 'Drizzle', iconSymbol: 'water_drop' };
  if (code >= 61 && code <= 65) return { condition: 'Rainy', iconSymbol: 'rainy' };
  if (code >= 66 && code <= 67) return { condition: 'Freezing Rain', iconSymbol: 'rainy' };
  if (code >= 71 && code <= 77) return { condition: 'Snowfall', iconSymbol: 'ac_unit' };
  if (code >= 80 && code <= 82) return { condition: 'Rain Showers', iconSymbol: 'rainy' };
  if (code === 85 || code === 86) return { condition: 'Snow Showers', iconSymbol: 'ac_unit' };
  if (code === 95) return { condition: 'Thunderstorm', iconSymbol: 'thunderstorm' };
  if (code >= 96) return { condition: 'Severe Thunderstorm', iconSymbol: 'thunderstorm' };

  return { condition: 'Sunny', iconSymbol: 'wb_sunny' };
}
