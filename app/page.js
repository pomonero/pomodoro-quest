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
import AdSpace, { HorizontalAd, VerticalAd, BillboardAd } from '@/components/AdSpace';
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
        // Önce local storage'dan profil yükle (hızlı)
        const localProfile = localStorage.getItem('pomonero_profile');
        const localStats = localStorage.getItem('pomonero_stats');
        if (localProfile) {
          try { setProfile(JSON.parse(localProfile)); } catch {}
        }
        if (localStats) {
          try { setStats(JSON.parse(localStats)); } catch {}
        }

        const user = await auth.getUser();
        if (user) {
          setUser(user);
          
          // Supabase'den profil çek (varsa local'i override et)
          try {
            const { data: profileData } = await db.getProfile(user.id);
            if (profileData) {
              setProfile(profileData);
              localStorage.setItem('pomonero_profile', JSON.stringify(profileData));
            }
          } catch (e) {
            console.log('Profile fetch error, using local:', e);
          }
          
          // Stats ve leaderboard arka planda
          db.getUserStats(user.id).then(stats => {
            if (stats) {
              setStats(stats);
              localStorage.setItem('pomonero_stats', JSON.stringify(stats));
            }
          }).catch(() => {});
          db.getLeaderboard().then(({ data }) => data && setLeaderboard(data)).catch(() => {});
        }
      } catch (err) {
        console.log('Auth check error:', err);
      }
      setLoading(false);
    };
    
    timeoutId = setTimeout(() => setLoading(false), 3000);
    checkUser();

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

  if (!mounted) return null;

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: theme.colors.background }}>
        <div className="text-center animate-fadeIn">
          <img src="/logo.png" alt="Pomonero" className="h-20 mx-auto mb-6 animate-pulse" />
          <div className="w-10 h-10 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // Auth
  if (!user) return <AuthScreen />;

  // Sayfa render
  const renderPage = () => {
    switch (currentPage) {
      case 'pomodoro': 
        return (
          <div className="space-y-6">
            <HorizontalAd />
            <PomodoroPage />
            <BillboardAd />
          </div>
        );
      case 'about': 
        return (
          <div className="space-y-6">
            <HorizontalAd />
            <AboutPage />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdSpace size="mediumRectangle" />
              <AdSpace size="mediumRectangle" />
            </div>
          </div>
        );
      case 'contact': 
        return (
          <div className="space-y-6">
            <ContactPage />
            <HorizontalAd />
          </div>
        );
      case 'support': 
        return (
          <div className="space-y-6">
            <HorizontalAd />
            <SupportPage />
            <AdSpace size="largeRectangle" className="max-w-md mx-auto" />
          </div>
        );
      case 'privacy': 
        return (
          <div className="space-y-6">
            <PrivacyPage />
            <HorizontalAd />
          </div>
        );
      default: 
        return (
          <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Üst Reklam - Mobil ve Desktop */}
            <div className="mb-6">
              <HorizontalAd className="hidden md:flex" />
              <AdSpace size="largeBanner" className="md:hidden" />
            </div>

            {/* MOBİL LAYOUT */}
            <div className="lg:hidden space-y-4">
              <Timer />
              <DailyInfo />
              <AdSpace size="mediumRectangle" />
              <Stats />
              <Weather />
              <Radio />
              <AdSpace size="largeBanner" />
              <Calendar />
              <Leaderboard />
              <AdSpace size="mediumRectangle" />
            </div>

            {/* DESKTOP LAYOUT - 3 kolon */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-6">
              {/* Sol Kolon */}
              <div className="lg:col-span-3 space-y-6">
                <LiveClock />
                <Weather />
                <Radio />
                <AdSpace size="square" />
                <VerticalAd />
              </div>
              
              {/* Orta Kolon */}
              <div className="lg:col-span-6 space-y-6">
                <Timer />
                <DailyInfo />
                <AdSpace size="leaderboard" />
                <Calendar />
                <BillboardAd />
              </div>
              
              {/* Sağ Kolon */}
              <div className="lg:col-span-3 space-y-6">
                <Stats />
                <Leaderboard />
                <AdSpace size="mediumRectangle" />
                <AdSpace size="square" />
              </div>
            </div>

            {/* Alt Reklam */}
            <div className="mt-6">
              <BillboardAd className="hidden md:flex" />
              <AdSpace size="largeBanner" className="md:hidden" />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-500" style={{ background: theme.colors.background }}>
      <Header />
      <main className="pb-8 animate-fadeIn">{renderPage()}</main>
      <GameModal />
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      {showProfile && <Profile />}
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
      `}</style>
    </div>
  );
}
