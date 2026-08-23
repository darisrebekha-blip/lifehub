import React, { useState, useEffect, useRef } from 'react';
import { UserProfileData } from '../types';
import {
  fetchWeatherForCity,
  fetchWeatherByCoords,
  fetchLiveWeatherByCoords,
  searchCities,
  CitySearchResult,
  POPULAR_CITIES,
  WeatherData
} from '../lib/weather';

interface ClimateModalProps {
  isOpen: boolean;
  profile: UserProfileData;
  onClose: () => void;
  onUpdateProfile: (updated: Partial<UserProfileData>) => void;
}

export const ClimateModal: React.FC<ClimateModalProps> = ({
  isOpen,
  profile,
  onClose,
  onUpdateProfile
}) => {
  const [searchQuery, setSearchQuery] = useState(
    profile.location && profile.location !== 'Add City' ? profile.location : ''
  );
  const [selectedCityName, setSelectedCityName] = useState(
    profile.location && profile.location !== 'Add City' ? profile.location : 'Chennai'
  );
  const [unit, setUnit] = useState<'C' | 'F'>(profile.tempUnit || 'C');
  const [weatherData, setWeatherData] = useState<WeatherData>({
    city: profile.location && profile.location !== 'Add City' ? profile.location : 'Chennai',
    tempC: profile.tempC ?? 28,
    tempF: profile.tempF ?? 82,
    condition: profile.weatherCondition || 'Sunny',
    iconSymbol: profile.weatherIconSymbol || 'wb_sunny'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<CitySearchResult[]>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);

  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Automatically fetch weather when modal opens if we have a city
  useEffect(() => {
    if (isOpen) {
      const initialCity =
        profile.location && profile.location !== 'Add City' ? profile.location : 'Chennai';
      setSelectedCityName(initialCity);
      setSearchQuery(initialCity);
      setUnit(profile.tempUnit || 'C');
      handleAutoLoadWeather(initialCity);
    }
  }, [isOpen]);

  // Handle outside click for suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestionsDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  // Auto load weather for a given city string
  const handleAutoLoadWeather = async (cityName: string) => {
    if (!cityName || !cityName.trim()) return;
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const data = await fetchWeatherForCity(cityName.trim());
      setWeatherData(data);
      setSelectedCityName(data.city + (data.country ? `, ${data.country}` : ''));
      setStatusMessage(`Live climate loaded for ${data.city}`);
    } catch {
      setStatusMessage('Unable to fetch live weather. Please check city name.');
    } finally {
      setIsLoading(false);
    }
  };

  // Search input change with debounced suggestions
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (val.trim().length >= 2) {
      setIsSearchingSuggestions(true);
      searchDebounceRef.current = setTimeout(async () => {
        const results = await searchCities(val.trim());
        setSuggestions(results);
        setIsSearchingSuggestions(false);
        setShowSuggestionsDropdown(results.length > 0);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestionsDropdown(false);
      setIsSearchingSuggestions(false);
    }
  };

  // User selects a suggestion from dropdown
  const handleSelectSuggestion = async (city: CitySearchResult) => {
    setShowSuggestionsDropdown(false);
    const displayLabel = city.name + (city.country ? `, ${city.country}` : '');
    setSearchQuery(displayLabel);
    setSelectedCityName(displayLabel);
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const data = await fetchLiveWeatherByCoords(
        city.latitude,
        city.longitude,
        city.name,
        city.country
      );
      setWeatherData(data);
      setStatusMessage(`Live climate updated for ${city.name}!`);
    } catch {
      setStatusMessage('Error fetching weather data.');
    } finally {
      setIsLoading(false);
    }
  };

  // 1-Click GPS Location detection
  const handleDetectGPSLocation = () => {
    if (!navigator.geolocation) {
      setStatusMessage('Geolocation is not supported by your browser.');
      return;
    }
    setIsLoading(true);
    setStatusMessage('Detecting your local city & weather...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const data = await fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
          setWeatherData(data);
          const displayLabel = data.city + (data.country ? `, ${data.country}` : '');
          setSearchQuery(displayLabel);
          setSelectedCityName(displayLabel);
          setStatusMessage(`Live climate detected for ${data.city}!`);
        } catch {
          setStatusMessage('Could not fetch weather for your location.');
        } finally {
          setIsLoading(false);
        }
      },
      () => {
        setIsLoading(false);
        setStatusMessage('Location access denied. You can search any city above.');
      },
      { timeout: 10000 }
    );
  };

  // 1-Tap Popular City selection
  const handleSelectPopularCity = async (cityName: string) => {
    setSearchQuery(cityName);
    setSelectedCityName(cityName);
    setShowSuggestionsDropdown(false);
    await handleAutoLoadWeather(cityName);
  };

  // Submit search directly (press Enter or Click Search)
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowSuggestionsDropdown(false);
    if (!searchQuery.trim()) return;
    await handleAutoLoadWeather(searchQuery.trim());
  };

  // Save selection
  const handleSaveAndApply = () => {
    const activeCity = selectedCityName || searchQuery.trim() || 'My City';
    const displayTemp = unit === 'C' ? `${weatherData.tempC}°C` : `${weatherData.tempF}°F`;

    onUpdateProfile({
      location: activeCity,
      tempC: weatherData.tempC,
      tempF: weatherData.tempF,
      tempUnit: unit,
      temperature: displayTemp,
      weatherCondition: weatherData.condition,
      weatherIconSymbol: weatherData.iconSymbol
    });
    onClose();
  };

  const currentDisplayTemp = unit === 'C' ? `${weatherData.tempC}°C` : `${weatherData.tempF}°F`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#181c24] border border-[#21262d] rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl space-y-4">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-2 border-b border-[#21262d]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#adc6ff]/10 text-[#adc6ff] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">routine</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#dfe2ee]">Automatic Climate Settings</h3>
              <p className="text-[11px] text-[#8c909f]">
                Select your city to get automatic live climate
              </p>
            </div>
          </div>
          <button
            id="close-climate-modal-btn"
            onClick={onClose}
            className="text-[#8c909f] hover:text-white cursor-pointer p-1.5 rounded-lg hover:bg-[#262a33]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Setting 1: Degree Unit Selector (°C vs °F) */}
        <div>
          <label className="block text-xs font-semibold text-[#c2c6d6] mb-1.5">
            Temperature Unit Setting
          </label>
          <div className="grid grid-cols-2 gap-2 bg-[#0a0e16] p-1 rounded-xl micro-border">
            <button
              id="select-celsius-btn"
              type="button"
              onClick={() => setUnit('C')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                unit === 'C'
                  ? 'bg-[#adc6ff] text-[#00285d] shadow-sm'
                  : 'text-[#8c909f] hover:text-[#dfe2ee]'
              }`}
            >
              <span className="text-sm font-mono">°C</span>
              <span>Celsius</span>
            </button>
            <button
              id="select-fahrenheit-btn"
              type="button"
              onClick={() => setUnit('F')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                unit === 'F'
                  ? 'bg-[#adc6ff] text-[#00285d] shadow-sm'
                  : 'text-[#8c909f] hover:text-[#dfe2ee]'
              }`}
            >
              <span className="text-sm font-mono">°F</span>
              <span>Fahrenheit</span>
            </button>
          </div>
        </div>

        {/* Setting 2: City Search with Autocomplete & Auto Live Fetch */}
        <div className="relative" ref={dropdownRef}>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold text-[#c2c6d6]">
              Select Your City
            </label>
            <button
              id="auto-detect-gps-btn"
              type="button"
              onClick={handleDetectGPSLocation}
              disabled={isLoading}
              className="text-[10px] text-[#adc6ff] hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <span className="material-symbols-outlined text-[12px]">my_location</span>
              Use Current Location
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="climate-city-search-input"
                type="text"
                placeholder="Type any city (e.g. Chennai, London, New York...)"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestionsDropdown(true);
                }}
                className="w-full bg-[#0a0e16] border border-[#424754] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#dfe2ee] focus:border-[#adc6ff] outline-none"
              />
              <span className="material-symbols-outlined text-[16px] text-[#8c909f] absolute left-3 top-1/2 -translate-y-1/2">
                location_city
              </span>
              {isSearchingSuggestions && (
                <span className="material-symbols-outlined text-[14px] text-[#adc6ff] animate-spin absolute right-3 top-1/2 -translate-y-1/2">
                  sync
                </span>
              )}
            </div>

            <button
              id="search-city-btn"
              type="submit"
              disabled={isLoading}
              className="px-3.5 py-2.5 bg-[#262a33] hover:bg-[#31353e] text-[#adc6ff] rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
            >
              {isLoading ? (
                <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
              ) : (
                <span className="material-symbols-outlined text-[16px]">search</span>
              )}
              <span>Find</span>
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {showSuggestionsDropdown && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#10141d] border border-[#21262d] rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto divide-y divide-[#21262d]">
              {suggestions.map((city) => (
                <button
                  key={`${city.id}-${city.name}`}
                  type="button"
                  onClick={() => handleSelectSuggestion(city)}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-[#181c24] flex items-center justify-between text-[#dfe2ee] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] text-[#adc6ff]">
                      pin_drop
                    </span>
                    <span className="font-semibold">{city.name}</span>
                    {city.admin1 && (
                      <span className="text-[10px] text-[#8c909f]">({city.admin1})</span>
                    )}
                  </div>
                  {city.country && (
                    <span className="text-[10px] text-[#adc6ff] bg-[#adc6ff]/10 px-1.5 py-0.5 rounded font-mono">
                      {city.country}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick 1-Tap Popular Cities */}
        <div>
          <label className="block text-[11px] font-semibold text-[#8c909f] mb-1.5">
            Or pick from popular cities:
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {POPULAR_CITIES.map((city) => {
              const isSelected = selectedCityName.toLowerCase().includes(city.toLowerCase());
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleSelectPopularCity(city)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#adc6ff] text-[#00285d] font-bold shadow-xs'
                      : 'bg-[#0a0e16] text-[#c2c6d6] hover:text-white hover:bg-[#262a33] micro-border'
                  }`}
                >
                  {city}
                </button>
              );
            })}
          </div>
        </div>

        {/* Automatic Live Climate Card (Generated automatically) */}
        <div className="p-4 bg-[#0a0e16] rounded-2xl micro-border relative overflow-hidden space-y-2">
          {isLoading && (
            <div className="absolute inset-0 bg-[#0a0e16]/85 backdrop-blur-xs flex items-center justify-center gap-2 z-10 text-[#adc6ff]">
              <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
              <span className="text-xs font-semibold">Fetching automatic live climate...</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4edea3] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
              Live Automatic Climate
            </span>
            <span className="text-[10px] text-[#8c909f] font-mono">
              Auto-sync enabled
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#ffb95f]/10 border border-[#ffb95f]/20 flex items-center justify-center text-[#ffb95f]">
                <span className="material-symbols-outlined text-[32px]">
                  {weatherData.iconSymbol}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#dfe2ee]">
                  {weatherData.city}
                  {weatherData.country ? `, ${weatherData.country}` : ''}
                </h4>
                <p className="text-xs text-[#adc6ff] font-medium">
                  {weatherData.condition}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold font-mono text-[#dfe2ee] tracking-tight">
                {currentDisplayTemp}
              </div>
              <span className="text-[10px] text-[#8c909f] font-mono">
                {unit === 'C' ? `(${weatherData.tempF}°F)` : `(${weatherData.tempC}°C)`}
              </span>
            </div>
          </div>

          {(weatherData.humidity !== undefined || weatherData.windSpeedKmH !== undefined) && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#21262d]/60 text-[11px] text-[#8c909f]">
              {weatherData.humidity !== undefined && (
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-[#adc6ff]">
                    humidity_percentage
                  </span>
                  <span>Humidity: <b className="text-[#dfe2ee]">{weatherData.humidity}%</b></span>
                </div>
              )}
              {weatherData.windSpeedKmH !== undefined && (
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-[#adc6ff]">
                    air
                  </span>
                  <span>Wind: <b className="text-[#dfe2ee]">{weatherData.windSpeedKmH} km/h</b></span>
                </div>
              )}
            </div>
          )}
        </div>

        {statusMessage && (
          <p className="text-[11px] text-[#adc6ff] text-center">{statusMessage}</p>
        )}

        {/* Modal Action Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-[#21262d]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-[#c2c6d6] hover:bg-[#262a33] rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="apply-climate-btn"
            type="button"
            onClick={handleSaveAndApply}
            className="px-4 py-2 text-xs font-bold bg-[#adc6ff] text-[#00285d] rounded-xl hover:bg-[#adc6ff]/90 cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">check</span>
            Apply Climate
          </button>
        </div>
      </div>
    </div>
  );
};
