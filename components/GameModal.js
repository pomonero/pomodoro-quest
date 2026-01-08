'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

const GAMES = [
  { id: 'jump', icon: '🐸', name: 'Zıpla!', nameEn: 'Jump!', desc: 'Engellerin üzerinden atla', descEn: 'Jump over obstacles', keys: 'SPACE / TAP' },
  { id: 'catch', icon: '⭐', name: 'Yıldız Topla', nameEn: 'Star Catch', desc: 'Yıldızları topla, bombalardan kaç', descEn: 'Catch stars, avoid bombs', keys: '← → / SWIPE' },
  { id: 'dodge', icon: '🚀', name: 'Kaçış', nameEn: 'Dodge', desc: 'Düşmanlardan kaç', descEn: 'Avoid enemies', keys: '← → ↑ ↓ / SWIPE' },
  { id: 'click', icon: '🎯', name: 'Hızlı Tıkla', nameEn: 'Quick Click', desc: 'Hedeflere tıkla', descEn: 'Click the targets', keys: 'CLICK / TAP' },
  { id: 'memory', icon: '🧠', name: 'Hafıza', nameEn: 'Memory', desc: 'Kartları eşleştir', descEn: 'Match the cards', keys: 'CLICK / TAP' },
];

export default function GameModal() {
  const { user, language, showGame, setShowGame, canPlayGame, stats, setStats } = useStore();
  const t = translations[language] || translations.tr;
  
  const [screen, setScreen] = useState('menu'); // menu, countdown, playing, gameover
  const [selectedGame, setSelectedGame] = useState(null);
  const [score, setScore] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [highScore, setHighScore] = useState(0);
  
  const canvasRef = useRef(null);
  const gameRef = useRef({ active: false, score: 0 });

  // Kapat
  const closeModal = () => {
    gameRef.current.active = false;
    setShowGame(false);
    setScreen('menu');
    setSelectedGame(null);
    setScore(0);
    setCountdown(3);
  };

  // Oyun seç
  const selectGame = (game) => {
    if (!canPlayGame) return;
    setSelectedGame(game);
    setScreen('countdown');
    setCountdown(3);
  };

  // Countdown
  useEffect(() => {
    if (screen !== 'countdown') return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setScreen('playing');
      gameRef.current.active = true;
      gameRef.current.score = 0;
    }
  }, [screen, countdown]);

  // Oyun bitti
  const endGame = useCallback(async (finalScore) => {
    gameRef.current.active = false;
    setScore(finalScore);
    setScreen('gameover');
    
    if (finalScore > highScore) setHighScore(finalScore);
    if (user && finalScore > 0) {
      try {
        await db.saveGameScore(user.id, selectedGame?.id, finalScore);
        if (finalScore > (stats?.bestScore || 0)) {
          setStats({ ...stats, bestScore: finalScore });
        }
      } catch {}
    }
  }, [highScore, user, selectedGame, stats, setStats]);

  // ============ OYUNLAR ============
  useEffect(() => {
    if (screen !== 'playing' || !selectedGame || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = 400, H = 300;
    canvas.width = W;
    canvas.height = H;
    
    gameRef.current.active = true;
    gameRef.current.score = 0;
    
    const keys = {};
    let animId;
    
    const onKeyDown = (e) => {
      keys[e.code] = true;
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    };
    const onKeyUp = (e) => keys[e.code] = false;
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // ========== JUMP GAME ==========
    if (selectedGame.id === 'jump') {
      let player = { x: 60, y: H - 60, vy: 0, jumping: false };
      let obstacles = [];
      let frame = 0;
      let speed = 5;
      const GROUND = H - 40;
      const GRAVITY = 0.6;
      const JUMP = -13;
      
      const jump = () => {
        if (!player.jumping) {
          player.vy = JUMP;
          player.jumping = true;
        }
      };
      
      canvas.onclick = jump;
      
      const loop = () => {
        if (!gameRef.current.active) return;
        
        // Background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#2d2d44';
        ctx.fillRect(0, GROUND, W, 40);
        
        // Input
        if (keys['Space'] || keys['ArrowUp']) jump();
        
        // Player physics
        player.vy += GRAVITY;
        player.y += player.vy;
        if (player.y >= GROUND - 30) {
          player.y = GROUND - 30;
          player.vy = 0;
          player.jumping = false;
        }
        
        // Player draw
        ctx.fillStyle = '#6366f1';
        ctx.fillRect(player.x, player.y, 30, 30);
        ctx.font = '24px Arial';
        ctx.fillText('🐸', player.x + 3, player.y + 24);
        
        // Obstacles
        frame++;
        speed = 5 + Math.floor(gameRef.current.score / 100); // Zorluk artışı
        
        if (frame % Math.max(40, 80 - gameRef.current.score) === 0) {
          obstacles.push({ x: W + 20, w: 25, h: 35 + Math.random() * 20 });
        }
        
        for (let i = obstacles.length - 1; i >= 0; i--) {
          const o = obstacles[i];
          o.x -= speed;
          
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(o.x, GROUND - o.h, o.w, o.h);
          ctx.font = '20px Arial';
          ctx.fillText('🌵', o.x + 2, GROUND - o.h + 18);
          
          // Collision
          if (player.x < o.x + o.w - 10 && player.x + 30 > o.x + 10 && player.y + 30 > GROUND - o.h + 10) {
            endGame(gameRef.current.score);
            return;
          }
          
          // Score
          if (o.x + o.w < player.x && !o.passed) {
            o.passed = true;
            gameRef.current.score += 10;
          }
          
          if (o.x < -30) obstacles.splice(i, 1);
        }
        
        // UI
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Arial';
        ctx.fillText(`Score: ${gameRef.current.score}`, 10, 30);
        ctx.fillText(`Speed: ${speed}`, W - 100, 30);
        
        animId = requestAnimationFrame(loop);
      };
      loop();
    }

    // ========== CATCH GAME ==========
    else if (selectedGame.id === 'catch') {
      let basket = { x: W / 2 - 25, w: 50 };
      let items = [];
      let lives = 3;
      let frame = 0;
      
      const loop = () => {
        if (!gameRef.current.active) return;
        
        ctx.fillStyle = '#0f0f23';
        ctx.fillRect(0, 0, W, H);
        
        // Input
        if (keys['ArrowLeft']) basket.x = Math.max(0, basket.x - 8);
        if (keys['ArrowRight']) basket.x = Math.min(W - basket.w, basket.x + 8);
        
        // Basket
        ctx.fillStyle = '#6366f1';
        ctx.fillRect(basket.x, H - 40, basket.w, 30);
        ctx.font = '24px Arial';
        ctx.fillText('🧺', basket.x + 12, H - 18);
        
        // Spawn items
        frame++;
        const spawnRate = Math.max(25, 50 - Math.floor(gameRef.current.score / 50));
        if (frame % spawnRate === 0) {
          const isBomb = Math.random() < 0.2 + (gameRef.current.score / 1000);
          items.push({
            x: Math.random() * (W - 30),
            y: -30,
            type: isBomb ? 'bomb' : 'star',
            speed: 3 + Math.random() * 2 + gameRef.current.score / 200
          });
        }
        
        // Items
        for (let i = items.length - 1; i >= 0; i--) {
          const item = items[i];
          item.y += item.speed;
          
          ctx.font = '28px Arial';
          ctx.fillText(item.type === 'star' ? '⭐' : '💣', item.x, item.y);
          
          // Catch check
          if (item.y > H - 50 && item.y < H - 10 && item.x > basket.x - 10 && item.x < basket.x + basket.w) {
            if (item.type === 'star') {
              gameRef.current.score += 10;
            } else {
              lives--;
              if (lives <= 0) {
                endGame(gameRef.current.score);
                return;
              }
            }
            items.splice(i, 1);
            continue;
          }
          
          // Miss star penalty
          if (item.y > H && item.type === 'star') {
            items.splice(i, 1);
          } else if (item.y > H) {
            items.splice(i, 1);
          }
        }
        
        // UI
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Arial';
        ctx.fillText(`Score: ${gameRef.current.score}`, 10, 30);
        ctx.fillText('❤️'.repeat(lives), W - 80, 30);
        
        animId = requestAnimationFrame(loop);
      };
      loop();
    }

    // ========== DODGE GAME ==========
    else if (selectedGame.id === 'dodge') {
      let player = { x: W / 2 - 15, y: H / 2 - 15, size: 30 };
      let enemies = [];
      let frame = 0;
      
      const loop = () => {
        if (!gameRef.current.active) return;
        
        ctx.fillStyle = '#0a1628';
        ctx.fillRect(0, 0, W, H);
        
        // Grid
        ctx.strokeStyle = '#1a2a40';
        for (let i = 0; i < W; i += 30) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, H);
          ctx.stroke();
        }
        for (let i = 0; i < H; i += 30) {
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(W, i);
          ctx.stroke();
        }
        
        // Input
        const speed = 5;
        if (keys['ArrowLeft'] || keys['KeyA']) player.x = Math.max(0, player.x - speed);
        if (keys['ArrowRight'] || keys['KeyD']) player.x = Math.min(W - player.size, player.x + speed);
        if (keys['ArrowUp'] || keys['KeyW']) player.y = Math.max(0, player.y - speed);
        if (keys['ArrowDown'] || keys['KeyS']) player.y = Math.min(H - player.size, player.y + speed);
        
        // Player
        ctx.fillStyle = '#6366f1';
        ctx.fillRect(player.x, player.y, player.size, player.size);
        ctx.font = '22px Arial';
        ctx.fillText('🚀', player.x + 3, player.y + 22);
        
        // Spawn enemies
        frame++;
        const spawnRate = Math.max(20, 50 - Math.floor(gameRef.current.score / 30));
        if (frame % spawnRate === 0) {
          const side = Math.floor(Math.random() * 4);
          const enemySpeed = 3 + gameRef.current.score / 100;
          let e;
          switch (side) {
            case 0: e = { x: -20, y: Math.random() * H, vx: enemySpeed, vy: 0 }; break;
            case 1: e = { x: W + 20, y: Math.random() * H, vx: -enemySpeed, vy: 0 }; break;
            case 2: e = { x: Math.random() * W, y: -20, vx: 0, vy: enemySpeed }; break;
            case 3: e = { x: Math.random() * W, y: H + 20, vx: 0, vy: -enemySpeed }; break;
          }
          enemies.push(e);
          gameRef.current.score += 5;
        }
        
        // Enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
          const e = enemies[i];
          e.x += e.vx;
          e.y += e.vy;
          
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(e.x, e.y, 20, 20);
          ctx.font = '16px Arial';
          ctx.fillText('👾', e.x + 1, e.y + 16);
          
          // Collision
          if (player.x < e.x + 15 && player.x + player.size > e.x + 5 &&
              player.y < e.y + 15 && player.y + player.size > e.y + 5) {
            endGame(gameRef.current.score);
            return;
          }
          
          // Remove if off screen
          if (e.x < -30 || e.x > W + 30 || e.y < -30 || e.y > H + 30) {
            enemies.splice(i, 1);
          }
        }
        
        // UI
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Arial';
        ctx.fillText(`Score: ${gameRef.current.score}`, 10, 30);
        
        animId = requestAnimationFrame(loop);
      };
      loop();
    }

    // ========== CLICK GAME ==========
    else if (selectedGame.id === 'click') {
      let targets = [];
      let timeLeft = 30;
      let lastTime = Date.now();
      
      const spawnTarget = () => {
        targets.push({
          x: 30 + Math.random() * (W - 80),
          y: 50 + Math.random() * (H - 100),
          r: 20 + Math.random() * 15,
          life: 2000 - Math.min(1500, gameRef.current.score * 10)
        });
      };
      
      canvas.onclick = (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (W / rect.width);
        const my = (e.clientY - rect.top) * (H / rect.height);
        
        for (let i = targets.length - 1; i >= 0; i--) {
          const t = targets[i];
          const dist = Math.sqrt((mx - t.x) ** 2 + (my - t.y) ** 2);
          if (dist < t.r) {
            targets.splice(i, 1);
            gameRef.current.score += 10;
            spawnTarget();
            break;
          }
        }
      };
      
      spawnTarget();
      spawnTarget();
      
      const loop = () => {
        if (!gameRef.current.active) return;
        
        const now = Date.now();
        const delta = (now - lastTime) / 1000;
        lastTime = now;
        timeLeft -= delta;
        
        if (timeLeft <= 0) {
          endGame(gameRef.current.score);
          return;
        }
        
        ctx.fillStyle = '#1a0a2e';
        ctx.fillRect(0, 0, W, H);
        
        // Update & draw targets
        for (let i = targets.length - 1; i >= 0; i--) {
          const t = targets[i];
          t.life -= delta * 1000;
          
          if (t.life <= 0) {
            targets.splice(i, 1);
            spawnTarget();
            continue;
          }
          
          const alpha = Math.min(1, t.life / 500);
          ctx.beginPath();
          ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          ctx.font = `${t.r}px Arial`;
          ctx.fillText('🎯', t.x - t.r / 2, t.y + t.r / 3);
        }
        
        // Ensure minimum targets
        while (targets.length < 2) spawnTarget();
        
        // UI
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Arial';
        ctx.fillText(`Score: ${gameRef.current.score}`, 10, 30);
        ctx.fillText(`Time: ${Math.ceil(timeLeft)}s`, W - 100, 30);
        
        animId = requestAnimationFrame(loop);
      };
      loop();
    }

    // ========== MEMORY GAME ==========
    else if (selectedGame.id === 'memory') {
      const emojis = ['🍎', '🍊', '🍋', '🍇', '🍓', '🫐', '🥝', '🍑'];
      const pairs = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
      const cards = pairs.map((emoji, i) => ({
        emoji,
        x: 25 + (i % 4) * 90,
        y: 30 + Math.floor(i / 4) * 70,
        w: 70,
        h: 55,
        flipped: false,
        matched: false
      }));
      
      let flippedCards = [];
      let moves = 0;
      let matchedPairs = 0;
      let canClick = true;
      
      canvas.onclick = (e) => {
        if (!canClick) return;
        
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (W / rect.width);
        const my = (e.clientY - rect.top) * (H / rect.height);
        
        for (const card of cards) {
          if (card.matched || card.flipped) continue;
          if (mx > card.x && mx < card.x + card.w && my > card.y && my < card.y + card.h) {
            card.flipped = true;
            flippedCards.push(card);
            
            if (flippedCards.length === 2) {
              moves++;
              canClick = false;
              
              setTimeout(() => {
                if (flippedCards[0].emoji === flippedCards[1].emoji) {
                  flippedCards[0].matched = true;
                  flippedCards[1].matched = true;
                  matchedPairs++;
                  gameRef.current.score += 50;
                  
                  if (matchedPairs === 8) {
                    gameRef.current.score += Math.max(0, 500 - moves * 10);
                    endGame(gameRef.current.score);
                    return;
                  }
                } else {
                  flippedCards[0].flipped = false;
                  flippedCards[1].flipped = false;
                }
                flippedCards = [];
                canClick = true;
              }, 800);
            }
            break;
          }
        }
      };
      
      const loop = () => {
        if (!gameRef.current.active) return;
        
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, W, H);
        
        // Draw cards
        for (const card of cards) {
          ctx.fillStyle = card.matched ? '#22c55e' : card.flipped ? '#6366f1' : '#334155';
          ctx.fillRect(card.x, card.y, card.w, card.h);
          ctx.strokeStyle = '#64748b';
          ctx.strokeRect(card.x, card.y, card.w, card.h);
          
          if (card.flipped || card.matched) {
            ctx.font = '28px Arial';
            ctx.fillText(card.emoji, card.x + 20, card.y + 38);
          } else {
            ctx.font = '24px Arial';
            ctx.fillText('❓', card.x + 22, card.y + 38);
          }
        }
        
        // UI
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`Moves: ${moves}`, 10, H - 10);
        ctx.fillText(`Pairs: ${matchedPairs}/8`, W - 100, H - 10);
        
        animId = requestAnimationFrame(loop);
      };
      loop();
    }

    return () => {
      gameRef.current.active = false;
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [screen, selectedGame, endGame]);

  if (!showGame) return null;

  const tr = language === 'tr';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-scaleIn" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        
        {/* MENU */}
        {screen === 'menu' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
                <span>🎮</span> {tr ? 'Oyunlar' : 'Games'}
              </h2>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-[var(--surface)] text-xl">✕</button>
            </div>
            
            {!canPlayGame && (
              <div className="mb-4 p-4 rounded-xl text-center" style={{ background: 'var(--surface)' }}>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {tr ? '🔒 Oyun oynamak için bir pomodoro tamamlayın' : '🔒 Complete a pomodoro to play'}
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              {GAMES.map((game) => (
                <button
                  key={game.id}
                  onClick={() => selectGame(game)}
                  disabled={!canPlayGame}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all ${canPlayGame ? 'hover:scale-[1.02] hover:border-[var(--primary)]' : 'opacity-50'}`}
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <span className="text-4xl">{game.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg" style={{ color: 'var(--text)' }}>{tr ? game.name : game.nameEn}</h3>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{tr ? game.desc : game.descEn}</p>
                    <p className="text-xs mt-1 font-mono" style={{ color: 'var(--primary)' }}>{game.keys}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* COUNTDOWN */}
        {screen === 'countdown' && (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">{selectedGame?.icon}</span>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text)' }}>
              {tr ? selectedGame?.name : selectedGame?.nameEn}
            </h2>
            <div className="text-8xl font-bold animate-pulse" style={{ color: 'var(--primary)' }}>
              {countdown || (tr ? 'BAŞLA!' : 'GO!')}
            </div>
            <p className="text-sm mt-6" style={{ color: 'var(--text-muted)' }}>{selectedGame?.keys}</p>
          </div>
        )}

        {/* PLAYING */}
        {screen === 'playing' && (
          <>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
                <span>{selectedGame?.icon}</span>
                <span>{tr ? selectedGame?.name : selectedGame?.nameEn}</span>
              </h3>
              <button onClick={closeModal} className="text-sm px-3 py-1 rounded-lg" style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>
                ESC
              </button>
            </div>
            <canvas ref={canvasRef} className="w-full rounded-xl" style={{ background: '#1a1a2e' }} />
          </>
        )}

        {/* GAME OVER */}
        {screen === 'gameover' && (
          <div className="text-center py-8">
            <span className="text-6xl mb-4 block animate-bounce">{selectedGame?.icon}</span>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>
              {tr ? 'Oyun Bitti!' : 'Game Over!'}
            </h2>
            <p className="text-5xl font-bold mb-2 animate-pulse" style={{ color: 'var(--primary)' }}>{score}</p>
            {score >= highScore && score > 0 && (
              <p className="text-lg text-yellow-400 mb-4 animate-bounce">🏆 {tr ? 'Yeni Rekor!' : 'New High Score!'}</p>
            )}
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => { setScreen('countdown'); setCountdown(3); }}
                className="px-6 py-2 rounded-xl font-semibold text-white transition-all hover:scale-105"
                style={{ background: 'var(--primary)' }}
              >
                {tr ? '🔄 Tekrar' : '🔄 Retry'}
              </button>
              <button
                onClick={closeModal}
                className="px-6 py-2 rounded-xl font-semibold transition-all hover:scale-105"
                style={{ background: 'var(--surface)', color: 'var(--text)' }}
              >
                {tr ? '✕ Kapat' : '✕ Close'}
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}
