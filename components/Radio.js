'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

// Çalışan radyo stream'leri
const radioStations = [
  { id: 'lofi', name: 'Lofi Study', genre: 'Lofi/Chill', url: 'https://streams.ilovemusic.de/iloveradio17.mp3', icon: '🎧' },
  { id: 'chillhop', name: 'Chillhop', genre: 'Chill/Jazz', url: 'https://streams.fluxfm.de/Chillhop/mp3-320/streams.fluxfm.de/', icon: '☕' },
  { id: 'jazz', name: 'Smooth Jazz', genre: 'Jazz', url: 'https://strm112.1.fm/smoothjazz_mobile_mp3', icon: '🎷' },
  { id: 'classical', name: 'Classical', genre: 'Klasik', url: 'https://live.musopen.org:8085/streamvbr0', icon: '🎻' },
  { id: 'ambient', name: 'Ambient', genre: 'Ambient', url: 'https://strm112.1.fm/ambient_mobile_mp3', icon: '🌙' },
  { id: 'piano', name: 'Piano', genre: 'Piyano', url: 'https://live.musopen.org:8085/streamvbr0', icon: '🎹' },
  { id: 'nature', name: 'Nature Sounds', genre: 'Doğa', url: 'https://strm112.1.fm/nature_mobile_mp3', icon: '🌿' },
  { id: 'focus', name: 'Focus Music', genre: 'Focus', url: 'https://streams.ilovemusic.de/iloveradio17.mp3', icon: '🎯' },
];

export default function Radio() {
  const { language } = useStore();
  const t = translations[language] || translations.tr;
  
  const [currentStation, setCurrentStation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [showStations, setShowStations] = useState(false);
  const [error, setError] = useState('');
  const audioRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('pomonero_radio');
    if (saved) {
      const station = radioStations.find(s => s.id === saved);
      if (station) setCurrentStation(station);
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const playStation = (station) => {
    setError('');
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    setCurrentStation(station);
    localStorage.setItem('pomonero_radio', station.id);
    setShowStations(false);
    
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = station.url;
        audioRef.current.volume = volume / 100;
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            setError(language === 'tr' ? 'Yüklenemedi' : 'Failed to load');
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
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setError(language === 'tr' ? 'Oynatılamıyor' : 'Cannot play'));
    }
  };

  const stopRadio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setIsPlaying(false);
  };

  return (
    <div className="card p-4">
      <audio ref={audioRef} />
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <span className="text-lg">📻</span>
          </div>
          <span className="font-medium text-sm" style={{ color: 'var(--text)' }}>{t.radio}</span>
        </div>
        {isPlaying && (
          <div className="flex items-center gap-0.5">
            <span className="w-1 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <span className="w-1 h-4 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></span>
            <span className="w-1 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
          </div>
        )}
      </div>

      {/* Current Station */}
      {currentStation && (
        <div className="mb-3 p-3 rounded-xl" style={{ background: 'var(--surface)' }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentStation.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate" style={{ color: 'var(--text)' }}>{currentStation.name}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{currentStation.genre}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={togglePlay} className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: 'var(--primary)' }}>
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              <button onClick={stopRadio} className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: 'var(--surface-hover)' }}>
                ⏹️
              </button>
            </div>
          </div>
          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
          
          {/* Volume */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs">🔈</span>
            <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(parseInt(e.target.value))} className="flex-1 h-1 rounded-full appearance-none cursor-pointer" style={{ background: 'var(--border)' }} />
            <span className="text-xs">🔊</span>
          </div>
        </div>
      )}

      {/* Station List Toggle */}
      <button
        onClick={() => setShowStations(!showStations)}
        className="w-full py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
        style={{ background: 'var(--surface)', color: 'var(--text)' }}
      >
        <span>{showStations ? '▲' : '▼'}</span>
        <span>{t.selectStation}</span>
      </button>

      {/* Station List */}
      {showStations && (
        <div className="mt-2 max-h-40 overflow-y-auto space-y-1 rounded-xl p-2" style={{ background: 'var(--surface)' }}>
          {radioStations.map((station) => (
            <button
              key={station.id}
              onClick={() => playStation(station)}
              className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all hover:bg-[var(--surface-hover)] ${currentStation?.id === station.id ? 'ring-1 ring-[var(--primary)]' : ''}`}
            >
              <span className="text-xl">{station.icon}</span>
              <div className="text-left">
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{station.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{station.genre}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
