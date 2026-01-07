'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '@/lib/supabase';
import { useStore } from '@/lib/store';

// 5 Farklı Oyun Componenti
const games = {
  runner: RunnerGame,
  jumper: JumperGame,
  collector: CollectorGame,
  dodger: DodgerGame,
  climber: ClimberGame
};

const gameInfo = {
  runner: { name: 'KOŞUCU', icon: '🏃', description: 'Engellere çarpmadan koş!', controls: '↑ ZIPLA' },
  jumper: { name: 'ZIPLAYICI', icon: '🐸', description: 'Platformlara zıpla!', controls: '← → HAREKET, ↑ ZIPLA' },
  collector: { name: 'TOPLAYICI', icon: '⭐', description: 'Düşen yıldızları topla!', controls: '← → HAREKET' },
  dodger: { name: 'KAÇIŞ', icon: '💨', description: 'Kırmızı bloklardan kaç!', controls: '↑ ↓ ← → HAREKET' },
  climber: { name: 'TIRMANICI', icon: '🧗', description: 'En yükseğe tırman!', controls: '← → HAREKET, ↑ ZIPLA' }
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

  // Rastgele oyun seç (her pomodoro bitişinde)
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

    // Skoru kaydet
    if (user && score > 0 && !scoreSaved) {
      await db.saveGameScore(user.id, selectedGame, score);
      setScoreSaved(true);
      
      // Best score güncelle
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

  const handlePlayAgain = () => {
    setIsPlaying(true);
    setFinalScore(0);
    setScoreSaved(false);
  };

  if (!showGame) return null;

  const theme = darkMode ? {
    overlay: 'bg-black/90',
    surface: 'bg-gray-900',
    text: 'text-gray-100',
    textMuted: 'text-gray-400',
    border: 'border-cyan-500/30',
    neonPrimary: 'text-cyan-400',
    neonSecondary: 'text-fuchsia-400',
    neonAccent: 'text-lime-400',
    button: 'bg-cyan-500 hover:bg-cyan-400 text-gray-950',
    buttonSecondary: 'bg-gray-800 hover:bg-gray-700 text-gray-300',
    gameBg: 'bg-gray-800',
  } : {
    overlay: 'bg-black/70',
    surface: 'bg-white',
    text: 'text-gray-900',
    textMuted: 'text-gray-600',
    border: 'border-fuchsia-400/30',
    neonPrimary: 'text-fuchsia-600',
    neonSecondary: 'text-cyan-600',
    neonAccent: 'text-emerald-600',
    button: 'bg-fuchsia-500 hover:bg-fuchsia-400 text-white',
    buttonSecondary: 'bg-slate-200 hover:bg-slate-300 text-gray-700',
    gameBg: 'bg-slate-100',
  };

  const GameComponent = selectedGame ? games[selectedGame] : null;
  const info = selectedGame ? gameInfo[selectedGame] : null;

  return (
    <div className={`fixed inset-0 ${theme.overlay} flex items-center justify-center z-50 p-4`}>
      <div className={`${theme.surface} ${theme.border} border-4 p-6 max-w-2xl w-full shadow-neon-cyan`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{info?.icon}</span>
            <div>
              <h2 className={`font-pixel text-sm ${theme.neonAccent}`}>
                🎮 ÖDÜL OYUNU!
              </h2>
              <p className={`font-pixel text-xs ${theme.textMuted}`}>
                {info?.name}
              </p>
            </div>
          </div>
          <div className={`font-pixel text-lg ${theme.neonPrimary}`}>
            SKOR: {isPlaying ? '...' : finalScore}
          </div>
        </div>

        {/* Game Area */}
        <div className={`${theme.gameBg} ${theme.border} border-2 relative overflow-hidden`}
          style={{ height: '300px' }}>
          
          {!isPlaying && !finalScore && (
            // Start Screen
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl mb-4 animate-bounce">{info?.icon}</span>
              <p className={`font-pixel text-sm ${theme.neonPrimary} mb-2`}>
                {info?.name}
              </p>
              <p className={`font-pixel text-xs ${theme.textMuted} mb-4`}>
                {info?.description}
              </p>
              <p className={`font-pixel text-xs ${theme.neonSecondary}`}>
                {info?.controls}
              </p>
            </div>
          )}

          {isPlaying && GameComponent && (
            <GameComponent 
              darkMode={darkMode}
              onGameEnd={handleGameEnd}
            />
          )}

          {!isPlaying && finalScore > 0 && (
            // Game Over Screen
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
              <p className={`font-pixel text-xl ${theme.neonPrimary} mb-2`}>
                OYUN BİTTİ!
              </p>
              <p className={`font-pixel text-3xl ${theme.neonAccent} mb-4`}>
                {finalScore} PUAN
              </p>
              {scoreSaved && (
                <p className={`font-pixel text-xs ${theme.neonSecondary}`}>
                  ✓ Skor kaydedildi!
                </p>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-3 mt-4">
          {!isPlaying ? (
            <>
              <button
                onClick={() => setIsPlaying(true)}
                disabled={!canPlayGame && finalScore > 0}
                className={`flex-1 py-3 font-pixel text-xs ${theme.button} transition-all
                  ${!canPlayGame && finalScore > 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
              >
                {finalScore > 0 ? '↺ TEKRAR OYNA' : '▶ OYUNA BAŞLA'}
              </button>
              <button
                onClick={handleClose}
                className={`flex-1 py-3 font-pixel text-xs ${theme.buttonSecondary} ${theme.border} border-2`}
              >
                ✕ KAPAT
              </button>
            </>
          ) : (
            <p className={`w-full text-center font-pixel text-xs ${theme.textMuted}`}>
              {info?.controls} • ESC ile çık
            </p>
          )}
        </div>

        {/* Warning */}
        {!canPlayGame && finalScore > 0 && (
          <p className={`font-pixel text-xs ${theme.neonSecondary} text-center mt-4`}>
            ⚠ Tekrar oynamak için bir pomodoro daha tamamla!
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================
// OYUN 1: RUNNER - Engellere atlayarak koş
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
    speed: 5
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    const state = gameState.current;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp' && !state.isJumping) {
        state.velocity = -12;
        state.isJumping = true;
      }
      if (e.key === 'Escape') {
        state.gameOver = true;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const gameLoop = () => {
      if (state.gameOver) {
        onGameEnd(score);
        return;
      }

      ctx.fillStyle = darkMode ? '#1a1a2e' : '#e2e8f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Ground
      ctx.fillStyle = darkMode ? '#374151' : '#94a3b8';
      ctx.fillRect(0, 260, canvas.width, 40);

      // Player
      state.velocity += 0.5; // Gravity
      state.playerY += state.velocity;

      if (state.playerY >= 220) {
        state.playerY = 220;
        state.velocity = 0;
        state.isJumping = false;
      }

      ctx.fillStyle = darkMode ? '#22d3ee' : '#d946ef';
      ctx.shadowColor = darkMode ? '#22d3ee' : '#d946ef';
      ctx.shadowBlur = 10;
      ctx.fillRect(50, state.playerY, 30, 40);
      ctx.shadowBlur = 0;

      // Obstacles
      if (Math.random() < 0.02) {
        state.obstacles.push({
          x: canvas.width,
          width: 20 + Math.random() * 20,
          height: 30 + Math.random() * 30
        });
      }

      state.obstacles = state.obstacles.filter(obs => {
        obs.x -= state.speed;

        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 5;
        ctx.fillRect(obs.x, 260 - obs.height, obs.width, obs.height);
        ctx.shadowBlur = 0;

        // Collision
        if (
          50 < obs.x + obs.width &&
          50 + 30 > obs.x &&
          state.playerY + 40 > 260 - obs.height
        ) {
          state.gameOver = true;
        }

        return obs.x > -50;
      });

      // Score
      setScore(s => s + 1);
      state.speed = 5 + Math.floor(score / 500) * 0.5;

      // Score display
      ctx.fillStyle = darkMode ? '#22d3ee' : '#d946ef';
      ctx.font = '16px "Press Start 2P"';
      ctx.fillText(`SKOR: ${score}`, 10, 30);

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(animationId);
    };
  }, [score]);

  return <canvas ref={canvasRef} width={600} height={300} className="w-full h-full" />;
}

// ============================================
// OYUN 2: JUMPER - Platform zıplama
// ============================================
function JumperGame({ darkMode, onGameEnd }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const gameState = useRef({
    playerX: 280,
    playerY: 250,
    velocityY: 0,
    platforms: [
      { x: 250, y: 280, width: 100 },
      { x: 100, y: 200, width: 80 },
      { x: 350, y: 140, width: 80 },
      { x: 200, y: 80, width: 80 },
    ],
    gameOver: false,
    cameraY: 0,
    keys: {}
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
    const handleKeyUp = (e) => {
      state.keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const gameLoop = () => {
      if (state.gameOver) {
        onGameEnd(score);
        return;
      }

      ctx.fillStyle = darkMode ? '#1a1a2e' : '#e2e8f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Movement
      if (state.keys['ArrowLeft']) state.playerX -= 5;
      if (state.keys['ArrowRight']) state.playerX += 5;
      if (state.keys['ArrowUp'] && state.velocityY === 0) state.velocityY = -15;

      // Physics
      state.velocityY += 0.6;
      state.playerY += state.velocityY;

      // Wrap around
      if (state.playerX < -20) state.playerX = canvas.width;
      if (state.playerX > canvas.width) state.playerX = -20;

      // Platform collision
      state.platforms.forEach(plat => {
        const platY = plat.y - state.cameraY;
        if (
          state.velocityY > 0 &&
          state.playerX + 20 > plat.x &&
          state.playerX < plat.x + plat.width &&
          state.playerY + 30 > platY &&
          state.playerY + 30 < platY + 20
        ) {
          state.velocityY = -15;
          setScore(s => s + 10);
        }
      });

      // Camera follows player up
      if (state.playerY < 150) {
        state.cameraY -= (150 - state.playerY);
        state.playerY = 150;
      }

      // Generate new platforms
      while (state.platforms[state.platforms.length - 1].y - state.cameraY > -50) {
        const lastPlat = state.platforms[state.platforms.length - 1];
        state.platforms.push({
          x: Math.random() * (canvas.width - 80),
          y: lastPlat.y - 60 - Math.random() * 40,
          width: 60 + Math.random() * 40
        });
      }

      // Remove old platforms
      state.platforms = state.platforms.filter(p => p.y - state.cameraY < canvas.height + 50);

      // Fall death
      if (state.playerY > canvas.height) {
        state.gameOver = true;
      }

      // Draw platforms
      state.platforms.forEach(plat => {
        ctx.fillStyle = darkMode ? '#84cc16' : '#22c55e';
        ctx.shadowColor = darkMode ? '#84cc16' : '#22c55e';
        ctx.shadowBlur = 5;
        ctx.fillRect(plat.x, plat.y - state.cameraY, plat.width, 15);
        ctx.shadowBlur = 0;
      });

      // Draw player
      ctx.fillStyle = darkMode ? '#22d3ee' : '#d946ef';
      ctx.shadowColor = darkMode ? '#22d3ee' : '#d946ef';
      ctx.shadowBlur = 10;
      ctx.fillRect(state.playerX, state.playerY, 30, 30);
      ctx.shadowBlur = 0;

      // Score
      ctx.fillStyle = darkMode ? '#22d3ee' : '#d946ef';
      ctx.font = '16px "Press Start 2P"';
      ctx.fillText(`SKOR: ${score}`, 10, 30);

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, [score]);

  return <canvas ref={canvasRef} width={600} height={300} className="w-full h-full" />;
}

// ============================================
// OYUN 3: COLLECTOR - Düşen yıldızları topla
// ============================================
function CollectorGame({ darkMode, onGameEnd }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const gameState = useRef({
    playerX: 280,
    items: [],
    gameOver: false,
    keys: {},
    spawnRate: 0.03
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
    const handleKeyUp = (e) => {
      state.keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const gameLoop = () => {
      if (state.gameOver || lives <= 0) {
        onGameEnd(score);
        return;
      }

      ctx.fillStyle = darkMode ? '#1a1a2e' : '#e2e8f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Movement
      if (state.keys['ArrowLeft']) state.playerX -= 8;
      if (state.keys['ArrowRight']) state.playerX += 8;
      state.playerX = Math.max(0, Math.min(canvas.width - 50, state.playerX));

      // Spawn items
      if (Math.random() < state.spawnRate) {
        const isStar = Math.random() > 0.2;
        state.items.push({
          x: Math.random() * (canvas.width - 20),
          y: -20,
          type: isStar ? 'star' : 'bomb',
          speed: 3 + Math.random() * 2
        });
      }

      // Update items
      state.items = state.items.filter(item => {
        item.y += item.speed;

        // Draw
        if (item.type === 'star') {
          ctx.fillStyle = '#fbbf24';
          ctx.shadowColor = '#fbbf24';
        } else {
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
        }
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(item.x + 10, item.y + 10, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Collision with player
        if (
          item.x < state.playerX + 50 &&
          item.x + 20 > state.playerX &&
          item.y + 20 > 250 &&
          item.y < 280
        ) {
          if (item.type === 'star') {
            setScore(s => s + 10);
          } else {
            setLives(l => l - 1);
          }
          return false;
        }

        // Missed star
        if (item.y > canvas.height) {
          if (item.type === 'star') {
            setLives(l => l - 1);
          }
          return false;
        }

        return true;
      });

      // Draw player
      ctx.fillStyle = darkMode ? '#22d3ee' : '#d946ef';
      ctx.shadowColor = darkMode ? '#22d3ee' : '#d946ef';
      ctx.shadowBlur = 10;
      ctx.fillRect(state.playerX, 250, 50, 30);
      ctx.shadowBlur = 0;

      // UI
      ctx.fillStyle = darkMode ? '#22d3ee' : '#d946ef';
      ctx.font = '14px "Press Start 2P"';
      ctx.fillText(`SKOR: ${score}`, 10, 25);
      ctx.fillText(`❤️ ${lives}`, canvas.width - 80, 25);

      state.spawnRate = 0.03 + score / 1000;

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, [score, lives]);

  return <canvas ref={canvasRef} width={600} height={300} className="w-full h-full" />;
}

// ============================================
// OYUN 4: DODGER - Düşmanlardan kaç
// ============================================
function DodgerGame({ darkMode, onGameEnd }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const gameState = useRef({
    playerX: 280,
    playerY: 140,
    enemies: [],
    gameOver: false,
    keys: {}
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
    const handleKeyUp = (e) => {
      state.keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const gameLoop = () => {
      if (state.gameOver) {
        onGameEnd(score);
        return;
      }

      ctx.fillStyle = darkMode ? '#1a1a2e' : '#e2e8f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Movement
      if (state.keys['ArrowLeft']) state.playerX -= 6;
      if (state.keys['ArrowRight']) state.playerX += 6;
      if (state.keys['ArrowUp']) state.playerY -= 6;
      if (state.keys['ArrowDown']) state.playerY += 6;

      state.playerX = Math.max(0, Math.min(canvas.width - 30, state.playerX));
      state.playerY = Math.max(0, Math.min(canvas.height - 30, state.playerY));

      // Spawn enemies
      if (Math.random() < 0.04) {
        const side = Math.floor(Math.random() * 4);
        let x, y, vx, vy;
        
        switch(side) {
          case 0: x = -20; y = Math.random() * canvas.height; vx = 3 + Math.random() * 2; vy = 0; break;
          case 1: x = canvas.width; y = Math.random() * canvas.height; vx = -(3 + Math.random() * 2); vy = 0; break;
          case 2: x = Math.random() * canvas.width; y = -20; vx = 0; vy = 3 + Math.random() * 2; break;
          case 3: x = Math.random() * canvas.width; y = canvas.height; vx = 0; vy = -(3 + Math.random() * 2); break;
        }
        
        state.enemies.push({ x, y, vx, vy, size: 15 + Math.random() * 10 });
      }

      // Update enemies
      state.enemies = state.enemies.filter(enemy => {
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;

        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 5;
        ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
        ctx.shadowBlur = 0;

        // Collision
        if (
          state.playerX < enemy.x + enemy.size &&
          state.playerX + 30 > enemy.x &&
          state.playerY < enemy.y + enemy.size &&
          state.playerY + 30 > enemy.y
        ) {
          state.gameOver = true;
        }

        return enemy.x > -30 && enemy.x < canvas.width + 30 &&
               enemy.y > -30 && enemy.y < canvas.height + 30;
      });

      // Draw player
      ctx.fillStyle = darkMode ? '#22d3ee' : '#d946ef';
      ctx.shadowColor = darkMode ? '#22d3ee' : '#d946ef';
      ctx.shadowBlur = 10;
      ctx.fillRect(state.playerX, state.playerY, 30, 30);
      ctx.shadowBlur = 0;

      // Score
      setScore(s => s + 1);
      ctx.fillStyle = darkMode ? '#22d3ee' : '#d946ef';
      ctx.font = '16px "Press Start 2P"';
      ctx.fillText(`SKOR: ${score}`, 10, 30);

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, [score]);

  return <canvas ref={canvasRef} width={600} height={300} className="w-full h-full" />;
}

// ============================================
// OYUN 5: CLIMBER - Yukarı tırman
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
    scrollSpeed: 1,
    onWall: null
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    const state = gameState.current;

    // Initialize walls
    for (let i = 0; i < 10; i++) {
      state.walls.push({
        x: i % 2 === 0 ? 0 : canvas.width - 80,
        y: 300 - i * 60,
        width: 80,
        height: 40,
        side: i % 2 === 0 ? 'left' : 'right'
      });
    }

    const handleKeyDown = (e) => {
      state.keys[e.key] = true;
      if (e.key === 'Escape') state.gameOver = true;
      if (e.key === 'ArrowUp' && state.onWall) {
        state.velocityY = -12;
        state.onWall = null;
      }
    };
    const handleKeyUp = (e) => {
      state.keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const gameLoop = () => {
      if (state.gameOver) {
        onGameEnd(score);
        return;
      }

      ctx.fillStyle = darkMode ? '#1a1a2e' : '#e2e8f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Scroll
      state.walls.forEach(w => w.y += state.scrollSpeed);
      state.playerY += state.scrollSpeed;

      // Movement
      if (state.keys['ArrowLeft']) state.playerX -= 5;
      if (state.keys['ArrowRight']) state.playerX += 5;

      // Gravity
      if (!state.onWall) {
        state.velocityY += 0.5;
        state.playerY += state.velocityY;
      } else {
        state.velocityY = 0;
      }

      // Wall collision
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
      while (state.walls[state.walls.length - 1].y > -50) {
        const lastWall = state.walls[state.walls.length - 1];
        const newSide = lastWall.side === 'left' ? 'right' : 'left';
        state.walls.push({
          x: newSide === 'left' ? 0 : canvas.width - 80,
          y: lastWall.y - 60 - Math.random() * 30,
          width: 80,
          height: 40,
          side: newSide
        });
        setScore(s => s + 5);
      }

      // Remove old walls
      state.walls = state.walls.filter(w => w.y < canvas.height + 50);

      // Death
      if (state.playerY > canvas.height) {
        state.gameOver = true;
      }

      // Draw walls
      state.walls.forEach(wall => {
        ctx.fillStyle = darkMode ? '#84cc16' : '#22c55e';
        ctx.shadowColor = darkMode ? '#84cc16' : '#22c55e';
        ctx.shadowBlur = 5;
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        ctx.shadowBlur = 0;
      });

      // Draw player
      ctx.fillStyle = darkMode ? '#22d3ee' : '#d946ef';
      ctx.shadowColor = darkMode ? '#22d3ee' : '#d946ef';
      ctx.shadowBlur = 10;
      ctx.fillRect(state.playerX, state.playerY, 30, 30);
      ctx.shadowBlur = 0;

      // Score
      ctx.fillStyle = darkMode ? '#22d3ee' : '#d946ef';
      ctx.font = '16px "Press Start 2P"';
      ctx.fillText(`SKOR: ${score}`, 10, 30);

      state.scrollSpeed = 1 + score / 200;

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, [score]);

  return <canvas ref={canvasRef} width={600} height={300} className="w-full h-full" />;
}
