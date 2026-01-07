import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Supabase client - eğer env yoksa null döner
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const auth = {
  signUp: async (email, password, username) => {
    if (!supabase) return { data: null, error: { message: 'Supabase not configured' } };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } }
    });
    return { data, error };
  },
  
  signIn: async (email, password) => {
    if (!supabase) return { data: null, error: { message: 'Supabase not configured' } };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  },
  
  signOut: async () => {
    if (!supabase) return;
    return supabase.auth.signOut();
  },
  
  getUser: async () => {
    if (!supabase) return null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch {
      return null;
    }
  },
  
  onAuthStateChange: (callback) => {
    if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } };
    return supabase.auth.onAuthStateChange(callback);
  }
};

export const db = {
  getProfile: async (userId) => {
    if (!supabase) return { data: null, error: null };
    return supabase.from('profiles').select('*').eq('id', userId).single();
  },
  
  updateProfile: async (userId, updates) => {
    if (!supabase) return { data: null, error: null };
    return supabase.from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
  },
  
  startPomodoro: async (userId, sessionType, duration) => {
    if (!supabase) return { data: null, error: null };
    return supabase.from('pomodoro_sessions')
      .insert({
        user_id: userId,
        session_type: sessionType,
        duration,
        started_at: new Date().toISOString()
      })
      .select()
      .single();
  },
  
  completePomodoro: async (sessionId) => {
    if (!supabase) return { data: null, error: null };
    return supabase.from('pomodoro_sessions')
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq('id', sessionId)
      .select()
      .single();
  },
  
  getUserStats: async (userId) => {
    if (!supabase) return { totalSessions: 0, todaySessions: 0, totalFocusMinutes: 0, bestScore: 0 };
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: totalSessions } = await supabase
        .from('pomodoro_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('completed', true)
        .eq('session_type', 'work');
      
      const { count: todaySessions } = await supabase
        .from('pomodoro_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('completed', true)
        .eq('session_type', 'work')
        .gte('completed_at', today.toISOString());
      
      const { data: minutesData } = await supabase
        .from('pomodoro_sessions')
        .select('duration')
        .eq('user_id', userId)
        .eq('completed', true)
        .eq('session_type', 'work');
      
      const totalFocusMinutes = minutesData?.reduce((acc, s) => acc + (s.duration || 25), 0) || 0;
      
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
    } catch {
      return { totalSessions: 0, todaySessions: 0, totalFocusMinutes: 0, bestScore: 0 };
    }
  },
  
  getActivityByDateRange: async (userId, startDate, endDate) => {
    if (!supabase) return { data: [], error: null };
    return supabase
      .from('pomodoro_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', true)
      .eq('session_type', 'work')
      .gte('started_at', startDate)
      .lte('started_at', endDate);
  },
  
  saveGameScore: async (userId, gameType, score) => {
    if (!supabase) return { data: null, error: null };
    return supabase.from('game_scores')
      .insert({ user_id: userId, game_type: gameType, score })
      .select()
      .single();
  },
  
  getLeaderboard: async (limit = 10) => {
    if (!supabase) return { data: [], error: null };
    try {
      const { data, error } = await supabase
        .from('game_scores')
        .select('id, score, game_type, created_at, profiles!inner(username, avatar_emoji)')
        .order('score', { ascending: false })
        .limit(limit);
      
      return {
        data: data?.map(item => ({
          ...item,
          username: item.profiles?.username,
          avatar_emoji: item.profiles?.avatar_emoji,
          best_score: item.score
        })) || [],
        error
      };
    } catch {
      return { data: [], error: null };
    }
  },
  
  updateSettings: async (userId, settings) => {
    if (!supabase) return { data: null, error: null };
    return supabase.from('user_settings')
      .upsert({ user_id: userId, ...settings, updated_at: new Date().toISOString() })
      .select()
      .single();
  },
  
  updateStats: async (userId, stats) => {
    if (!supabase) return { data: null, error: null };
    // Stats'ı profiles tablosunda tutabiliriz veya ayrı bir tablo
    // Şimdilik local storage'da tutuluyor, sadece pomodoro_sessions'a ekleme yapıyoruz
    return { data: stats, error: null };
  },
};

export default supabase;
