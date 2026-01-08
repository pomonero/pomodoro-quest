'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

// İlçe bazlı koordinatlar
const turkeyData = {
  'İstanbul': {
    'Kadıköy': { lat: 40.9927, lon: 29.0277 },
    'Beşiktaş': { lat: 41.0420, lon: 29.0100 },
    'Üsküdar': { lat: 41.0234, lon: 29.0152 },
    'Bakırköy': { lat: 40.9819, lon: 28.8772 },
    'Fatih': { lat: 41.0186, lon: 28.9397 },
    'Şişli': { lat: 41.0602, lon: 28.9877 },
    'Beyoğlu': { lat: 41.0370, lon: 28.9770 },
    'Maltepe': { lat: 40.9346, lon: 29.1311 },
    'Kartal': { lat: 40.8898, lon: 29.1858 },
    'Pendik': { lat: 40.8753, lon: 29.2338 },
    'Ataşehir': { lat: 40.9833, lon: 29.1167 },
    'Ümraniye': { lat: 41.0167, lon: 29.1167 },
    'Esenyurt': { lat: 41.0333, lon: 28.6833 },
    'Başakşehir': { lat: 41.0942, lon: 28.8025 },
    'Beylikdüzü': { lat: 40.9833, lon: 28.6333 },
    'Sarıyer': { lat: 41.1667, lon: 29.0500 },
    'Zeytinburnu': { lat: 41.0000, lon: 28.9000 },
    'Bahçelievler': { lat: 41.0000, lon: 28.8667 },
    'Bağcılar': { lat: 41.0333, lon: 28.8500 },
    'Esenler': { lat: 41.0500, lon: 28.8833 },
  },
  'Ankara': {
    'Çankaya': { lat: 39.9000, lon: 32.8600 },
    'Keçiören': { lat: 39.9833, lon: 32.8667 },
    'Yenimahalle': { lat: 39.9667, lon: 32.8000 },
    'Mamak': { lat: 39.9333, lon: 32.9167 },
    'Etimesgut': { lat: 39.9500, lon: 32.6667 },
    'Sincan': { lat: 39.9667, lon: 32.5833 },
    'Altındağ': { lat: 39.9500, lon: 32.8833 },
    'Pursaklar': { lat: 40.0333, lon: 32.9000 },
    'Gölbaşı': { lat: 39.8000, lon: 32.8000 },
    'Polatlı': { lat: 39.5833, lon: 32.1500 },
  },
  'İzmir': {
    'Konak': { lat: 38.4189, lon: 27.1287 },
    'Karşıyaka': { lat: 38.4559, lon: 27.1094 },
    'Bornova': { lat: 38.4667, lon: 27.2167 },
    'Buca': { lat: 38.3833, lon: 27.1667 },
    'Bayraklı': { lat: 38.4667, lon: 27.1667 },
    'Çiğli': { lat: 38.5000, lon: 27.0667 },
    'Gaziemir': { lat: 38.3167, lon: 27.1333 },
    'Karabağlar': { lat: 38.3833, lon: 27.1167 },
    'Balçova': { lat: 38.3833, lon: 27.0500 },
    'Narlıdere': { lat: 38.4000, lon: 27.0167 },
    'Güzelbahçe': { lat: 38.3667, lon: 26.9000 },
    'Menemen': { lat: 38.6000, lon: 27.0667 },
    'Torbalı': { lat: 38.1667, lon: 27.3500 },
  },
  'Bursa': {
    'Osmangazi': { lat: 40.1833, lon: 29.0667 },
    'Yıldırım': { lat: 40.2000, lon: 29.0833 },
    'Nilüfer': { lat: 40.2167, lon: 28.9833 },
    'İnegöl': { lat: 40.0833, lon: 29.5167 },
    'Gemlik': { lat: 40.4333, lon: 29.1667 },
    'Mudanya': { lat: 40.3833, lon: 28.8833 },
    'Gürsu': { lat: 40.2333, lon: 29.1167 },
    'Kestel': { lat: 40.2000, lon: 29.2167 },
  },
  'Antalya': {
    'Muratpaşa': { lat: 36.8833, lon: 30.7000 },
    'Kepez': { lat: 36.9500, lon: 30.7167 },
    'Konyaaltı': { lat: 36.8667, lon: 30.6333 },
    'Alanya': { lat: 36.5500, lon: 32.0000 },
    'Manavgat': { lat: 36.7833, lon: 31.4333 },
    'Serik': { lat: 36.9167, lon: 31.1000 },
    'Aksu': { lat: 36.9500, lon: 30.8333 },
    'Döşemealtı': { lat: 37.0333, lon: 30.5833 },
    'Kaş': { lat: 36.2000, lon: 29.6500 },
    'Kemer': { lat: 36.6000, lon: 30.5500 },
  },
  'Kocaeli': {
    'İzmit': { lat: 40.7667, lon: 29.9167 },
    'Gebze': { lat: 40.8000, lon: 29.4333 },
    'Darıca': { lat: 40.7667, lon: 29.3833 },
    'Körfez': { lat: 40.7500, lon: 29.7500 },
    'Gölcük': { lat: 40.7167, lon: 29.8333 },
    'Derince': { lat: 40.7500, lon: 29.8167 },
    'Karamürsel': { lat: 40.6833, lon: 29.6167 },
    'Başiskele': { lat: 40.7333, lon: 29.9333 },
    'Çayırova': { lat: 40.8333, lon: 29.3667 },
    'Dilovası': { lat: 40.7833, lon: 29.5333 },
    'Kartepe': { lat: 40.6833, lon: 30.0333 },
    'Kandıra': { lat: 41.0667, lon: 30.1500 },
  },
  'Adana': {
    'Seyhan': { lat: 36.9914, lon: 35.3308 },
    'Yüreğir': { lat: 37.0000, lon: 35.4000 },
    'Çukurova': { lat: 37.0167, lon: 35.3167 },
    'Sarıçam': { lat: 37.0500, lon: 35.4333 },
    'Ceyhan': { lat: 37.0333, lon: 35.8167 },
    'Kozan': { lat: 37.4500, lon: 35.8167 },
  },
  'Konya': {
    'Selçuklu': { lat: 37.9000, lon: 32.4500 },
    'Meram': { lat: 37.8500, lon: 32.4333 },
    'Karatay': { lat: 37.8833, lon: 32.5000 },
    'Ereğli': { lat: 37.5167, lon: 34.0500 },
    'Akşehir': { lat: 38.3500, lon: 31.4167 },
  },
  'Gaziantep': {
    'Şahinbey': { lat: 37.0500, lon: 37.3833 },
    'Şehitkamil': { lat: 37.0833, lon: 37.3500 },
    'Nizip': { lat: 37.0167, lon: 37.8000 },
    'İslahiye': { lat: 37.0333, lon: 36.6333 },
  },
  'Mersin': {
    'Yenişehir': { lat: 36.8000, lon: 34.6333 },
    'Toroslar': { lat: 36.8500, lon: 34.6000 },
    'Akdeniz': { lat: 36.7833, lon: 34.6167 },
    'Mezitli': { lat: 36.7667, lon: 34.5500 },
    'Tarsus': { lat: 36.9167, lon: 34.8833 },
    'Erdemli': { lat: 36.6000, lon: 34.3167 },
    'Silifke': { lat: 36.3833, lon: 33.9333 },
  },
  'Diyarbakır': {
    'Bağlar': { lat: 37.9167, lon: 40.2000 },
    'Kayapınar': { lat: 37.9333, lon: 40.1500 },
    'Yenişehir': { lat: 37.9000, lon: 40.2333 },
    'Sur': { lat: 37.9167, lon: 40.2333 },
    'Ergani': { lat: 38.2667, lon: 39.7667 },
  },
  'Kayseri': {
    'Melikgazi': { lat: 38.7333, lon: 35.5000 },
    'Kocasinan': { lat: 38.7500, lon: 35.4667 },
    'Talas': { lat: 38.6833, lon: 35.5500 },
    'Develi': { lat: 38.3833, lon: 35.4833 },
  },
  'Eskişehir': {
    'Odunpazarı': { lat: 39.7667, lon: 30.5333 },
    'Tepebaşı': { lat: 39.8000, lon: 30.5000 },
  },
  'Samsun': {
    'İlkadım': { lat: 41.2833, lon: 36.3333 },
    'Atakum': { lat: 41.3333, lon: 36.2667 },
    'Canik': { lat: 41.2500, lon: 36.3667 },
    'Tekkeköy': { lat: 41.2167, lon: 36.4667 },
    'Bafra': { lat: 41.5667, lon: 35.9000 },
  },
  'Trabzon': {
    'Ortahisar': { lat: 41.0000, lon: 39.7333 },
    'Akçaabat': { lat: 41.0167, lon: 39.5500 },
    'Yomra': { lat: 40.9500, lon: 39.8500 },
    'Arsin': { lat: 40.9167, lon: 39.9333 },
    'Of': { lat: 40.9500, lon: 40.2667 },
  },
  'Van': {
    'İpekyolu': { lat: 38.5000, lon: 43.4000 },
    'Tuşba': { lat: 38.5167, lon: 43.4333 },
    'Edremit': { lat: 38.4333, lon: 43.2833 },
    'Erciş': { lat: 39.0333, lon: 43.3500 },
  },
  'Muğla': {
    'Bodrum': { lat: 37.0333, lon: 27.4333 },
    'Fethiye': { lat: 36.6500, lon: 29.1167 },
    'Marmaris': { lat: 36.8500, lon: 28.2667 },
    'Milas': { lat: 37.3167, lon: 27.7833 },
    'Menteşe': { lat: 37.2167, lon: 28.3667 },
    'Dalaman': { lat: 36.7667, lon: 28.8000 },
    'Datça': { lat: 36.7333, lon: 27.6833 },
    'Köyceğiz': { lat: 36.9667, lon: 28.6833 },
    'Ortaca': { lat: 36.8333, lon: 28.7667 },
  },
  'Hatay': {
    'Antakya': { lat: 36.2000, lon: 36.1500 },
    'İskenderun': { lat: 36.5833, lon: 36.1667 },
    'Defne': { lat: 36.2333, lon: 36.1333 },
    'Samandağ': { lat: 36.0833, lon: 35.9667 },
    'Dörtyol': { lat: 36.8500, lon: 36.2167 },
  },
  'Manisa': {
    'Yunusemre': { lat: 38.6167, lon: 27.4167 },
    'Şehzadeler': { lat: 38.6333, lon: 27.4333 },
    'Akhisar': { lat: 38.9167, lon: 27.8333 },
    'Turgutlu': { lat: 38.5000, lon: 27.7000 },
    'Salihli': { lat: 38.4833, lon: 28.1333 },
  },
  'Sakarya': {
    'Adapazarı': { lat: 40.7833, lon: 30.4000 },
    'Serdivan': { lat: 40.7333, lon: 30.3500 },
    'Erenler': { lat: 40.7667, lon: 30.3667 },
    'Arifiye': { lat: 40.7167, lon: 30.3667 },
    'Sapanca': { lat: 40.6833, lon: 30.2667 },
  },
  'Tekirdağ': {
    'Süleymanpaşa': { lat: 40.9833, lon: 27.5167 },
    'Çorlu': { lat: 41.1500, lon: 27.8000 },
    'Çerkezköy': { lat: 41.2833, lon: 28.0000 },
    'Ergene': { lat: 41.2833, lon: 27.7833 },
    'Kapaklı': { lat: 41.3333, lon: 28.0333 },
  },
  'Denizli': {
    'Merkezefendi': { lat: 37.7833, lon: 29.0833 },
    'Pamukkale': { lat: 37.9167, lon: 29.1167 },
    'Çivril': { lat: 38.3000, lon: 29.7333 },
  },
  'Şanlıurfa': {
    'Eyyübiye': { lat: 37.1500, lon: 38.8000 },
    'Haliliye': { lat: 37.1667, lon: 38.7833 },
    'Karaköprü': { lat: 37.1833, lon: 38.7500 },
    'Viranşehir': { lat: 37.2333, lon: 39.7667 },
  },
  'Malatya': {
    'Battalgazi': { lat: 38.4000, lon: 38.3333 },
    'Yeşilyurt': { lat: 38.3167, lon: 38.2500 },
  },
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
  95: { icon: '⛈️', tr: 'Gök gürültülü', en: 'Thunderstorm' },
};

export default function Weather() {
  const { language } = useStore();
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
          if (district && turkeyData[city][district]) setSelectedDistrict(district);
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
    if (!selectedCity || !selectedDistrict || !turkeyData[selectedCity]?.[selectedDistrict]) return;
    
    setLoading(true);
    setError('');
    
    try {
      const { lat, lon } = turkeyData[selectedCity][selectedDistrict];
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`);
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
    } catch {
      setError(language === 'tr' ? 'Hava durumu alınamadı' : 'Could not fetch weather');
    } finally {
      setLoading(false);
    }
  };

  const cities = Object.keys(turkeyData).sort();
  const districts = selectedCity ? Object.keys(turkeyData[selectedCity]).sort() : [];

  return (
    <div className="card p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
          <span className="text-lg">🌤️</span>
        </div>
        <span className="font-medium text-sm" style={{ color: 'var(--text)' }}>{language === 'tr' ? 'Hava Durumu' : 'Weather'}</span>
      </div>

      {/* City */}
      <div className="relative mb-2">
        <button onClick={() => { setShowCityMenu(!showCityMenu); setShowDistrictMenu(false); }} className="w-full p-3 rounded-xl text-left flex items-center justify-between text-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}>
          <span className="flex items-center gap-2"><span>🏙️</span>{selectedCity || (language === 'tr' ? 'İl Seçin' : 'Select City')}</span>
          <span className={`text-xs transition-transform ${showCityMenu ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {showCityMenu && (
          <div className="absolute z-30 w-full mt-1 max-h-48 overflow-y-auto rounded-xl shadow-xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            {cities.map(city => (
              <button key={city} onClick={() => { setSelectedCity(city); setSelectedDistrict(''); setShowCityMenu(false); setWeather(null); }} className={`w-full p-2.5 text-left text-sm hover:bg-[var(--surface)] ${selectedCity === city ? 'bg-[var(--primary)]/20 font-medium' : ''}`} style={{ color: 'var(--text)' }}>
                {city}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* District */}
      {selectedCity && (
        <div className="relative mb-4">
          <button onClick={() => { setShowDistrictMenu(!showDistrictMenu); setShowCityMenu(false); }} className="w-full p-3 rounded-xl text-left flex items-center justify-between text-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}>
            <span className="flex items-center gap-2"><span>📍</span>{selectedDistrict || (language === 'tr' ? 'İlçe Seçin' : 'Select District')}</span>
            <span className={`text-xs transition-transform ${showDistrictMenu ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {showDistrictMenu && (
            <div className="absolute z-30 w-full mt-1 max-h-48 overflow-y-auto rounded-xl shadow-xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              {districts.map(district => (
                <button key={district} onClick={() => { setSelectedDistrict(district); setShowDistrictMenu(false); }} className={`w-full p-2.5 text-left text-sm hover:bg-[var(--surface)] ${selectedDistrict === district ? 'bg-[var(--primary)]/20 font-medium' : ''}`} style={{ color: 'var(--text)' }}>
                  {district}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="text-center py-6">
          <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-4">
          <p className="text-xs text-red-400">{error}</p>
          <button onClick={fetchWeather} className="text-xs mt-2 px-3 py-1 rounded-lg" style={{ background: 'var(--surface)', color: 'var(--primary)' }}>
            {language === 'tr' ? 'Tekrar Dene' : 'Retry'}
          </button>
        </div>
      )}

      {weather && !loading && !error && (
        <div className="text-center p-4 rounded-xl" style={{ background: 'var(--surface)' }}>
          <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>📍 {selectedDistrict}, {selectedCity}</p>
          <span className="text-5xl block mb-1">{weather.icon}</span>
          <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>{weather.temp}°C</p>
          <p className="text-sm capitalize mb-3" style={{ color: 'var(--text-muted)' }}>{weather.description}</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2 rounded-lg" style={{ background: 'var(--background)' }}>
              <span className="block text-base">💧</span>
              <span className="block font-bold" style={{ color: 'var(--text)' }}>{weather.humidity}%</span>
            </div>
            <div className="p-2 rounded-lg" style={{ background: 'var(--background)' }}>
              <span className="block text-base">💨</span>
              <span className="block font-bold" style={{ color: 'var(--text)' }}>{weather.wind} km/h</span>
            </div>
            <div className="p-2 rounded-lg" style={{ background: 'var(--background)' }}>
              <span className="block text-base">🌡️</span>
              <span className="block font-bold" style={{ color: 'var(--text)' }}>{weather.feelsLike}°</span>
            </div>
          </div>
        </div>
      )}

      {!selectedCity && !loading && <p className="text-xs text-center py-3" style={{ color: 'var(--text-muted)' }}>👆 {language === 'tr' ? 'Konumunuzu seçin' : 'Select your location'}</p>}
    </div>
  );
}
