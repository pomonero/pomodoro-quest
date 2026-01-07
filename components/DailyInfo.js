'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

// Pozitif günlük bilgiler - motivasyon, ilginç bilgiler, ipuçları
const dailyFacts = {
  tr: [
    { icon: '🧠', text: 'Beyin günde yaklaşık 70.000 düşünce üretir. Bugün pozitif düşüncelere odaklan!' },
    { icon: '💪', text: 'Başarılı insanların %92\'si sabah rutinine sahiptir. Pomodoro ile rutinini oluştur!' },
    { icon: '📚', text: 'Günde sadece 25 dakika okumak, yılda 24 kitap okumana yardımcı olur.' },
    { icon: '🎯', text: 'Hedeflerini yazan kişiler, yazmayanlardan %42 daha başarılı oluyor.' },
    { icon: '☕', text: 'Bir fincan kahve, odaklanmanı 45 dakikaya kadar artırabilir.' },
    { icon: '🌱', text: 'Yeni bir alışkanlık oluşturmak ortalama 66 gün sürer. Bugün başla!' },
    { icon: '🎵', text: 'Müzik dinlerken çalışmak, bazı görevlerde verimliliği %15 artırır.' },
    { icon: '💧', text: 'Yeterli su içmek, beyin performansını %14 artırabilir.' },
    { icon: '🌅', text: 'Sabah güneş ışığına maruz kalmak, gece daha iyi uyumana yardımcı olur.' },
    { icon: '🧘', text: '5 dakikalık nefes egzersizi, stresi %40 oranında azaltabilir.' },
    { icon: '📝', text: 'Elle not almak, dijitale göre %34 daha iyi hafızaya yardımcı olur.' },
    { icon: '🚶', text: 'Kısa yürüyüşler, yaratıcılığı %60 oranında artırır.' },
    { icon: '😊', text: 'Gülümsemek, beyne mutluluk sinyalleri gönderir ve stresi azaltır.' },
    { icon: '🌿', text: 'Çalışma alanında bitki bulundurmak, verimliliği %15 artırır.' },
    { icon: '🎮', text: 'Kısa molalar vermek, uzun vadede üretkenliği artırır!' },
    { icon: '⭐', text: 'Bugün küçük bir adım at. Her büyük başarı küçük adımlarla başlar.' },
    { icon: '🌈', text: 'Pozitif düşünce, problem çözme yeteneğini %30 artırır.' },
    { icon: '🔥', text: 'Tutku ile yapılan işler, 3 kat daha kaliteli olur.' },
    { icon: '🎓', text: 'Öğrenmeye açık olmak, kariyer başarısının en büyük göstergesidir.' },
    { icon: '💡', text: 'En iyi fikirler genellikle molalarda ortaya çıkar. Dinlenmeyi unutma!' },
    { icon: '🏆', text: 'Düzenli çalışma, yetenekten daha önemlidir. Bugün de devam et!' },
    { icon: '🎨', text: 'Farklı renkler kullanmak, notları %55 daha akılda kalıcı yapar.' },
    { icon: '🤝', text: 'Başkalarına yardım etmek, kendi motivasyonunu da artırır.' },
    { icon: '📈', text: 'Her gün %1 gelişmek, yıl sonunda %37 daha iyi olmak demektir.' },
    { icon: '🌟', text: 'Sen bugün dünden daha iyisin. Kendine güven!' },
    { icon: '⏰', text: 'Sabahın ilk 2 saati, günün en verimli zamanıdır.' },
    { icon: '🎭', text: 'Pozitif insanlarla vakit geçirmek, başarı şansını artırır.' },
    { icon: '📱', text: 'Bildirimler kapatıldığında odaklanma %50 artar.' },
    { icon: '🥗', text: 'Sağlıklı beslenme, beyin fonksiyonlarını iyileştirir.' },
    { icon: '😴', text: '7-8 saat uyku, öğrenme kapasitesini %40 artırır.' },
  ],
  en: [
    { icon: '🧠', text: 'The brain produces about 70,000 thoughts a day. Focus on positive thoughts today!' },
    { icon: '💪', text: '92% of successful people have a morning routine. Create yours with Pomodoro!' },
    { icon: '📚', text: 'Reading just 25 minutes a day helps you read 24 books a year.' },
    { icon: '🎯', text: 'People who write down their goals are 42% more likely to achieve them.' },
    { icon: '☕', text: 'A cup of coffee can boost your focus for up to 45 minutes.' },
    { icon: '🌱', text: 'It takes an average of 66 days to form a new habit. Start today!' },
    { icon: '🎵', text: 'Listening to music while working can increase productivity by 15%.' },
    { icon: '💧', text: 'Staying hydrated can improve brain performance by 14%.' },
    { icon: '🌅', text: 'Morning sunlight exposure helps you sleep better at night.' },
    { icon: '🧘', text: 'A 5-minute breathing exercise can reduce stress by 40%.' },
    { icon: '📝', text: 'Handwriting notes helps memory 34% better than typing.' },
    { icon: '🚶', text: 'Short walks can increase creativity by 60%.' },
    { icon: '😊', text: 'Smiling sends happiness signals to your brain and reduces stress.' },
    { icon: '🌿', text: 'Having plants in your workspace increases productivity by 15%.' },
    { icon: '🎮', text: 'Taking short breaks increases long-term productivity!' },
    { icon: '⭐', text: 'Take a small step today. Every big success starts with small steps.' },
    { icon: '🌈', text: 'Positive thinking improves problem-solving ability by 30%.' },
    { icon: '🔥', text: 'Work done with passion is 3 times better quality.' },
    { icon: '🎓', text: 'Being open to learning is the greatest indicator of career success.' },
    { icon: '💡', text: 'The best ideas often come during breaks. Don\'t forget to rest!' },
    { icon: '🏆', text: 'Consistent work is more important than talent. Keep going today!' },
    { icon: '🎨', text: 'Using different colors makes notes 55% more memorable.' },
    { icon: '🤝', text: 'Helping others also increases your own motivation.' },
    { icon: '📈', text: 'Improving 1% every day means being 37% better by year end.' },
    { icon: '🌟', text: 'You are better today than yesterday. Believe in yourself!' },
    { icon: '⏰', text: 'The first 2 hours of morning are the most productive time.' },
    { icon: '🎭', text: 'Spending time with positive people increases your success.' },
    { icon: '📱', text: 'Turning off notifications increases focus by 50%.' },
    { icon: '🥗', text: 'Healthy eating improves brain function.' },
    { icon: '😴', text: '7-8 hours of sleep increases learning capacity by 40%.' },
  ]
};

export default function DailyInfo() {
  const { language } = useStore();
  const t = translations[language] || translations.tr;
  
  const [fact, setFact] = useState(null);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Günün tarihine göre sabit bir fact seç (aynı gün aynı fact)
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const facts = dailyFacts[language] || dailyFacts.tr;
    const index = dayOfYear % facts.length;
    
    setFact(facts[index]);
    setTimeout(() => setFadeIn(true), 100);
  }, [language]);

  const getRandomFact = () => {
    setFadeIn(false);
    setTimeout(() => {
      const facts = dailyFacts[language] || dailyFacts.tr;
      const randomIndex = Math.floor(Math.random() * facts.length);
      setFact(facts[randomIndex]);
      setFadeIn(true);
    }, 300);
  };

  if (!fact) return null;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <span className="text-lg">💡</span>
          </div>
          <div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
              {t.didYouKnow}
            </h3>
          </div>
        </div>
        <button
          onClick={getRandomFact}
          className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-all"
          style={{ color: 'var(--text-muted)' }}
          title={language === 'tr' ? 'Yeni bilgi' : 'New fact'}
        >
          🔄
        </button>
      </div>

      <div className={`transition-all duration-300 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
        <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'var(--surface)' }}>
          <span className="text-2xl shrink-0">{fact.icon}</span>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
            {fact.text}
          </p>
        </div>
      </div>
    </div>
  );
}
