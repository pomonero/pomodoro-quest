'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

// Türkiye illeri
const cities = [
  'Adana', 'Adıyaman', 'Afyon', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya', 'Ardahan', 'Artvin',
  'Aydın', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur',
  'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan',
  'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul',
  'İzmir', 'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kırıkkale', 'Kırklareli', 'Kırşehir',
  'Kilis', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Mardin', 'Mersin', 'Muğla', 'Muş',
  'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas',
  'Şanlıurfa', 'Şırnak', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak'
];

// Hava durumu ikonları
const weatherIcons = {
  'Clear': '☀️',
  'Clouds': '☁️',
  'Rain': '🌧️',
  'Drizzle': '🌦️',
  'Thunderstorm': '⛈️',
  'Snow': '❄️',
  'Mist': '🌫️',
  'Fog': '🌫️',
  'Haze': '🌫️',
};

export default function Weather() {
  const { language } = useStore();
  const t = translations[language] || translations.tr;
  
  const [selectedCity, setSelectedCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // LocalStorage'dan şehri yükle
  useEffect(() => {
    const savedCity = localStorage.getItem('pomonero_city');
    if (savedCity) {
      setSelectedCity(savedCity);
    }
  }, []);

  // Hava durumunu çek
  useEffect(() => {
    if (selectedCity) {
      fetchWeather(selectedCity);
      localStorage.setItem('pomonero_city', selectedCity);
    }
  }, [selectedCity]);

  const fetchWeather = async (city) => {
    setLoading(true);
    setError('');
    
    try {
      // OpenWeatherMap API (ücretsiz)
      const apiKey = '284b62ae7f7d4fd7b384fa2e1cc6a0b1'; // Ücretsiz API key
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},TR&appid=${apiKey}&units=metric&lang=${language}`
      );
      
      if (!response.ok) throw new Error('Weather data not found');
      
      const data = await response.json();
      setWeather({
        temp: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        wind: Math.round(data.wind.speed * 3.6), // m/s to km/h
        description: data.weather[0].description,
        icon: weatherIcons[data.weather[0].main] || '🌡️',
        main: data.weather[0].main
      });
    } catch (err) {
      setError(language === 'tr' ? 'Hava durumu yüklenemedi' : 'Could not load weather');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
          <span className="text-lg">🌤️</span>
        </div>
        <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
          {t.weather}
        </span>
      </div>

      {/* Şehir Seçimi */}
      <select
        value={selectedCity}
        onChange={(e) => setSelectedCity(e.target.value)}
        className="input-modern mb-3 text-sm"
      >
        <option value="">{t.selectCity}</option>
        {cities.map(city => (
          <option key={city} value={city}>{city}</option>
        ))}
      </select>

      {/* Hava Durumu */}
      {loading && (
        <div className="text-center py-4">
          <div className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      )}

      {error && (
        <p className="text-sm text-center py-2" style={{ color: 'var(--text-muted)' }}>
          {error}
        </p>
      )}

      {weather && !loading && (
        <div className="text-center">
          <span className="text-5xl mb-2 block">{weather.icon}</span>
          <p className="text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>
            {weather.temp}°C
          </p>
          <p className="text-sm capitalize mb-3" style={{ color: 'var(--text-muted)' }}>
            {weather.description}
          </p>
          
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2 rounded-lg" style={{ background: 'var(--surface)' }}>
              <span className="block">💧</span>
              <span style={{ color: 'var(--text-muted)' }}>{t.humidity}</span>
              <span className="block font-bold" style={{ color: 'var(--text)' }}>{weather.humidity}%</span>
            </div>
            <div className="p-2 rounded-lg" style={{ background: 'var(--surface)' }}>
              <span className="block">💨</span>
              <span style={{ color: 'var(--text-muted)' }}>{t.wind}</span>
              <span className="block font-bold" style={{ color: 'var(--text)' }}>{weather.wind} km/h</span>
            </div>
            <div className="p-2 rounded-lg" style={{ background: 'var(--surface)' }}>
              <span className="block">🌡️</span>
              <span style={{ color: 'var(--text-muted)' }}>{t.feelsLike}</span>
              <span className="block font-bold" style={{ color: 'var(--text)' }}>{weather.feelsLike}°</span>
            </div>
          </div>
        </div>
      )}

      {!selectedCity && !loading && (
        <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
          {language === 'tr' ? 'Şehir seçin' : 'Select a city'}
        </p>
      )}
    </div>
  );
}
