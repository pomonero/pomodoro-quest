'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

// Türkiye illeri ve bazı önemli ilçeler
const turkeyData = {
  'İstanbul': ['Kadıköy', 'Beşiktaş', 'Üsküdar', 'Bakırköy', 'Fatih', 'Şişli', 'Beyoğlu', 'Maltepe', 'Kartal', 'Pendik', 'Ataşehir', 'Ümraniye', 'Esenyurt', 'Başakşehir', 'Beylikdüzü'],
  'Ankara': ['Çankaya', 'Keçiören', 'Yenimahalle', 'Mamak', 'Etimesgut', 'Sincan', 'Altındağ', 'Pursaklar'],
  'İzmir': ['Konak', 'Karşıyaka', 'Bornova', 'Buca', 'Bayraklı', 'Çiğli', 'Gaziemir', 'Karabağlar'],
  'Bursa': ['Osmangazi', 'Yıldırım', 'Nilüfer', 'İnegöl', 'Gemlik', 'Mudanya'],
  'Antalya': ['Muratpaşa', 'Kepez', 'Konyaaltı', 'Alanya', 'Manavgat', 'Serik'],
  'Adana': ['Seyhan', 'Yüreğir', 'Çukurova', 'Sarıçam', 'Ceyhan'],
  'Konya': ['Selçuklu', 'Meram', 'Karatay', 'Ereğli'],
  'Gaziantep': ['Şahinbey', 'Şehitkamil', 'Nizip'],
  'Kocaeli': ['İzmit', 'Gebze', 'Darıca', 'Körfez', 'Gölcük'],
  'Mersin': ['Yenişehir', 'Toroslar', 'Akdeniz', 'Mezitli', 'Tarsus'],
  'Diyarbakır': ['Bağlar', 'Kayapınar', 'Yenişehir', 'Sur'],
  'Kayseri': ['Melikgazi', 'Kocasinan', 'Talas'],
  'Eskişehir': ['Odunpazarı', 'Tepebaşı'],
  'Samsun': ['İlkadım', 'Atakum', 'Canik'],
  'Denizli': ['Merkezefendi', 'Pamukkale'],
  'Şanlıurfa': ['Eyyübiye', 'Haliliye', 'Karaköprü'],
  'Malatya': ['Battalgazi', 'Yeşilyurt'],
  'Trabzon': ['Ortahisar', 'Akçaabat'],
  'Sakarya': ['Adapazarı', 'Serdivan'],
  'Manisa': ['Yunusemre', 'Şehzadeler'],
  'Muğla': ['Bodrum', 'Fethiye', 'Marmaris', 'Milas'],
  'Tekirdağ': ['Süleymanpaşa', 'Çorlu'],
  'Van': ['İpekyolu', 'Tuşba'],
  'Hatay': ['Antakya', 'İskenderun'],
};

const weatherIcons = {
  'Clear': '☀️', 'Clouds': '☁️', 'Rain': '🌧️', 'Drizzle': '🌦️',
  'Thunderstorm': '⛈️', 'Snow': '❄️', 'Mist': '🌫️', 'Fog': '🌫️', 'Haze': '🌫️',
};

export default function Weather() {
  const { language } = useStore();
  const t = translations[language] || translations.tr;
  
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCityMenu, setShowCityMenu] = useState(false);
  const [showDistrictMenu, setShowDistrictMenu] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('pomonero_location');
    if (saved) {
      try {
        const { city, district } = JSON.parse(saved);
        setSelectedCity(city);
        setSelectedDistrict(district);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (selectedCity && selectedDistrict) {
      fetchWeather();
      localStorage.setItem('pomonero_location', JSON.stringify({ city: selectedCity, district: selectedDistrict }));
    }
  }, [selectedCity, selectedDistrict]);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      // OpenWeatherMap ücretsiz API
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(selectedCity)},TR&appid=bd5e378503939ddaee76f12ad7a97608&units=metric&lang=${language}`
      );
      if (res.ok) {
        const data = await res.json();
        setWeather({
          temp: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          wind: Math.round(data.wind.speed * 3.6),
          description: data.weather[0].description,
          icon: weatherIcons[data.weather[0].main] || '🌡️',
        });
      }
    } catch (err) {
      console.log('Weather error:', err);
    } finally {
      setLoading(false);
    }
  };

  const cities = Object.keys(turkeyData).sort();
  const districts = selectedCity ? turkeyData[selectedCity] || [] : [];

  return (
    <div className="card p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
          <span className="text-lg">🌤️</span>
        </div>
        <span className="font-medium text-sm" style={{ color: 'var(--text)' }}>{t.weather}</span>
      </div>

      {/* İl Seçimi */}
      <div className="relative mb-2">
        <button
          onClick={() => { setShowCityMenu(!showCityMenu); setShowDistrictMenu(false); }}
          className="w-full p-3 rounded-xl text-left flex items-center justify-between text-sm"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
        >
          <span>🏙️ {selectedCity || t.selectCity}</span>
          <span className={`text-xs transition-transform ${showCityMenu ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {showCityMenu && (
          <div className="absolute z-30 w-full mt-1 max-h-40 overflow-y-auto rounded-xl shadow-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            {cities.map(city => (
              <button
                key={city}
                onClick={() => { setSelectedCity(city); setSelectedDistrict(''); setShowCityMenu(false); }}
                className={`w-full p-2 text-left text-sm hover:bg-[var(--surface-hover)] ${selectedCity === city ? 'bg-[var(--primary)]/20' : ''}`}
                style={{ color: 'var(--text)' }}
              >
                {city}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* İlçe Seçimi */}
      {selectedCity && (
        <div className="relative mb-4">
          <button
            onClick={() => { setShowDistrictMenu(!showDistrictMenu); setShowCityMenu(false); }}
            className="w-full p-3 rounded-xl text-left flex items-center justify-between text-sm"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            <span>📍 {selectedDistrict || t.selectDistrict}</span>
            <span className={`text-xs transition-transform ${showDistrictMenu ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {showDistrictMenu && (
            <div className="absolute z-30 w-full mt-1 max-h-40 overflow-y-auto rounded-xl shadow-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              {districts.map(district => (
                <button
                  key={district}
                  onClick={() => { setSelectedDistrict(district); setShowDistrictMenu(false); }}
                  className={`w-full p-2 text-left text-sm hover:bg-[var(--surface-hover)] ${selectedDistrict === district ? 'bg-[var(--primary)]/20' : ''}`}
                  style={{ color: 'var(--text)' }}
                >
                  {district}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Weather Display */}
      {loading && (
        <div className="text-center py-4">
          <div className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      )}

      {weather && !loading && (
        <div className="text-center p-3 rounded-xl" style={{ background: 'var(--surface)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>📍 {selectedDistrict}, {selectedCity}</p>
          <span className="text-4xl block">{weather.icon}</span>
          <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{weather.temp}°C</p>
          <p className="text-xs capitalize mb-2" style={{ color: 'var(--text-muted)' }}>{weather.description}</p>
          <div className="grid grid-cols-3 gap-1 text-xs">
            <div className="p-1 rounded" style={{ background: 'var(--background)' }}>
              <span>💧</span>
              <span className="block font-bold" style={{ color: 'var(--text)' }}>{weather.humidity}%</span>
            </div>
            <div className="p-1 rounded" style={{ background: 'var(--background)' }}>
              <span>💨</span>
              <span className="block font-bold" style={{ color: 'var(--text)' }}>{weather.wind}km/h</span>
            </div>
            <div className="p-1 rounded" style={{ background: 'var(--background)' }}>
              <span>🌡️</span>
              <span className="block font-bold" style={{ color: 'var(--text)' }}>{weather.feelsLike}°</span>
            </div>
          </div>
        </div>
      )}

      {!selectedCity && !loading && (
        <p className="text-xs text-center py-2" style={{ color: 'var(--text-muted)' }}>👆 {language === 'tr' ? 'Konum seçin' : 'Select location'}</p>
      )}
    </div>
  );
}
