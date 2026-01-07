'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

// Türk radyo istasyonları (ücretsiz stream URL'leri)
const radioStations = [
  { id: 'power', name: 'Power FM', genre: 'Pop', url: 'https://listen.powerapp.com.tr/powerfm/abr/playlist.m3u8', icon: '🎵' },
  { id: 'virgin', name: 'Virgin Radio', genre: 'Pop/Rock', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/VIRGIN_RADIO_TURKEY.mp3', icon: '🎸' },
  { id: 'joyturk', name: 'Joy Türk', genre: 'Türkçe Pop', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_TURK.mp3', icon: '🎤' },
  { id: 'slowturk', name: 'SlowTürk', genre: 'Slow', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/SLOW_TURK.mp3', icon: '💜' },
  { id: 'ntv', name: 'NTV Radyo', genre: 'Haber', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/NTV_RADYO.mp3', icon: '📰' },
  { id: 'klasik', name: 'Açık Radyo', genre: 'Karma', url: 'https://stream.acikradyo.com.tr/acikradyo.mp3', icon: '📻' },
  { id: 'trt', name: 'TRT FM', genre: 'Türkçe', url: 'https://trtsc.radyotvonline.com/trt_fm.mp3', icon: '🇹🇷' },
  { id: 'lofi', name: 'Lofi Hip Hop', genre: 'Lofi', url: 'https://streams.ilovemusic.de/iloveradio17.mp3', icon: '🎧' },
];

export default function Radio() {
  const { language } = useStore();
  const t = translations[language] || translations.tr;
  
  const [currentStation, setCurrentStation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [showStations, setShowStations] = useState(false);
  const audioRef = useRef(null);

  // LocalStorage'dan son istasyonu yükle
  useEffect(() => {
    const savedStation = localStorage.getItem('pomonero_radio_station');
    if (savedStation) {
      const station = radioStations.find(s => s.id === savedStation);
      if (station) setCurrentStation(station);
    }
  }, []);

  // Volume değişikliği
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const playStation = (station) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    setCurrentStation(station);
    localStorage.setItem('pomonero_radio_station', station.id);
    setShowStations(false);
    
    // Yeni audio oluştur
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = station.url;
        audioRef.current.volume = volume / 100;
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.log('Radyo başlatılamadı:', err);
          setIsPlaying(false);
        });
      }
    }, 100);
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentStation) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.log('Radyo başlatılamadı:', err);
      });
    }
  };

  return (
    <div className="card p-4">
      <audio ref={audioRef} />
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <span className="text-lg">📻</span>
          </div>
          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
            {t.radio}
          </span>
        </div>
        
        {isPlaying && (
          <div className="flex items-center gap-1">
            <span className="w-1 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <span className="w-1 h-4 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-1 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
          </div>
        )}
      </div>

      {/* Current Station */}
      {currentStation ? (
        <div className="mb-3">
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--surface)' }}>
            <span className="text-2xl">{currentStation.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate" style={{ color: 'var(--text)' }}>
                {currentStation.name}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {currentStation.genre}
              </p>
            </div>
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
              style={{ background: 'var(--primary)' }}
            >
              {isPlaying ? (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm">🔈</span>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
              style={{ background: 'var(--border)' }}
            />
            <span className="text-sm">🔊</span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-center py-2 mb-3" style={{ color: 'var(--text-muted)' }}>
          {t.selectStation}
        </p>
      )}

      {/* Station List Toggle */}
      <button
        onClick={() => setShowStations(!showStations)}
        className="w-full py-2 rounded-lg text-sm font-medium transition-all"
        style={{ background: 'var(--surface)', color: 'var(--text)' }}
      >
        {showStations ? '▲ ' : '▼ '} {t.selectStation}
      </button>

      {/* Station List */}
      {showStations && (
        <div className="mt-2 max-h-48 overflow-y-auto space-y-1 rounded-xl p-2" style={{ background: 'var(--surface)' }}>
          {radioStations.map((station) => (
            <button
              key={station.id}
              onClick={() => playStation(station)}
              className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all hover:bg-[var(--surface-hover)] ${
                currentStation?.id === station.id ? 'ring-2 ring-[var(--primary)]' : ''
              }`}
            >
              <span className="text-xl">{station.icon}</span>
              <div className="text-left">
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  {station.name}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {station.genre}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
