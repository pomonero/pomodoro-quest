export const themes = {
  midnight: {
    id: 'midnight', name: 'Gece Yarısı', nameEn: 'Midnight', type: 'dark', pixelArt: '🌙',
    colors: { background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #16213e 100%)', surface: 'rgba(26, 26, 46, 0.9)', primary: '#6366f1', text: '#ffffff', textMuted: '#94a3b8' }
  },
  ocean: {
    id: 'ocean', name: 'Okyanus', nameEn: 'Ocean', type: 'dark', pixelArt: '🌊',
    colors: { background: 'linear-gradient(135deg, #0c1929 0%, #1e3a5f 50%, #0d2137 100%)', surface: 'rgba(14, 40, 70, 0.9)', primary: '#0ea5e9', text: '#ffffff', textMuted: '#7dd3fc' }
  },
  forest: {
    id: 'forest', name: 'Orman', nameEn: 'Forest', type: 'dark', pixelArt: '🌲',
    colors: { background: 'linear-gradient(135deg, #0a1f0a 0%, #1a3a1a 50%, #0d2818 100%)', surface: 'rgba(20, 50, 30, 0.9)', primary: '#22c55e', text: '#ffffff', textMuted: '#86efac' }
  },
  sunset: {
    id: 'sunset', name: 'Gün Batımı', nameEn: 'Sunset', type: 'dark', pixelArt: '🌅',
    colors: { background: 'linear-gradient(135deg, #1a0a1a 0%, #3d1a3d 50%, #2d1f1f 100%)', surface: 'rgba(50, 25, 40, 0.9)', primary: '#f97316', text: '#ffffff', textMuted: '#fdba74' }
  },
  snow: {
    id: 'snow', name: 'Kar', nameEn: 'Snow', type: 'light', pixelArt: '❄️',
    colors: { background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)', surface: 'rgba(255, 255, 255, 0.95)', primary: '#3b82f6', text: '#1e293b', textMuted: '#64748b' }
  },
  sakura: {
    id: 'sakura', name: 'Sakura', nameEn: 'Sakura', type: 'light', pixelArt: '🌸',
    colors: { background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)', surface: 'rgba(255, 255, 255, 0.95)', primary: '#ec4899', text: '#831843', textMuted: '#9d174d' }
  },
  mint: {
    id: 'mint', name: 'Nane', nameEn: 'Mint', type: 'light', pixelArt: '🍃',
    colors: { background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)', surface: 'rgba(255, 255, 255, 0.95)', primary: '#10b981', text: '#064e3b', textMuted: '#047857' }
  },
  peach: {
    id: 'peach', name: 'Şeftali', nameEn: 'Peach', type: 'light', pixelArt: '🍑',
    colors: { background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)', surface: 'rgba(255, 255, 255, 0.95)', primary: '#f97316', text: '#7c2d12', textMuted: '#9a3412' }
  },
};

export const getTheme = (id) => themes[id] || themes.midnight;
export const getDarkThemes = () => Object.values(themes).filter(t => t.type === 'dark');
export const getLightThemes = () => Object.values(themes).filter(t => t.type === 'light');
