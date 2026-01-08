'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

const games = [
  { id: 'runner', name: 'spaceRunner', icon: '🚀', desc: 'spaceRunnerDesc', controls: 'spaceRunnerControls' },
  { id: 'platform', name: 'platformJump', icon: '🐸', desc: 'platformJumpDesc', controls: 'platformJumpControls' },
  { id: 'catcher', name: 'starCatcher', icon: '⭐', desc: 'starCatcherDesc', controls: 'starCatcherControls' },
  { id: 'maze', name: 'mazeEscape', icon: '💨', desc: 'mazeEscapeDesc', controls: 'mazeEscapeControls' },
  { id: 'climber', name: 'skyClimber', icon: '🧗', desc: 'skyClimberDesc', controls: 'skyClimberControls' },
];

export default function GameModal() {
  const { user, language, showGame, setShowGame, canPlayGame, stats, setStats } = useStore();
  const t = translations[language] || translations.tr;
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameState, setGameState] = useState('select');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const canvasRef = useRef(null);
  const gameRef = useRef({ running: false });

  const closeModal = useCallback(() => {
    gameRef.current.running = false;
    setShowGame(false);
    setSelectedGame(null);
    setGameState('select');
    setScore(0);
    setCountdown(0);
  }, [setShowGame]);

  const startGame = (game) => {
    setSelectedGame(game);
    setCountdown(3);
    setGameState('countdown');
  };

  const endGame = useCallback(async (finalScore) => {
    gameRef.current.running = false;
    setScore(finalScore);
    setGameState('ended');
    if (finalScore > highScore) setHighScore(finalScore);
    if (user && finalScore > 0) {
      await db.saveGameScore(user.id, selectedGame?.id, finalScore);
      if (finalScore > (stats?.bestScore || 0)) setStats({ ...stats, bestScore: finalScore });
    }
  }, [highScore, user, selectedGame, stats, setStats]);

  // Countdown
  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'countdown' && countdown === 0) {
      setGameState('playing');
      gameRef.current.running = true;
    }
  }, [gameState, countdown]);

  // Game Loop
  useEffect(() => {
    if (gameState !== 'playing' || !canvasRef.current || !selectedGame) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 300;

    const keys = {};
    const handleKeyDown = (e) => { keys[e.code] = true; if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault(); };
    const handleKeyUp = (e) => { keys[e.code] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let animationId;
    gameRef.current.running = true;

    // ==================== RUNNER ====================
    if (selectedGame.id === 'runner') {
      const player = { x: 50, y: 220, vy: 0, w: 30, h: 30, onGround: true };
      const obstacles = [];
      let gameScore = 0, frame = 0;
      const gravity = 0.8, jumpForce = -14, ground = 250;

      const jump = () => { if (player.onGround) { player.vy = jumpForce; player.onGround = false; } };
      canvas.onclick = jump;

      const loop = () => {
        if (!gameRef.current.running) return;
        
        // Clear
        ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0, 0, 400, 300);
        ctx.fillStyle = '#2d2d44'; ctx.fillRect(0, ground, 400, 50);

        // Input
        if (keys['Space'] || keys['ArrowUp']) jump();

        // Physics
        player.vy += gravity;
        player.y += player.vy;
        if (player.y >= ground - player.h) { player.y = ground - player.h; player.vy = 0; player.onGround = true; }

        // Player
        ctx.fillStyle = '#6366f1'; ctx.fillRect(player.x, player.y, player.w, player.h);
        ctx.font = '22px Arial'; ctx.fillText('🚀', player.x + 3, player.y + 24);

        // Obstacles - zorluk artıyor
        frame++;
        const spawnRate = Math.max(30, 60 - Math.floor(gameScore / 50)); // Hızlanıyor
        const speed = 5 + Math.floor(gameScore / 100); // Hızlanıyor
        
        if (frame % spawnRate === 0) {
          obstacles.push({ x: 420, y: ground - 30, w: 25, h: 30 });
        }

        for (let i = obstacles.length - 1; i >= 0; i--) {
          const obs = obstacles[i];
          obs.x -= speed;
          ctx.fillStyle = '#ef4444'; ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
          ctx.font = '18px Arial'; ctx.fillText('☄️', obs.x + 3, obs.y + 22);

          // Collision
          if (player.x < obs.x + obs.w - 8 && player.x + player.w - 8 > obs.x && player.y < obs.y + obs.h - 5 && player.y + player.h > obs.y + 5) {
            endGame(gameScore);
            return;
          }

          // Score & remove
          if (obs.x < -30) { gameScore += 10; obstacles.splice(i, 1); }
        }

        // UI
        ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Arial';
        ctx.fillText(`Score: ${gameScore}`, 10, 25);
        ctx.fillText(`Speed: ${speed}`, 310, 25);

        animationId = requestAnimationFrame(loop);
      };
      loop();
    }

    // ==================== PLATFORM ====================
    else if (selectedGame.id === 'platform') {
      const player = { x: 185, y: 250, vy: 0, w: 25, h: 25 };
      const platforms = [{ x: 160, y: 280, w: 80 }];
      let gameScore = 0, cameraY = 0;
      const gravity = 0.4, bounceForce = -12;
      
      for (let i = 1; i < 20; i++) platforms.push({ x: Math.random() * 320, y: 280 - i * 50, w: 70 });

      const loop = () => {
        if (!gameRef.current.running) return;

        ctx.fillStyle = '#0c1929'; ctx.fillRect(0, 0, 400, 300);

        // Input
        if (keys['ArrowLeft']) player.x -= 5;
        if (keys['ArrowRight']) player.x += 5;
        if (player.x < -25) player.x = 400;
        if (player.x > 400) player.x = -25;

        // Physics
        player.vy += gravity;
        player.y += player.vy;

        // Platforms
        platforms.forEach(p => {
          const screenY = p.y - cameraY;
          if (screenY > -20 && screenY < 320) {
            ctx.fillStyle = '#22c55e'; ctx.fillRect(p.x, screenY, p.w, 12);
            if (player.vy > 0 && player.y + player.h > p.y && player.y + player.h < p.y + 20 && player.x + player.w > p.x && player.x < p.x + p.w) {
              player.vy = bounceForce; gameScore += 10;
            }
          }
        });

        // Camera
        if (player.y < cameraY + 100) cameraY = player.y - 100;

        // Player
        const screenPlayerY = player.y - cameraY;
        ctx.fillStyle = '#6366f1'; ctx.fillRect(player.x, screenPlayerY, player.w, player.h);
        ctx.font = '20px Arial'; ctx.fillText('🐸', player.x + 2, screenPlayerY + 20);

        // Game over
        if (screenPlayerY > 350) { endGame(gameScore); return; }

        // Generate platforms
        const highest = Math.min(...platforms.map(p => p.y));
        if (cameraY < highest + 200) {
          for (let i = 0; i < 3; i++) platforms.push({ x: Math.random() * 320, y: highest - 50 - i * 50, w: 70 });
        }

        ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Arial'; ctx.fillText(`Score: ${gameScore}`, 10, 25);
        animationId = requestAnimationFrame(loop);
      };
      loop();
    }

    // ==================== CATCHER ====================
    else if (selectedGame.id === 'catcher') {
      const basket = { x: 175, y: 260, w: 50 };
      const items = [];
      let gameScore = 0, lives = 5, frame = 0;

      const loop = () => {
        if (!gameRef.current.running) return;

        ctx.fillStyle = '#1a0a2e'; ctx.fillRect(0, 0, 400, 300);

        // Input
        if (keys['ArrowLeft'] && basket.x > 0) basket.x -= 7;
        if (keys['ArrowRight'] && basket.x < 350) basket.x += 7;

        // Basket
        ctx.fillStyle = '#6366f1'; ctx.fillRect(basket.x, basket.y, basket.w, 25);
        ctx.font = '22px Arial'; ctx.fillText('🧺', basket.x + 13, basket.y + 22);

        // Spawn - zorluk artıyor
        frame++;
        const spawnRate = Math.max(20, 40 - Math.floor(gameScore / 30));
        const baseSpeed = 3 + Math.floor(gameScore / 50);
        
        if (frame % spawnRate === 0) {
          const isBomb = Math.random() < 0.2 + (gameScore / 500); // Bomba şansı artıyor
          items.push({ x: Math.random() * 360, y: -20, type: isBomb ? 'bomb' : 'star', speed: baseSpeed + Math.random() * 2 });
        }

        // Items
        for (let i = items.length - 1; i >= 0; i--) {
          const item = items[i];
          item.y += item.speed;
          ctx.font = '26px Arial'; ctx.fillText(item.type === 'star' ? '⭐' : '💣', item.x, item.y);

          // Catch
          if (item.y > basket.y - 15 && item.y < basket.y + 25 && item.x > basket.x - 20 && item.x < basket.x + basket.w) {
            if (item.type === 'star') gameScore += 10;
            else { lives--; if (lives <= 0) { endGame(gameScore); return; } }
            items.splice(i, 1);
          } else if (item.y > 320) {
            items.splice(i, 1);
          }
        }

        ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Arial';
        ctx.fillText(`Score: ${gameScore}`, 10, 25);
        ctx.fillText('❤️'.repeat(lives), 300, 25);
        animationId = requestAnimationFrame(loop);
      };
      loop();
    }

    // ==================== MAZE ====================
    else if (selectedGame.id === 'maze') {
      const player = { x: 190, y: 140, size: 20 };
      const enemies = [];
      let gameScore = 0, frame = 0;

      const loop = () => {
        if (!gameRef.current.running) return;

        ctx.fillStyle = '#0a1f0a'; ctx.fillRect(0, 0, 400, 300);
        for (let i = 0; i < 400; i += 20) for (let j = 0; j < 300; j += 20) { ctx.strokeStyle = '#1a3a1a'; ctx.strokeRect(i, j, 20, 20); }

        // Input
        const speed = 4;
        if (keys['ArrowUp'] && player.y > 0) player.y -= speed;
        if (keys['ArrowDown'] && player.y < 280) player.y += speed;
        if (keys['ArrowLeft'] && player.x > 0) player.x -= speed;
        if (keys['ArrowRight'] && player.x < 380) player.x += speed;

        // Player
        ctx.fillStyle = '#6366f1'; ctx.fillRect(player.x, player.y, player.size, player.size);
        ctx.font = '16px Arial'; ctx.fillText('😊', player.x + 2, player.y + 16);

        // Enemies - zorluk artıyor
        frame++;
        const spawnRate = Math.max(30, 60 - Math.floor(gameScore / 20));
        const enemySpeed = 3 + Math.floor(gameScore / 50);

        if (frame % spawnRate === 0) {
          const side = Math.floor(Math.random() * 4);
          const pos = Math.random() * 280;
          const configs = [
            { vx: enemySpeed, vy: 0, x: -20, y: pos },
            { vx: -enemySpeed, vy: 0, x: 420, y: pos },
            { vx: 0, vy: enemySpeed, x: pos, y: -20 },
            { vx: 0, vy: -enemySpeed, x: pos, y: 320 }
          ];
          enemies.push({ ...configs[side], size: 18 });
          gameScore += 5;
        }

        // Enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
          const e = enemies[i];
          e.x += e.vx; e.y += e.vy;
          ctx.fillStyle = '#ef4444'; ctx.fillRect(e.x, e.y, e.size, e.size);
          ctx.font = '14px Arial'; ctx.fillText('👾', e.x + 1, e.y + 14);

          // Collision
          if (player.x < e.x + e.size - 4 && player.x + player.size - 4 > e.x && player.y < e.y + e.size - 4 && player.y + player.size - 4 > e.y) {
            endGame(gameScore); return;
          }

          // Remove if off screen
          if (e.x < -30 || e.x > 430 || e.y < -30 || e.y > 330) enemies.splice(i, 1);
        }

        ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Arial'; ctx.fillText(`Score: ${gameScore}`, 10, 25);
        animationId = requestAnimationFrame(loop);
      };
      loop();
    }

    // ==================== CLIMBER ====================
    else if (selectedGame.id === 'climber') {
      const player = { x: 185, y: 250, vy: 0, w: 25, h: 25 };
      const platforms = [];
      let gameScore = 0;
      const gravity = 0.35, jumpForce = -11;
      
      for (let i = 0; i < 8; i++) platforms.push({ x: i % 2 === 0 ? 50 + Math.random() * 50 : 250 + Math.random() * 50, y: 280 - i * 40, w: 70 });

      const loop = () => {
        if (!gameRef.current.running) return;

        ctx.fillStyle = '#16213e'; ctx.fillRect(0, 0, 400, 300);

        // Input
        if (keys['ArrowLeft']) player.x -= 5;
        if (keys['ArrowRight']) player.x += 5;
        player.x = Math.max(0, Math.min(375, player.x));

        // Physics
        player.vy += gravity;
        player.y += player.vy;

        // Scroll speed - zorluk artıyor
        const scrollSpeed = 1 + gameScore / 300;

        // Platforms
        platforms.forEach(p => {
          p.y += scrollSpeed;
          ctx.fillStyle = '#f97316'; ctx.fillRect(p.x, p.y, p.w, 10);
          
          if (player.vy > 0 && player.y + player.h > p.y && player.y + player.h < p.y + 15 && player.x + player.w > p.x && player.x < p.x + p.w) {
            player.vy = jumpForce; gameScore += 10;
          }
        });

        // Remove & generate
        for (let i = platforms.length - 1; i >= 0; i--) {
          if (platforms[i].y > 320) platforms.splice(i, 1);
        }
        if (platforms.length < 8) {
          const lastY = Math.min(...platforms.map(p => p.y));
          platforms.push({ x: platforms.length % 2 === 0 ? 50 + Math.random() * 80 : 220 + Math.random() * 80, y: lastY - 40 - Math.random() * 20, w: 70 });
        }

        // Player
        ctx.fillStyle = '#6366f1'; ctx.fillRect(player.x, player.y, player.w, player.h);
        ctx.font = '20px Arial'; ctx.fillText('🧗', player.x + 2, player.y + 20);

        // Game over
        if (player.y > 320) { endGame(gameScore); return; }

        ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Arial'; ctx.fillText(`Score: ${gameScore}`, 10, 25);
        animationId = requestAnimationFrame(loop);
      };
      loop();
    }

    return () => {
      gameRef.current.running = false;
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [gameState, selectedGame, endGame]);

  if (!showGame) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg rounded-2xl p-6 shadow-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        
        {/* SELECT */}
        {gameState === 'select' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}><span>🎮</span> {t.games}</h2>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-[var(--surface)]" style={{ color: 'var(--text-muted)' }}>✕</button>
            </div>
            {!canPlayGame && <div className="mb-4 p-3 rounded-xl text-center" style={{ background: 'var(--surface)' }}><p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.completeSession}</p></div>}
            <div className="space-y-2">
              {games.map((game) => (
                <button key={game.id} onClick={() => startGame(game)} disabled={!canPlayGame} className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all ${canPlayGame ? 'hover:scale-[1.02]' : 'opacity-50'}`} style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <span className="text-3xl">{game.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-bold" style={{ color: 'var(--text)' }}>{t[game.name]}</h3>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t[game.desc]}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--primary)' }}>{t[game.controls]}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* COUNTDOWN */}
        {gameState === 'countdown' && (
          <div className="text-center py-12">
            <span className="text-6xl mb-6 block">{selectedGame?.icon}</span>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text)' }}>{t[selectedGame?.name]}</h2>
            <div className="text-8xl font-bold animate-pulse" style={{ color: 'var(--primary)' }}>{countdown || 'GO!'}</div>
            <p className="text-sm mt-4" style={{ color: 'var(--text-muted)' }}>{t[selectedGame?.controls]}</p>
          </div>
        )}

        {/* PLAYING */}
        {gameState === 'playing' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}><span>{selectedGame?.icon}</span> {t[selectedGame?.name]}</h3>
              <button onClick={closeModal} className="text-sm px-3 py-1 rounded-lg" style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>ESC</button>
            </div>
            <canvas ref={canvasRef} className="w-full rounded-xl border" style={{ background: '#1a1a2e', borderColor: 'var(--border)' }} />
            <p className="text-center text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{t[selectedGame?.controls]}</p>
          </>
        )}

        {/* ENDED */}
        {gameState === 'ended' && (
          <div className="text-center py-8">
            <span className="text-6xl mb-4 block">{selectedGame?.icon}</span>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>{t.gameOver}</h2>
            <p className="text-5xl font-bold mb-2" style={{ color: 'var(--primary)' }}>{score}</p>
            {score >= highScore && score > 0 && <p className="text-lg text-yellow-400 mb-4">🏆 {t.newHighScore}</p>}
            <div className="flex justify-center gap-3 mt-6">
              <button onClick={() => startGame(selectedGame)} className="px-6 py-2 rounded-xl font-semibold text-white" style={{ background: 'var(--primary)' }}>{t.tryAgain}</button>
              <button onClick={closeModal} className="px-6 py-2 rounded-xl font-semibold" style={{ background: 'var(--surface)', color: 'var(--text)' }}>{t.close}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
