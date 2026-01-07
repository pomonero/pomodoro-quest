'use client';

import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/supabase';
import { useStore } from '@/lib/store';

const games = {
  runner: RunnerGame,
  jumper: JumperGame,
  collector: CollectorGame,
  dodger: DodgerGame,
  climber: ClimberGame
};

const gameInfo = {
  runner: { name: 'Koşucu', icon: '🏃', description: 'Engellere çarpmadan koş!', controls: '↑ veya SPACE ile zıpla' },
  jumper: { name: 'Zıplayıcı', icon: '🐸', description: 'Platformlara zıpla!', controls: '← → hareket, ↑ zıpla' },
  collector: { name: 'Toplayıcı', icon: '⭐', description: 'Yıldızları topla, bombaları atla!', controls: '← → hareket' },
  dodger: { name: 'Kaçış', icon: '💨', description: 'Kırmızı bloklardan kaç!', controls: '↑ ↓ ← → hareket' },
  climber: { name: 'Tırmanıcı', icon: '🧗', description: 'En yükseğe tırman!', controls: '← → hareket, ↑ zıpla' }
};

export default function GameModal() {
  const { 
    user, darkMode, showGame, setShowGame, 
    canPlayGame, setCanPlayGame, 
    gameScore, setGameScore,
    stats, setStats
  } = useStore();
  
  const [selectedGame, setSelectedGame] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [scoreSaved, setScoreSaved] = useState(false);

  useEffect(() => {
    if (showGame && !selectedGame) {
      const gameKeys = Object.keys(games);
      const randomGame = gameKeys[Math.floor(Math.random() * gameKeys.length)];
      setSelectedGame(randomGame);
    }
  }, [showGame]);

  const handleGameEnd = async (score) => {
    setIsPlaying(false);
    setFinalScore(score);
    setGameScore(score);

    if (user && score > 0 && !scoreSaved) {
      await db.saveGameScore(user.id, selectedGame, score);
      setScoreSaved(true);
      
      if (score > stats.bestScore) {
        setStats({ ...stats, bestScore: score });
      }
    }
  };

  const handleClose = () => {
    setShowGame(false);
    setSelectedGame(null);
    setIsPlaying(false);
    setFinalScore(0);
    setScoreSaved(false);
    setCanPlayGame(false);
  };

  if (!showGame) return null;

  const GameComponent = selectedGame ? games[selectedGame] : null;
  const info = selectedGame ? gameInfo[selectedGame] : null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-2xl rounded-2xl p-6 ${darkMode ? 'bg-surface-dark border border-white/10' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{info?.icon}</span>
            <div>
              <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                🎮 Ödül Oyunu!
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {info?.name}
              </p>
            </div>
          </div>
          <div className={`text-xl font-display font-bold ${darkMode ? 'text-primary' : 'text-primary-dark'}`}>
            {isPlaying ? '...' : finalScore} puan
          </div>
        </div>

        <div className={`rounded-xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`} style={{ height: '320px' }}>
          {!isPlaying && !finalScore && (
            <div className="h-full flex flex-col items-center justify-center">
              <span className="text-6xl mb-4 animate-bounce">{info?.icon}</span>
              <p className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {info?.name}
              </p>
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {info?.description}
              </p>
              <p className={`text-xs px-4 py-2 rounded-lg ${darkMode ? 'bg-white/10 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                {info?.controls}
              </p>
            </div>
          )}

          {isPlaying && GameComponent && (
            <GameComponent darkMode={darkMode} onGameEnd={handleGameEnd} />
          )}

          {!isPlaying && finalScore > 0 && (
            <div className="h-full flex flex-col items-center justify-center bg-black/50">
              <p className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Oyun Bitti!
              </p>
              <p className="text-4xl font-display font-bold text-primary mb-4">
                {finalScore} puan
              </p>
              {scoreSaved && (
                <p className="text-accent text-sm flex items-center gap-2">
                  <span>✓</span> Skor kaydedildi!
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-4">
          {!isPlaying ? (
            <>
              <button
                onClick={() => { setIsPlaying(true); setFinalScore(0); setScoreSaved(false); }}
                disabled={!canPlayGame && finalScore > 0}
                className={`flex-1 btn-primary py-3 ${!canPlayGame && finalScore > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {finalScore > 0 ? '↺ Tekrar Oyna' : '▶ Oyuna Başla'}
              </button>
              <button
                onClick={handleClose}
                className={`flex-1 py-3 rounded-xl font-medium ${
                  darkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ✕ Kapat
              </button>
            </>
          ) : (
            <p className={`w-full text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {info?.controls} • ESC ile çık
            </p>
          )}
        </div>

        {!canPlayGame && finalScore > 0 && (
          <p className="text-secondary text-sm text-center mt-4">
            ⚠ Tekrar oynamak için bir pomodoro daha tamamla!
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================
// OYUN 1: RUNNER - Daha yavaş başlangıç
// ============================================
function RunnerGame({ darkMode, onGameEnd }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const gameState = useRef({
    playerY: 220,
    velocity: 0,
    isJumping: false,
    obstacles: [],
    gameOver: false,
    speed: 3, // Daha yavaş başlangıç
    frameCount: 0
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    const state = gameState.current;

    const handleKeyDown = (e) => {
      if ((e.key === 'ArrowUp' || e.key === ' ') && !state.isJumping) {
        state.velocity = -10;
        state.isJumping = true;
      }
      if (e.key === 'Escape') state.gameOver = true;
    };

    window.addEventListener('keydown', handleKeyDown);

    const gameLoop = () => {
      if (state.gameOver) {
        onGameEnd(score);
        return;
      }

      state.frameCount++;

      ctx.fillStyle = darkMode ? '#1f2937' : '#f3f4f6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Ground
      ctx.fillStyle = darkMode ? '#374151' : '#d1d5db';
      ctx.fillRect(0, 260, canvas.width, 40);

      // Player physics
      state.velocity += 0.5;
      state.playerY += state.velocity;

      if (state.playerY >= 220) {
        state.playerY = 220;
        state.velocity = 0;
        state.isJumping = false;
      }

      // Draw player
      ctx.fillStyle = '#6366f1';
      ctx.shadowColor = '#6366f1';
      ctx.shadowBlur = 15;
      ctx.fillRect(50, state.playerY, 30, 40);
      ctx.shadowBlur = 0;

      // Spawn obstacles - daha seyrek
      if (state.frameCount % 90 === 0 && Math.random() < 0.7) {
        state.obstacles.push({
          x: canvas.width,
          width: 20 + Math.random() * 15,
          height: 25 + Math.random() * 25
        });
      }

      // Update obstacles
      state.obstacles = state.obstacles.filter(obs => {
        obs.x -= state.speed;

        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 8;
        ctx.fillRect(obs.x, 260 - obs.height, obs.width, obs.height);
        ctx.shadowBlur = 0;

        // Collision - biraz daha hoşgörülü
        if (
          55 < obs.x + obs.width &&
          50 + 25 > obs.x &&
          state.playerY + 35 > 260 - obs.height
        ) {
          state.gameOver = true;
        }

        return obs.x > -50;
      });

      // Score & difficulty increase
      setScore(s => s + 1);
      
      // Zorluk artışı daha yavaş
      if (state.frameCount % 500 === 0 && state.speed < 8) {
        state.speed += 0.3;
      }

      ctx.fillStyle = darkMode ? '#fff' : '#1f2937';
      ctx.font = 'bold 18px Inter';
      ctx.fillText(`Skor: ${score}`, 15, 30);

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(animationId);
    };
  }, [score, darkMode, onGameEnd]);

  return <canvas ref={canvasRef} width={600} height={300} className="w-full h-full" />;
}

// ============================================
// OYUN 2: JUMPER - Daha kolay
// ============================================
function JumperGame({ darkMode, onGameEnd }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const gameState = useRef({
    playerX: 280,
    playerY: 250,
    velocityY: 0,
    platforms: [],
    gameOver: false,
    cameraY: 0,
    keys: {}
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    const state = gameState.current;

    // Initialize platforms - daha geniş ve sık
    for (let i = 0; i < 12; i++) {
      state.platforms.push({
        x: Math.random() * (canvas.width - 100),
        y: 280 - i * 50,
        width: 80 + Math.random() * 40
      });
    }

    const handleKeyDown = (e) => {
      state.keys[e.key] = true;
      if (e.key === 'Escape') state.gameOver = true;
    };
    const handleKeyUp = (e) => state.keys[e.key] = false;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const gameLoop = () => {
      if (state.gameOver) {
        onGameEnd(score);
        return;
      }

      ctx.fillStyle = darkMode ? '#1f2937' : '#f3f4f6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (state.keys['ArrowLeft']) state.playerX -= 5;
      if (state.keys['ArrowRight']) state.playerX += 5;

      state.velocityY += 0.4; // Daha az yerçekimi
      state.playerY += state.velocityY;

      if (state.playerX < -20) state.playerX = canvas.width;
      if (state.playerX > canvas.width) state.playerX = -20;

      // Platform collision
      state.platforms.forEach(plat => {
        const platY = plat.y - state.cameraY;
        if (
          state.velocityY > 0 &&
          state.playerX + 25 > plat.x &&
          state.playerX + 5 < plat.x + plat.width &&
          state.playerY + 30 > platY &&
          state.playerY + 30 < platY + 15
        ) {
          state.velocityY = -11; // Daha düşük zıplama
          setScore(s => s + 10);
        }
      });

      if (state.playerY < 120) {
        state.cameraY -= (120 - state.playerY);
        state.playerY = 120;
      }

      // Generate new platforms
      while (state.platforms[state.platforms.length - 1].y - state.cameraY > -30) {
        const lastPlat = state.platforms[state.platforms.length - 1];
        state.platforms.push({
          x: Math.random() * (canvas.width - 100),
          y: lastPlat.y - 45 - Math.random() * 25, // Daha sık platformlar
          width: 70 + Math.random() * 50
        });
      }

      state.platforms = state.platforms.filter(p => p.y - state.cameraY < canvas.height + 50);

      if (state.playerY > canvas.height) state.gameOver = true;

      // Draw platforms
      state.platforms.forEach(plat => {
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 8;
        ctx.fillRect(plat.x, plat.y - state.cameraY, plat.width, 12);
        ctx.shadowBlur = 0;
      });

      // Draw player
      ctx.fillStyle = '#6366f1';
      ctx.shadowColor = '#6366f1';
      ctx.shadowBlur = 15;
      ctx.fillRect(state.playerX, state.playerY, 30, 30);
      ctx.shadowBlur = 0;

      ctx.fillStyle = darkMode ? '#fff' : '#1f2937';
      ctx.font = 'bold 18px Inter';
      ctx.fillText(`Skor: ${score}`, 15, 30);

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, [score, darkMode, onGameEnd]);

  return <canvas ref={canvasRef} width={600} height={300} className="w-full h-full" />;
}

// ============================================
// OYUN 3: COLLECTOR - Daha kolay
// ============================================
function CollectorGame({ darkMode, onGameEnd }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5); // Daha fazla can
  const gameState = useRef({
    playerX: 280,
    items: [],
    gameOver: false,
    keys: {},
    frameCount: 0
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    const state = gameState.current;

    const handleKeyDown = (e) => {
      state.keys[e.key] = true;
      if (e.key === 'Escape') state.gameOver = true;
    };
    const handleKeyUp = (e) => state.keys[e.key] = false;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const gameLoop = () => {
      if (state.gameOver || lives <= 0) {
        onGameEnd(score);
        return;
      }

      state.frameCount++;

      ctx.fillStyle = darkMode ? '#1f2937' : '#f3f4f6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (state.keys['ArrowLeft']) state.playerX -= 7;
      if (state.keys['ArrowRight']) state.playerX += 7;
      state.playerX = Math.max(0, Math.min(canvas.width - 50, state.playerX));

      // Spawn items - daha seyrek
      if (state.frameCount % 45 === 0) {
        const isStar = Math.random() > 0.15; // %85 yıldız
        state.items.push({
          x: Math.random() * (canvas.width - 20),
          y: -20,
          type: isStar ? 'star' : 'bomb',
          speed: 2 + Math.random() * 1.5 // Daha yavaş
        });
      }

      state.items = state.items.filter(item => {
        item.y += item.speed;

        if (item.type === 'star') {
          ctx.fillStyle = '#fbbf24';
          ctx.shadowColor = '#fbbf24';
        } else {
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
        }
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(item.x + 12, item.y + 12, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Collision
        if (
          item.x < state.playerX + 50 &&
          item.x + 24 > state.playerX &&
          item.y + 24 > 250 &&
          item.y < 280
        ) {
          if (item.type === 'star') {
            setScore(s => s + 15);
          } else {
            setLives(l => l - 1);
          }
          return false;
        }

        if (item.y > canvas.height) {
          if (item.type === 'star') {
            // Yıldız kaçtığında can kaybetme
          }
          return false;
        }

        return true;
      });

      // Draw player
      ctx.fillStyle = '#6366f1';
      ctx.shadowColor = '#6366f1';
      ctx.shadowBlur = 15;
      ctx.fillRect(state.playerX, 250, 50, 30);
      ctx.shadowBlur = 0;

      ctx.fillStyle = darkMode ? '#fff' : '#1f2937';
      ctx.font = 'bold 18px Inter';
      ctx.fillText(`Skor: ${score}`, 15, 30);
      ctx.fillText(`❤️ ${lives}`, canvas.width - 70, 30);

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, [score, lives, darkMode, onGameEnd]);

  return <canvas ref={canvasRef} width={600} height={300} className="w-full h-full" />;
}

// ============================================
// OYUN 4: DODGER - Daha kolay
// ============================================
function DodgerGame({ darkMode, onGameEnd }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const gameState = useRef({
    playerX: 280,
    playerY: 140,
    enemies: [],
    gameOver: false,
    keys: {},
    frameCount: 0,
    spawnRate: 120 // Daha seyrek spawn
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    const state = gameState.current;

    const handleKeyDown = (e) => {
      state.keys[e.key] = true;
      if (e.key === 'Escape') state.gameOver = true;
    };
    const handleKeyUp = (e) => state.keys[e.key] = false;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const gameLoop = () => {
      if (state.gameOver) {
        onGameEnd(score);
        return;
      }

      state.frameCount++;

      ctx.fillStyle = darkMode ? '#1f2937' : '#f3f4f6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (state.keys['ArrowLeft']) state.playerX -= 5;
      if (state.keys['ArrowRight']) state.playerX += 5;
      if (state.keys['ArrowUp']) state.playerY -= 5;
      if (state.keys['ArrowDown']) state.playerY += 5;

      state.playerX = Math.max(0, Math.min(canvas.width - 30, state.playerX));
      state.playerY = Math.max(0, Math.min(canvas.height - 30, state.playerY));

      // Spawn enemies
      if (state.frameCount % state.spawnRate === 0) {
        const side = Math.floor(Math.random() * 4);
        let x, y, vx, vy;
        const speed = 2 + Math.random() * 1.5;
        
        switch(side) {
          case 0: x = -20; y = Math.random() * canvas.height; vx = speed; vy = 0; break;
          case 1: x = canvas.width; y = Math.random() * canvas.height; vx = -speed; vy = 0; break;
          case 2: x = Math.random() * canvas.width; y = -20; vx = 0; vy = speed; break;
          default: x = Math.random() * canvas.width; y = canvas.height; vx = 0; vy = -speed; break;
        }
        
        state.enemies.push({ x, y, vx, vy, size: 18 + Math.random() * 12 });
      }

      state.enemies = state.enemies.filter(enemy => {
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;

        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 8;
        ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
        ctx.shadowBlur = 0;

        // Collision - biraz daha hoşgörülü
        if (
          state.playerX + 5 < enemy.x + enemy.size &&
          state.playerX + 25 > enemy.x &&
          state.playerY + 5 < enemy.y + enemy.size &&
          state.playerY + 25 > enemy.y
        ) {
          state.gameOver = true;
        }

        return enemy.x > -30 && enemy.x < canvas.width + 30 &&
               enemy.y > -30 && enemy.y < canvas.height + 30;
      });

      // Draw player
      ctx.fillStyle = '#6366f1';
      ctx.shadowColor = '#6366f1';
      ctx.shadowBlur = 15;
      ctx.fillRect(state.playerX, state.playerY, 30, 30);
      ctx.shadowBlur = 0;

      setScore(s => s + 1);

      // Zorluk artışı daha yavaş
      if (state.frameCount % 600 === 0 && state.spawnRate > 60) {
        state.spawnRate -= 10;
      }

      ctx.fillStyle = darkMode ? '#fff' : '#1f2937';
      ctx.font = 'bold 18px Inter';
      ctx.fillText(`Skor: ${score}`, 15, 30);

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, [score, darkMode, onGameEnd]);

  return <canvas ref={canvasRef} width={600} height={300} className="w-full h-full" />;
}

// ============================================
// OYUN 5: CLIMBER - Daha kolay
// ============================================
function ClimberGame({ darkMode, onGameEnd }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const gameState = useRef({
    playerX: 280,
    playerY: 250,
    velocityY: 0,
    walls: [],
    gameOver: false,
    keys: {},
    scrollSpeed: 0.8, // Daha yavaş scroll
    onWall: null
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    const state = gameState.current;

    // Initialize walls - daha geniş
    for (let i = 0; i < 12; i++) {
      state.walls.push({
        x: i % 2 === 0 ? 0 : canvas.width - 100,
        y: 300 - i * 55,
        width: 100,
        height: 40,
        side: i % 2 === 0 ? 'left' : 'right'
      });
    }

    const handleKeyDown = (e) => {
      state.keys[e.key] = true;
      if (e.key === 'Escape') state.gameOver = true;
      if (e.key === 'ArrowUp' && state.onWall) {
        state.velocityY = -10;
        state.onWall = null;
      }
    };
    const handleKeyUp = (e) => state.keys[e.key] = false;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const gameLoop = () => {
      if (state.gameOver) {
        onGameEnd(score);
        return;
      }

      ctx.fillStyle = darkMode ? '#1f2937' : '#f3f4f6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      state.walls.forEach(w => w.y += state.scrollSpeed);
      state.playerY += state.scrollSpeed;

      if (state.keys['ArrowLeft']) state.playerX -= 5;
      if (state.keys['ArrowRight']) state.playerX += 5;

      if (!state.onWall) {
        state.velocityY += 0.4;
        state.playerY += state.velocityY;
      } else {
        state.velocityY = 0;
      }

      state.onWall = null;
      state.walls.forEach(wall => {
        if (
          state.playerX < wall.x + wall.width &&
          state.playerX + 30 > wall.x &&
          state.playerY + 30 > wall.y &&
          state.playerY < wall.y + wall.height
        ) {
          state.onWall = wall.side;
          state.playerY = wall.y - 30;
          state.velocityY = 0;
        }
      });

      // Generate new walls
      while (state.walls[state.walls.length - 1].y > -30) {
        const lastWall = state.walls[state.walls.length - 1];
        const newSide = lastWall.side === 'left' ? 'right' : 'left';
        state.walls.push({
          x: newSide === 'left' ? 0 : canvas.width - 100,
          y: lastWall.y - 50 - Math.random() * 25,
          width: 100,
          height: 40,
          side: newSide
        });
        setScore(s => s + 5);
      }

      state.walls = state.walls.filter(w => w.y < canvas.height + 50);

      if (state.playerY > canvas.height) state.gameOver = true;

      // Draw walls
      state.walls.forEach(wall => {
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 8;
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        ctx.shadowBlur = 0;
      });

      // Draw player
      ctx.fillStyle = '#6366f1';
      ctx.shadowColor = '#6366f1';
      ctx.shadowBlur = 15;
      ctx.fillRect(state.playerX, state.playerY, 30, 30);
      ctx.shadowBlur = 0;

      // Zorluk artışı daha yavaş
      if (score % 100 === 0 && score > 0 && state.scrollSpeed < 2) {
        state.scrollSpeed += 0.05;
      }

      ctx.fillStyle = darkMode ? '#fff' : '#1f2937';
      ctx.font = 'bold 18px Inter';
      ctx.fillText(`Skor: ${score}`, 15, 30);

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, [score, darkMode, onGameEnd]);

  return <canvas ref={canvasRef} width={600} height={300} className="w-full h-full" />;
}
