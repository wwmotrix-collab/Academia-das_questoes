// ═══════════════════════════════════════════════════════════════════
// Academia das Questões V3 — Evolution Data
// ═══════════════════════════════════════════════════════════════════

// ── Desbloqueio por capítulo ──────────────────────────────────────
const EVOLUTION_UNLOCKS = {
  0: 0,   // sempre disponível
  1: 2,   // cap 2
  2: 4,   // cap 4
  3: 6,   // cap 6
  4: 8,   // cap 8
  5: 11,  // cap 11
  6: 15,  // cap 15
  7: 20,  // cap 20
};

// ── Estágio labels ────────────────────────────────────────────────
const STAGE_LABELS = [
  { stage: 0, name: 'Origem',              icon: '💎', field: null },
  { stage: 1, name: 'Classe Evolutiva',    icon: '🐾', field: 'class_path' },
  { stage: 2, name: 'Linhagem',            icon: '🧬', field: 'lineage' },
  { stage: 3, name: 'Alinhamento',         icon: '🌙', field: 'alignment' },
  { stage: 4, name: 'Elemento',            icon: '⚡', field: 'element' },
  { stage: 5, name: 'Armadura',            icon: '🛡️', field: 'armor' },
  { stage: 6, name: 'Personalidade',       icon: '❤️', field: 'personality' },
  { stage: 7, name: 'Evolução Final',      icon: '👑', field: null },
];

// ── MIMO base (estágio 0) ─────────────────────────────────────────
const MIMO_BASE = {
  stage: 0,
  emoji: '🐱',
  name: 'Mimo',
  description: 'O pequeno gato branco cheio de curiosidade e pronto para aprender!',
  color: '#c4b5fd',
};

// ── Estágio 1 — Classes ───────────────────────────────────────────
const CLASSES = [
  {
    id: 'mamifero',
    name: 'Mamífero',
    emoji: '🦁',
    tagline: 'Força, coragem e lealdade.',
    description: 'Nascido para proteger e liderar! Guerreiro do coração.',
    color: '#f59e0b',
    border: '#92400e',
    bg: 'rgba(245,158,11,0.12)',
  },
  {
    id: 'reptil',
    name: 'Réptil',
    emoji: '🦎',
    tagline: 'Adaptação, estratégia e resistência.',
    description: 'Sempre um passo à frente! Mestre da sobrevivência.',
    color: '#34d399',
    border: '#065f46',
    bg: 'rgba(52,211,153,0.12)',
  },
  {
    id: 'ave',
    name: 'Ave',
    emoji: '🦅',
    tagline: 'Liberdade, visão aguçada e velocidade.',
    description: 'Os céus são o seu lar! Explorador dos horizontes.',
    color: '#60a5fa',
    border: '#1e3a5f',
    bg: 'rgba(96,165,250,0.12)',
  },
];

// ── Estágio 2 — Linhagens por classe ─────────────────────────────
const LINEAGES = {
  mamifero: [
    {
      id: 'prehistorico',
      name: 'Pré-Histórico',
      subname: 'Tigre Dente-de-Sabre',
      emoji: '🐯',
      description: 'Força ancestral, instinto e sobrevivência. Um guerreiro das eras antigas!',
      color: '#f59e0b',
    },
    {
      id: 'lendario',
      name: 'Lendário',
      subname: 'Leão Alado',
      emoji: '🦁',
      description: 'Liderança, honra e coragem lendária. Um verdadeiro rei dos céus!',
      color: '#fcd34d',
    },
    {
      id: 'mistico',
      name: 'Místico',
      subname: 'Tigre Branco Espiritual',
      emoji: '🐱',
      description: 'Equilíbrio, sabedoria e proteção mística. Um guardião espiritual!',
      color: '#c4b5fd',
    },
  ],
  reptil: [
    {
      id: 'prehistorico',
      name: 'Pré-Histórico',
      subname: 'Raptor Primevo',
      emoji: '🦖',
      description: 'Velocidade, instinto e inteligência caçadora. Um sobrevivente das eras antigas!',
      color: '#34d399',
    },
    {
      id: 'lendario',
      name: 'Lendário',
      subname: 'Dragão Alado',
      emoji: '🐉',
      description: 'Poder, domínio e majestade. Senhor dos céus e dos elementos!',
      color: '#4ade80',
    },
    {
      id: 'mistico',
      name: 'Místico',
      subname: 'Dragão Serpentino',
      emoji: '🐍',
      description: 'Sabedoria ancestral e energia espiritual. O equilíbrio entre corpo e alma!',
      color: '#86efac',
    },
  ],
  ave: [
    {
      id: 'prehistorico',
      name: 'Pré-Histórico',
      subname: 'Argentavis Primevo',
      emoji: '🦅',
      description: 'Envergadura colossal, visão panorâmica e força que domina os céus!',
      color: '#60a5fa',
    },
    {
      id: 'lendario',
      name: 'Lendário',
      subname: 'Fênix Solar',
      emoji: '🔥',
      description: 'Renascimento, energia e chama eterna que nunca se apaga!',
      color: '#fb923c',
    },
    {
      id: 'mistico',
      name: 'Místico',
      subname: 'Garuda Celestial',
      emoji: '✨',
      description: 'Proteção divina, velocidade sagrada e sabedoria dos céus!',
      color: '#fcd34d',
    },
  ],
};

// ── Estágio 3 — Alinhamento ───────────────────────────────────────
const ALIGNMENTS = [
  {
    id: 'solar',
    name: 'Solar',
    emoji: '☀️',
    description: 'Energia, luz e vitalidade. Seu brilho inspira e fortalece!',
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.12)',
    gradient: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.1))',
  },
  {
    id: 'lunar',
    name: 'Lunar',
    emoji: '🌙',
    description: 'Intuição, calma e sabedoria. Guiado pela luz da lua!',
    color: '#93c5fd',
    bg: 'rgba(147,197,253,0.12)',
    gradient: 'linear-gradient(135deg, rgba(147,197,253,0.2), rgba(96,165,250,0.1))',
  },
];

// ── Estágio 4 — Elementos ─────────────────────────────────────────
const ELEMENTS = [
  {
    id: 'fogo',
    name: 'Fogo',
    emoji: '🔥',
    description: 'Paixão, força e poder destrutivo. Chamas que nunca se apagam!',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.12)',
  },
  {
    id: 'gelo',
    name: 'Gelo',
    emoji: '❄️',
    description: 'Controle, foco e resistência. Frieza que congela e protege!',
    color: '#7dd3fc',
    bg: 'rgba(125,211,252,0.12)',
  },
  {
    id: 'tempestade',
    name: 'Tempestade',
    emoji: '⚡',
    description: 'Velocidade, fúria e energia elétrica. O trovão obedece a você!',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.12)',
  },
];

// ── Estágio 5 — Armaduras ─────────────────────────────────────────
const ARMORS = [
  {
    id: 'tribal',
    name: 'Tribal',
    emoji: '🌿',
    description: 'Conexão com a natureza e os ancestrais. Força primitiva!',
    color: '#86efac',
    bg: 'rgba(134,239,172,0.12)',
  },
  {
    id: 'celestial',
    name: 'Celestial',
    emoji: '⭐',
    description: 'Luz, pureza e poder divino. Protegido pelas estrelas!',
    color: '#fcd34d',
    bg: 'rgba(252,211,77,0.12)',
  },
  {
    id: 'mecanica',
    name: 'Mecânica',
    emoji: '⚙️',
    description: 'Tecnologia, precisão e inovação. Forjado para o futuro!',
    color: '#94a3b8',
    bg: 'rgba(148,163,184,0.12)',
  },
];

// ── Estágio 6 — Personalidade + Objeto ───────────────────────────
const PERSONALITIES = [
  {
    id: 'sabio',
    name: 'Sábio',
    emoji: '🧙',
    description: 'Busca conhecimento e guia os outros.',
    objects: ['Óculos', 'Varinha'],
    objectEmojis: ['🔮', '✨'],
    color: '#c4b5fd',
    bg: 'rgba(196,181,253,0.12)',
  },
  {
    id: 'protetor',
    name: 'Protetor',
    emoji: '🛡️',
    description: 'Defende seus amigos e tudo que é justo.',
    objects: ['Escudo', 'Elmo'],
    objectEmojis: ['🛡️', '⛑️'],
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.12)',
  },
  {
    id: 'corajoso',
    name: 'Corajoso',
    emoji: '⚔️',
    description: 'Enfrenta desafios sem medo.',
    objects: ['Espada', 'Lança'],
    objectEmojis: ['⚔️', '🏹'],
    color: '#f87171',
    bg: 'rgba(248,113,113,0.12)',
  },
];

// ── Estágio 7 — Evolução Final ────────────────────────────────────
const FINAL_EVOLUTION = {
  id: 'final',
  name: 'Evolução Final',
  emoji: '👑',
  description: 'Seu Mimo alcança sua forma adulta, com todo o poder das suas escolhas e conquistas!',
  color: '#fcd34d',
};

// ── Helper: get current MIMO description ─────────────────────────
function getMimoDescription(evo) {
  if (!evo || evo.stage === 0) return MIMO_BASE;

  let emoji = '🐱';
  let name  = 'Mimo';
  let color = '#c4b5fd';

  if (evo.stage >= 1 && evo.class_path) {
    const cls = CLASSES.find(c => c.id === evo.class_path);
    if (cls) { emoji = cls.emoji; name = cls.name; color = cls.color; }
  }
  if (evo.stage >= 2 && evo.lineage && evo.class_path) {
    const lins = LINEAGES[evo.class_path] || [];
    const lin  = lins.find(l => l.id === evo.lineage);
    if (lin) { emoji = lin.emoji; name = lin.subname; color = lin.color; }
  }
  if (evo.stage >= 7) { emoji = '👑'; name = 'Mimo Lendário'; color = '#fcd34d'; }

  return {
    stage: evo.stage,
    emoji,
    name,
    color,
    description: `Nível ${evo.evolution_level} — ${evo.xp_total} XP`,
    class_path:  evo.class_path,
    lineage:     evo.lineage,
    alignment:   evo.alignment,
    element:     evo.element,
  };
}

// ── XP needed per evolution level ────────────────────────────────
function xpForNextLevel(currentLevel) {
  return 100 + currentLevel * 50;
}

function getEvolutionLevel(xp) {
  let level = 0, accumulated = 0;
  while (accumulated + xpForNextLevel(level) <= xp) {
    accumulated += xpForNextLevel(level);
    level++;
  }
  return {
    level,
    currentXP:   xp - accumulated,
    neededXP:    xpForNextLevel(level),
    percentage:  Math.round((xp - accumulated) / xpForNextLevel(level) * 100),
  };
}
