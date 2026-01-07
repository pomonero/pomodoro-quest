import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      profile: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      
      // Language
      language: 'tr',
      setLanguage: (language) => set({ language }),
      toggleLanguage: () => set((s) => ({ language: s.language === 'tr' ? 'en' : 'tr' })),
      
      // Theme
      currentTheme: 'midnight',
      setTheme: (currentTheme) => set({ currentTheme }),
      
      // Settings
      settings: {
        workDuration: 25,
        breakDuration: 5,
        longBreakDuration: 30,
        soundEnabled: true,
        notificationsEnabled: true,
        dailyGoal: 8
      },
      updateSettings: (newSettings) => set((s) => ({ settings: { ...s.settings, ...newSettings } })),
      
      // Timer Settings
      timerSettings: {
        focusTime: 25,
        shortBreakTime: 5,
        longBreakTime: 30,
        dailyGoal: 8,
        autoStartBreaks: false,
        autoStartPomodoros: false,
        soundEnabled: true,
        soundVolume: 50
      },
      setTimerSettings: (timerSettings) => set({ timerSettings }),
      
      // Timer
      timerState: {
        isRunning: false,
        timeLeft: 25 * 60,
        sessionType: 'work',
        completedSessions: 0,
        currentSessionId: null
      },
      setTimerState: (updates) => set((s) => ({ timerState: { ...s.timerState, ...updates } })),
      resetTimer: () => set((s) => ({
        timerState: {
          isRunning: false,
          timeLeft: s.settings.workDuration * 60,
          sessionType: 'work',
          completedSessions: 0,
          currentSessionId: null
        }
      })),
      
      // UI
      showSettings: false,
      setShowSettings: (show) => set({ showSettings: show }),
      showProfile: false,
      setShowProfile: (show) => set({ showProfile: show }),
      currentPage: 'home',
      setCurrentPage: (page) => set({ currentPage: page }),
      
      // Games
      showGame: false,
      currentGame: null,
      canPlayGame: false,
      setShowGame: (show) => set({ showGame: show }),
      setCurrentGame: (game) => set({ currentGame: game }),
      setCanPlayGame: (can) => set({ canPlayGame: can }),
      
      // Stats
      stats: {
        totalSessions: 0,
        todaySessions: 0,
        totalFocusMinutes: 0,
        bestScore: 0
      },
      setStats: (stats) => set({ stats }),
      
      // Leaderboard
      leaderboard: [],
      setLeaderboard: (data) => set({ leaderboard: data }),
    }),
    {
      name: 'pomonero-storage',
      partialize: (state) => ({
        language: state.language,
        currentTheme: state.currentTheme,
        settings: state.settings,
        timerSettings: state.timerSettings
      })
    }
  )
);
