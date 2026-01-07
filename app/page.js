'use client';

import { useEffect } from 'react';
import { supabase, auth, db } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import { themes } from '@/lib/themes';

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
import TodayInHistory from '@/components/TodayInHistory';
import AdSpace from '@/components/AdSpace';

// Pages
import PomodoroPage from '@/components/pages/PomodoroPage';
import AboutPage from '@/components/pages/AboutPage';
import ContactPage from '@/components/pages/ContactPage';
import SupportPage from '@/components/pages/SupportPage';

export default function Home() {
  const { 
    user, setUser, 
    profile, setProfile,
    isLoading, setLoading,
    currentTheme,
    language,
    currentPage,
    showGame,
    showSettings, setShowSettings,
    showProfile, setShowProfile,
    stats, setStats,
    leaderboard, setLeaderboard
  } = useStore();

  const t = translations[language] || translations.tr;
  const theme = themes[currentTheme] || themes.midnight;

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.body.style.background = theme.colors.background;
  }, [currentTheme, theme]);

  // Auth state listener
  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await auth.getUser();
      if (currentUser) {
        setUser(currentUser);
        const { data: profileData } = await db.getProfile(currentUser.id);
        setProfile(profileData);
        
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

  // Load leaderboard
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: theme.colors.background }}>
        <div className="text-center">
          <img 
            src="/logo.png" 
            alt="Pomonero" 
            className="w-24 h-24 mx-auto mb-4 animate-float"
          />
          <div className="flex items-center gap-2 justify-center">
            <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: theme.colors.primary, animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: theme.colors.primary, animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: theme.colors.primary, animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Auth screen
  if (!user) {
    return <AuthScreen />;
  }

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'pomodoro':
        return <PomodoroPage />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'support':
        return <SupportPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-500" style={{ background: theme.colors.background }}>
      {/* Pixel art background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 text-4xl opacity-10 animate-float" style={{ animationDelay: '0s' }}>⭐</div>
        <div className="absolute top-40 right-20 text-3xl opacity-10 animate-float" style={{ animationDelay: '1s' }}>🌙</div>
        <div className="absolute bottom-40 left-20 text-3xl opacity-10 animate-float" style={{ animationDelay: '2s' }}>✨</div>
        <div className="absolute bottom-20 right-10 text-4xl opacity-10 animate-float" style={{ animationDelay: '0.5s' }}>🎮</div>
        <div className="absolute top-1/2 left-5 text-2xl opacity-10 animate-float" style={{ animationDelay: '1.5s' }}>🚀</div>
      </div>

      <Header />
      
      <main className="relative z-10">
        {renderPage()}
      </main>

      {/* Modals */}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      {showProfile && <Profile onClose={() => setShowProfile(false)} />}
      {showGame && <GameModal />}
    </div>
  );
}

// Home Page Component
function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sol Kolon */}
        <div className="lg:col-span-8 space-y-6">
          {/* Timer ve Saat */}
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

          {/* Tarihte Bugün */}
          <TodayInHistory />

          {/* Alt Reklam */}
          <AdSpace size="banner" />
        </div>

        {/* Sağ Kolon */}
        <div className="lg:col-span-4 space-y-6">
          <Stats />
          <Leaderboard />
          <AdSpace size="square" />
        </div>
      </div>
    </div>
  );
}
