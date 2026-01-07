'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

export default function ContactPage() {
  const { language } = useStore();
  const t = translations[language] || translations.tr;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Form gönderme işlemi
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 mb-6">
          <span className="text-4xl">📧</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text)' }}>
          {t.contactTitle}
        </h1>
        <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
          {t.contactText}
        </p>
      </div>

      {/* Contact Form */}
      <div className="card p-6">
        {submitted ? (
          <div className="text-center py-8">
            <span className="text-6xl mb-4 block">✅</span>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>
              {language === 'tr' ? 'Mesajınız Gönderildi!' : 'Message Sent!'}
            </h3>
            <p style={{ color: 'var(--text-muted)' }}>
              {language === 'tr' ? 'En kısa sürede dönüş yapacağız.' : 'We will get back to you soon.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                  {language === 'tr' ? 'Adınız' : 'Your Name'}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-modern"
                  placeholder={language === 'tr' ? 'Adınızı girin' : 'Enter your name'}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                  {t.contactEmail}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-modern"
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                {t.contactSubject}
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="input-modern"
                placeholder={language === 'tr' ? 'Konu başlığı' : 'Subject'}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                {t.contactMessage}
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="input-modern min-h-[150px] resize-none"
                placeholder={language === 'tr' ? 'Mesajınızı buraya yazın...' : 'Write your message here...'}
                required
              />
            </div>

            <button type="submit" className="w-full btn-primary py-3">
              {t.contactSend}
            </button>
          </form>
        )}
      </div>

      {/* Social Links */}
      <div className="mt-8 text-center">
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          {language === 'tr' ? 'Bizi takip edin' : 'Follow us'}
        </p>
        <div className="flex justify-center gap-4">
          <a href="#" className="w-10 h-10 rounded-full bg-[var(--surface)] flex items-center justify-center hover:bg-[var(--surface-hover)] transition-colors">
            <span>🐦</span>
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-[var(--surface)] flex items-center justify-center hover:bg-[var(--surface-hover)] transition-colors">
            <span>📸</span>
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-[var(--surface)] flex items-center justify-center hover:bg-[var(--surface-hover)] transition-colors">
            <span>💬</span>
          </a>
        </div>
      </div>
    </div>
  );
}
