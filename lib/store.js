import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      user: null, profile: null, isLoading: true,
      setUser: (user) => set({ user }), setProfile: (profile) => set({ profile }), setLoading: (isLoading) => set({ isLoading }),
      language: 'tr', setLanguage: (language) => set({ language }), toggleLanguage: () => set((s) => ({ language: s.language === 'tr' ? 'en' : 'tr' })),
      currentTheme: 'midnight', setTheme: (currentTheme) => set({ currentTheme }),
      settings: { workDuration: 25, breakDuration: 5, longBreakDuration: 30, soundEnabled: true, notificationsEnabled: true },
      updateSettings: (newSettings) => set((s) => ({ settings: { ...s.settings, ...newSettings } })),
      timerState: { isRunning: false, timeLeft: 25 * 60, sessionType: 'work', completedSessions: 0, currentSessionId: null },
      setTimerState: (updates) => set((s) => ({ timerState: { ...s.timerState, ...updates } })),
      resetTimer: () => set((s) => ({ timerState: { isRunning: false, timeLeft: s.settings.workDuration * 60, sessionType: 'work', completedSessions: 0, currentSessionId: null } })),
      showSettings: false, setShowSettings: (show) => set({ showSettings: show }),
      showProfile: false, setShowProfile: (show) => set({ showProfile: show }),
      showSidebar: false, setShowSidebar: (show) => set({ showSidebar: show }),
      currentPage: 'home', setCurrentPage: (page) => set({ currentPage: page }),
      showGame: false, currentGame: null, canPlayGame: false,
      setShowGame: (show) => set({ showGame: show }), setCurrentGame: (game) => set({ currentGame: game }), setCanPlayGame: (can) => set({ canPlayGame: can }),
      stats: { totalSessions: 0, todaySessions: 0, totalFocusMinutes: 0, bestScore: 0, currentStreak: 0 },
      setStats: (stats) => set({ stats }),
      leaderboard: [], setLeaderboard: (data) => set({ leaderboard: data }),
    }),
    { name: 'pomonero-storage', partialize: (s) => ({ language: s.language, currentTheme: s.currentTheme, settings: s.settings }) }
  )
);
