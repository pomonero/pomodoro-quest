import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

// Auth functions
export const auth = {
  signUp: async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });
    return { data, error };
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Database functions
export const db = {
  // Profile
  getProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  updateProfile: async (userId, updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  // Pomodoro Sessions
  startPomodoro: async (userId, sessionType, duration) => {
    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .insert({
        user_id: userId,
        session_type: sessionType,
        duration: duration,
        started_at: new Date().toISOString()
      })
      .select()
      .single();
    return { data, error };
  },

  completePomodoro: async (sessionId) => {
    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .update({
        completed: true,
        completed_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single();
    return { data, error };
  },

  // User Stats
  getUserStats: async (userId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total sessions
    const { count: totalSessions } = await supabase
      .from('pomodoro_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('completed', true)
      .eq('session_type', 'work');

    // Today's sessions
    const { count: todaySessions } = await supabase
      .from('pomodoro_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('completed', true)
      .eq('session_type', 'work')
      .gte('completed_at', today.toISOString());

    // Total focus minutes
    const { data: minutesData } = await supabase
      .from('pomodoro_sessions')
      .select('duration')
      .eq('user_id', userId)
      .eq('completed', true)
      .eq('session_type', 'work');

    const totalFocusMinutes = minutesData?.reduce((acc, s) => acc + (s.duration || 25), 0) || 0;

    // Best game score
    const { data: scoreData } = await supabase
      .from('game_scores')
      .select('score')
      .eq('user_id', userId)
      .order('score', { ascending: false })
      .limit(1)
      .single();

    return {
      totalSessions: totalSessions || 0,
      todaySessions: todaySessions || 0,
      totalFocusMinutes,
      bestScore: scoreData?.score || 0
    };
  },

  // Activity by date range
  getActivityByDateRange: async (userId, startDate, endDate) => {
    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', true)
      .eq('session_type', 'work')
      .gte('started_at', startDate)
      .lte('started_at', endDate);
    return { data, error };
  },

  // Game Scores
  saveGameScore: async (userId, gameType, score) => {
    const { data, error } = await supabase
      .from('game_scores')
      .insert({
        user_id: userId,
        game_type: gameType,
        score: score
      })
      .select()
      .single();
    return { data, error };
  },

  // Leaderboard
  getLeaderboard: async (gameType = null, limit = 10) => {
    let query = supabase
      .from('game_scores')
      .select(`
        id,
        score,
        game_type,
        created_at,
        profiles!inner(username)
      `)
      .order('score', { ascending: false })
      .limit(limit);

    if (gameType) {
      query = query.eq('game_type', gameType);
    }

    const { data, error } = await query;

    // Format data
    const formattedData = data?.map(item => ({
      ...item,
      username: item.profiles?.username,
      best_score: item.score
    })) || [];

    return { data: formattedData, error };
  },

  // Settings
  updateSettings: async (userId, settings) => {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        ...settings,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    return { data, error };
  },

  getSettings: async (userId) => {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  }
};

export default supabase;
