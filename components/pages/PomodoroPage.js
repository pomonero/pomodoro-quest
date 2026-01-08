'use client';
import { useStore } from '@/lib/store';

export default function PomodoroPage() {
  const { language, setCurrentPage } = useStore();

  const goToTimer = () => {
    setCurrentPage('home');
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  };

  if (language === 'tr') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-orange-600 mb-6">
            <span className="text-4xl">🍅</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text)' }}>Pomodoro Tekniği Nedir?</h1>
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>Odaklanmanızı artırın, tükenmişliği önleyin</p>
        </div>

        <div className="card p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-3" style={{ color: 'var(--text)' }}><span>📜</span> Tarihçe</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Pomodoro Tekniği, 1980'lerde <strong>Francesco Cirillo</strong> tarafından geliştirilmiştir. 
            Domates şeklindeki zamanlayıcı ile kısa çalışma periyotları belirlemiştir.
          </p>
        </div>

        <div className="card p-6 mb-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--text)' }}><span>⚙️</span> Nasıl Çalışır?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { step: 1, icon: '📝', title: 'Görev Seçin', desc: 'Odaklanmak istediğiniz görevi belirleyin' },
              { step: 2, icon: '⏱️', title: '25 Dakika Çalışın', desc: 'Dikkatiniz dağılmadan çalışın' },
              { step: 3, icon: '☕', title: '5 Dakika Mola', desc: 'Kısa bir mola verin' },
              { step: 4, icon: '🔄', title: 'Tekrarlayın', desc: '4 pomodoro sonra uzun mola' },
            ].map((item) => (
              <div key={item.step} className="p-4 rounded-xl" style={{ background: 'var(--surface)' }}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-sm" style={{ background: 'var(--primary)' }}>{item.step}</span>
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <h3 className="font-bold mb-1" style={{ color: 'var(--text)' }}>{item.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6 mb-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--text)' }}><span>💪</span> Faydaları</h2>
          <div className="space-y-4">
            {[
              { icon: '🎯', title: 'Odaklanma', desc: 'Dikkatinizi tek işe vermenizi sağlar' },
              { icon: '🧠', title: 'Dinlenme', desc: 'Düzenli molalar beyni dinlendirir' },
              { icon: '📊', title: 'Takip', desc: 'İlerlemenizi görün' },
              { icon: '⚡', title: 'Motivasyon', desc: 'Ertelemeyi yenin' },
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

        <div className="text-center p-8 rounded-2xl" style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
          <h2 className="text-2xl font-bold text-white mb-4">Hemen Başlayın!</h2>
          <p className="text-white/80 mb-6">İlk pomodoro'nuzu tamamlayın.</p>
          <button onClick={goToTimer} className="px-8 py-3 bg-white rounded-xl font-bold hover:scale-105 transition-transform" style={{ color: 'var(--primary)' }}>
            🍅 Zamanlayıcıya Git
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-orange-600 mb-6">
          <span className="text-4xl">🍅</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text)' }}>What is Pomodoro Technique?</h1>
        <p className="text-lg" style={{ color: 'var(--text-muted)' }}>Boost your focus, prevent burnout</p>
      </div>

      <div className="card p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-3" style={{ color: 'var(--text)' }}><span>📜</span> History</h2>
        <p style={{ color: 'var(--text-muted)' }}>Developed by <strong>Francesco Cirillo</strong> in the 1980s using a tomato-shaped timer.</p>
      </div>

      <div className="card p-6 mb-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--text)' }}><span>⚙️</span> How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { step: 1, icon: '📝', title: 'Choose Task', desc: 'Select what to focus on' },
            { step: 2, icon: '⏱️', title: 'Work 25 Min', desc: 'Work without distractions' },
            { step: 3, icon: '☕', title: '5 Min Break', desc: 'Take a short break' },
            { step: 4, icon: '🔄', title: 'Repeat', desc: 'Long break after 4' },
          ].map((item) => (
            <div key={item.step} className="p-4 rounded-xl" style={{ background: 'var(--surface)' }}>
              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-sm" style={{ background: 'var(--primary)' }}>{item.step}</span>
                <span className="text-2xl">{item.icon}</span>
              </div>
              <h3 className="font-bold mb-1" style={{ color: 'var(--text)' }}>{item.title}</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center p-8 rounded-2xl" style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
        <h2 className="text-2xl font-bold text-white mb-4">Get Started!</h2>
        <button onClick={goToTimer} className="px-8 py-3 bg-white rounded-xl font-bold hover:scale-105 transition-transform" style={{ color: 'var(--primary)' }}>
          🍅 Go to Timer
        </button>
      </div>
    </div>
  );
}
