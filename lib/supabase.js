import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL ve Anon Key .env.local dosyasında tanımlanmalı!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth yardımcı fonksiyonları
export const auth = {
  // Kayıt ol
  signUp: async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          display_name: username
        }
      }
    });
    return { data, error };
  },

  // Giriş yap
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // Çıkış yap
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Mevcut kullanıcı
  getUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Oturum dinle
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Veritabanı yardımcı fonksiyonları
export const db = {
  // Profil getir
  getProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  // Profil güncelle
  updateProfile: async (userId, updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId);
    return { data, error };
  },

  // Ayarları getir
  getSettings: async (userId) => {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  },

  // Ayarları güncelle
  updateSettings: async (userId, settings) => {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({ user_id: userId, ...settings, updated_at: new Date().toISOString() });
    return { data, error };
  },

  // Pomodoro oturumu başlat
  startPomodoro: async (userId, sessionType, durationMinutes) => {
    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .insert({
        user_id: userId,
        session_type: sessionType,
        duration_minutes: durationMinutes,
        completed: false
      })
      .select()
      .single();
    return { data, error };
  },

  // Pomodoro oturumu tamamla
  completePomodoro: async (sessionId) => {
    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq('id', sessionId);
    return { data, error };
  },

  // Oyun skoru kaydet
  saveGameScore: async (userId, gameType, score) => {
    const { data, error } = await supabase
      .from('game_scores')
      .insert({
        user_id: userId,
        game_type: gameType,
        score: score
      });
    return { data, error };
  },

  // Liderlik tablosu getir
  getLeaderboard: async (gameType = null, limit = 10) => {
    let query = supabase
      .from('daily_leaderboard')
      .select('username, game_type, best_score')
      .eq('date', new Date().toISOString().split('T')[0])
      .order('best_score', { ascending: false })
      .limit(limit);

    if (gameType) {
      query = query.eq('game_type', gameType);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // Tüm zamanların en iyileri
  getAllTimeLeaderboard: async (limit = 10) => {
    const { data, error } = await supabase
      .from('top_players')
      .select('*')
      .limit(limit);
    return { data, error };
  },

  // Kullanıcının istatistikleri
  getUserStats: async (userId) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_pomodoros, total_focus_minutes')
      .eq('id', userId)
      .single();

    const { data: todayPomodoros } = await supabase
      .from('pomodoro_sessions')
      .select('id')
      .eq('user_id', userId)
      .eq('completed', true)
      .gte('started_at', new Date().toISOString().split('T')[0]);

    const { data: bestScore } = await supabase
      .from('game_scores')
      .select('score')
      .eq('user_id', userId)
      .order('score', { ascending: false })
      .limit(1)
      .single();

    return {
      totalPomodoros: profile?.total_pomodoros || 0,
      totalFocusMinutes: profile?.total_focus_minutes || 0,
      todayPomodoros: todayPomodoros?.length || 0,
      bestScore: bestScore?.score || 0
    };
  }
};
