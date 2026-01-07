import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      // ==================
      // KULLANICI DURUMU
      // ==================
      user: null,
      profile: null,
      isLoading: true,
      
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),

      // ==================
      // DİL AYARLARI
      // ==================
      language: 'tr',
      setLanguage: (language) => set({ language }),
      toggleLanguage: () => set((state) => ({ 
        language: state.language === 'tr' ? 'en' : 'tr' 
      })),

      // ==================
      // TEMA AYARLARI
      // ==================
      currentTheme: 'midnight',
      setTheme: (currentTheme) => set({ currentTheme }),

      // ==================
      // TIMER AYARLARI
      // ==================
      settings: {
        workDuration: 25,
        breakDuration: 5,
        longBreakDuration: 30,
        soundEnabled: true,
        notificationsEnabled: true
      },
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      // ==================
      // TIMER DURUMU
      // ==================
      timerState: {
        isRunning: false,
        timeLeft: 25 * 60,
        sessionType: 'work', // work, break, longBreak
        completedSessions: 0,
        currentSessionId: null
      },
      setTimerState: (updates) => set((state) => ({
        timerState: { ...state.timerState, ...updates }
      })),
      resetTimer: () => set((state) => ({
        timerState: {
          isRunning: false,
          timeLeft: state.settings.workDuration * 60,
          sessionType: 'work',
          completedSessions: 0,
          currentSessionId: null
        }
      })),

      // ==================
      // MODALS & NAVIGATION
      // ==================
      showSettings: false,
      setShowSettings: (show) => set({ showSettings: show }),
      
      showProfile: false,
      setShowProfile: (show) => set({ showProfile: show }),
      
      showSidebar: false,
      setShowSidebar: (show) => set({ showSidebar: show }),
      
      currentPage: 'home',
      setCurrentPage: (page) => set({ currentPage: page }),

      // ==================
      // OYUN DURUMU
      // ==================
      showGame: false,
      currentGame: null,
      canPlayGame: false,
      
      setShowGame: (show) => set({ showGame: show }),
      setCurrentGame: (game) => set({ currentGame: game }),
      setCanPlayGame: (can) => set({ canPlayGame: can }),

      // ==================
      // İSTATİSTİKLER
      // ==================
      stats: {
        totalSessions: 0,
        todaySessions: 0,
        totalFocusMinutes: 0,
        bestScore: 0,
        currentStreak: 0
      },
      setStats: (stats) => set({ stats }),

      // ==================
      // LİDERLİK TABLOSU
      // ==================
      leaderboard: [],
      setLeaderboard: (data) => set({ leaderboard: data }),

      // ==================
      // TARİHTE BUGÜN
      // ==================
      todayInHistory: null,
      setTodayInHistory: (data) => set({ todayInHistory: data }),
    }),
    {
      name: 'pomonero-storage',
      partialize: (state) => ({
        language: state.language,
        currentTheme: state.currentTheme,
        settings: state.settings
      })
    }
  )
);
