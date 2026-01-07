import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');

export const auth = {
  signUp: async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { username } } });
    return { data, error };
  },
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  },
  signOut: async () => supabase.auth.signOut(),
  getUser: async () => { const { data: { user } } = await supabase.auth.getUser(); return user; },
  onAuthStateChange: (callback) => supabase.auth.onAuthStateChange(callback)
};

export const db = {
  getProfile: async (userId) => supabase.from('profiles').select('*').eq('id', userId).single(),
  updateProfile: async (userId, updates) => supabase.from('profiles').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', userId).select().single(),
  startPomodoro: async (userId, sessionType, duration) => supabase.from('pomodoro_sessions').insert({ user_id: userId, session_type: sessionType, duration, started_at: new Date().toISOString() }).select().single(),
  completePomodoro: async (sessionId) => supabase.from('pomodoro_sessions').update({ completed: true, completed_at: new Date().toISOString() }).eq('id', sessionId).select().single(),
  getUserStats: async (userId) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const { count: totalSessions } = await supabase.from('pomodoro_sessions').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('completed', true).eq('session_type', 'work');
    const { count: todaySessions } = await supabase.from('pomodoro_sessions').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('completed', true).eq('session_type', 'work').gte('completed_at', today.toISOString());
    const { data: minutesData } = await supabase.from('pomodoro_sessions').select('duration').eq('user_id', userId).eq('completed', true).eq('session_type', 'work');
    const totalFocusMinutes = minutesData?.reduce((acc, s) => acc + (s.duration || 25), 0) || 0;
    const { data: scoreData } = await supabase.from('game_scores').select('score').eq('user_id', userId).order('score', { ascending: false }).limit(1).single();
    return { totalSessions: totalSessions || 0, todaySessions: todaySessions || 0, totalFocusMinutes, bestScore: scoreData?.score || 0 };
  },
  getActivityByDateRange: async (userId, startDate, endDate) => supabase.from('pomodoro_sessions').select('*').eq('user_id', userId).eq('completed', true).eq('session_type', 'work').gte('started_at', startDate).lte('started_at', endDate),
  saveGameScore: async (userId, gameType, score) => supabase.from('game_scores').insert({ user_id: userId, game_type: gameType, score }).select().single(),
  getLeaderboard: async (gameType = null, limit = 10) => {
    let query = supabase.from('game_scores').select('id, score, game_type, created_at, profiles!inner(username)').order('score', { ascending: false }).limit(limit);
    if (gameType) query = query.eq('game_type', gameType);
    const { data, error } = await query;
    return { data: data?.map(item => ({ ...item, username: item.profiles?.username, best_score: item.score })) || [], error };
  },
  updateSettings: async (userId, settings) => supabase.from('user_settings').upsert({ user_id: userId, ...settings, updated_at: new Date().toISOString() }).select().single(),
};

export default supabase;
