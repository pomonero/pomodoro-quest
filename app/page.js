'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { themes } from '@/lib/themes';

// Components
import AuthScreen from '@/components/AuthScreen';
import Header from '@/components/Header';
import Timer from '@/components/Timer';
import Stats from '@/components/Stats';
import Calendar from '@/components/Calendar';
import Leaderboard from '@/components/Leaderboard';
import LiveClock from '@/components/LiveClock';
import Weather from '@/components/Weather';
import Radio from '@/components/Radio';
import DailyInfo from '@/components/DailyInfo';
import AdSpace from '@/components/AdSpace';
import GameModal from '@/components/GameModal';
import Settings from '@/components/Settings';
import Profile from '@/components/Profile';
import PomodoroPage from '@/components/pages/PomodoroPage';
import AboutPage from '@/components/pages/AboutPage';
import ContactPage from '@/components/pages/ContactPage';
import SupportPage from '@/components/pages/SupportPage';
import PrivacyPage from '@/components/pages/PrivacyPage';

export default function Home() {
  const { 
    user, setUser, profile, setProfile, 
    isLoading, setLoading, currentTheme, 
    showSettings, setShowSettings, 
    showProfile, setShowProfile, 
    currentPage, setStats, setLeaderboard 
  } = useStore();
  
  const theme = themes[currentTheme] || themes.midnight;
  const [mounted, setMounted] = useState(false);

  // Theme uygula
  useEffect(() => {
    setMounted(true);
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.body.style.background = theme.colors.background;
  }, [currentTheme, theme]);

  // Auth kontrolü - 3 saniye timeout
  useEffect(() => {
    let timeoutId;
    
    const checkUser = async () => {
      try {
        const user = await auth.getUser();
        if (user) {
          setUser(user);
          
          // Profile'ı al
          const { data: profileData } = await db.getProfile(user.id);
          if (profileData) setProfile(profileData);
          
          // Stats ve leaderboard arka planda yükle
          db.getUserStats(user.id).then(stats => setStats(stats)).catch(() => {});
          db.getLeaderboard().then(({ data }) => data && setLeaderboard(data)).catch(() => {});
        }
      } catch (err) {
        console.log('Auth check error:', err);
      }
      setLoading(false);
    };
    
    // 3 saniye timeout - eğer Supabase yanıt vermezse loading'i kapat
    timeoutId = setTimeout(() => {
      setLoading(false);
    }, 3000);
    
    checkUser();

    // Auth state değişikliklerini dinle
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        const { data: profileData } = await db.getProfile(session.user.id);
        if (profileData) setProfile(profileData);
        db.getUserStats(session.user.id).then(stats => setStats(stats)).catch(() => {});
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      clearTimeout(timeoutId);
      subscription?.unsubscribe();
    };
  }, []);

  // Henüz mount olmadıysa boş döndür
  if (!mounted) return null;

  // Loading ekranı
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: theme.colors.background }}>
        <div className="text-center">
          <img src="/logo.png" alt="Pomonero" className="h-14 mx-auto mb-4" />
          <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Giriş yapılmamışsa auth ekranı
  if (!user) return <AuthScreen />;

  // Sayfa render
  const renderPage = () => {
    switch (currentPage) {
      case 'pomodoro': return <PomodoroPage />;
      case 'about': return <AboutPage />;
      case 'contact': return <ContactPage />;
      case 'support': return <SupportPage />;
      case 'privacy': return <PrivacyPage />;
      default: return (
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* MOBİL - Timer en üstte */}
          <div className="lg:hidden space-y-4">
            <Timer />
            <DailyInfo />
            <Stats />
            <Weather />
            <Radio />
            <Calendar />
            <Leaderboard />
          </div>

          {/* DESKTOP - 3 kolon */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <LiveClock />
              <Weather />
              <Radio />
              <AdSpace size="square" />
            </div>
            <div className="lg:col-span-6 space-y-6">
              <Timer />
              <DailyInfo />
              <Calendar />
            </div>
            <div className="lg:col-span-3 space-y-6">
              <Stats />
              <Leaderboard />
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen" style={{ background: theme.colors.background }}>
      <Header />
      <main className="pb-8">{renderPage()}</main>
      <GameModal />
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      {showProfile && <Profile onClose={() => setShowProfile(false)} />}
    </div>
  );
}
