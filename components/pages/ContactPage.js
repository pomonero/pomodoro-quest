'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

export default function ContactPage() {
  const { language, profile } = useStore();
  const t = translations[language] || translations.tr;
  
  const [formData, setFormData] = useState({ subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // FormSubmit.co kullanarak mail gönder - kullanıcı görmez
      const response = await fetch('https://formsubmit.co/ajax/aliiduurak@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `[Pomonero] ${formData.subject}`,
          Kullanici: profile?.username || 'Anonim',
          Email: profile?.email || 'Bilinmiyor',
          Mesaj: formData.message,
          _template: 'table'
        })
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({ subject: '', message: '' });
      } else {
        throw new Error('Failed');
      }
    } catch (err) {
      setError(language === 'tr' ? 'Mesaj gönderilemedi. Lütfen tekrar deneyin.' : 'Failed to send. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 mb-4">
          <span className="text-3xl">📧</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
          {language === 'tr' ? 'Bize Ulaşın' : 'Contact Us'}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {language === 'tr' ? 'Soru, öneri veya geri bildirimlerinizi bekliyoruz.' : 'We welcome your questions, suggestions or feedback.'}
        </p>
      </div>

      {/* Form Card */}
      <div className="card p-6">
        {submitted ? (
          <div className="text-center py-8">
            <span className="text-5xl mb-4 block">✅</span>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>
              {language === 'tr' ? 'Mesajınız Gönderildi!' : 'Message Sent!'}
            </h3>
            <p className="mb-4" style={{ color: 'var(--text-muted)' }}>
              {language === 'tr' ? 'En kısa sürede size dönüş yapacağız.' : 'We will get back to you soon.'}
            </p>
            <button onClick={() => setSubmitted(false)} className="btn-primary">
              {language === 'tr' ? 'Yeni Mesaj' : 'New Message'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User Info */}
            <div className="p-3 rounded-xl" style={{ background: 'var(--surface)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                {language === 'tr' ? 'Gönderen' : 'From'}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xl">{profile?.avatar_emoji || '😊'}</span>
                <span className="font-medium" style={{ color: 'var(--text)' }}>@{profile?.username || 'Kullanıcı'}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                {language === 'tr' ? 'Konu' : 'Subject'} *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="input-modern"
                placeholder={language === 'tr' ? 'Mesajınızın konusu' : 'Subject of your message'}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                {language === 'tr' ? 'Mesaj' : 'Message'} *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="input-modern min-h-[120px] resize-none"
                placeholder={language === 'tr' ? 'Mesajınızı buraya yazın...' : 'Write your message here...'}
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">⚠️ {error}</div>
            )}

            <button type="submit" disabled={submitting} className="w-full btn-primary py-3 disabled:opacity-50">
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  {language === 'tr' ? 'Gönderiliyor...' : 'Sending...'}
                </span>
              ) : (
                <span>📧 {language === 'tr' ? 'Gönder' : 'Send'}</span>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 text-center">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {language === 'tr' 
            ? 'Mesajınız doğrudan ekibimize ulaşacaktır.' 
            : 'Your message will reach our team directly.'}
        </p>
      </div>
    </div>
  );
}
