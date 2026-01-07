'use client';
import { useStore } from '@/lib/store';

export default function PomodoroPage() {
  const { language } = useStore();

  if (language === 'tr') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-orange-600 mb-6">
            <span className="text-4xl">🍅</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text)' }}>
            Pomodoro Tekniği Nedir?
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
            Odaklanmanızı artırın, tükenmişliği önleyin, daha verimli çalışın
          </p>
        </div>

        {/* Tarihçe */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-3" style={{ color: 'var(--text)' }}>
            <span>📜</span> Tarihçe
          </h2>
          <p className="mb-4" style={{ color: 'var(--text-muted)' }}>
            Pomodoro Tekniği, 1980'lerin sonunda <strong>Francesco Cirillo</strong> tarafından geliştirilmiştir. 
            Üniversite öğrencisiyken konsantrasyon sorunları yaşayan Cirillo, mutfaktaki domates şeklindeki 
            (İtalyanca: pomodoro) zamanlayıcıyı kullanarak kendine kısa çalışma periyotları belirlemiştir.
          </p>
          <p style={{ color: 'var(--text-muted)' }}>
            Başlangıçta sadece 10 dakika odaklanmayı hedefleyen bu yöntem, zamanla gelişerek bugün dünya 
            genelinde milyonlarca insanın kullandığı bir verimlilik tekniğine dönüşmüştür.
          </p>
        </div>

        {/* Nasıl Çalışır */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--text)' }}>
            <span>⚙️</span> Nasıl Çalışır?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { step: 1, icon: '📝', title: 'Görev Seçin', desc: 'Odaklanmak istediğiniz bir görev belirleyin' },
              { step: 2, icon: '⏱️', title: '25 Dakika Çalışın', desc: 'Zamanlayıcıyı ayarlayın ve hiç dikkatiniz dağılmadan çalışın' },
              { step: 3, icon: '☕', title: '5 Dakika Mola', desc: 'Kısa bir mola verin, beyninizi dinlendirin' },
              { step: 4, icon: '🔄', title: 'Tekrarlayın', desc: '4 pomodoro sonra 30 dakikalık uzun mola verin' },
            ].map((item) => (
              <div key={item.step} className="p-4 rounded-xl" style={{ background: 'var(--surface)' }}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-sm">
                    {item.step}
                  </span>
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <h3 className="font-bold mb-1" style={{ color: 'var(--text)' }}>{item.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Neden Kullanmalı */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--text)' }}>
            <span>💪</span> Neden Pomodoro Kullanmalısınız?
          </h2>
          <div className="space-y-4">
            {[
              { icon: '🎯', title: 'Odaklanma Gücünüzü Artırır', desc: 'Kısa ve yoğun çalışma periyotları, dikkatinizi tek bir işe vermenizi sağlar. Böylece daha az zamanda daha çok iş başarırsınız.' },
              { icon: '🧠', title: 'Zihinsel Yorgunluğu Önler', desc: 'Düzenli molalar beyninizin dinlenmesini sağlar. Bu sayede gün boyu enerjik ve üretken kalabilirsiniz.' },
              { icon: '📊', title: 'İlerlemenizi Takip Edersiniz', desc: 'Her tamamlanan pomodoro bir başarıdır. Günlük, haftalık ve aylık istatistiklerinizi görerek motivasyonunuzu korursunuz.' },
              { icon: '⚡', title: 'Erteleme Alışkanlığını Yenersiniz', desc: '"Sadece 25 dakika" demek, büyük görevleri başlatmayı kolaylaştırır. Küçük adımlar büyük başarılara götürür.' },
              { icon: '⏰', title: 'Zaman Yönetimini Öğrenirsiniz', desc: 'Görevlerin ne kadar sürdüğünü daha iyi tahmin etmeye başlarsınız. Planlama becerileriniz gelişir.' },
              { icon: '🌟', title: 'İş-Yaşam Dengesini Korursunuz', desc: 'Net çalışma ve mola süreleri, gün boyu dengeli bir tempo tutmanızı sağlar.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl" style={{ background: 'var(--surface)' }}>
                <span className="text-3xl">{item.icon}</span>
                <div>
                  <h3 className="font-bold mb-1" style={{ color: 'var(--text)' }}>{item.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* İpuçları */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--text)' }}>
            <span>💡</span> Etkili Kullanım İpuçları
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              '📱 Pomodoro sırasında telefonunuzu sessize alın veya başka odaya bırakın',
              '📋 Günün başında yapılacaklar listesi hazırlayın',
              '🚫 Mola sırasında sosyal medya yerine kısa yürüyüş yapın',
              '💧 Su içmeyi ve göz egzersizlerini unutmayın',
              '📝 Dikkatinizi dağıtan şeyleri not alın, sonra halledin',
              '🎯 Zor görevleri enerjinizin yüksek olduğu saatlere planlayın',
            ].map((tip, i) => (
              <div key={i} className="p-3 rounded-xl flex items-start gap-2" style={{ background: 'var(--surface)' }}>
                <span className="text-green-500">✓</span>
                <span className="text-sm" style={{ color: 'var(--text)' }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-8 rounded-2xl" style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
          <h2 className="text-2xl font-bold text-white mb-4">Hemen Başlayın!</h2>
          <p className="text-white/80 mb-6">İlk pomodoro'nuzu tamamlayarak verimlilik yolculuğunuza adım atın.</p>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-8 py-3 bg-white rounded-xl font-bold text-[var(--primary)] hover:scale-105 transition-transform"
          >
            🍅 Zamanlayıcıya Git
          </button>
        </div>
      </div>
    );
  }

  // English version
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-orange-600 mb-6">
          <span className="text-4xl">🍅</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text)' }}>
          What is the Pomodoro Technique?
        </h1>
        <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
          Boost your focus, prevent burnout, work more efficiently
        </p>
      </div>

      {/* History */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-3" style={{ color: 'var(--text)' }}>
          <span>📜</span> History
        </h2>
        <p className="mb-4" style={{ color: 'var(--text-muted)' }}>
          The Pomodoro Technique was developed by <strong>Francesco Cirillo</strong> in the late 1980s. 
          As a university student struggling with concentration, Cirillo used a tomato-shaped 
          (Italian: pomodoro) kitchen timer to set short work periods for himself.
        </p>
        <p style={{ color: 'var(--text-muted)' }}>
          Initially aiming to focus for just 10 minutes, this method evolved over time into a 
          productivity technique used by millions of people worldwide today.
        </p>
      </div>

      {/* How It Works */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--text)' }}>
          <span>⚙️</span> How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { step: 1, icon: '📝', title: 'Choose a Task', desc: 'Select a task you want to focus on' },
            { step: 2, icon: '⏱️', title: 'Work for 25 Minutes', desc: 'Set the timer and work without any distractions' },
            { step: 3, icon: '☕', title: '5 Minute Break', desc: 'Take a short break to rest your mind' },
            { step: 4, icon: '🔄', title: 'Repeat', desc: 'After 4 pomodoros, take a 30-minute long break' },
          ].map((item) => (
            <div key={item.step} className="p-4 rounded-xl" style={{ background: 'var(--surface)' }}>
              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-sm">
                  {item.step}
                </span>
                <span className="text-2xl">{item.icon}</span>
              </div>
              <h3 className="font-bold mb-1" style={{ color: 'var(--text)' }}>{item.title}</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Why Use It */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--text)' }}>
          <span>💪</span> Why Should You Use Pomodoro?
        </h2>
        <div className="space-y-4">
          {[
            { icon: '🎯', title: 'Improves Your Focus', desc: 'Short, intense work periods help you concentrate on one task. You accomplish more in less time.' },
            { icon: '🧠', title: 'Prevents Mental Fatigue', desc: 'Regular breaks allow your brain to rest. This way, you can stay energetic and productive throughout the day.' },
            { icon: '📊', title: 'Track Your Progress', desc: 'Every completed pomodoro is an achievement. Stay motivated by viewing your daily, weekly, and monthly stats.' },
            { icon: '⚡', title: 'Overcome Procrastination', desc: 'Saying "just 25 minutes" makes it easier to start big tasks. Small steps lead to big achievements.' },
            { icon: '⏰', title: 'Learn Time Management', desc: 'You start to better estimate how long tasks take. Your planning skills improve.' },
            { icon: '🌟', title: 'Maintain Work-Life Balance', desc: 'Clear work and break times help you maintain a balanced pace throughout the day.' },
          ].map((item, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-xl" style={{ background: 'var(--surface)' }}>
              <span className="text-3xl">{item.icon}</span>
              <div>
                <h3 className="font-bold mb-1" style={{ color: 'var(--text)' }}>{item.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--text)' }}>
          <span>💡</span> Effective Usage Tips
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            '📱 Put your phone on silent or in another room during pomodoros',
            '📋 Prepare a to-do list at the start of the day',
            '🚫 Take short walks instead of social media during breaks',
            '💧 Remember to drink water and do eye exercises',
            '📝 Note down distractions to deal with later',
            '🎯 Schedule difficult tasks when your energy is highest',
          ].map((tip, i) => (
            <div key={i} className="p-3 rounded-xl flex items-start gap-2" style={{ background: 'var(--surface)' }}>
              <span className="text-green-500">✓</span>
              <span className="text-sm" style={{ color: 'var(--text)' }}>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center p-8 rounded-2xl" style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
        <h2 className="text-2xl font-bold text-white mb-4">Get Started Now!</h2>
        <p className="text-white/80 mb-6">Take the first step on your productivity journey by completing your first pomodoro.</p>
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="px-8 py-3 bg-white rounded-xl font-bold text-[var(--primary)] hover:scale-105 transition-transform"
        >
          🍅 Go to Timer
        </button>
      </div>
    </div>
  );
}
