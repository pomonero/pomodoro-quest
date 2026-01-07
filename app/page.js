'use client';

import { useEffect, useState } from 'react';
import { supabase, auth, db } from '@/lib/supabase';
import { useStore } from '@/lib/store';

// Components
import AuthScreen from '@/components/AuthScreen';
import Header from '@/components/Header';
import Timer from '@/components/Timer';
import Calendar from '@/components/Calendar';
import LiveClock from '@/components/LiveClock';
import Leaderboard from '@/components/Leaderboard';
import Stats from '@/components/Stats';
import Settings from '@/components/Settings';
import Profile from '@/components/Profile';
import MusicPlayer from '@/components/MusicPlayer';
import GameModal from '@/components/GameModal';
import AdSpace from '@/components/AdSpace';

export default function Home() {
  const { 
    user, setUser, 
    profile, setProfile,
    isLoading, setLoading,
    darkMode,
    showGame,
    showSettings, setShowSettings,
    showProfile, setShowProfile,
    stats, setStats,
    leaderboard, setLeaderboard
  } = useStore();

  // Auth state listener
  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await auth.getUser();
      if (currentUser) {
        setUser(currentUser);
        const { data: profileData } = await db.getProfile(currentUser.id);
        setProfile(profileData);
        
        // İstatistikleri yükle
        const userStats = await db.getUserStats(currentUser.id);
        setStats(userStats);
      }
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const { data: profileData } = await db.getProfile(session.user.id);
        setProfile(profileData);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Liderlik tablosunu yükle
  useEffect(() => {
    const loadLeaderboard = async () => {
      const { data } = await db.getLeaderboard(null, 10);
      if (data) setLeaderboard(data);
    };

    loadLeaderboard();
    const interval = setInterval(loadLeaderboard, 30000);

    return () => clearInterval(interval);
  }, []);

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <img 
            src="/logo.png" 
            alt="Pomonero" 
            className="w-24 h-24 mx-auto mb-4 animate-float"
          />
          <div className="flex items-center gap-2 justify-center">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Auth screen if not logged in
  if (!user) {
    return <AuthScreen />;
  }

  // Main app
  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'gradient-bg' : 'gradient-bg-light'}`}>
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Sol Kolon - Timer & Calendar */}
          <div className="lg:col-span-8 space-y-6">
            {/* Üst Kısım - Timer ve Saat */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Timer />
              </div>
              <div className="space-y-6">
                <LiveClock />
                <MusicPlayer />
              </div>
            </div>

            {/* Takvim */}
            <Calendar />

            {/* Alt Reklam */}
            <AdSpace size="banner" />
          </div>

          {/* Sağ Kolon - Stats, Leaderboard */}
          <div className="lg:col-span-4 space-y-6">
            <Stats />
            <Leaderboard />
            <AdSpace size="square" />
          </div>
        </div>
      </main>

      {/* Modals */}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      {showProfile && <Profile onClose={() => setShowProfile(false)} />}
      {showGame && <GameModal />}
    </div>
  );
}
