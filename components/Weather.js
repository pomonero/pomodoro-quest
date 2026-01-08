'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';

// 81 İL VE İLÇELERİ - Koordinatlarıyla
const TURKEY = {
  'Adana': { lat: 37.00, lon: 35.32, ilceler: ['Seyhan', 'Yüreğir', 'Çukurova', 'Sarıçam', 'Ceyhan', 'Kozan', 'İmamoğlu', 'Karaisalı'] },
  'Adıyaman': { lat: 37.76, lon: 38.28, ilceler: ['Merkez', 'Kahta', 'Besni', 'Gölbaşı'] },
  'Afyonkarahisar': { lat: 38.74, lon: 30.54, ilceler: ['Merkez', 'Sandıklı', 'Dinar', 'Bolvadin', 'Emirdağ'] },
  'Ağrı': { lat: 39.72, lon: 43.05, ilceler: ['Merkez', 'Doğubayazıt', 'Patnos', 'Eleşkirt'] },
  'Aksaray': { lat: 38.37, lon: 34.03, ilceler: ['Merkez', 'Ortaköy', 'Eskil'] },
  'Amasya': { lat: 40.65, lon: 35.83, ilceler: ['Merkez', 'Merzifon', 'Suluova', 'Taşova'] },
  'Ankara': { lat: 39.93, lon: 32.86, ilceler: ['Çankaya', 'Keçiören', 'Yenimahalle', 'Mamak', 'Etimesgut', 'Sincan', 'Altındağ', 'Pursaklar', 'Gölbaşı', 'Polatlı', 'Beypazarı', 'Elmadağ'] },
  'Antalya': { lat: 36.90, lon: 30.71, ilceler: ['Muratpaşa', 'Kepez', 'Konyaaltı', 'Alanya', 'Manavgat', 'Serik', 'Aksu', 'Döşemealtı', 'Kaş', 'Kemer', 'Kumluca', 'Finike'] },
  'Ardahan': { lat: 41.11, lon: 42.70, ilceler: ['Merkez', 'Göle', 'Çıldır'] },
  'Artvin': { lat: 41.18, lon: 41.82, ilceler: ['Merkez', 'Hopa', 'Arhavi', 'Borçka'] },
  'Aydın': { lat: 37.85, lon: 27.85, ilceler: ['Efeler', 'Nazilli', 'Söke', 'Kuşadası', 'Didim', 'İncirliova', 'Germencik'] },
  'Balıkesir': { lat: 39.65, lon: 27.89, ilceler: ['Karesi', 'Altıeylül', 'Bandırma', 'Edremit', 'Gönen', 'Ayvalık', 'Burhaniye', 'Susurluk'] },
  'Bartın': { lat: 41.64, lon: 32.34, ilceler: ['Merkez', 'Amasra', 'Ulus'] },
  'Batman': { lat: 37.89, lon: 41.14, ilceler: ['Merkez', 'Kozluk', 'Sason'] },
  'Bayburt': { lat: 40.26, lon: 40.22, ilceler: ['Merkez', 'Demirözü'] },
  'Bilecik': { lat: 40.14, lon: 29.98, ilceler: ['Merkez', 'Bozüyük', 'Söğüt'] },
  'Bingöl': { lat: 38.88, lon: 40.50, ilceler: ['Merkez', 'Genç', 'Solhan', 'Karlıova'] },
  'Bitlis': { lat: 38.40, lon: 42.11, ilceler: ['Merkez', 'Tatvan', 'Ahlat', 'Güroymak'] },
  'Bolu': { lat: 40.73, lon: 31.61, ilceler: ['Merkez', 'Gerede', 'Mudurnu', 'Mengen'] },
  'Burdur': { lat: 37.72, lon: 30.29, ilceler: ['Merkez', 'Bucak', 'Gölhisar'] },
  'Bursa': { lat: 40.19, lon: 29.06, ilceler: ['Osmangazi', 'Yıldırım', 'Nilüfer', 'İnegöl', 'Gemlik', 'Mudanya', 'Gürsu', 'Kestel', 'Mustafakemalpaşa', 'Karacabey', 'Orhangazi'] },
  'Çanakkale': { lat: 40.15, lon: 26.41, ilceler: ['Merkez', 'Biga', 'Çan', 'Gelibolu', 'Ezine', 'Ayvacık'] },
  'Çankırı': { lat: 40.60, lon: 33.62, ilceler: ['Merkez', 'Çerkeş', 'Ilgaz'] },
  'Çorum': { lat: 40.55, lon: 34.95, ilceler: ['Merkez', 'Sungurlu', 'Osmancık', 'İskilip', 'Alaca'] },
  'Denizli': { lat: 37.77, lon: 29.09, ilceler: ['Merkezefendi', 'Pamukkale', 'Çivril', 'Acıpayam', 'Tavas', 'Sarayköy'] },
  'Diyarbakır': { lat: 37.91, lon: 40.23, ilceler: ['Bağlar', 'Kayapınar', 'Yenişehir', 'Sur', 'Ergani', 'Bismil', 'Silvan', 'Çermik'] },
  'Düzce': { lat: 40.84, lon: 31.16, ilceler: ['Merkez', 'Akçakoca', 'Kaynaşlı', 'Gölyaka'] },
  'Edirne': { lat: 41.68, lon: 26.56, ilceler: ['Merkez', 'Keşan', 'Uzunköprü', 'İpsala'] },
  'Elazığ': { lat: 38.68, lon: 39.22, ilceler: ['Merkez', 'Kovancılar', 'Karakoçan', 'Palu'] },
  'Erzincan': { lat: 39.75, lon: 39.49, ilceler: ['Merkez', 'Üzümlü', 'Tercan', 'Refahiye'] },
  'Erzurum': { lat: 39.90, lon: 41.27, ilceler: ['Yakutiye', 'Palandöken', 'Aziziye', 'Horasan', 'Pasinler', 'Oltu', 'Tortum'] },
  'Eskişehir': { lat: 39.78, lon: 30.52, ilceler: ['Odunpazarı', 'Tepebaşı', 'Sivrihisar', 'Çifteler', 'Mahmudiye'] },
  'Gaziantep': { lat: 37.07, lon: 37.38, ilceler: ['Şahinbey', 'Şehitkamil', 'Nizip', 'İslahiye', 'Nurdağı', 'Araban'] },
  'Giresun': { lat: 40.91, lon: 38.39, ilceler: ['Merkez', 'Bulancak', 'Espiye', 'Görele', 'Tirebolu'] },
  'Gümüşhane': { lat: 40.46, lon: 39.48, ilceler: ['Merkez', 'Kelkit', 'Şiran', 'Köse'] },
  'Hakkari': { lat: 37.58, lon: 43.74, ilceler: ['Merkez', 'Yüksekova', 'Çukurca', 'Şemdinli'] },
  'Hatay': { lat: 36.20, lon: 36.16, ilceler: ['Antakya', 'İskenderun', 'Defne', 'Samandağ', 'Dörtyol', 'Kırıkhan', 'Reyhanlı', 'Arsuz'] },
  'Iğdır': { lat: 39.92, lon: 44.05, ilceler: ['Merkez', 'Tuzluca', 'Aralık'] },
  'Isparta': { lat: 37.76, lon: 30.55, ilceler: ['Merkez', 'Yalvaç', 'Eğirdir', 'Şarkikaraağaç', 'Senirkent'] },
  'İstanbul': { lat: 41.01, lon: 28.98, ilceler: ['Kadıköy', 'Beşiktaş', 'Üsküdar', 'Bakırköy', 'Fatih', 'Şişli', 'Beyoğlu', 'Maltepe', 'Kartal', 'Pendik', 'Ataşehir', 'Ümraniye', 'Esenyurt', 'Başakşehir', 'Beylikdüzü', 'Sarıyer', 'Zeytinburnu', 'Bahçelievler', 'Bağcılar', 'Esenler', 'Güngören', 'Eyüpsultan', 'Kağıthane', 'Sultangazi', 'Gaziosmanpaşa', 'Bayrampaşa', 'Sultanbeyli', 'Sancaktepe', 'Çekmeköy', 'Beykoz', 'Arnavutköy', 'Büyükçekmece', 'Küçükçekmece', 'Avcılar', 'Silivri', 'Çatalca', 'Tuzla', 'Şile', 'Adalar'] },
  'İzmir': { lat: 38.42, lon: 27.14, ilceler: ['Konak', 'Karşıyaka', 'Bornova', 'Buca', 'Bayraklı', 'Çiğli', 'Gaziemir', 'Karabağlar', 'Balçova', 'Narlıdere', 'Güzelbahçe', 'Menemen', 'Torbalı', 'Aliağa', 'Bergama', 'Ödemiş', 'Tire', 'Kemalpaşa', 'Urla', 'Seferihisar', 'Çeşme', 'Foça', 'Dikili'] },
  'Kahramanmaraş': { lat: 37.58, lon: 36.93, ilceler: ['Onikişubat', 'Dulkadiroğlu', 'Elbistan', 'Afşin', 'Göksun', 'Türkoğlu', 'Pazarcık'] },
  'Karabük': { lat: 41.20, lon: 32.62, ilceler: ['Merkez', 'Safranbolu', 'Eskipazar', 'Yenice'] },
  'Karaman': { lat: 37.18, lon: 33.22, ilceler: ['Merkez', 'Ermenek', 'Ayrancı'] },
  'Kars': { lat: 40.60, lon: 43.09, ilceler: ['Merkez', 'Sarıkamış', 'Kağızman', 'Selim'] },
  'Kastamonu': { lat: 41.38, lon: 33.78, ilceler: ['Merkez', 'Tosya', 'Taşköprü', 'İnebolu', 'Cide'] },
  'Kayseri': { lat: 38.73, lon: 35.48, ilceler: ['Melikgazi', 'Kocasinan', 'Talas', 'Develi', 'İncesu', 'Yahyalı', 'Bünyan'] },
  'Kırıkkale': { lat: 39.85, lon: 33.52, ilceler: ['Merkez', 'Yahşihan', 'Keskin', 'Delice'] },
  'Kırklareli': { lat: 41.74, lon: 27.22, ilceler: ['Merkez', 'Lüleburgaz', 'Babaeski', 'Vize'] },
  'Kırşehir': { lat: 39.15, lon: 34.17, ilceler: ['Merkez', 'Mucur', 'Kaman'] },
  'Kilis': { lat: 36.72, lon: 37.12, ilceler: ['Merkez', 'Musabeyli', 'Elbeyli'] },
  'Kocaeli': { lat: 40.85, lon: 29.88, ilceler: ['İzmit', 'Gebze', 'Darıca', 'Körfez', 'Gölcük', 'Derince', 'Karamürsel', 'Başiskele', 'Çayırova', 'Dilovası', 'Kartepe', 'Kandıra'] },
  'Konya': { lat: 37.87, lon: 32.49, ilceler: ['Selçuklu', 'Meram', 'Karatay', 'Ereğli', 'Akşehir', 'Seydişehir', 'Beyşehir', 'Cihanbeyli', 'Kulu', 'Ilgın', 'Çumra'] },
  'Kütahya': { lat: 39.42, lon: 29.98, ilceler: ['Merkez', 'Tavşanlı', 'Simav', 'Gediz', 'Emet'] },
  'Malatya': { lat: 38.36, lon: 38.31, ilceler: ['Battalgazi', 'Yeşilyurt', 'Darende', 'Akçadağ', 'Doğanşehir'] },
  'Manisa': { lat: 38.62, lon: 27.43, ilceler: ['Yunusemre', 'Şehzadeler', 'Akhisar', 'Turgutlu', 'Salihli', 'Soma', 'Kırkağaç', 'Saruhanlı', 'Alaşehir', 'Demirci'] },
  'Mardin': { lat: 37.31, lon: 40.74, ilceler: ['Artuklu', 'Kızıltepe', 'Nusaybin', 'Midyat', 'Derik', 'Savur'] },
  'Mersin': { lat: 36.81, lon: 34.64, ilceler: ['Yenişehir', 'Toroslar', 'Akdeniz', 'Mezitli', 'Tarsus', 'Erdemli', 'Silifke', 'Anamur', 'Mut', 'Gülnar'] },
  'Muğla': { lat: 37.22, lon: 28.36, ilceler: ['Menteşe', 'Bodrum', 'Fethiye', 'Marmaris', 'Milas', 'Dalaman', 'Datça', 'Köyceğiz', 'Ortaca', 'Yatağan', 'Ula', 'Seydikemer'] },
  'Muş': { lat: 38.73, lon: 41.49, ilceler: ['Merkez', 'Bulanık', 'Malazgirt', 'Varto'] },
  'Nevşehir': { lat: 38.62, lon: 34.72, ilceler: ['Merkez', 'Ürgüp', 'Avanos', 'Gülşehir', 'Derinkuyu', 'Kozaklı'] },
  'Niğde': { lat: 37.97, lon: 34.68, ilceler: ['Merkez', 'Bor', 'Ulukışla', 'Çamardı'] },
  'Ordu': { lat: 40.98, lon: 37.88, ilceler: ['Altınordu', 'Ünye', 'Fatsa', 'Perşembe', 'Akkuş', 'Korgan'] },
  'Osmaniye': { lat: 37.07, lon: 36.25, ilceler: ['Merkez', 'Kadirli', 'Düziçi', 'Bahçe'] },
  'Rize': { lat: 41.02, lon: 40.52, ilceler: ['Merkez', 'Çayeli', 'Ardeşen', 'Pazar', 'Fındıklı', 'İyidere'] },
  'Sakarya': { lat: 40.78, lon: 30.40, ilceler: ['Adapazarı', 'Serdivan', 'Erenler', 'Arifiye', 'Sapanca', 'Hendek', 'Karasu', 'Geyve', 'Pamukova'] },
  'Samsun': { lat: 41.29, lon: 36.33, ilceler: ['İlkadım', 'Atakum', 'Canik', 'Tekkeköy', 'Bafra', 'Çarşamba', 'Terme', 'Vezirköprü', 'Havza'] },
  'Siirt': { lat: 37.93, lon: 41.95, ilceler: ['Merkez', 'Kurtalan', 'Baykan', 'Pervari'] },
  'Sinop': { lat: 42.02, lon: 35.15, ilceler: ['Merkez', 'Boyabat', 'Gerze', 'Ayancık'] },
  'Sivas': { lat: 39.75, lon: 37.02, ilceler: ['Merkez', 'Şarkışla', 'Yıldızeli', 'Suşehri', 'Zara', 'Kangal', 'Gemerek'] },
  'Şanlıurfa': { lat: 37.16, lon: 38.80, ilceler: ['Eyyübiye', 'Haliliye', 'Karaköprü', 'Viranşehir', 'Siverek', 'Suruç', 'Akçakale', 'Birecik', 'Harran', 'Ceylanpınar'] },
  'Şırnak': { lat: 37.52, lon: 42.45, ilceler: ['Merkez', 'Cizre', 'Silopi', 'İdil', 'Uludere'] },
  'Tekirdağ': { lat: 40.98, lon: 27.52, ilceler: ['Süleymanpaşa', 'Çorlu', 'Çerkezköy', 'Ergene', 'Kapaklı', 'Saray', 'Malkara', 'Hayrabolu', 'Muratlı', 'Marmaraereğlisi'] },
  'Tokat': { lat: 40.31, lon: 36.55, ilceler: ['Merkez', 'Turhal', 'Erbaa', 'Niksar', 'Zile', 'Reşadiye'] },
  'Trabzon': { lat: 41.00, lon: 39.73, ilceler: ['Ortahisar', 'Akçaabat', 'Yomra', 'Arsin', 'Of', 'Araklı', 'Sürmene', 'Maçka', 'Vakfıkebir'] },
  'Tunceli': { lat: 39.11, lon: 39.55, ilceler: ['Merkez', 'Pertek', 'Çemişgezek', 'Hozat'] },
  'Uşak': { lat: 38.67, lon: 29.41, ilceler: ['Merkez', 'Eşme', 'Banaz', 'Sivaslı'] },
  'Van': { lat: 38.49, lon: 43.41, ilceler: ['İpekyolu', 'Tuşba', 'Edremit', 'Erciş', 'Muradiye', 'Özalp', 'Başkale', 'Çaldıran'] },
  'Yalova': { lat: 40.65, lon: 29.28, ilceler: ['Merkez', 'Çınarcık', 'Termal', 'Altınova'] },
  'Yozgat': { lat: 39.82, lon: 34.80, ilceler: ['Merkez', 'Sorgun', 'Yerköy', 'Boğazlıyan', 'Akdağmadeni'] },
  'Zonguldak': { lat: 41.45, lon: 31.79, ilceler: ['Merkez', 'Ereğli', 'Karadeniz Ereğli', 'Çaycuma', 'Devrek', 'Alaplı', 'Gökçebey'] },
};

const WEATHER_CODES = {
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
  const tr = language === 'tr';
  
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCities, setShowCities] = useState(false);
  const [showDistricts, setShowDistricts] = useState(false);
  const [citySearch, setCitySearch] = useState('');

  // Kayıtlı konum
  useEffect(() => {
    const saved = localStorage.getItem('pomonero_location');
    if (saved) {
      try {
        const { city: c, district: d } = JSON.parse(saved);
        if (c && TURKEY[c]) {
          setCity(c);
          setDistrict(d || '');
        }
      } catch {}
    }
  }, []);

  // Hava durumu çek
  useEffect(() => {
    if (!city) return;
    
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const data = TURKEY[city];
        if (!data) return;
        
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${data.lat}&longitude=${data.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
        );
        const json = await res.json();
        
        if (json.current) {
          const code = json.current.weather_code;
          const info = WEATHER_CODES[code] || WEATHER_CODES[0];
          setWeather({
            temp: Math.round(json.current.temperature_2m),
            feels: Math.round(json.current.apparent_temperature),
            humidity: json.current.relative_humidity_2m,
            wind: Math.round(json.current.wind_speed_10m),
            icon: info.icon,
            desc: tr ? info.tr : info.en,
          });
        }
      } catch (e) {
        console.error('Weather fetch error:', e);
      }
      setLoading(false);
    };
    
    fetchWeather();
    localStorage.setItem('pomonero_location', JSON.stringify({ city, district }));
  }, [city, district, tr]);

  const cities = Object.keys(TURKEY).filter(c => 
    c.toLowerCase().includes(citySearch.toLowerCase())
  );
  const districts = city ? TURKEY[city]?.ilceler || [] : [];

  return (
    <div className="card p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-xl">
          🌤️
        </div>
        <span className="font-semibold" style={{ color: 'var(--text)' }}>
          {tr ? 'Hava Durumu' : 'Weather'}
        </span>
      </div>

      {/* İl Seç */}
      <div className="relative mb-2">
        <button
          onClick={() => { setShowCities(!showCities); setShowDistricts(false); }}
          className="w-full p-3 rounded-xl text-left flex items-center justify-between"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
        >
          <span className="flex items-center gap-2">
            <span>🏙️</span>
            {city || (tr ? 'İl Seçin' : 'Select City')}
          </span>
          <span className={`text-xs transition-transform ${showCities ? 'rotate-180' : ''}`}>▼</span>
        </button>
        
        {showCities && (
          <div className="absolute z-40 w-full mt-1 rounded-xl shadow-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <input
              type="text"
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              placeholder={tr ? 'Ara...' : 'Search...'}
              className="w-full p-3 outline-none border-b"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
              autoFocus
            />
            <div className="max-h-48 overflow-y-auto">
              {cities.map(c => (
                <button
                  key={c}
                  onClick={() => { setCity(c); setDistrict(''); setShowCities(false); setCitySearch(''); }}
                  className={`w-full p-3 text-left hover:bg-[var(--surface)] ${city === c ? 'bg-[var(--primary)]/20 font-semibold' : ''}`}
                  style={{ color: 'var(--text)' }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* İlçe Seç */}
      {city && (
        <div className="relative mb-4">
          <button
            onClick={() => { setShowDistricts(!showDistricts); setShowCities(false); }}
            className="w-full p-3 rounded-xl text-left flex items-center justify-between"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            <span className="flex items-center gap-2">
              <span>📍</span>
              {district || (tr ? 'İlçe Seçin' : 'Select District')}
            </span>
            <span className={`text-xs transition-transform ${showDistricts ? 'rotate-180' : ''}`}>▼</span>
          </button>
          
          {showDistricts && (
            <div className="absolute z-40 w-full mt-1 max-h-48 overflow-y-auto rounded-xl shadow-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              {districts.map(d => (
                <button
                  key={d}
                  onClick={() => { setDistrict(d); setShowDistricts(false); }}
                  className={`w-full p-3 text-left hover:bg-[var(--surface)] ${district === d ? 'bg-[var(--primary)]/20 font-semibold' : ''}`}
                  style={{ color: 'var(--text)' }}
                >
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-6">
          <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      )}

      {/* Weather Display */}
      {weather && !loading && (
        <div className="text-center p-4 rounded-xl animate-fadeIn" style={{ background: 'var(--surface)' }}>
          <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
            📍 {district ? `${district}, ${city}` : city}
          </p>
          <span className="text-5xl block mb-2">{weather.icon}</span>
          <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>{weather.temp}°C</p>
          <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>{weather.desc}</p>
          
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2 rounded-lg" style={{ background: 'var(--background)' }}>
              <span className="block text-lg">💧</span>
              <span className="font-bold" style={{ color: 'var(--text)' }}>{weather.humidity}%</span>
            </div>
            <div className="p-2 rounded-lg" style={{ background: 'var(--background)' }}>
              <span className="block text-lg">💨</span>
              <span className="font-bold" style={{ color: 'var(--text)' }}>{weather.wind} km/h</span>
            </div>
            <div className="p-2 rounded-lg" style={{ background: 'var(--background)' }}>
              <span className="block text-lg">🌡️</span>
              <span className="font-bold" style={{ color: 'var(--text)' }}>{weather.feels}°</span>
            </div>
          </div>
        </div>
      )}

      {/* Hint */}
      {!city && !loading && (
        <p className="text-center text-sm py-4" style={{ color: 'var(--text-muted)' }}>
          👆 {tr ? 'Konumunuzu seçin' : 'Select your location'}
        </p>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}
