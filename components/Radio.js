'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

// Çalışan radyo stream URL'leri
const radioStations = [
  { 
    id: 'lofi', 
    name: 'Lofi Hip Hop', 
    genre: 'Lofi/Study', 
    url: 'https://streams.ilovemusic.de/iloveradio17.mp3', 
    icon: '🎧' 
  },
  { 
    id: 'chill', 
    name: 'Chill House', 
    genre: 'Chill/House', 
    url: 'https://streams.ilovemusic.de/iloveradio2.mp3', 
    icon: '🏠' 
  },
  { 
    id: 'dance', 
    name: 'Dance Hits', 
    genre: 'Dance/EDM', 
    url: 'https://streams.ilovemusic.de/iloveradio1.mp3', 
    icon: '💃' 
  },
  { 
    id: 'hiphop', 
    name: 'Hip Hop', 
    genre: 'Hip Hop/Rap', 
    url: 'https://streams.ilovemusic.de/iloveradio3.mp3', 
    icon: '🎤' 
  },
  { 
    id: 'relax', 
    name: 'Relax Radio', 
    genre: 'Ambient/Relax', 
    url: 'https://streams.ilovemusic.de/iloveradio15.mp3', 
    icon: '😌' 
  },
  { 
    id: 'jazz', 
    name: 'Smooth Jazz', 
    genre: 'Jazz', 
    url: 'https://streaming.radio.co/s774887f7b/listen', 
    icon: '🎷' 
  },
  { 
    id: 'classical', 
    name: 'Classical', 
    genre: 'Klasik Müzik', 
    url: 'https://live.musopen.org:8085/streamvbr0', 
    icon: '🎻' 
  },
  { 
    id: 'pop', 
    name: 'Pop Music', 
    genre: 'Pop', 
    url: 'https://streams.ilovemusic.de/iloveradio16.mp3', 
    icon: '🎵' 
  },
];

export default function Radio() {
  const { language } = useStore();
  const t = translations[language] || translations.tr;
  
  const [currentStation, setCurrentStation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [showStations, setShowStations] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const audioRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('pomonero_radio_station');
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
    setLoading(true);
    
    // Önceki stream'i durdur
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    
    setCurrentStation(station);
    localStorage.setItem('pomonero_radio_station', station.id);
    setShowStations(false);
    
    // Yeni stream'i başlat
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = station.url;
        audioRef.current.volume = volume / 100;
        
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              setLoading(false);
            })
            .catch((err) => {
              console.log('Play error:', err);
              setError(language === 'tr' ? 'Radyo yüklenemedi' : 'Failed to load');
              setIsPlaying(false);
              setLoading(false);
            });
        }
      }
    }, 200);
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentStation) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setLoading(true);
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setLoading(false);
        })
        .catch(() => {
          setError(language === 'tr' ? 'Oynatılamıyor' : 'Cannot play');
          setLoading(false);
        });
    }
  };

  const stopRadio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setIsPlaying(false);
    setCurrentStation(null);
    setError('');
  };

  return (
    <div className="card p-4">
      <audio ref={audioRef} preload="none" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <span className="text-lg">📻</span>
          </div>
          <span className="font-medium text-sm" style={{ color: 'var(--text)' }}>
            {t.radio || 'Radyo'}
          </span>
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
              <p className="font-medium text-sm truncate" style={{ color: 'var(--text)' }}>
                {currentStation.name}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {currentStation.genre}
              </p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={togglePlay}
                disabled={loading}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-all disabled:opacity-50"
                style={{ background: 'var(--primary)' }}
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : isPlaying ? '⏸️' : '▶️'}
              </button>
              <button
                onClick={stopRadio}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                style={{ background: 'var(--surface-hover)' }}
              >
                ⏹️
              </button>
            </div>
          </div>
          
          {error && (
            <p className="text-xs text-red-400 mt-2">{error}</p>
          )}

          {/* Volume */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs">🔈</span>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, var(--primary) ${volume}%, var(--border) ${volume}%)` }}
            />
            <span className="text-xs">🔊</span>
            <span className="text-xs w-8" style={{ color: 'var(--text-muted)' }}>{volume}%</span>
          </div>
        </div>
      )}

      {/* Station List Toggle */}
      <button
        onClick={() => setShowStations(!showStations)}
        className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
        style={{ background: 'var(--surface)', color: 'var(--text)' }}
      >
        <span className={`transition-transform ${showStations ? 'rotate-180' : ''}`}>▼</span>
        <span>{language === 'tr' ? 'İstasyon Seç' : 'Select Station'}</span>
      </button>

      {/* Station List */}
      {showStations && (
        <div className="mt-2 max-h-52 overflow-y-auto space-y-1 rounded-xl p-2" style={{ background: 'var(--surface)' }}>
          {radioStations.map((station) => (
            <button
              key={station.id}
              onClick={() => playStation(station)}
              className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all hover:bg-[var(--surface-hover)] ${
                currentStation?.id === station.id ? 'ring-2 ring-[var(--primary)] bg-[var(--primary)]/10' : ''
              }`}
            >
              <span className="text-xl">{station.icon}</span>
              <div className="text-left flex-1">
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  {station.name}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {station.genre}
                </p>
              </div>
              {currentStation?.id === station.id && isPlaying && (
                <span className="text-green-500 text-xs">●</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* No station selected hint */}
      {!currentStation && !showStations && (
        <p className="text-xs text-center mt-2" style={{ color: 'var(--text-muted)' }}>
          👆 {language === 'tr' ? 'Radyo seçin ve dinlemeye başlayın' : 'Select a station to start listening'}
        </p>
      )}
    </div>
  );
}
