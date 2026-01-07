'use client';
import { useState, useEffect, useRef } from 'react';
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
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);

  const closeModal = () => {
    setShowGame(false);
    setSelectedGame(null);
    setGameState('select');
    setScore(0);
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
  };

  const startGame = (game) => {
    setSelectedGame(game);
    setGameState('playing');
    setScore(0);
  };

  const endGame = async (finalScore) => {
    setScore(finalScore);
    setGameState('ended');
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    if (finalScore > highScore) setHighScore(finalScore);
    if (user && finalScore > 0) {
      await db.saveGameScore(user.id, selectedGame.id, finalScore);
      if (finalScore > stats.bestScore) setStats({ ...stats, bestScore: finalScore });
    }
  };

  useEffect(() => {
    if (gameState !== 'playing' || !canvasRef.current || !selectedGame) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 300;

    let animationId;
    const keys = {};
    const handleKeyDown = (e) => { keys[e.code] = true; if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault(); };
    const handleKeyUp = (e) => { keys[e.code] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Simple Runner Game
    if (selectedGame.id === 'runner') {
      let player = { x: 50, y: 220, vy: 0, width: 30, height: 30, onGround: true };
      let obstacles = [];
      let gameScore = 0;
      let frameCount = 0;
      const gravity = 0.8, jumpForce = -14, ground = 250;

      const jump = () => { if (player.onGround) { player.vy = jumpForce; player.onGround = false; } };
      canvas.onclick = jump;

      const loop = () => {
        ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0, 0, 400, 300);
        ctx.fillStyle = '#2d2d44'; ctx.fillRect(0, ground, 400, 50);
        if (keys['Space'] || keys['ArrowUp']) jump();
        player.vy += gravity;
        player.y += player.vy;
        if (player.y >= ground - player.height) { player.y = ground - player.height; player.vy = 0; player.onGround = true; }
        ctx.fillStyle = '#6366f1'; ctx.fillRect(player.x, player.y, player.width, player.height);
        ctx.font = '20px Arial'; ctx.fillText('🚀', player.x + 5, player.y + 22);
        frameCount++;
        if (frameCount % 60 === 0) obstacles.push({ x: 400, y: ground - 30, width: 25, height: 30 });
        obstacles = obstacles.filter(obs => {
          obs.x -= 5;
          ctx.fillStyle = '#ef4444'; ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          ctx.font = '16px Arial'; ctx.fillText('☄️', obs.x + 4, obs.y + 20);
          const hit = player.x < obs.x + obs.width - 10 && player.x + player.width - 10 > obs.x && player.y < obs.y + obs.height - 5 && player.y + player.height > obs.y + 5;
          if (hit) { endGame(gameScore); return false; }
          if (obs.x < -30) { gameScore += 10; return false; }
          return true;
        });
        ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Arial'; ctx.fillText(`Score: ${gameScore}`, 10, 25);
        animationId = requestAnimationFrame(loop);
      };
      loop();
    }

    // Platform Jump
    else if (selectedGame.id === 'platform') {
      let player = { x: 180, y: 250, vy: 0, width: 25, height: 25 };
      let platforms = [{ x: 160, y: 280, width: 80 }];
      let gameScore = 0, cameraY = 0;
      const gravity = 0.4, bounceForce = -12;
      for (let i = 1; i < 20; i++) platforms.push({ x: Math.random() * 320, y: 280 - i * 50, width: 70 });

      const loop = () => {
        ctx.fillStyle = '#0c1929'; ctx.fillRect(0, 0, 400, 300);
        if (keys['ArrowLeft']) player.x -= 5;
        if (keys['ArrowRight']) player.x += 5;
        if (player.x < -25) player.x = 400;
        if (player.x > 400) player.x = -25;
        player.vy += gravity;
        player.y += player.vy;
        platforms.forEach(p => {
          const screenY = p.y - cameraY;
          if (screenY > -20 && screenY < 320) {
            ctx.fillStyle = '#22c55e'; ctx.fillRect(p.x, screenY, p.width, 12);
            if (player.vy > 0 && player.y + player.height > p.y && player.y + player.height < p.y + 20 && player.x + player.width > p.x && player.x < p.x + p.width) {
              player.vy = bounceForce; gameScore += 10;
            }
          }
        });
        if (player.y < cameraY + 100) cameraY = player.y - 100;
        const screenPlayerY = player.y - cameraY;
        ctx.fillStyle = '#6366f1'; ctx.fillRect(player.x, screenPlayerY, player.width, player.height);
        ctx.font = '18px Arial'; ctx.fillText('🐸', player.x + 3, screenPlayerY + 18);
        if (screenPlayerY > 350) { endGame(gameScore); return; }
        const highest = Math.min(...platforms.map(p => p.y));
        if (cameraY < highest + 200) for (let i = 0; i < 3; i++) platforms.push({ x: Math.random() * 320, y: highest - 50 - i * 50, width: 70 });
        ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Arial'; ctx.fillText(`Score: ${gameScore}`, 10, 25);
        animationId = requestAnimationFrame(loop);
      };
      loop();
    }

    // Star Catcher
    else if (selectedGame.id === 'catcher') {
      let basket = { x: 175, y: 260, width: 50 };
      let items = [];
      let gameScore = 0, lives = 5, frameCount = 0;

      const loop = () => {
        ctx.fillStyle = '#1a0a1a'; ctx.fillRect(0, 0, 400, 300);
        if (keys['ArrowLeft'] && basket.x > 0) basket.x -= 6;
        if (keys['ArrowRight'] && basket.x < 350) basket.x += 6;
        ctx.fillStyle = '#6366f1'; ctx.fillRect(basket.x, basket.y, basket.width, 25);
        ctx.font = '20px Arial'; ctx.fillText('🧺', basket.x + 14, basket.y + 20);
        frameCount++;
        if (frameCount % 40 === 0) {
          const isBomb = Math.random() < 0.2;
          items.push({ x: Math.random() * 360, y: -20, type: isBomb ? 'bomb' : 'star', speed: 3 + Math.random() * 2 });
        }
        items = items.filter(item => {
          item.y += item.speed;
          ctx.font = '24px Arial'; ctx.fillText(item.type === 'star' ? '⭐' : '💣', item.x, item.y);
          if (item.y > basket.y - 10 && item.y < basket.y + 25 && item.x > basket.x - 15 && item.x < basket.x + basket.width) {
            if (item.type === 'star') gameScore += 10;
            else { lives--; if (lives <= 0) { endGame(gameScore); return false; } }
            return false;
          }
          return item.y < 320;
        });
        ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Arial';
        ctx.fillText(`Score: ${gameScore}`, 10, 25);
        ctx.fillText(`❤️ ${lives}`, 340, 25);
        animationId = requestAnimationFrame(loop);
      };
      loop();
    }

    // Maze Escape
    else if (selectedGame.id === 'maze') {
      let player = { x: 185, y: 135, size: 20 };
      let enemies = [];
      let gameScore = 0, frameCount = 0;

      const loop = () => {
        ctx.fillStyle = '#0a1f0a'; ctx.fillRect(0, 0, 400, 300);
        for (let i = 0; i < 400; i += 20) for (let j = 0; j < 300; j += 20) { ctx.strokeStyle = '#1a3a1a'; ctx.strokeRect(i, j, 20, 20); }
        if (keys['ArrowUp'] && player.y > 0) player.y -= 4;
        if (keys['ArrowDown'] && player.y < 280) player.y += 4;
        if (keys['ArrowLeft'] && player.x > 0) player.x -= 4;
        if (keys['ArrowRight'] && player.x < 380) player.x += 4;
        ctx.fillStyle = '#6366f1'; ctx.fillRect(player.x, player.y, player.size, player.size);
        frameCount++;
        if (frameCount % 60 === 0) {
          const side = Math.floor(Math.random() * 4);
          const pos = Math.random() * 280;
          const speeds = [{ vx: 3, vy: 0, x: -20, y: pos }, { vx: -3, vy: 0, x: 400, y: pos }, { vx: 0, vy: 3, x: pos, y: -20 }, { vx: 0, vy: -3, x: pos, y: 300 }];
          enemies.push({ ...speeds[side], size: 18 });
          gameScore += 5;
        }
        enemies = enemies.filter(e => {
          e.x += e.vx; e.y += e.vy;
          ctx.fillStyle = '#ef4444'; ctx.fillRect(e.x, e.y, e.size, e.size);
          if (player.x < e.x + e.size - 4 && player.x + player.size - 4 > e.x && player.y < e.y + e.size - 4 && player.y + player.size - 4 > e.y) { endGame(gameScore); return false; }
          return e.x > -30 && e.x < 430 && e.y > -30 && e.y < 330;
        });
        ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Arial'; ctx.fillText(`Score: ${gameScore}`, 10, 25);
        animationId = requestAnimationFrame(loop);
      };
      loop();
    }

    // Sky Climber
    else if (selectedGame.id === 'climber') {
      let player = { x: 185, y: 250, vy: 0, width: 25, height: 25 };
      let platforms = [];
      let gameScore = 0, scrollSpeed = 1;
      const gravity = 0.3, jumpForce = -10;
      for (let i = 0; i < 8; i++) platforms.push({ x: i % 2 === 0 ? 50 : 280, y: 280 - i * 40, width: 70 });

      const loop = () => {
        ctx.fillStyle = '#16213e'; ctx.fillRect(0, 0, 400, 300);
        if (keys['ArrowLeft']) player.x -= 5;
        if (keys['ArrowRight']) player.x += 5;
        player.x = Math.max(0, Math.min(375, player.x));
        player.vy += gravity;
        player.y += player.vy;
        platforms.forEach(p => {
          p.y += scrollSpeed;
          ctx.fillStyle = '#f97316'; ctx.fillRect(p.x, p.y, p.width, 10);
          if (player.vy > 0 && player.y + player.height > p.y && player.y + player.height < p.y + 15 && player.x + player.width > p.x && player.x < p.x + p.width) {
            player.vy = jumpForce; gameScore += 10;
          }
        });
        platforms = platforms.filter(p => p.y < 320);
        if (platforms.length < 8) {
          const lastY = Math.min(...platforms.map(p => p.y));
          platforms.push({ x: platforms.length % 2 === 0 ? 50 + Math.random() * 50 : 250 + Math.random() * 50, y: lastY - 40, width: 70 });
        }
        ctx.fillStyle = '#6366f1'; ctx.fillRect(player.x, player.y, player.width, player.height);
        ctx.font = '18px Arial'; ctx.fillText('🧗', player.x + 3, player.y + 18);
        if (player.y > 320) { endGame(gameScore); return; }
        scrollSpeed = 1 + gameScore / 500;
        ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Arial'; ctx.fillText(`Score: ${gameScore}`, 10, 25);
        animationId = requestAnimationFrame(loop);
      };
      loop();
    }

    gameLoopRef.current = animationId;
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); if (animationId) cancelAnimationFrame(animationId); };
  }, [gameState, selectedGame]);

  if (!showGame) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg rounded-2xl p-6 glass border" style={{ borderColor: 'var(--border)' }}>
        {gameState === 'select' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}><span>🎮</span> {t.games}</h2>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-[var(--surface-hover)]" style={{ color: 'var(--text-muted)' }}>✕</button>
            </div>
            {!canPlayGame && <div className="mb-4 p-3 rounded-xl text-center" style={{ background: 'var(--surface)' }}><p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.completeSession}</p></div>}
            <div className="space-y-2">
              {games.map((game) => (
                <button key={game.id} onClick={() => canPlayGame && startGame(game)} disabled={!canPlayGame} className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all ${canPlayGame ? 'hover:border-[var(--primary)]' : 'opacity-50'}`} style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
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
        {gameState === 'playing' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}><span>{selectedGame.icon}</span> {t[selectedGame.name]}</h3>
              <button onClick={closeModal} className="text-sm px-3 py-1 rounded-lg" style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>ESC</button>
            </div>
            <canvas ref={canvasRef} className="w-full rounded-xl" style={{ background: '#1a1a2e' }} />
            <p className="text-center text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{t[selectedGame.controls]}</p>
          </>
        )}
        {gameState === 'ended' && (
          <div className="text-center py-8">
            <span className="text-6xl mb-4 block">{selectedGame.icon}</span>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>{t.gameOver}</h2>
            <p className="text-4xl font-bold mb-2" style={{ color: 'var(--primary)' }}>{score}</p>
            {score >= highScore && score > 0 && <p className="text-lg text-yellow-400 mb-4">{t.newHighScore}</p>}
            <div className="flex justify-center gap-3">
              <button onClick={() => startGame(selectedGame)} className="btn-primary">{t.tryAgain}</button>
              <button onClick={closeModal} className="btn-secondary">{t.close}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
