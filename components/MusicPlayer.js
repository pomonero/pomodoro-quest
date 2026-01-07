'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';

export default function MusicPlayer() {
  const { darkMode } = useStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [volume, setVolume] = useState(70);

  // Placeholder tracks - buraya telifsiz müzikler eklenecek
  const tracks = [
    // { id: 1, title: 'Lo-Fi Study', artist: 'Ambient', url: '/music/lofi.mp3' },
    // { id: 2, title: 'Focus Flow', artist: 'Ambient', url: '/music/focus.mp3' },
  ];

  const togglePlay = () => {
    if (tracks.length === 0) return;
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={`card p-4 music-player ${darkMode ? '' : 'card-light'}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Müzik Çalar
          </p>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {tracks.length > 0 ? currentTrack?.title || 'Parça seç' : 'Yakında...'}
          </p>
        </div>
      </div>

      {/* Player Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          className={`p-2 rounded-lg transition-all ${
            darkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
          }`}
          disabled={tracks.length === 0}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
          </svg>
        </button>

        <button
          onClick={togglePlay}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            tracks.length === 0
              ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
          }`}
          disabled={tracks.length === 0}
        >
          {isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        <button
          className={`p-2 rounded-lg transition-all ${
            darkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
          }`}
          disabled={tracks.length === 0}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798L4.555 5.168z" />
          </svg>
        </button>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2 mt-3">
        <svg className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
        </svg>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => setVolume(e.target.value)}
          className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          disabled={tracks.length === 0}
        />
      </div>

      {tracks.length === 0 && (
        <p className={`text-xs text-center mt-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          🎵 Müzikler yakında eklenecek
        </p>
      )}
    </div>
  );
}
