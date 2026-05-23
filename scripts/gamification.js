// ═══════════════════════════════════════════════════════════
// Academia das Questões V2 — Gamification
// ═══════════════════════════════════════════════════════════

const XP_PER_CORRECT  = 10;
const XP_PERFECT_BONUS = 50;

const GLOBAL_RANKS = [
  { min:0,    max:199,  label:'Aprendiz',           icon:'🌿', color:'#86efac' },
  { min:200,  max:499,  label:'Exploradora',         icon:'📘', color:'#93c5fd' },
  { min:500,  max:999,  label:'Guardiã',             icon:'💎', color:'#c4b5fd' },
  { min:1000, max:1799, label:'Heroína da Academia', icon:'⚡', color:'#fde68a' },
  { min:1800, max:9999, label:'Mestra das Questões', icon:'👑', color:'#fcd34d' },
];

const NEXT_RANK_XP = [200, 500, 1000, 1800, 9999];

const BADGE_DEFS = [
  { name:'Primeira Missão',   icon:'⚔️',  desc:'Completou sua primeira atividade!' },
  { name:'Exploradora',       icon:'🔍',  desc:'Completou 3 atividades!' },
  { name:'Metade do Caminho', icon:'⭐',  desc:'Completou 5 atividades!' },
  { name:'Quase Lá',          icon:'💫',  desc:'Completou 8 atividades!' },
  { name:'Campeã',            icon:'🏆',  desc:'Completou todas as 10 atividades!' },
  { name:'Perfeição',         icon:'💎',  desc:'100% de acertos em uma atividade!' },
  { name:'Mestra das Frações',icon:'½',   desc:'100% nas atividades de frações (6, 7 ou 8)!' },
  { name:'Lógica Pura',       icon:'🧠',  desc:'100% na atividade de sequências!' },
  { name:'Veterana',          icon:'🌟',  desc:'Mais de 500 XP acumulados!' },
  { name:'Lendária',          icon:'👑',  desc:'Mais de 1000 XP acumulados!' },
];

const Gamification = {

  // Calculate XP from a single activity result
  calcXP(score, maxScore) {
    const base    = score * XP_PER_CORRECT;
    const perfect = score === maxScore ? XP_PERFECT_BONUS : 0;
    return base + perfect;
  },

  // Get global rank from total XP
  getGlobalRank(totalXP) {
    for (const r of GLOBAL_RANKS) {
      if (totalXP >= r.min && totalXP <= r.max) return r;
    }
    return GLOBAL_RANKS[GLOBAL_RANKS.length - 1];
  },

  // XP to next rank
  xpToNextRank(totalXP) {
    for (const threshold of NEXT_RANK_XP) {
      if (totalXP < threshold) return threshold - totalXP;
    }
    return 0;
  },

  // Progress percentage to next rank
  rankProgress(totalXP) {
    const rank = Gamification.getGlobalRank(totalXP);
    const range = rank.max - rank.min;
    const progress = totalXP - rank.min;
    return Math.min(100, Math.round(progress / range * 100));
  },

  // Check which badges to unlock after completing activities
  async checkBadges(studentId, completedCount, activityId, score, maxScore, totalXP) {
    const newBadges = [];
    const badges = LS.get('badges') || [];
    const has = (name) => badges.some(b => b.badge_name === name);

    const unlock = async (name) => {
      const def = BADGE_DEFS.find(b => b.name === name);
      if (!def) return;
      const result = await DB.unlockBadge(studentId, name, def.desc);
      if (result.isNew) newBadges.push({ ...def });
    };

    if (completedCount >= 1  && !has('Primeira Missão'))   await unlock('Primeira Missão');
    if (completedCount >= 3  && !has('Exploradora'))        await unlock('Exploradora');
    if (completedCount >= 5  && !has('Metade do Caminho'))  await unlock('Metade do Caminho');
    if (completedCount >= 8  && !has('Quase Lá'))           await unlock('Quase Lá');
    if (completedCount >= 10 && !has('Campeã'))             await unlock('Campeã');
    if (score === maxScore   && !has('Perfeição'))           await unlock('Perfeição');
    if ([6,7,8].includes(activityId) && score === maxScore && !has('Mestra das Frações')) await unlock('Mestra das Frações');
    if (activityId === 5 && score === maxScore && !has('Lógica Pura')) await unlock('Lógica Pura');
    if (totalXP >= 500  && !has('Veterana'))                await unlock('Veterana');
    if (totalXP >= 1000 && !has('Lendária'))                await unlock('Lendária');

    return newBadges;
  },

  // ── PARTICLES ─────────────────────────────────────────
  particles: [],
  particleCanvas: null,
  particleCtx: null,
  particleRAF: null,

  initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    Gamification.particleCanvas = canvas;
    Gamification.particleCtx = canvas.getContext('2d');
    Gamification._resizeCanvas();
    window.addEventListener('resize', Gamification._resizeCanvas);
    Gamification._spawnParticles();
    Gamification._animateParticles();
  },

  _resizeCanvas() {
    const c = Gamification.particleCanvas;
    if (!c) return;
    c.width  = window.innerWidth;
    c.height = window.innerHeight;
  },

  _spawnParticles() {
    const count = Math.min(40, Math.floor(window.innerWidth / 20));
    for (let i = 0; i < count; i++) {
      Gamification.particles.push(Gamification._newParticle(true));
    }
  },

  _newParticle(random = false) {
    const types = ['✦', '✧', '⋆', '◆', '◇', '★', '·'];
    return {
      x:     Math.random() * window.innerWidth,
      y:     random ? Math.random() * window.innerHeight : window.innerHeight + 10,
      vx:    (Math.random() - 0.5) * 0.4,
      vy:    -(Math.random() * 0.5 + 0.1),
      alpha: Math.random() * 0.5 + 0.1,
      size:  Math.random() * 12 + 6,
      type:  types[Math.floor(Math.random() * types.length)],
      color: ['#f59e0b','#9333ea','#60a5fa','#f472b6','#34d399'][Math.floor(Math.random() * 5)],
      life:  Math.random() * 200 + 100,
      age:   random ? Math.random() * 200 : 0,
    };
  },

  _animateParticles() {
    const ctx = Gamification.particleCtx;
    const canvas = Gamification.particleCanvas;
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    Gamification.particles = Gamification.particles.filter(p => {
      p.x   += p.vx;
      p.y   += p.vy;
      p.age++;
      p.alpha = p.age < p.life * 0.2
        ? p.age / (p.life * 0.2) * 0.4
        : (1 - (p.age - p.life * 0.8) / (p.life * 0.2)) * 0.4;

      if (p.age > p.life) {
        Object.assign(p, Gamification._newParticle(false));
        return true;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.font        = `${p.size}px Arial`;
      ctx.fillStyle   = p.color;
      ctx.fillText(p.type, p.x, p.y);
      ctx.restore();
      return true;
    });

    // Refill
    while (Gamification.particles.length < 40) {
      Gamification.particles.push(Gamification._newParticle(true));
    }

    Gamification.particleRAF = requestAnimationFrame(Gamification._animateParticles);
  },

  // ── CONFETTI ──────────────────────────────────────────
  confettiPieces: [],
  confettiCanvas: null,
  confettiCtx:    null,
  confettiRAF:    null,

  launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    Gamification.confettiCanvas = canvas;
    Gamification.confettiCtx = canvas.getContext('2d');

    const colors = ['#f59e0b','#9333ea','#60a5fa','#f472b6','#34d399','#fcd34d','#a78bfa'];
    for (let i = 0; i < 120; i++) {
      Gamification.confettiPieces.push({
        x:    Math.random() * canvas.width,
        y:    Math.random() * canvas.height - canvas.height,
        vx:   (Math.random() - 0.5) * 3,
        vy:   Math.random() * 4 + 2,
        w:    Math.random() * 12 + 4,
        h:    Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: Math.random() * Math.PI * 2,
        av:   (Math.random() - 0.5) * 0.2,
        life: 200,
        age:  0,
      });
    }
    cancelAnimationFrame(Gamification.confettiRAF);
    Gamification._animateConfetti();
    setTimeout(() => { Gamification.confettiPieces = []; }, 4000);
  },

  _animateConfetti() {
    const ctx = Gamification.confettiCtx;
    const canvas = Gamification.confettiCanvas;
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    Gamification.confettiPieces = Gamification.confettiPieces.filter(p => {
      p.x += p.vx; p.y += p.vy;
      p.angle += p.av; p.age++;
      if (p.y > canvas.height + 20) return false;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.globalAlpha = p.age > 150 ? 1 - (p.age - 150) / 50 : 1;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      ctx.restore();
      return true;
    });

    if (Gamification.confettiPieces.length > 0) {
      Gamification.confettiRAF = requestAnimationFrame(Gamification._animateConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  },

  // ── XP FLOAT ANIMATION ────────────────────────────────
  showXPGain(amount, x, y) {
    const el = document.createElement('div');
    el.className = 'xp-gain-flash';
    el.textContent = `+${amount} XP`;
    el.style.left = `${x}px`;
    el.style.top  = `${y}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1300);
  },

  // ── CELEBRATION OVERLAY ───────────────────────────────
  showCelebration(title, message, emoji, newBadges, onClose) {
    const overlay  = document.getElementById('celebration-overlay');
    const titleEl  = document.getElementById('cel-title');
    const msgEl    = document.getElementById('cel-msg');
    const emojiEl  = document.getElementById('cel-emoji');
    const badgesEl = document.getElementById('cel-badges');
    const closeBtn = document.getElementById('cel-close');

    emojiEl.textContent = emoji;
    titleEl.textContent = title;
    msgEl.innerHTML     = message;

    if (newBadges && newBadges.length > 0) {
      badgesEl.innerHTML = newBadges.map(b =>
        `<div class="result-badge-chip">${b.icon} ${b.name}</div>`
      ).join('');
      badgesEl.style.display = 'flex';
    } else {
      badgesEl.style.display = 'none';
    }

    overlay.classList.add('show');
    Gamification.launchConfetti();

    closeBtn.onclick = () => {
      overlay.classList.remove('show');
      if (onClose) onClose();
    };
  },
};
