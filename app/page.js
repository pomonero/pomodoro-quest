'use client';

import { useEffect, useState } from 'react';
import { supabase, auth, db } from '@/lib/supabase';
import { useStore } from '@/lib/store';

// Components
import AuthScreen from '@/components/AuthScreen';
import Header from '@/components/Header';
import Timer from '@/components/Timer';
import Leaderboard from '@/components/Leaderboard';
import Stats from '@/components/Stats';
import Settings from '@/components/Settings';
import GameModal from '@/components/GameModal';
import AdSpace from '@/components/AdSpace';

export default function Home() {
  const { 
    user, setUser, 
    profile, setProfile,
    isLoading, setLoading,
    darkMode,
    showGame,
    stats, setStats,
    leaderboard, setLeaderboard
  } = useStore();

  const [showSettings, setShowSettings] = useState(false);

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
    const interval = setInterval(loadLeaderboard, 30000); // 30 saniyede bir güncelle

    return () => clearInterval(interval);
  }, []);

  // Loading screen
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-950' : 'bg-slate-100'}`}>
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🍅</div>
          <p className={`text-xs font-pixel ${darkMode ? 'text-cyan-400 neon-text-cyan' : 'text-fuchsia-600'}`}>
            YÜKLENİYOR...
          </p>
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
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-950' : 'bg-slate-100'}`}>
      <Header onSettingsClick={() => setShowSettings(true)} />
      
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sol Sidebar - Reklam */}
          <div className="hidden lg:block lg:col-span-2">
            <AdSpace size="vertical" />
          </div>

          {/* Ana İçerik */}
          <div className="lg:col-span-6">
            <Timer />
            
            {/* Mobil için alt reklam */}
            <div className="lg:hidden mt-6">
              <AdSpace size="horizontal" />
            </div>
          </div>

          {/* Sağ Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <Stats />
            <Leaderboard />
            <AdSpace size="square" />
          </div>
        </div>

        {/* Alt Banner Reklam */}
        <div className="mt-8 hidden lg:block">
          <AdSpace size="banner" />
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}

      {/* Game Modal */}
      {showGame && <GameModal />}
    </div>
  );
}
