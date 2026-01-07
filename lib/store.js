import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      // Kullanıcı durumu
      user: null,
      profile: null,
      isLoading: true,
      
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),

      // Tema
      darkMode: true,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      // Timer ayarları
      settings: {
        workDuration: 25,
        breakDuration: 5,
        longBreakDuration: 30,
        soundEnabled: true
      },
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      // Timer durumu
      timerState: {
        isRunning: false,
        timeLeft: 25 * 60,
        sessionType: 'work',
        completedPomodoros: 0,
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
          completedPomodoros: 0,
          currentSessionId: null
        }
      })),

      // Modals
      showSettings: false,
      setShowSettings: (show) => set({ showSettings: show }),
      
      showProfile: false,
      setShowProfile: (show) => set({ showProfile: show }),

      // Oyun durumu
      showGame: false,
      currentGame: null,
      gameScore: 0,
      canPlayGame: false,
      
      setShowGame: (show) => set({ showGame: show }),
      setCurrentGame: (game) => set({ currentGame: game }),
      setGameScore: (score) => set({ gameScore: score }),
      setCanPlayGame: (can) => set({ canPlayGame: can }),

      // İstatistikler
      stats: {
        totalPomodoros: 0,
        todayPomodoros: 0,
        totalFocusMinutes: 0,
        bestScore: 0
      },
      setStats: (stats) => set({ stats }),

      // Liderlik tablosu
      leaderboard: [],
      setLeaderboard: (data) => set({ leaderboard: data })
    }),
    {
      name: 'pomonero-storage',
      partialize: (state) => ({
        darkMode: state.darkMode,
        settings: state.settings
      })
    }
  )
);
