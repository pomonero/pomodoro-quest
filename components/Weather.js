'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

// Türkiye illeri ve koordinatları
const turkeyData = {
  'İstanbul': { lat: 41.0082, lon: 28.9784, districts: ['Kadıköy', 'Beşiktaş', 'Üsküdar', 'Bakırköy', 'Fatih', 'Şişli', 'Beyoğlu', 'Maltepe', 'Kartal', 'Pendik', 'Ataşehir', 'Ümraniye', 'Esenyurt', 'Başakşehir'] },
  'Ankara': { lat: 39.9334, lon: 32.8597, districts: ['Çankaya', 'Keçiören', 'Yenimahalle', 'Mamak', 'Etimesgut', 'Sincan', 'Altındağ', 'Pursaklar'] },
  'İzmir': { lat: 38.4237, lon: 27.1428, districts: ['Konak', 'Karşıyaka', 'Bornova', 'Buca', 'Bayraklı', 'Çiğli', 'Gaziemir', 'Karabağlar'] },
  'Bursa': { lat: 40.1885, lon: 29.0610, districts: ['Osmangazi', 'Yıldırım', 'Nilüfer', 'İnegöl', 'Gemlik', 'Mudanya'] },
  'Antalya': { lat: 36.8969, lon: 30.7133, districts: ['Muratpaşa', 'Kepez', 'Konyaaltı', 'Alanya', 'Manavgat', 'Serik'] },
  'Adana': { lat: 37.0000, lon: 35.3213, districts: ['Seyhan', 'Yüreğir', 'Çukurova', 'Sarıçam', 'Ceyhan'] },
  'Konya': { lat: 37.8746, lon: 32.4932, districts: ['Selçuklu', 'Meram', 'Karatay', 'Ereğli'] },
  'Gaziantep': { lat: 37.0662, lon: 37.3833, districts: ['Şahinbey', 'Şehitkamil', 'Nizip'] },
  'Kocaeli': { lat: 40.8533, lon: 29.8815, districts: ['İzmit', 'Gebze', 'Darıca', 'Körfez', 'Gölcük'] },
  'Mersin': { lat: 36.8121, lon: 34.6415, districts: ['Yenişehir', 'Toroslar', 'Akdeniz', 'Mezitli', 'Tarsus'] },
  'Diyarbakır': { lat: 37.9144, lon: 40.2306, districts: ['Bağlar', 'Kayapınar', 'Yenişehir', 'Sur'] },
  'Kayseri': { lat: 38.7312, lon: 35.4787, districts: ['Melikgazi', 'Kocasinan', 'Talas'] },
  'Eskişehir': { lat: 39.7767, lon: 30.5206, districts: ['Odunpazarı', 'Tepebaşı'] },
  'Samsun': { lat: 41.2867, lon: 36.3300, districts: ['İlkadım', 'Atakum', 'Canik'] },
  'Denizli': { lat: 37.7765, lon: 29.0864, districts: ['Merkezefendi', 'Pamukkale'] },
  'Şanlıurfa': { lat: 37.1591, lon: 38.7969, districts: ['Eyyübiye', 'Haliliye', 'Karaköprü'] },
  'Malatya': { lat: 38.3552, lon: 38.3095, districts: ['Battalgazi', 'Yeşilyurt'] },
  'Trabzon': { lat: 41.0027, lon: 39.7168, districts: ['Ortahisar', 'Akçaabat'] },
  'Muğla': { lat: 37.2153, lon: 28.3636, districts: ['Bodrum', 'Fethiye', 'Marmaris', 'Milas'] },
  'Van': { lat: 38.4891, lon: 43.4089, districts: ['İpekyolu', 'Tuşba', 'Edremit'] },
  'Hatay': { lat: 36.2026, lon: 36.1606, districts: ['Antakya', 'İskenderun'] },
  'Manisa': { lat: 38.6191, lon: 27.4289, districts: ['Yunusemre', 'Şehzadeler'] },
  'Sakarya': { lat: 40.7569, lon: 30.3781, districts: ['Adapazarı', 'Serdivan'] },
  'Tekirdağ': { lat: 40.9781, lon: 27.5117, districts: ['Süleymanpaşa', 'Çorlu'] },
};

const weatherCodes = {
  0: { icon: '☀️', tr: 'Açık', en: 'Clear' },
  1: { icon: '🌤️', tr: 'Az bulutlu', en: 'Mostly clear' },
  2: { icon: '⛅', tr: 'Parçalı bulutlu', en: 'Partly cloudy' },
  3: { icon: '☁️', tr: 'Bulutlu', en: 'Cloudy' },
  45: { icon: '🌫️', tr: 'Sisli', en: 'Foggy' },
  48: { icon: '🌫️', tr: 'Puslu', en: 'Hazy' },
  51: { icon: '🌦️', tr: 'Hafif yağmur', en: 'Light drizzle' },
  53: { icon: '🌧️', tr: 'Yağmurlu', en: 'Drizzle' },
  55: { icon: '🌧️', tr: 'Yoğun yağmur', en: 'Heavy drizzle' },
  61: { icon: '🌧️', tr: 'Hafif yağmur', en: 'Light rain' },
  63: { icon: '🌧️', tr: 'Yağmurlu', en: 'Rain' },
  65: { icon: '🌧️', tr: 'Şiddetli yağmur', en: 'Heavy rain' },
  71: { icon: '🌨️', tr: 'Hafif kar', en: 'Light snow' },
  73: { icon: '❄️', tr: 'Karlı', en: 'Snow' },
  75: { icon: '❄️', tr: 'Yoğun kar', en: 'Heavy snow' },
  80: { icon: '🌦️', tr: 'Sağanak', en: 'Showers' },
  81: { icon: '🌧️', tr: 'Sağanak yağış', en: 'Rain showers' },
  82: { icon: '⛈️', tr: 'Şiddetli sağanak', en: 'Heavy showers' },
  95: { icon: '⛈️', tr: 'Gök gürültülü', en: 'Thunderstorm' },
  96: { icon: '⛈️', tr: 'Dolu', en: 'Hail' },
  99: { icon: '⛈️', tr: 'Şiddetli fırtına', en: 'Severe storm' },
};

export default function Weather() {
  const { language } = useStore();
  const t = translations[language] || translations.tr;
  
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCityMenu, setShowCityMenu] = useState(false);
  const [showDistrictMenu, setShowDistrictMenu] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('pomonero_weather_location');
    if (saved) {
      try {
        const { city, district } = JSON.parse(saved);
        if (city && turkeyData[city]) {
          setSelectedCity(city);
          setSelectedDistrict(district || '');
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (selectedCity && selectedDistrict) {
      fetchWeather();
      localStorage.setItem('pomonero_weather_location', JSON.stringify({ city: selectedCity, district: selectedDistrict }));
    }
  }, [selectedCity, selectedDistrict, language]);

  const fetchWeather = async () => {
    if (!selectedCity || !turkeyData[selectedCity]) return;
    
    setLoading(true);
    setError('');
    
    try {
      const { lat, lon } = turkeyData[selectedCity];
      
      // Open-Meteo API - ücretsiz ve key gerektirmez
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
      );
      
      if (!response.ok) throw new Error('API error');
      
      const data = await response.json();
      
      if (data.current) {
        const code = data.current.weather_code;
        const weatherInfo = weatherCodes[code] || weatherCodes[0];
        
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          feelsLike: Math.round(data.current.apparent_temperature),
          humidity: data.current.relative_humidity_2m,
          wind: Math.round(data.current.wind_speed_10m),
          icon: weatherInfo.icon,
          description: language === 'tr' ? weatherInfo.tr : weatherInfo.en,
        });
      }
    } catch (err) {
      console.log('Weather error:', err);
      setError(language === 'tr' ? 'Hava durumu alınamadı' : 'Could not fetch weather');
    } finally {
      setLoading(false);
    }
  };

  const cities = Object.keys(turkeyData).sort();
  const districts = selectedCity && turkeyData[selectedCity] ? turkeyData[selectedCity].districts : [];

  return (
    <div className="card p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
          <span className="text-lg">🌤️</span>
        </div>
        <span className="font-medium text-sm" style={{ color: 'var(--text)' }}>
          {t.weather || 'Hava Durumu'}
        </span>
      </div>

      {/* City Select */}
      <div className="relative mb-2">
        <button
          onClick={() => { setShowCityMenu(!showCityMenu); setShowDistrictMenu(false); }}
          className="w-full p-3 rounded-xl text-left flex items-center justify-between text-sm transition-all"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
        >
          <span className="flex items-center gap-2">
            <span>🏙️</span>
            {selectedCity || (language === 'tr' ? 'İl Seçin' : 'Select City')}
          </span>
          <span className={`text-xs transition-transform ${showCityMenu ? 'rotate-180' : ''}`}>▼</span>
        </button>
        
        {showCityMenu && (
          <div className="absolute z-30 w-full mt-1 max-h-48 overflow-y-auto rounded-xl shadow-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            {cities.map(city => (
              <button
                key={city}
                onClick={() => { 
                  setSelectedCity(city); 
                  setSelectedDistrict(''); 
                  setShowCityMenu(false); 
                  setWeather(null);
                }}
                className={`w-full p-2.5 text-left text-sm hover:bg-[var(--surface-hover)] transition-colors ${selectedCity === city ? 'bg-[var(--primary)]/20 font-medium' : ''}`}
                style={{ color: 'var(--text)' }}
              >
                {city}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* District Select */}
      {selectedCity && (
        <div className="relative mb-4">
          <button
            onClick={() => { setShowDistrictMenu(!showDistrictMenu); setShowCityMenu(false); }}
            className="w-full p-3 rounded-xl text-left flex items-center justify-between text-sm transition-all"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            <span className="flex items-center gap-2">
              <span>📍</span>
              {selectedDistrict || (language === 'tr' ? 'İlçe Seçin' : 'Select District')}
            </span>
            <span className={`text-xs transition-transform ${showDistrictMenu ? 'rotate-180' : ''}`}>▼</span>
          </button>
          
          {showDistrictMenu && (
            <div className="absolute z-30 w-full mt-1 max-h-48 overflow-y-auto rounded-xl shadow-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              {districts.map(district => (
                <button
                  key={district}
                  onClick={() => { setSelectedDistrict(district); setShowDistrictMenu(false); }}
                  className={`w-full p-2.5 text-left text-sm hover:bg-[var(--surface-hover)] transition-colors ${selectedDistrict === district ? 'bg-[var(--primary)]/20 font-medium' : ''}`}
                  style={{ color: 'var(--text)' }}
                >
                  {district}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-6">
          <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            {language === 'tr' ? 'Yükleniyor...' : 'Loading...'}
          </p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-center py-4">
          <p className="text-xs text-red-400">{error}</p>
          <button 
            onClick={fetchWeather}
            className="text-xs mt-2 px-3 py-1 rounded-lg"
            style={{ background: 'var(--surface)', color: 'var(--primary)' }}
          >
            {language === 'tr' ? 'Tekrar Dene' : 'Retry'}
          </button>
        </div>
      )}

      {/* Weather Display */}
      {weather && !loading && !error && (
        <div className="text-center p-4 rounded-xl" style={{ background: 'var(--surface)' }}>
          <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
            📍 {selectedDistrict}, {selectedCity}
          </p>
          <span className="text-5xl block mb-1">{weather.icon}</span>
          <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
            {weather.temp}°C
          </p>
          <p className="text-sm capitalize mb-3" style={{ color: 'var(--text-muted)' }}>
            {weather.description}
          </p>
          
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2 rounded-lg" style={{ background: 'var(--background)' }}>
              <span className="block text-base">💧</span>
              <span className="block font-bold" style={{ color: 'var(--text)' }}>{weather.humidity}%</span>
              <span style={{ color: 'var(--text-muted)' }}>{language === 'tr' ? 'Nem' : 'Humidity'}</span>
            </div>
            <div className="p-2 rounded-lg" style={{ background: 'var(--background)' }}>
              <span className="block text-base">💨</span>
              <span className="block font-bold" style={{ color: 'var(--text)' }}>{weather.wind} km/h</span>
              <span style={{ color: 'var(--text-muted)' }}>{language === 'tr' ? 'Rüzgar' : 'Wind'}</span>
            </div>
            <div className="p-2 rounded-lg" style={{ background: 'var(--background)' }}>
              <span className="block text-base">🌡️</span>
              <span className="block font-bold" style={{ color: 'var(--text)' }}>{weather.feelsLike}°</span>
              <span style={{ color: 'var(--text-muted)' }}>{language === 'tr' ? 'Hissedilen' : 'Feels'}</span>
            </div>
          </div>
        </div>
      )}

      {/* No location hint */}
      {!selectedCity && !loading && (
        <p className="text-xs text-center py-3" style={{ color: 'var(--text-muted)' }}>
          👆 {language === 'tr' ? 'Konumunuzu seçin' : 'Select your location'}
        </p>
      )}
    </div>
  );
}
