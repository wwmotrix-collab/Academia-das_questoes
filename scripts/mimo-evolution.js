// ═══════════════════════════════════════════════════════════════
// Academia das Questões V3.7.1 — mimo-evolution.js
// Corrige: contagem dinâmica, desbloqueio por XP real, modal de escolha
// ═══════════════════════════════════════════════════════════════

'use strict';

/* ── XP thresholds — desbloqueio por XP, SEM dependência de capítulo ── */
const EVO_THRESHOLDS = {
  class_path:   100,
  lineage:      300,
  alignment:    600,
  element:      900,
  armor:        1300,
  personality:  1800,
  final:        2400,
};

const EVO_FIELD_ORDER = [
  'class_path', 'lineage', 'alignment',
  'element', 'armor', 'personality',
];

const EVO_FIELD_LABELS = {
  class_path:  'Classe Evolutiva',
  lineage:     'Linhagem',
  alignment:   'Alinhamento',
  element:     'Elemento',
  armor:       'Armadura',
  personality: 'Personalidade',
  final:       'Evolução Final',
};

/* ── Choice options per field ── */
const EVO_OPTIONS = {
  class_path: [
    { id:'mamifero', name:'Mamífero',  emoji:'🦁', desc:'Força, coragem e lealdade. Nascido para proteger e liderar!' },
    { id:'reptil',   name:'Réptil',    emoji:'🦎', desc:'Adaptação, estratégia e resistência. Sempre um passo à frente!' },
    { id:'ave',      name:'Ave',       emoji:'🦅', desc:'Liberdade, visão aguçada e velocidade. Os céus são o seu lar!' },
  ],
  lineage: {
    mamifero: [
      { id:'prehistorico', name:'Pré-Histórico', subname:'Tigre Dente-de-Sabre', emoji:'🐯', desc:'Força ancestral, instinto e sobrevivência!' },
      { id:'lendario',     name:'Lendário',      subname:'Leão Alado',           emoji:'🦁', desc:'Liderança, honra e coragem lendária!' },
      { id:'mistico',      name:'Místico',       subname:'Tigre Branco Espiritual', emoji:'🐱', desc:'Equilíbrio, sabedoria e proteção mística!' },
    ],
    reptil: [
      { id:'prehistorico', name:'Pré-Histórico', subname:'Raptor Primevo',    emoji:'🦖', desc:'Velocidade, instinto e inteligência caçadora!' },
      { id:'lendario',     name:'Lendário',      subname:'Dragão Alado',      emoji:'🐉', desc:'Poder, domínio e majestade. Senhor dos céus!' },
      { id:'mistico',      name:'Místico',       subname:'Dragão Serpentino', emoji:'🐍', desc:'Sabedoria ancestral e energia espiritual!' },
    ],
    ave: [
      { id:'prehistorico', name:'Pré-Histórico', subname:'Argentavis Primevo', emoji:'🦅', desc:'Envergadura colossal e força que domina os céus!' },
      { id:'lendario',     name:'Lendário',      subname:'Fênix Solar',        emoji:'🔥', desc:'Renascimento, energia e chama eterna!' },
      { id:'mistico',      name:'Místico',       subname:'Garuda Celestial',   emoji:'✨', desc:'Proteção divina e sabedoria dos céus!' },
    ],
  },
  alignment: [
    { id:'solar', name:'Solar', emoji:'☀️', desc:'Energia, luz e vitalidade. Seu brilho inspira e fortalece!' },
    { id:'lunar', name:'Lunar', emoji:'🌙', desc:'Intuição, calma e sabedoria. Guiado pela luz da lua!' },
  ],
  element: [
    { id:'fogo',       name:'Fogo',       emoji:'🔥', desc:'Paixão, força e poder. Chamas que nunca se apagam!' },
    { id:'gelo',       name:'Gelo',       emoji:'❄️', desc:'Controle, foco e resistência. Frieza que congela e protege!' },
    { id:'tempestade', name:'Tempestade', emoji:'⚡', desc:'Velocidade, fúria e energia elétrica. O trovão obedece!' },
  ],
  armor: [
    { id:'tribal',    name:'Tribal',    emoji:'🌿', desc:'Conexão com a natureza e os ancestrais. Força primitiva!' },
    { id:'celestial', name:'Celestial', emoji:'⭐', desc:'Luz, pureza e poder divino. Protegido pelas estrelas!' },
    { id:'mecanica',  name:'Mecânica',  emoji:'⚙️', desc:'Tecnologia, precisão e inovação. Forjado para o futuro!' },
  ],
  personality: [
    { id:'sabio',     name:'Sábio',     emoji:'🧙', desc:'Busca conhecimento e guia os outros. Objeto: Óculos + Varinha' },
    { id:'protetor',  name:'Protetor',  emoji:'🛡️', desc:'Defende seus amigos e tudo que é justo. Objeto: Escudo + Elmo' },
    { id:'corajoso',  name:'Corajoso',  emoji:'⚔️', desc:'Enfrenta desafios sem medo. Objeto: Espada ou Lança' },
  ],
};

/* ── Asset map ── */
const MIMO_IMGS = {
  base:     '/assets/mascots/mimo-base.webp',
  mamifero: '/assets/mascots/mimo-mammal.webp',
  reptil:   '/assets/mascots/mimo-reptile.webp',
  ave:      '/assets/mascots/mimo-bird.webp',
};

/* ── localStorage key — V3.7.1 unified key ── */
const LS_EVO_KEY = 'academia_mimo_evolution';

/* ── Context tips ── */
const MIMO_TIPS = {
  math:             ['Observe os números com <em>calma!</em>', 'Tente resolver em <em>partes menores!</em>', 'Frações: numerador é a <strong>parte</strong>, denominador é o <em>todo</em>!', 'Na sequência, procura o <em>padrão</em>: soma, subtrai ou multiplica?'],
  reading:          ['Releia a questão com <em>atenção total!</em>', 'Procura a <em>palavra mais importante</em> da pergunta!', 'As <strong>emoções</strong> do personagem são uma pista enorme!', 'O que está <em>nas entrelinhas?</em>'],
  wrong:            ['Não desiste! <em>Vamos tentar juntos!</em> 💜', 'Cada erro é um <strong>aprendizado!</strong> Você consegue!', 'Respira e <em>tenta de novo.</em> Eu acredito em você!'],
  correct:          ['<strong>Incrível!</strong> Você está evoluindo! ⭐', 'Isso aí! <em>Você é demais!</em>', '<strong>Perfeito!</strong> Seu conhecimento brilhou! 🌟'],
  start:            ['Leia cada questão com <em>atenção!</em>', '<em>Respira fundo</em> e começa pela mais fácil!', 'Essa atividade vai me dar <strong>XP para evoluir!</strong> ⚡'],
  finish:           ['<em>Revisa suas respostas</em> antes de concluir!', 'Confere se <em>todas as questões</em> estão respondidas!', 'Dá uma última olhada. <strong>Você é detalhista!</strong> ✅'],
  incomplete:       ['Psiu! Ainda tem <em>questões em branco!</em>', 'Vi que tem questões abertas. <em>Revisa tudo!</em>', '<strong>Espera!</strong> Rola a tela e responde tudo! 👀'],
  idle:             ['Clica em mim para uma <em>dica!</em> 💜', 'Psiu! <em>Já fez suas atividades</em> hoje?', 'Cada atividade me faz <strong>evoluir</strong> um pouco mais!'],
  welcome:          ['Bem-vinda de volta! <em>Saudades!</em> 💜', 'Olha quem voltou! <em>Pronta para aprender?</em> ⭐', 'A Academia te aguardava! <em>Vamos continuar!</em>'],
  evolution_ready:  ['⭐ <strong>Posso evoluir!</strong> Clica em mim e escolhe!', '🌟 XP suficiente! <em>É hora de evoluir!</em> Clica aqui!', '✨ <strong>Nova forma desbloqueada!</strong> Me clica!'],
};

/* ═══════════════════════════════════════════════════════════════
   MimoEvo — core object
   ═══════════════════════════════════════════════════════════════ */
const MimoEvo = {
  _mounted:   false,
  _minimised: false,
  _panelOpen: false,
  _choiceModalOpen: false,
  _activeTab: 'status',
  _hideTimer: null,
  _idleTimer: null,

  /* refs */
  $wrap:    null,
  $img:     null,
  $bubbleW: null,
  $bubbleT: null,
  $ctxIcon: null,
  $ctxLbl:  null,
  $burst:   null,
  $restore: null,
  $restImg: null,
  $panel:   null,
  $choiceModal: null,

  /* ── Persistence ───────────────────────────────────────────── */
  _defaultEvo() {
    return { stage:0, class_path:null, lineage:null, alignment:null, element:null, armor:null, personality:null, updatedAt:null };
  },

  getEvo() {
    try {
      const raw = localStorage.getItem(LS_EVO_KEY);
      if (!raw) return this._defaultEvo();
      const parsed = JSON.parse(raw);
      return { ...this._defaultEvo(), ...parsed };
    } catch { return this._defaultEvo(); }
  },

  saveEvoLocal(evo) {
    try {
      evo.updatedAt = new Date().toISOString();
      localStorage.setItem(LS_EVO_KEY, JSON.stringify(evo));
    } catch (e) { console.warn('[Mimo] localStorage save:', e); }
  },

  async saveEvoSupabase(evo) {
    // Try to persist to Supabase student_evolution table if available
    try {
      if (typeof sbFetch !== 'function') return;
      const student = (typeof Auth !== 'undefined') ? Auth.student : null;
      if (!student?.id) return;

      const patch = {
        stage:        evo.stage        || 0,
        class_path:   evo.class_path   || null,
        lineage:      evo.lineage      || null,
        alignment:    evo.alignment    || null,
        element:      evo.element      || null,
        armor:        evo.armor        || null,
        personality:  evo.personality  || null,
      };

      // Upsert via EvoDB if available, else direct
      if (typeof EvoDB !== 'undefined' && typeof EvoDB.saveChoice === 'function') {
        return; // EvoDB handles it field by field
      }

      await sbFetch(`student_evolution?student_id=eq.${student.id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
        prefer: 'return=minimal',
      });
    } catch (e) {
      console.warn('[Mimo] Supabase evo save (non-critical):', e);
    }
  },

  async saveChoice(field, value) {
    const evo = this.getEvo();
    evo[field] = value;
    evo.stage  = this._calcStage(evo);
    this.saveEvoLocal(evo);

    // Mirror to EvoDB/Supabase silently
    try {
      if (typeof EvoDB !== 'undefined' && typeof EvoDB.saveChoice === 'function') {
        const student = (typeof Auth !== 'undefined') ? Auth.student : null;
        if (student?.id) {
          await EvoDB.saveChoice(student.id, field, value);
        }
      } else {
        await this.saveEvoSupabase(evo);
      }
    } catch (e) { console.warn('[Mimo] saveChoice remote (non-critical):', e); }

    return evo;
  },

  _calcStage(evo) {
    const order = ['personality','armor','element','alignment','lineage','class_path'];
    for (let i = 0; i < order.length; i++) {
      if (evo[order[i]]) return order.length - i;
    }
    return 0;
  },

  /* ── XP helpers ────────────────────────────────────────────── */
  getXP() {
    try {
      const s = (typeof Auth !== 'undefined') ? Auth.student : null;
      if (s?.total_xp != null) return s.total_xp;
    } catch {}
    // fallback: read from evo stored XP
    try {
      const r = LS.get('resultMap') || {};
      return Object.values(r).reduce((acc, v) => acc + (v.xp_earned || 0), 0);
    } catch {}
    return 0;
  },

  /* ── Field unlock state ─────────────────────────────────────── */
  getFieldState(evo, field, xp) {
    const threshold = EVO_THRESHOLDS[field];
    const chosen    = evo[field];

    if (chosen)          return { state:'done',      label: chosen };
    if (xp >= threshold) return { state:'available', label: 'Disponível para escolher!' };
    return               { state:'locked',     label: `Precisa de ${threshold} XP` };
  },

  getNextAvailable(evo, xp) {
    for (const field of EVO_FIELD_ORDER) {
      if (!evo[field] && xp >= EVO_THRESHOLDS[field]) return field;
    }
    return null;
  },

  checkNewUnlock(prevXP, newXP, evo) {
    for (const field of EVO_FIELD_ORDER) {
      if (evo[field]) continue;
      const t = EVO_THRESHOLDS[field];
      if (prevXP < t && newXP >= t) return field;
    }
    return null;
  },

  /* ── Image ──────────────────────────────────────────────────── */
  getImgSrc(evo) {
    return MIMO_IMGS[evo?.class_path] || MIMO_IMGS.base;
  },

  applyEvo(evo) {
    const src = this.getImgSrc(evo);
    if (this.$img)    this.$img.src = src;
    if (this.$restImg) this.$restImg.src = src;
    if (this.$wrap)   this.$wrap.setAttribute('data-class', evo.class_path || 'base');
    if (document.getElementById('mp-mimo-img')) {
      document.getElementById('mp-mimo-img').src = src;
    }
  },

  /* ── Mount ──────────────────────────────────────────────────── */
  mount() {
    if (this._mounted) return;
    this._mounted = true;

    /* Companion */
    const wrap = document.createElement('div');
    wrap.id = 'mimo-companion';
    wrap.setAttribute('data-class', 'base');
    wrap.innerHTML = `
      <div id="mimo-bubble-wrap" class="mimo-bubble-wrap" style="display:none">
        <div class="mimo-bubble">
          <button class="mimo-bubble-close" onclick="MimoEvo.hideBubble()" aria-label="Fechar">✕</button>
          <div class="mimo-bubble-meta">
            <span id="mimo-ctx-icon">💡</span>
            <span id="mimo-ctx-label" class="mimo-ctx-label">MIMO</span>
          </div>
          <p id="mimo-bubble-text" class="mimo-bubble-text">Olá!</p>
        </div>
      </div>
      <div id="mimo-avatar-wrap" class="mimo-avatar-wrap"
           onclick="MimoEvo.onAvatarClick()"
           title="Clique para dica ou evolução!">
        <div class="mimo-glow-ring"></div>
        <div id="mimo-burst" class="mimo-burst"></div>
        <img id="mimo-img" class="mimo-img"
             src="${MIMO_IMGS.base}" alt="Mimo" draggable="false"
             onerror="MimoEvo.onImgError(this)">
        <button class="mimo-toggle-btn"
          onclick="event.stopPropagation();MimoEvo.minimise()"
          aria-label="Minimizar">−</button>
      </div>`;
    document.body.appendChild(wrap);

    /* Restore pill */
    const pill = document.createElement('div');
    pill.id = 'mimo-restore-pill';
    pill.className = 'mimo-restore-pill';
    pill.innerHTML = `
      <img class="mimo-restore-img" id="mimo-restore-img" src="${MIMO_IMGS.base}" alt="Mimo">
      <span class="mimo-restore-text">Mimo ✨</span>`;
    pill.addEventListener('click', () => this.restore());
    document.body.appendChild(pill);

    /* Panel */
    this._buildPanel();
    /* Choice modal */
    this._buildChoiceModal();

    /* Cache refs */
    this.$wrap    = document.getElementById('mimo-companion');
    this.$img     = document.getElementById('mimo-img');
    this.$bubbleW = document.getElementById('mimo-bubble-wrap');
    this.$bubbleT = document.getElementById('mimo-bubble-text');
    this.$ctxIcon = document.getElementById('mimo-ctx-icon');
    this.$ctxLbl  = document.getElementById('mimo-ctx-label');
    this.$burst   = document.getElementById('mimo-burst');
    this.$restore = document.getElementById('mimo-restore-pill');
    this.$restImg = document.getElementById('mimo-restore-img');

    /* Apply saved evo */
    this.applyEvo(this.getEvo());
    this._scheduleIdle();
  },

  /* ── Panel build ────────────────────────────────────────────── */
  _buildPanel() {
    const panel = document.createElement('div');
    panel.id = 'mimo-panel-overlay';
    panel.className = 'mimo-panel-overlay';
    panel.innerHTML = `
      <div class="mimo-panel" id="mimo-panel">
        <div class="mp-header">
          <div class="mp-header-left">
            <div class="mp-avatar-ring">
              <img id="mp-mimo-img" src="${MIMO_IMGS.base}" alt="Mimo" class="mp-mimo-img" onerror="this.style.opacity='.3'">
            </div>
            <div>
              <div class="mp-title"  id="mp-evo-name">Mimo — Origem</div>
              <div class="mp-subtitle" id="mp-evo-stage">Estágio 0</div>
            </div>
          </div>
          <button class="mp-close" onclick="MimoEvo.closePanel()">✕</button>
        </div>
        <div class="mp-xp-section">
          <div class="mp-xp-row">
            <span class="mp-xp-label">XP de Evolução</span>
            <span class="mp-xp-val" id="mp-xp-val">0 XP</span>
          </div>
          <div class="mp-xp-track"><div class="mp-xp-fill" id="mp-xp-fill" style="width:0%"></div></div>
          <div class="mp-xp-hint" id="mp-xp-hint">Complete atividades para evoluir!</div>
        </div>
        <div class="mp-tabs">
          <button class="mp-tab active" data-tab="status"    onclick="MimoEvo.switchTab('status')">📊 Status</button>
          <button class="mp-tab"        data-tab="evolucoes" onclick="MimoEvo.switchTab('evolucoes')">🌟 Evoluções</button>
          <button class="mp-tab"        data-tab="proximo"   onclick="MimoEvo.switchTab('proximo')">🔓 Próximo</button>
        </div>
        <div class="mp-tab-content active" id="mp-tab-status">
          <div class="mp-stat-grid" id="mp-stat-grid"></div>
        </div>
        <div class="mp-tab-content" id="mp-tab-evolucoes">
          <div class="mp-evo-tree"  id="mp-evo-tree"></div>
        </div>
        <div class="mp-tab-content" id="mp-tab-proximo">
          <div class="mp-next-stage" id="mp-next-stage"></div>
        </div>
      </div>`;
    panel.addEventListener('click', e => { if (e.target === panel) this.closePanel(); });
    document.body.appendChild(panel);
    this.$panel = panel;
  },

  /* ── Choice modal build ─────────────────────────────────────── */
  _buildChoiceModal() {
    const m = document.createElement('div');
    m.id = 'mimo-choice-overlay';
    m.className = 'mimo-choice-overlay';
    m.innerHTML = `
      <div class="mimo-choice-modal" id="mimo-choice-modal">
        <div class="mcm-header">
          <div class="mcm-title" id="mcm-title">Escolha sua Classe</div>
          <button class="mp-close" onclick="MimoEvo.closeChoiceModal()">✕</button>
        </div>
        <div class="mcm-subtitle" id="mcm-subtitle"></div>
        <div class="mcm-options" id="mcm-options"></div>
      </div>`;
    m.addEventListener('click', e => { if (e.target === m) this.closeChoiceModal(); });
    document.body.appendChild(m);
    this.$choiceModal = m;
  },

  /* ── Bubble ─────────────────────────────────────────────────── */
  showMsg(text, icon='💡', label='MIMO', duration=5500) {
    if (this._minimised || !this.$bubbleW) return;
    clearTimeout(this._hideTimer);
    this.$bubbleT.innerHTML      = text;
    this.$ctxIcon.textContent    = icon;
    this.$ctxLbl.textContent     = label;
    this.$bubbleW.style.display  = '';
    this.$bubbleW.classList.remove('hiding');
    void this.$bubbleW.offsetWidth;
    if (duration > 0) this._hideTimer = setTimeout(() => this.hideBubble(), duration);
  },

  hideBubble() {
    if (!this.$bubbleW) return;
    clearTimeout(this._hideTimer);
    this.$bubbleW.classList.add('hiding');
    setTimeout(() => {
      if (this.$bubbleW) { this.$bubbleW.style.display='none'; this.$bubbleW.classList.remove('hiding'); }
    }, 260);
  },

  tip(ctx) {
    const bank = MIMO_TIPS[ctx] || MIMO_TIPS.idle;
    const msg  = bank[Math.floor(Math.random() * bank.length)];
    const meta = { math:{icon:'🔢',label:'DICA DE CÁLCULO'}, reading:{icon:'📖',label:'DICA DE LEITURA'},
      wrong:{icon:'💜',label:'NÃO DESISTE!'}, correct:{icon:'⭐',label:'ARRASOU!'},
      start:{icon:'🚀',label:'COMEÇO!'}, finish:{icon:'🎯',label:'QUASE LÁ!'},
      incomplete:{icon:'⚠️',label:'ATENÇÃO!'}, idle:{icon:'💡',label:'MIMO'},
      welcome:{icon:'👋',label:'OLÁ!'}, evolution_ready:{icon:'🌟',label:'EVOLUÇÃO!'} }[ctx] || {icon:'💡',label:'MIMO'};
    this.showMsg(msg, meta.icon, meta.label);
  },

  /* ── Avatar click ───────────────────────────────────────────── */
  onAvatarClick() {
    const evo  = this.getEvo();
    const xp   = this.getXP();
    const next = this.getNextAvailable(evo, xp);
    if (next) {
      this.openPanel('evolucoes');
    } else {
      this.tip('idle');
    }
  },

  /* ── Animations ─────────────────────────────────────────────── */
  celebrate() {
    const av = document.getElementById('mimo-avatar-wrap');
    if (!av) return;
    av.classList.remove('mimo-happy','mimo-worried');
    void av.offsetWidth;
    av.classList.add('mimo-happy');
    setTimeout(() => av.classList.remove('mimo-happy'), 1100);
    if (this.$burst) {
      this.$burst.classList.remove('mimo-burst-active');
      void this.$burst.offsetWidth;
      this.$burst.classList.add('mimo-burst-active');
      setTimeout(() => this.$burst?.classList.remove('mimo-burst-active'), 750);
    }
  },
  worry() {
    const av = document.getElementById('mimo-avatar-wrap');
    if (!av) return;
    av.classList.remove('mimo-happy','mimo-worried');
    void av.offsetWidth;
    av.classList.add('mimo-worried');
    setTimeout(() => av.classList.remove('mimo-worried'), 900);
  },

  /* ── Minimise / restore ─────────────────────────────────────── */
  minimise() {
    this._minimised = true;
    this.hideBubble();
    if (this.$wrap)    this.$wrap.style.display = 'none';
    if (this.$restore) this.$restore.classList.add('visible');
    clearTimeout(this._idleTimer);
  },
  restore() {
    this._minimised = false;
    if (this.$wrap)    this.$wrap.style.display = '';
    if (this.$restore) this.$restore.classList.remove('visible');
    this._scheduleIdle();
    setTimeout(() => this.tip('welcome'), 400);
  },

  /* ── Idle ───────────────────────────────────────────────────── */
  _scheduleIdle() {
    clearTimeout(this._idleTimer);
    this._idleTimer = setTimeout(() => {
      if (!this._minimised && !this._panelOpen && !this._choiceModalOpen) {
        const evo = this.getEvo(), xp = this.getXP();
        if (this.getNextAvailable(evo, xp)) this.tip('evolution_ready');
        else this.tip('idle');
      }
      this._scheduleIdle();
    }, 40000 + Math.random() * 20000);
  },

  setActivityOpen(v) { document.body.classList.toggle('activity-open', v); },

  onImgError(el) {
    el.style.display = 'none';
    if (!el.parentElement.querySelector('.mimo-fallback')) {
      const fb = document.createElement('div');
      fb.className = 'mimo-fallback';
      fb.innerHTML = '<span>MIMO</span>';
      el.parentElement.appendChild(fb);
    }
  },

  /* ═══════════════════════════════════════════════════════════
     EVOLUTION PANEL
     ═══════════════════════════════════════════════════════════ */
  openPanel(tab='status') {
    if (!this.$panel) return;
    this._panelOpen = true;
    this.switchTab(tab);
    this._refreshPanel();
    this.$panel.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  closePanel() {
    if (!this.$panel) return;
    this._panelOpen = false;
    this.$panel.classList.remove('open');
    document.body.style.overflow = '';
  },

  switchTab(tab) {
    this._activeTab = tab;
    document.querySelectorAll('.mp-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    document.querySelectorAll('.mp-tab-content').forEach(t => t.classList.toggle('active', t.id === 'mp-tab-' + tab));
    this._refreshPanel();
  },

  _refreshPanel() {
    const evo = this.getEvo();
    const xp  = this.getXP();

    /* Header */
    const mimoName = this._getMimoName(evo);
    const imgEl = document.getElementById('mp-mimo-img');
    if (imgEl) imgEl.src = this.getImgSrc(evo);
    const nameEl = document.getElementById('mp-evo-name');
    if (nameEl) nameEl.textContent = mimoName.name;
    const stageEl = document.getElementById('mp-evo-stage');
    if (stageEl) stageEl.textContent = `Estágio ${mimoName.stage}`;

    /* XP bar — from current field to next */
    const nextField   = EVO_FIELD_ORDER.find(f => !evo[f]);
    const nextThresh  = nextField ? EVO_THRESHOLDS[nextField] : EVO_THRESHOLDS.final;
    const idx         = nextField ? EVO_FIELD_ORDER.indexOf(nextField) : EVO_FIELD_ORDER.length;
    const prevThresh  = idx > 0 ? EVO_THRESHOLDS[EVO_FIELD_ORDER[idx - 1]] : 0;
    const segSize     = nextThresh - prevThresh;
    const done        = Math.max(0, xp - prevThresh);
    const pct         = Math.min(100, Math.round(done / segSize * 100));

    const fillEl = document.getElementById('mp-xp-fill');
    if (fillEl) fillEl.style.width = pct + '%';
    const valEl = document.getElementById('mp-xp-val');
    if (valEl) valEl.textContent = xp + ' XP';
    const hintEl = document.getElementById('mp-xp-hint');
    if (hintEl) {
      if (!nextField) {
        hintEl.textContent = '✦ Mimo completo! Parabéns!';
      } else if (xp >= nextThresh) {
        hintEl.textContent = `🌟 ${EVO_FIELD_LABELS[nextField]} disponível! Clique em "Evoluções"`;
      } else {
        hintEl.textContent = `Faltam ${nextThresh - xp} XP para ${EVO_FIELD_LABELS[nextField]}`;
      }
    }

    if (this._activeTab === 'status')    this._renderStatus(evo, xp);
    if (this._activeTab === 'evolucoes') this._renderEvoTree(evo, xp);
    if (this._activeTab === 'proximo')   this._renderNext(evo, xp);
  },

  _renderStatus(evo, xp) {
    const el = document.getElementById('mp-stat-grid');
    if (!el) return;
    let rank = '🌿 Aprendiz';
    try { const r = Gamification.getGlobalRank(xp); rank = r.icon + ' ' + r.label; } catch {}
    const classMap = { mamifero:'🦁 Mamífero', reptil:'🦎 Réptil', ave:'🦅 Ave' };
    const fields = [
      { icon:'⚡', val: xp,            lbl:'XP Total' },
      { icon:'🏆', val: rank,           lbl:'Rank', small:true },
      { icon:'💎', val: evo.stage||0,   lbl:'Estágio' },
      { icon:'🐾', val: evo.class_path  ? classMap[evo.class_path]  || evo.class_path  : '—', lbl:'Classe',       small:true },
      { icon:'🧬', val: evo.lineage     || '—',  lbl:'Linhagem',     small:true },
      { icon:'🌙', val: evo.alignment   || '—',  lbl:'Alinhamento',  small:true },
      { icon:'⚡', val: evo.element     || '—',  lbl:'Elemento',     small:true },
      { icon:'🛡️', val: evo.armor       || '—',  lbl:'Armadura',     small:true },
      { icon:'❤️', val: evo.personality || '—',  lbl:'Personalidade',small:true },
    ];
    el.innerHTML = fields.map(f =>
      `<div class="mp-stat-card">
        <div class="mp-stat-icon">${f.icon}</div>
        <div class="mp-stat-val" style="${f.small?'font-size:10px':''}">${f.val}</div>
        <div class="mp-stat-lbl">${f.lbl}</div>
      </div>`
    ).join('');
  },

  _renderEvoTree(evo, xp) {
    const el = document.getElementById('mp-evo-tree');
    if (!el) return;
    let html = '';
    EVO_FIELD_ORDER.forEach((field, idx) => {
      const threshold = EVO_THRESHOLDS[field];
      const { state, label } = this.getFieldState(evo, field, xp);

      const icons   = { done:'✓', available:'🔓', locked:'🔒' };
      const classes = { done:'evo-node done', available:'evo-node unlocked', locked:'evo-node locked' };
      const btnHtml = state === 'available'
        ? `<button class="evo-node-btn" onclick="MimoEvo.closePanel();MimoEvo.openChoiceModal('${field}')">Escolher →</button>`
        : '';

      html += `
        <div class="${classes[state]}">
          <div class="evo-node-icon">${icons[state]}</div>
          <div class="evo-node-info">
            <div class="evo-node-name">${EVO_FIELD_LABELS[field]}</div>
            <div class="evo-node-detail">${state==='done' ? 'Escolhido: ' + label : label}</div>
          </div>
          ${btnHtml}
        </div>`;
      if (idx < EVO_FIELD_ORDER.length - 1) {
        html += `<div class="evo-connector ${state==='done'?'done':''}">▼</div>`;
      }
    });
    el.innerHTML = html;
  },

  _renderNext(evo, xp) {
    const el = document.getElementById('mp-next-stage');
    if (!el) return;
    const nextField = EVO_FIELD_ORDER.find(f => !evo[f]);
    if (!nextField) {
      el.innerHTML = `<div class="mp-next-complete">
        <div style="font-size:48px;margin-bottom:12px">👑</div>
        <div class="mp-next-title">Mimo Completo!</div>
        <p>Você completou toda a árvore evolutiva. Parabéns, Mestra!</p>
      </div>`;
      return;
    }
    const threshold = EVO_THRESHOLDS[nextField];
    const idx       = EVO_FIELD_ORDER.indexOf(nextField);
    const prevT     = idx > 0 ? EVO_THRESHOLDS[EVO_FIELD_ORDER[idx-1]] : 0;
    const segSize   = threshold - prevT;
    const done      = Math.max(0, xp - prevT);
    const pct       = Math.min(100, Math.round(done / segSize * 100));
    const ready     = xp >= threshold;

    el.innerHTML = `<div class="mp-next-card">
      <div class="mp-next-icon">${ready?'🌟':'🔒'}</div>
      <div class="mp-next-title">${EVO_FIELD_LABELS[nextField]}</div>
      <p class="mp-next-desc">${ready
        ? '✨ Desbloqueado! Clique abaixo e faça sua escolha!'
        : `Faltam <strong>${threshold-xp} XP</strong> para desbloquear este estágio.`}</p>
      <div class="mp-next-bar-track">
        <div class="mp-next-bar-fill ${ready?'full':''}" style="width:${pct}%"></div>
      </div>
      <div class="mp-next-pct">${pct}% completo — ${xp}/${threshold} XP</div>
      ${ready
        ? `<button class="mp-go-btn" onclick="MimoEvo.closePanel();MimoEvo.openChoiceModal('${nextField}')">✦ Fazer Escolha Agora ✦</button>`
        : `<div class="mp-tip-box">💡 Complete mais atividades para ganhar XP e desbloquear este estágio!</div>`}
    </div>`;
  },

  _getMimoName(evo) {
    const classNames = { mamifero:'Mamífero', reptil:'Réptil', ave:'Ave' };
    if (evo.personality) return { name:`Mimo — ${evo.personality}`, stage:6 };
    if (evo.armor)       return { name:`Mimo — ${evo.armor}`,       stage:5 };
    if (evo.element)     return { name:`Mimo — ${evo.element}`,     stage:4 };
    if (evo.alignment)   return { name:`Mimo — ${evo.alignment}`,   stage:3 };
    if (evo.lineage)     return { name:`Mimo — ${evo.lineage}`,     stage:2 };
    if (evo.class_path)  return { name:`Mimo — ${classNames[evo.class_path]||evo.class_path}`, stage:1 };
    return { name:'Mimo — Origem', stage:0 };
  },

  /* ═══════════════════════════════════════════════════════════
     CHOICE MODAL
     ═══════════════════════════════════════════════════════════ */
  openChoiceModal(field) {
    if (!this.$choiceModal) return;
    const evo = this.getEvo();
    const xp  = this.getXP();
    if (xp < EVO_THRESHOLDS[field]) {
      this.showMsg(`Ainda precisa de ${EVO_THRESHOLDS[field]} XP para escolher ${EVO_FIELD_LABELS[field]}!`, '🔒', 'BLOQUEADO');
      return;
    }

    this._choiceModalOpen = true;
    const titleEl    = document.getElementById('mcm-title');
    const subtitleEl = document.getElementById('mcm-subtitle');
    const optionsEl  = document.getElementById('mcm-options');

    titleEl.textContent    = `Escolha: ${EVO_FIELD_LABELS[field]}`;
    subtitleEl.textContent = 'Esta escolha define o destino do seu Mimo!';

    // Get options
    let opts;
    if (field === 'lineage') {
      const cls = evo.class_path || 'mamifero';
      opts = EVO_OPTIONS.lineage[cls] || EVO_OPTIONS.lineage.mamifero;
    } else {
      opts = EVO_OPTIONS[field] || [];
    }

    optionsEl.innerHTML = opts.map(opt => `
      <div class="mcm-option" onclick="MimoEvo.confirmChoice('${field}','${opt.id}','${(opt.subname||opt.name).replace(/'/g,"\\'")}','${opt.emoji}')">
        <div class="mcm-opt-emoji">${opt.emoji}</div>
        <div class="mcm-opt-info">
          <div class="mcm-opt-name">${opt.name}${opt.subname ? ' — ' + opt.subname : ''}</div>
          <div class="mcm-opt-desc">${opt.desc}</div>
        </div>
        <div class="mcm-opt-arrow">›</div>
      </div>`).join('');

    this.$choiceModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  closeChoiceModal() {
    if (!this.$choiceModal) return;
    this._choiceModalOpen = false;
    this.$choiceModal.classList.remove('open');
    document.body.style.overflow = '';
  },

  async confirmChoice(field, value, name, emoji) {
    this.closeChoiceModal();

    try {
      const evo = await this.saveChoice(field, value);
      this.applyEvo(evo);

      // Visual feedback
      this.celebrate();
      setTimeout(() => {
        this.showMsg(
          `${emoji} <strong>${name}</strong> escolhido! Seu Mimo está evoluindo! 💜`,
          emoji, 'EVOLUINDO!', 6000
        );
      }, 300);

      // Refresh panel if open
      if (this._panelOpen) this._refreshPanel();

      // Update evolution page avatar if present
      const evoHeaderImg = document.getElementById('evo-header-img');
      if (evoHeaderImg) evoHeaderImg.src = this.getImgSrc(evo);

    } catch (e) {
      console.warn('[Mimo] confirmChoice error (non-critical):', e);
      this.showMsg('Algo deu errado, mas não se preocupa! Tenta de novo. 💜', '⚠️', 'OPS!');
    }
  },

  /* ── XP trigger (called from app.js after activity) ────────── */
  onXPGained(prevXP, newXP) {
    try {
      const evo = this.getEvo();
      const unlocked = this.checkNewUnlock(prevXP, newXP, evo);
      if (unlocked) {
        setTimeout(() => {
          this.celebrate();
          setTimeout(() => this.tip('evolution_ready'), 700);
        }, 500);
      }
      if (this._panelOpen) this._refreshPanel();
    } catch (e) { console.warn('[Mimo] onXPGained (non-critical):', e); }
  },
};

/* ── Window-level API ─────────────────────────────────────────── */
window.MimoEvo = MimoEvo;
function showMimoMessage(t,i,l,d) { try{MimoEvo.showMsg(t,i,l,d);}catch{} }
function getMimoTip(ctx)          { try{MimoEvo.tip(ctx);}catch{} }
function minimizeMimo()           { try{MimoEvo.minimise();}catch{} }
function restoreMimo()            { try{MimoEvo.restore();}catch{} }
function updateMimoForm(d)        { try{MimoEvo.applyEvo(d||{});}catch{} }
