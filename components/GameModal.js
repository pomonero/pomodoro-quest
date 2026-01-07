'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

// Oyun bilgileri
const gameInfo = {
  spaceRunner: {
    icon: '🚀',
    gradient: 'from-indigo-500 to-purple-600',
  },
  platformJump: {
    icon: '🐸',
    gradient: 'from-green-500 to-emerald-600',
  },
  starCatcher: {
    icon: '⭐',
    gradient: 'from-yellow-500 to-orange-500',
  },
  mazeEscape: {
    icon: '💨',
    gradient: 'from-red-500 to-pink-600',
  },
  skyClimber: {
    icon: '🧗',
    gradient: 'from-cyan-500 to-blue-600',
  },
};

export default function GameModal() {
  const { 
    user, currentTheme, language, showGame, setShowGame, 
    canPlayGame, setCanPlayGame, 
    stats, setStats
  } = useStore();
  
  const t = translations[language] || translations.tr;
  
  const [selectedGame, setSelectedGame] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [scoreSaved, setScoreSaved] = useState(false);

  // Rastgele oyun seç
  useEffect(() => {
    if (showGame && !selectedGame) {
      const gameKeys = Object.keys(gameInfo);
      const randomGame = gameKeys[Math.floor(Math.random() * gameKeys.length)];
      setSelectedGame(randomGame);
    }
  }, [showGame, selectedGame]);

  const handleGameEnd = async (score) => {
    setIsPlaying(false);
    setFinalScore(score);

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

  const startGame = () => {
    setIsPlaying(true);
    setFinalScore(0);
    setScoreSaved(false);
  };

  if (!showGame) return null;

  const info = selectedGame ? gameInfo[selectedGame] : null;
  const gameName = t[selectedGame] || selectedGame;
  const gameDesc = t[`${selectedGame}Desc`] || '';
  const gameControls = t[`${selectedGame}Controls`] || '';

  // Oyun componentleri
  const GameComponents = {
    spaceRunner: SpaceRunnerGame,
    platformJump: PlatformJumpGame,
    starCatcher: StarCatcherGame,
    mazeEscape: MazeEscapeGame,
    skyClimber: SkyClimberGame,
  };

  const GameComponent = selectedGame ? GameComponents[selectedGame] : null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl bg-gray-900 rounded-2xl p-6 border border-white/10">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{info?.icon}</span>
            <div>
              <h2 className="text-xl font-bold text-white">{gameName}</h2>
              <p className="text-sm text-gray-400">{gameDesc}</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-primary">
            {finalScore > 0 ? `${finalScore} ${t.score}` : ''}
          </div>
        </div>

        {/* Game Area */}
        <div className="bg-gray-800 rounded-xl overflow-hidden" style={{ height: '350px' }}>
          {!isPlaying && finalScore === 0 && (
            <div className="h-full flex flex-col items-center justify-center">
              <span className="text-7xl mb-4 animate-bounce">{info?.icon}</span>
              <p className="text-xl font-bold text-white mb-2">{gameName}</p>
              <p className="text-gray-400 mb-4">{gameDesc}</p>
              <div className="px-4 py-2 bg-white/10 rounded-lg text-sm text-gray-300">
                {gameControls}
              </div>
            </div>
          )}

          {isPlaying && GameComponent && (
            <GameComponent onGameEnd={handleGameEnd} />
          )}

          {!isPlaying && finalScore > 0 && (
            <div className="h-full flex flex-col items-center justify-center">
              <p className="text-2xl font-bold text-white mb-2">{t.gameOver}</p>
              <p className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
                {finalScore}
              </p>
              {scoreSaved && (
                <p className="text-green-400 text-sm flex items-center gap-2">
                  ✓ {t.newHighScore || 'Skor kaydedildi!'}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-4">
          {!isPlaying ? (
            <>
              <button
                onClick={startGame}
                className={`flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r ${info?.gradient} hover:opacity-90 transition-opacity`}
              >
                {finalScore > 0 ? `↻ ${t.tryAgain}` : `▶ ${t.start}`}
              </button>
              <button
                onClick={handleClose}
                className="flex-1 py-3 rounded-xl font-medium bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                ✕ {t.close}
              </button>
            </>
          ) : (
            <p className="w-full text-center text-sm text-gray-400">
              {gameControls} • ESC {t.close}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}


// ============================================
// OYUN 1: SPACE RUNNER - Uzay Koşucusu
// ============================================
function SpaceRunnerGame({ onGameEnd }) {
  const canvasRef = useRef(null);
  const gameRef = useRef({
    player: { x: 50, y: 200, width: 40, height: 40, vy: 0, jumping: false },
    obstacles: [],
    score: 0,
    speed: 4,
    gravity: 0.6,
    jumpForce: -12,
    groundY: 250,
    gameOver: false,
    frameCount: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const game = gameRef.current;
    let animationId;

    // Reset game state
    game.player = { x: 50, y: 200, width: 40, height: 40, vy: 0, jumping: false };
    game.obstacles = [];
    game.score = 0;
    game.speed = 4;
    game.gameOver = false;
    game.frameCount = 0;

    const jump = () => {
      if (!game.player.jumping && !game.gameOver) {
        game.player.vy = game.jumpForce;
        game.player.jumping = true;
      }
    };

    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
      if (e.code === 'Escape') {
        game.gameOver = true;
      }
    };

    const handleClick = () => jump();

    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('click', handleClick);

    const gameLoop = () => {
      if (game.gameOver) {
        onGameEnd(game.score);
        return;
      }

      game.frameCount++;
      
      // Clear
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars background
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 50; i++) {
        const x = (i * 73 + game.frameCount * 0.5) % canvas.width;
        const y = (i * 37) % canvas.height;
        ctx.fillRect(x, y, 2, 2);
      }

      // Draw ground
      ctx.fillStyle = '#374151';
      ctx.fillRect(0, game.groundY + 40, canvas.width, 60);
      
      // Ground line
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, game.groundY + 40);
      ctx.lineTo(canvas.width, game.groundY + 40);
      ctx.stroke();

      // Player physics
      game.player.vy += game.gravity;
      game.player.y += game.player.vy;

      // Ground collision
      if (game.player.y >= game.groundY) {
        game.player.y = game.groundY;
        game.player.vy = 0;
        game.player.jumping = false;
      }

      // Draw player (rocket ship)
      ctx.fillStyle = '#6366f1';
      ctx.shadowColor = '#6366f1';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.moveTo(game.player.x + 40, game.player.y + 20);
      ctx.lineTo(game.player.x, game.player.y);
      ctx.lineTo(game.player.x, game.player.y + 40);
      ctx.closePath();
      ctx.fill();
      
      // Engine flame
      if (game.player.jumping) {
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(game.player.x, game.player.y + 10);
        ctx.lineTo(game.player.x - 15, game.player.y + 20);
        ctx.lineTo(game.player.x, game.player.y + 30);
        ctx.closePath();
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Spawn obstacles
      if (game.frameCount % 80 === 0) {
        const height = 30 + Math.random() * 40;
        game.obstacles.push({
          x: canvas.width,
          y: game.groundY + 40 - height,
          width: 25,
          height: height,
        });
      }

      // Update and draw obstacles
      game.obstacles = game.obstacles.filter(obs => {
        obs.x -= game.speed;

        // Draw asteroid
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(obs.x + obs.width/2, obs.y + obs.height/2, obs.width/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Collision check (with smaller hitbox)
        const playerBox = {
          x: game.player.x + 5,
          y: game.player.y + 5,
          width: game.player.width - 10,
          height: game.player.height - 10
        };
        
        if (
          playerBox.x < obs.x + obs.width &&
          playerBox.x + playerBox.width > obs.x &&
          playerBox.y < obs.y + obs.height &&
          playerBox.y + playerBox.height > obs.y
        ) {
          game.gameOver = true;
        }

        return obs.x > -50;
      });

      // Score
      game.score++;
      
      // Increase speed gradually
      if (game.frameCount % 500 === 0 && game.speed < 10) {
        game.speed += 0.5;
      }

      // Draw score
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(`Score: ${game.score}`, 20, 35);

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationId);
    };
  }, [onGameEnd]);

  return <canvas ref={canvasRef} width={600} height={350} className="w-full h-full" />;
}


// ============================================
// OYUN 2: PLATFORM JUMP - Platform Atlama
// ============================================
function PlatformJumpGame({ onGameEnd }) {
  const canvasRef = useRef(null);
  const gameRef = useRef({
    player: { x: 280, y: 250, width: 30, height: 30, vx: 0, vy: 0 },
    platforms: [],
    score: 0,
    cameraY: 0,
    gameOver: false,
    keys: {},
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const game = gameRef.current;
    let animationId;

    // Reset
    game.player = { x: 280, y: 250, width: 30, height: 30, vx: 0, vy: -10 };
    game.platforms = [];
    game.score = 0;
    game.cameraY = 0;
    game.gameOver = false;
    game.keys = {};

    // Create initial platforms
    // ÖNEMLI: İlk platform oyuncunun tam altında!
    game.platforms.push({ x: 250, y: 300, width: 100, height: 15 });
    
    for (let i = 1; i < 15; i++) {
      game.platforms.push({
        x: Math.random() * (canvas.width - 100),
        y: 300 - i * 60,
        width: 80 + Math.random() * 40,
        height: 15,
      });
    }

    const handleKeyDown = (e) => {
      game.keys[e.code] = true;
      if (e.code === 'Escape') game.gameOver = true;
    };
    const handleKeyUp = (e) => {
      game.keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const gameLoop = () => {
      if (game.gameOver) {
        onGameEnd(game.score);
        return;
      }

      // Clear
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Movement
      if (game.keys['ArrowLeft'] || game.keys['KeyA']) {
        game.player.vx = -6;
      } else if (game.keys['ArrowRight'] || game.keys['KeyD']) {
        game.player.vx = 6;
      } else {
        game.player.vx = 0;
      }

      // Physics
      game.player.vy += 0.5; // gravity
      game.player.x += game.player.vx;
      game.player.y += game.player.vy;

      // Screen wrap
      if (game.player.x < -game.player.width) game.player.x = canvas.width;
      if (game.player.x > canvas.width) game.player.x = -game.player.width;

      // Platform collision (only when falling)
      if (game.player.vy > 0) {
        game.platforms.forEach(plat => {
          const platScreenY = plat.y - game.cameraY;
          if (
            game.player.x + game.player.width > plat.x &&
            game.player.x < plat.x + plat.width &&
            game.player.y + game.player.height > platScreenY &&
            game.player.y + game.player.height < platScreenY + 20 &&
            game.player.vy > 0
          ) {
            game.player.vy = -13; // bounce
            game.score += 10;
          }
        });
      }

      // Camera follow
      if (game.player.y < 150) {
        const diff = 150 - game.player.y;
        game.cameraY -= diff;
        game.player.y = 150;
      }

      // Generate new platforms
      const highestPlat = Math.min(...game.platforms.map(p => p.y));
      while (highestPlat > game.cameraY - 100) {
        game.platforms.push({
          x: Math.random() * (canvas.width - 100),
          y: highestPlat - 60 - Math.random() * 30,
          width: 70 + Math.random() * 50,
          height: 15,
        });
        break;
      }

      // Remove off-screen platforms
      game.platforms = game.platforms.filter(p => p.y - game.cameraY < canvas.height + 50);

      // Game over
      if (game.player.y - game.cameraY > canvas.height + 50) {
        game.gameOver = true;
      }

      // Draw platforms
      game.platforms.forEach(plat => {
        const screenY = plat.y - game.cameraY;
        ctx.fillStyle = '#22c55e';
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 10;
        ctx.fillRect(plat.x, screenY, plat.width, plat.height);
        ctx.shadowBlur = 0;
      });

      // Draw player
      ctx.fillStyle = '#6366f1';
      ctx.shadowColor = '#6366f1';
      ctx.shadowBlur = 15;
      ctx.fillRect(game.player.x, game.player.y, game.player.width, game.player.height);
      
      // Eyes
      ctx.fillStyle = '#fff';
      ctx.fillRect(game.player.x + 8, game.player.y + 8, 5, 5);
      ctx.fillRect(game.player.x + 18, game.player.y + 8, 5, 5);
      ctx.shadowBlur = 0;

      // Score
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(`Score: ${game.score}`, 20, 35);

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, [onGameEnd]);

  return <canvas ref={canvasRef} width={600} height={350} className="w-full h-full" />;
}


// ============================================
// OYUN 3: STAR CATCHER - Yıldız Avcısı
// ============================================
function StarCatcherGame({ onGameEnd }) {
  const canvasRef = useRef(null);
  const gameRef = useRef({
    player: { x: 280, y: 300, width: 60, height: 20 },
    items: [],
    score: 0,
    lives: 5,
    gameOver: false,
    keys: {},
    frameCount: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const game = gameRef.current;
    let animationId;

    // Reset
    game.player = { x: 280, y: 300, width: 60, height: 20 };
    game.items = [];
    game.score = 0;
    game.lives = 5;
    game.gameOver = false;
    game.keys = {};
    game.frameCount = 0;

    const handleKeyDown = (e) => {
      game.keys[e.code] = true;
      if (e.code === 'Escape') game.gameOver = true;
    };
    const handleKeyUp = (e) => {
      game.keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const gameLoop = () => {
      if (game.gameOver || game.lives <= 0) {
        onGameEnd(game.score);
        return;
      }

      game.frameCount++;

      // Clear
      ctx.fillStyle = '#0c1929';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Background stars
      ctx.fillStyle = '#ffffff44';
      for (let i = 0; i < 30; i++) {
        const x = (i * 83) % canvas.width;
        const y = (i * 47 + game.frameCount * 0.2) % canvas.height;
        ctx.fillRect(x, y, 1, 1);
      }

      // Player movement
      if (game.keys['ArrowLeft'] || game.keys['KeyA']) {
        game.player.x -= 8;
      }
      if (game.keys['ArrowRight'] || game.keys['KeyD']) {
        game.player.x += 8;
      }
      game.player.x = Math.max(0, Math.min(canvas.width - game.player.width, game.player.x));

      // Spawn items
      if (game.frameCount % 40 === 0) {
        const isStar = Math.random() > 0.2; // 80% star, 20% bomb
        game.items.push({
          x: Math.random() * (canvas.width - 30),
          y: -30,
          size: 25,
          type: isStar ? 'star' : 'bomb',
          speed: 3 + Math.random() * 2,
        });
      }

      // Update items
      game.items = game.items.filter(item => {
        item.y += item.speed;

        // Draw
        if (item.type === 'star') {
          ctx.fillStyle = '#fbbf24';
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 15;
          drawStar(ctx, item.x + item.size/2, item.y + item.size/2, 5, item.size/2, item.size/4);
        } else {
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(item.x + item.size/2, item.y + item.size/2, item.size/2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#000';
          ctx.font = '12px sans-serif';
          ctx.fillText('💣', item.x + 5, item.y + 18);
        }
        ctx.shadowBlur = 0;

        // Collision with player
        if (
          item.x < game.player.x + game.player.width &&
          item.x + item.size > game.player.x &&
          item.y + item.size > game.player.y &&
          item.y < game.player.y + game.player.height
        ) {
          if (item.type === 'star') {
            game.score += 15;
          } else {
            game.lives--;
          }
          return false;
        }

        // Off screen
        return item.y < canvas.height + 50;
      });

      // Draw player (basket)
      ctx.fillStyle = '#6366f1';
      ctx.shadowColor = '#6366f1';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(game.player.x, game.player.y);
      ctx.lineTo(game.player.x + 10, game.player.y + game.player.height);
      ctx.lineTo(game.player.x + game.player.width - 10, game.player.y + game.player.height);
      ctx.lineTo(game.player.x + game.player.width, game.player.y);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // UI
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(`Score: ${game.score}`, 20, 35);
      ctx.fillText(`❤️ ${game.lives}`, canvas.width - 80, 35);

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, [onGameEnd]);

  return <canvas ref={canvasRef} width={600} height={350} className="w-full h-full" />;
}

// Yıldız çizme helper
function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
  let rot = Math.PI / 2 * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}


// ============================================
// OYUN 4: MAZE ESCAPE - Labirent Kaçışı
// ============================================
function MazeEscapeGame({ onGameEnd }) {
  const canvasRef = useRef(null);
  const gameRef = useRef({
    player: { x: 300, y: 175, size: 25 },
    enemies: [],
    score: 0,
    gameOver: false,
    keys: {},
    frameCount: 0,
    spawnRate: 100,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const game = gameRef.current;
    let animationId;

    // Reset
    game.player = { x: 300, y: 175, size: 25 };
    game.enemies = [];
    game.score = 0;
    game.gameOver = false;
    game.keys = {};
    game.frameCount = 0;
    game.spawnRate = 100;

    const handleKeyDown = (e) => {
      game.keys[e.code] = true;
      if (e.code === 'Escape') game.gameOver = true;
    };
    const handleKeyUp = (e) => {
      game.keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const gameLoop = () => {
      if (game.gameOver) {
        onGameEnd(game.score);
        return;
      }

      game.frameCount++;

      // Clear
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid background
      ctx.strokeStyle = '#ffffff11';
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Player movement
      const speed = 5;
      if (game.keys['ArrowUp'] || game.keys['KeyW']) game.player.y -= speed;
      if (game.keys['ArrowDown'] || game.keys['KeyS']) game.player.y += speed;
      if (game.keys['ArrowLeft'] || game.keys['KeyA']) game.player.x -= speed;
      if (game.keys['ArrowRight'] || game.keys['KeyD']) game.player.x += speed;

      // Boundaries
      game.player.x = Math.max(0, Math.min(canvas.width - game.player.size, game.player.x));
      game.player.y = Math.max(0, Math.min(canvas.height - game.player.size, game.player.y));

      // Spawn enemies
      if (game.frameCount % game.spawnRate === 0) {
        const side = Math.floor(Math.random() * 4);
        let x, y, vx, vy;
        const spd = 2 + Math.random() * 2;
        
        switch(side) {
          case 0: x = -30; y = Math.random() * canvas.height; vx = spd; vy = 0; break;
          case 1: x = canvas.width + 30; y = Math.random() * canvas.height; vx = -spd; vy = 0; break;
          case 2: x = Math.random() * canvas.width; y = -30; vx = 0; vy = spd; break;
          default: x = Math.random() * canvas.width; y = canvas.height + 30; vx = 0; vy = -spd; break;
        }
        
        game.enemies.push({ x, y, vx, vy, size: 20 + Math.random() * 15 });
      }

      // Update enemies
      game.enemies = game.enemies.filter(enemy => {
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;

        // Draw enemy
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
        ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
        ctx.shadowBlur = 0;

        // Collision (with smaller hitbox)
        const px = game.player.x + 3;
        const py = game.player.y + 3;
        const ps = game.player.size - 6;
        
        if (
          px < enemy.x + enemy.size &&
          px + ps > enemy.x &&
          py < enemy.y + enemy.size &&
          py + ps > enemy.y
        ) {
          game.gameOver = true;
        }

        return enemy.x > -50 && enemy.x < canvas.width + 50 &&
               enemy.y > -50 && enemy.y < canvas.height + 50;
      });

      // Draw player
      ctx.fillStyle = '#6366f1';
      ctx.shadowColor = '#6366f1';
      ctx.shadowBlur = 15;
      ctx.fillRect(game.player.x, game.player.y, game.player.size, game.player.size);
      ctx.shadowBlur = 0;

      // Score
      game.score++;
      
      // Increase difficulty
      if (game.frameCount % 500 === 0 && game.spawnRate > 40) {
        game.spawnRate -= 10;
      }

      // UI
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(`Score: ${game.score}`, 20, 35);

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, [onGameEnd]);

  return <canvas ref={canvasRef} width={600} height={350} className="w-full h-full" />;
}


// ============================================
// OYUN 5: SKY CLIMBER - Gökyüzü Tırmanıcısı
// ============================================
function SkyClimberGame({ onGameEnd }) {
  const canvasRef = useRef(null);
  const gameRef = useRef({
    player: { x: 280, y: 280, width: 30, height: 30 },
    platforms: [],
    score: 0,
    scrollSpeed: 1,
    gameOver: false,
    keys: {},
    frameCount: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const game = gameRef.current;
    let animationId;

    // Reset
    game.player = { x: 280, y: 280, width: 30, height: 30 };
    game.platforms = [];
    game.score = 0;
    game.scrollSpeed = 1;
    game.gameOver = false;
    game.keys = {};
    game.frameCount = 0;

    // Initial platforms
    for (let i = 0; i < 8; i++) {
      const isLeft = i % 2 === 0;
      game.platforms.push({
        x: isLeft ? 0 : canvas.width - 120,
        y: 300 - i * 60,
        width: 120,
        height: 20,
        side: isLeft ? 'left' : 'right',
      });
    }

    const handleKeyDown = (e) => {
      game.keys[e.code] = true;
      if (e.code === 'Escape') game.gameOver = true;
    };
    const handleKeyUp = (e) => {
      game.keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const gameLoop = () => {
      if (game.gameOver) {
        onGameEnd(game.score);
        return;
      }

      game.frameCount++;

      // Clear with gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0c4a6e');
      gradient.addColorStop(1, '#1e3a5f');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Scroll world down
      game.platforms.forEach(p => p.y += game.scrollSpeed);
      game.player.y += game.scrollSpeed;

      // Player movement
      if (game.keys['ArrowLeft'] || game.keys['KeyA']) {
        game.player.x -= 6;
      }
      if (game.keys['ArrowRight'] || game.keys['KeyD']) {
        game.player.x += 6;
      }

      // Boundaries
      game.player.x = Math.max(0, Math.min(canvas.width - game.player.width, game.player.x));

      // Platform collision
      let onPlatform = false;
      game.platforms.forEach(plat => {
        if (
          game.player.x + game.player.width > plat.x &&
          game.player.x < plat.x + plat.width &&
          game.player.y + game.player.height >= plat.y &&
          game.player.y + game.player.height <= plat.y + plat.height + 10
        ) {
          game.player.y = plat.y - game.player.height;
          onPlatform = true;
        }
      });

      // Fall if not on platform
      if (!onPlatform) {
        game.player.y += 3;
      }

      // Generate new platforms
      const highestPlat = game.platforms.reduce((min, p) => Math.min(min, p.y), Infinity);
      if (highestPlat > 30) {
        const lastSide = game.platforms[game.platforms.length - 1]?.side;
        const newSide = lastSide === 'left' ? 'right' : 'left';
        game.platforms.push({
          x: newSide === 'left' ? 0 : canvas.width - 120,
          y: highestPlat - 60,
          width: 120,
          height: 20,
          side: newSide,
        });
        game.score += 10;
      }

      // Remove old platforms
      game.platforms = game.platforms.filter(p => p.y < canvas.height + 50);

      // Game over
      if (game.player.y > canvas.height) {
        game.gameOver = true;
      }

      // Draw platforms
      game.platforms.forEach(plat => {
        ctx.fillStyle = '#22d3ee';
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 10;
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        ctx.shadowBlur = 0;
      });

      // Draw player
      ctx.fillStyle = '#6366f1';
      ctx.shadowColor = '#6366f1';
      ctx.shadowBlur = 15;
      ctx.fillRect(game.player.x, game.player.y, game.player.width, game.player.height);
      ctx.shadowBlur = 0;

      // Increase speed
      if (game.frameCount % 300 === 0 && game.scrollSpeed < 3) {
        game.scrollSpeed += 0.2;
      }

      // UI
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(`Score: ${game.score}`, 20, 35);

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, [onGameEnd]);

  return <canvas ref={canvasRef} width={600} height={350} className="w-full h-full" />;
}
