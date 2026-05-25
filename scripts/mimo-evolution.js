// ═══════════════════════════════════════════════════════════════════
// Academia das Questões V3.7 — Mimo Evolution System
// Corrige todos os bugs da V3.6 e implementa sistema evolutivo completo
// ═══════════════════════════════════════════════════════════════════

/* ── XP thresholds que desbloqueiam escolhas ── */
const EVO_XP_THRESHOLDS = {
  class_path:  100,
  lineage:     300,
  alignment:   600,
  element:     900,
  armor:       1300,
  personality: 1800,
  final:       2500,
};

const EVO_FIELD_ORDER = ['class_path','lineage','alignment','element','armor','personality'];

const EVO_FIELD_NAMES = {
  class_path:  'Classe Evolutiva',
  lineage:     'Linhagem',
  alignment:   'Alinhamento',
  element:     'Elemento',
  armor:       'Armadura',
  personality: 'Personalidade',
  final:       'Evolução Final',
};

/* ── localStorage key ── */
const LS_EVO_KEY   = 'academia_mimo_evo';
const LS_XP_KEY    = 'academia_mimo_xp';
const LS_PANEL_KEY = 'academia_mimo_panel_seen';

/* ── Asset map ── */
const MIMO_IMGS = {
  base:    '/assets/mascots/mimo-base.webp',
  mamifero:'/assets/mascots/mimo-mammal.webp',
  reptil:  '/assets/mascots/mimo-reptile.webp',
  ave:     '/assets/mascots/mimo-bird.webp',
};

/* ── Context tips bank ── */
const MIMO_TIPS = {
  math: [
    'Observe os números com <em>calma!</em> Respira fundo.',
    'Tente resolver a conta <em>em partes</em> menores!',
    'Lembra das frações: numerador é a <strong>parte</strong>, denominador é o <em>todo</em>!',
    'Na sequência, procura o <em>padrão</em>: soma, subtrai ou multiplica?',
  ],
  reading: [
    'Releia a questão com <em>atenção total!</em>',
    'Procura a <em>palavra mais importante</em> da pergunta!',
    'As <strong>emoções</strong> do personagem são uma pista enorme!',
    'O que está <em>nas entrelinhas?</em> Lê com cuidado!',
  ],
  wrong: [
    'Não desiste! <em>Vamos tentar juntos!</em> 💜',
    'Cada erro é um <strong>aprendizado!</strong> Você consegue!',
    'Respira e <em>tenta de novo.</em> Eu acredito em você!',
    'Hmm... talvez a <em>outra opção</em> faça mais sentido?',
  ],
  correct: [
    '<strong>Incrível!</strong> Você está evoluindo! ⭐',
    'Isso aí! <em>Você é demais!</em> Mais XP para mim!',
    '<strong>Perfeito!</strong> Seu conhecimento brilhou! 🌟',
    'Você mandou ver! <em>Sigo orgulhosa de você!</em> 💜',
  ],
  start: [
    'Leia cada questão com <em>atenção!</em> As pistas estão no texto!',
    '<em>Respira fundo</em> e começa pela mais fácil. Você consegue!',
    'Essa atividade vai me dar <strong>XP para evoluir!</strong> Vamos lá! ⚡',
  ],
  finish: [
    '<em>Revisa suas respostas</em> antes de concluir! Uma olhada extra ajuda!',
    'Confere se <em>todas as questões</em> estão respondidas, tá?',
    'Dá uma última olhada. <strong>Você é detalhista!</strong> Isso faz diferença! ✅',
  ],
  incomplete: [
    'Psiu! Ainda tem <em>questões em branco!</em> Confere antes de enviar!',
    'Vi que tem questões abertas. <em>Revisa tudo!</em> Você consegue!',
    '<strong>Espera!</strong> Rola a tela e responde tudo, tá? 👀',
  ],
  idle: [
    'Clica em mim para uma <em>dica!</em> Estou sempre aqui! 💜',
    'Psiu! <em>Já fez suas atividades</em> hoje? Vamos evoluir juntas!',
    'Cada atividade me faz <strong>evoluir</strong> um pouco mais!',
    'Estou <em>te acompanhando</em> em toda a jornada! 🌟',
  ],
  welcome: [
    'Bem-vinda de volta! <em>Saudades de você!</em> 💜',
    'Olha quem voltou! <em>Pronta para aprender</em> mais hoje? ⭐',
    'A Academia te aguardava! <em>Vamos continuar nossa jornada!</em>',
  ],
  evolution_ready: [
    '⭐ <strong>Posso evoluir!</strong> Vai na Árvore Evolutiva para fazer sua escolha!',
    '🌟 Juntamos XP suficiente! <em>É hora de evoluir!</em> Clica em mim!',
    '✨ <strong>Nova forma desbloqueada!</strong> Faça sua escolha evolutiva!',
  ],
};

/* ─────────────────────────────────────────────────────────────────
   MimoEvo — core object
   ───────────────────────────────────────────────────────────────── */
const MimoEvo = {
  /* State */
  _mounted:        false,
  _minimised:      false,
  _panelOpen:      false,
  _currentMsg:     null,
  _hideTimer:      null,
  _idleTimer:      null,
  _activeTab:      'status',
  _pendingUnlock:  null,   // field that just unlocked, waiting for user choice

  /* DOM refs */
  $wrap:     null,
  $img:      null,
  $bubble:   null,
  $bubbleT:  null,
  $glowRing: null,
  $burst:    null,
  $restore:  null,
  $panel:    null,

  /* ── Persist helpers ───────────────────────────────────────── */
  getEvo() {
    try {
      return JSON.parse(localStorage.getItem(LS_EVO_KEY)) || {
        stage: 0, class_path: null, lineage: null,
        alignment: null, element: null, armor: null,
        personality: null, xp: 0,
      };
    } catch { return { stage:0, xp:0 }; }
  },
  saveEvo(evo) {
    try { localStorage.setItem(LS_EVO_KEY, JSON.stringify(evo)); } catch {}
  },

  /* ── Current XP (from student object OR local fallback) ────── */
  getXP() {
    try {
      const student = typeof Auth !== 'undefined' ? Auth.student : null;
      return (student?.total_xp) || (this.getEvo().xp) || 0;
    } catch { return this.getEvo().xp || 0; }
  },

  /* ── Which field is next to unlock ─────────────────────────── */
  getNextUnlock(evo) {
    const xp = this.getXP();
    for (const field of EVO_FIELD_ORDER) {
      if (!evo[field]) {
        const needed = EVO_XP_THRESHOLDS[field];
        return { field, needed, current: xp, remaining: Math.max(0, needed - xp) };
      }
    }
    return null; // all unlocked
  },

  /* ── Check if any field just became unlockable ─────────────── */
  checkUnlocks(prevXP, newXP) {
    const evo = this.getEvo();
    for (const field of EVO_FIELD_ORDER) {
      if (evo[field]) continue; // already chosen
      const threshold = EVO_XP_THRESHOLDS[field];
      if (prevXP < threshold && newXP >= threshold) {
        return field; // this field just unlocked
      }
    }
    return null;
  },

  /* ── Which image to show ───────────────────────────────────── */
  getImgSrc(evo) {
    const cls = evo?.class_path;
    return MIMO_IMGS[cls] || MIMO_IMGS.base;
  },

  /* ── Mount everything into DOM ─────────────────────────────── */
  mount() {
    if (this._mounted) return;
    this._mounted = true;

    /* --- companion layer --- */
    const wrap = document.createElement('div');
    wrap.id = 'mimo-companion';
    wrap.setAttribute('data-class', 'base');
    wrap.innerHTML = `
      <!-- Bubble -->
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
      <!-- Avatar -->
      <div id="mimo-avatar-wrap" class="mimo-avatar-wrap"
           onclick="MimoEvo.onAvatarClick()"
           title="Clique para dica!">
        <div id="mimo-glow"  class="mimo-glow-ring"></div>
        <div id="mimo-burst" class="mimo-burst"></div>
        <img id="mimo-img" class="mimo-img"
             src="${MIMO_IMGS.base}"
             alt="Mimo"
             draggable="false"
             onerror="MimoEvo.onImgError(this)">
        <button class="mimo-toggle-btn"
          onclick="event.stopPropagation();MimoEvo.minimise()"
          aria-label="Minimizar">−</button>
      </div>`;
    document.body.appendChild(wrap);

    /* --- restore pill --- */
    const pill = document.createElement('div');
    pill.id = 'mimo-restore-pill';
    pill.className = 'mimo-restore-pill';
    pill.innerHTML = `
      <img class="mimo-restore-img" id="mimo-restore-img"
           src="${MIMO_IMGS.base}" alt="Mimo">
      <span class="mimo-restore-text">Mimo ✨</span>`;
    pill.addEventListener('click', () => MimoEvo.restore());
    document.body.appendChild(pill);

    /* --- evolution panel --- */
    this._buildPanel();

    /* Cache refs */
    this.$wrap     = document.getElementById('mimo-companion');
    this.$img      = document.getElementById('mimo-img');
    this.$bubbleW  = document.getElementById('mimo-bubble-wrap');
    this.$bubbleT  = document.getElementById('mimo-bubble-text');
    this.$ctxIcon  = document.getElementById('mimo-ctx-icon');
    this.$ctxLabel = document.getElementById('mimo-ctx-label');
    this.$burst    = document.getElementById('mimo-burst');
    this.$restore  = document.getElementById('mimo-restore-pill');
    this.$restImg  = document.getElementById('mimo-restore-img');

    /* Apply saved evo */
    this.applyEvo(this.getEvo());
    this._scheduleIdle();
  },

  /* ── Build the evolution panel DOM ─────────────────────────── */
  _buildPanel() {
    const panel = document.createElement('div');
    panel.id = 'mimo-panel-overlay';
    panel.className = 'mimo-panel-overlay';
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('role', 'dialog');
    panel.innerHTML = `
      <div class="mimo-panel" id="mimo-panel">
        <!-- Header -->
        <div class="mp-header">
          <div class="mp-header-left">
            <div class="mp-avatar-ring">
              <img id="mp-mimo-img" src="${MIMO_IMGS.base}" alt="Mimo" class="mp-mimo-img"
                   onerror="this.style.opacity='0.4'">
            </div>
            <div>
              <div class="mp-title" id="mp-evo-name">Mimo — Origem</div>
              <div class="mp-subtitle" id="mp-evo-stage">Estágio 0</div>
            </div>
          </div>
          <button class="mp-close" onclick="MimoEvo.closePanel()" aria-label="Fechar">✕</button>
        </div>

        <!-- XP bar -->
        <div class="mp-xp-section">
          <div class="mp-xp-row">
            <span class="mp-xp-label">XP de Evolução</span>
            <span class="mp-xp-val" id="mp-xp-val">0 XP</span>
          </div>
          <div class="mp-xp-track">
            <div class="mp-xp-fill" id="mp-xp-fill" style="width:0%"></div>
          </div>
          <div class="mp-xp-hint" id="mp-xp-hint">Complete atividades para evoluir!</div>
        </div>

        <!-- Tabs -->
        <div class="mp-tabs" role="tablist">
          <button class="mp-tab active" data-tab="status"   onclick="MimoEvo.switchTab('status')"   role="tab">📊 Status</button>
          <button class="mp-tab"        data-tab="evolucoes" onclick="MimoEvo.switchTab('evolucoes')" role="tab">🌟 Evoluções</button>
          <button class="mp-tab"        data-tab="proximo"  onclick="MimoEvo.switchTab('proximo')"  role="tab">🔓 Próximo</button>
        </div>

        <!-- Tab: Status -->
        <div class="mp-tab-content active" id="mp-tab-status">
          <div class="mp-stat-grid" id="mp-stat-grid">
            <!-- injected -->
          </div>
        </div>

        <!-- Tab: Evoluções -->
        <div class="mp-tab-content" id="mp-tab-evolucoes">
          <div class="mp-evo-tree" id="mp-evo-tree">
            <!-- injected -->
          </div>
        </div>

        <!-- Tab: Próximo -->
        <div class="mp-tab-content" id="mp-tab-proximo">
          <div class="mp-next-stage" id="mp-next-stage">
            <!-- injected -->
          </div>
        </div>
      </div>`;
    document.body.appendChild(panel);

    /* Close on backdrop click */
    panel.addEventListener('click', e => {
      if (e.target === panel) MimoEvo.closePanel();
    });

    this.$panel = panel;
  },

  /* ── Apply evolution data to companion ─────────────────────── */
  applyEvo(evo) {
    const src = this.getImgSrc(evo);
    if (this.$img)    { this.$img.src = src; }
    if (this.$restImg){ this.$restImg.src = src; }
    if (this.$wrap)   { this.$wrap.setAttribute('data-class', evo.class_path || 'base'); }
  },

  /* ── Image error fallback ───────────────────────────────────── */
  onImgError(el) {
    el.style.display = 'none';
    const parent = el.parentElement;
    if (!parent.querySelector('.mimo-fallback')) {
      const fb = document.createElement('div');
      fb.className = 'mimo-fallback';
      fb.innerHTML = '<span>MIMO</span>';
      parent.appendChild(fb);
    }
  },

  /* ── Show bubble message ────────────────────────────────────── */
  showMsg(text, icon = '💡', label = 'MIMO', duration = 5500) {
    if (this._minimised || !this.$bubbleW) return;
    clearTimeout(this._hideTimer);

    this.$bubbleT.innerHTML  = text;
    this.$ctxIcon.textContent  = icon;
    this.$ctxLabel.textContent = label;

    this.$bubbleW.style.display = '';
    this.$bubbleW.classList.remove('hiding');
    void this.$bubbleW.offsetWidth; // reflow

    if (duration > 0) {
      this._hideTimer = setTimeout(() => this.hideBubble(), duration);
    }
  },

  hideBubble() {
    if (!this.$bubbleW) return;
    clearTimeout(this._hideTimer);
    this.$bubbleW.classList.add('hiding');
    setTimeout(() => {
      if (this.$bubbleW) {
        this.$bubbleW.style.display = 'none';
        this.$bubbleW.classList.remove('hiding');
      }
    }, 260);
  },

  /* ── Random tip from bank ───────────────────────────────────── */
  tip(ctx) {
    const bank = MIMO_TIPS[ctx] || MIMO_TIPS.idle;
    const msg  = bank[Math.floor(Math.random() * bank.length)];
    const meta = {
      math:              { icon:'🔢', label:'DICA DE CÁLCULO' },
      reading:           { icon:'📖', label:'DICA DE LEITURA' },
      wrong:             { icon:'💜', label:'NÃO DESISTE!' },
      correct:           { icon:'⭐', label:'ARRASOU!' },
      start:             { icon:'🚀', label:'COMEÇO!' },
      finish:            { icon:'🎯', label:'QUASE LÁ!' },
      incomplete:        { icon:'⚠️', label:'ATENÇÃO!' },
      idle:              { icon:'💡', label:'MIMO' },
      welcome:           { icon:'👋', label:'OLÁ!' },
      evolution_ready:   { icon:'🌟', label:'EVOLUÇÃO!' },
    }[ctx] || { icon:'💡', label:'MIMO' };
    this.showMsg(msg, meta.icon, meta.label);
  },

  /* ── Avatar click ───────────────────────────────────────────── */
  onAvatarClick() {
    // If evolution available → open panel on evoluções tab
    const evo = this.getEvo();
    const xp  = this.getXP();
    const next = this.getNextUnlock(evo);
    if (next && xp >= next.needed && !evo[next.field]) {
      this.openPanel('evolucoes');
    } else {
      this.tip('idle');
    }
  },

  /* ── Celebrate animation ────────────────────────────────────── */
  celebrate() {
    const av = document.getElementById('mimo-avatar-wrap');
    if (!av) return;
    av.classList.remove('mimo-happy', 'mimo-worried');
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
    av.classList.remove('mimo-happy', 'mimo-worried');
    void av.offsetWidth;
    av.classList.add('mimo-worried');
    setTimeout(() => av.classList.remove('mimo-worried'), 900);
  },

  /* ── Minimise / restore ─────────────────────────────────────── */
  minimise() {
    this._minimised = true;
    this.hideBubble();
    if (this.$wrap)    this.$wrap.style.display    = 'none';
    if (this.$restore) this.$restore.classList.add('visible');
    clearTimeout(this._idleTimer);
  },

  restore() {
    this._minimised = false;
    if (this.$wrap)    this.$wrap.style.display    = '';
    if (this.$restore) this.$restore.classList.remove('visible');
    this._scheduleIdle();
    setTimeout(() => this.tip('welcome'), 400);
  },

  /* ── Idle cycle ─────────────────────────────────────────────── */
  _scheduleIdle() {
    clearTimeout(this._idleTimer);
    this._idleTimer = setTimeout(() => {
      if (!this._minimised && !this._panelOpen) {
        // check if evolution is ready
        const evo = this.getEvo();
        const xp  = this.getXP();
        const next = this.getNextUnlock(evo);
        if (next && xp >= next.needed) {
          this.tip('evolution_ready');
        } else {
          this.tip('idle');
        }
      }
      this._scheduleIdle();
    }, 38000 + Math.random() * 20000);
  },

  /* ── Body class helpers ─────────────────────────────────────── */
  setActivityOpen(v) { document.body.classList.toggle('activity-open', v); },

  /* ══════════════════════════════════════════════════════════════
     EVOLUTION PANEL
     ══════════════════════════════════════════════════════════════ */
  openPanel(tab = 'status') {
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
    document.querySelectorAll('.mp-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tab);
    });
    document.querySelectorAll('.mp-tab-content').forEach(t => {
      t.classList.toggle('active', t.id === 'mp-tab-' + tab);
    });
    this._refreshPanel();
  },

  _refreshPanel() {
    const evo = this.getEvo();
    const xp  = this.getXP();
    const next = this.getNextUnlock(evo);

    /* Header */
    const mimoDesc = this._getMimoName(evo);
    const mpImg = document.getElementById('mp-mimo-img');
    if (mpImg) mpImg.src = this.getImgSrc(evo);
    const nameEl = document.getElementById('mp-evo-name');
    if (nameEl) nameEl.textContent = mimoDesc.name;
    const stageEl = document.getElementById('mp-evo-stage');
    if (stageEl) stageEl.textContent = `Estágio ${mimoDesc.stage}`;

    /* XP bar */
    const threshold = next ? next.needed : EVO_XP_THRESHOLDS.final;
    const prevThresh = next ? (EVO_XP_THRESHOLDS[EVO_FIELD_ORDER[EVO_FIELD_ORDER.indexOf(next.field)-1]] || 0) : 0;
    const segXP   = threshold - prevThresh;
    const doneXP  = Math.min(xp - prevThresh, segXP);
    const pct     = Math.max(0, Math.min(100, Math.round(doneXP / segXP * 100)));

    const fillEl = document.getElementById('mp-xp-fill');
    if (fillEl) fillEl.style.width = pct + '%';
    const valEl  = document.getElementById('mp-xp-val');
    if (valEl)  valEl.textContent  = xp + ' XP';
    const hintEl = document.getElementById('mp-xp-hint');
    if (hintEl) hintEl.textContent = next
      ? `Faltam ${next.remaining} XP para desbloquear ${EVO_FIELD_NAMES[next.field]}`
      : '✦ Você alcançou o máximo! Mimo está completo!';

    if (this._activeTab === 'status')    this._renderStatus(evo, xp, next);
    if (this._activeTab === 'evolucoes') this._renderEvoTree(evo, xp);
    if (this._activeTab === 'proximo')   this._renderNext(evo, xp, next);
  },

  _renderStatus(evo, xp, next) {
    const el = document.getElementById('mp-stat-grid');
    if (!el) return;
    const rank = typeof Gamification !== 'undefined'
      ? Gamification.getGlobalRank(xp).icon + ' ' + Gamification.getGlobalRank(xp).label
      : '🌿 Aprendiz';
    const classMap = { mamifero:'🦁 Mamífero', reptil:'🦎 Réptil', ave:'🦅 Ave' };
    el.innerHTML = `
      <div class="mp-stat-card">
        <div class="mp-stat-icon">⚡</div>
        <div class="mp-stat-val">${xp}</div>
        <div class="mp-stat-lbl">XP Total</div>
      </div>
      <div class="mp-stat-card">
        <div class="mp-stat-icon">🏆</div>
        <div class="mp-stat-val" style="font-size:11px">${rank}</div>
        <div class="mp-stat-lbl">Rank</div>
      </div>
      <div class="mp-stat-card">
        <div class="mp-stat-icon">💎</div>
        <div class="mp-stat-val">${evo.stage || 0}</div>
        <div class="mp-stat-lbl">Estágio</div>
      </div>
      <div class="mp-stat-card">
        <div class="mp-stat-icon">🐾</div>
        <div class="mp-stat-val" style="font-size:11px">${evo.class_path ? classMap[evo.class_path] : '—'}</div>
        <div class="mp-stat-lbl">Classe</div>
      </div>
      ${evo.lineage    ? `<div class="mp-stat-card"><div class="mp-stat-icon">🧬</div><div class="mp-stat-val" style="font-size:10px">${evo.lineage}</div><div class="mp-stat-lbl">Linhagem</div></div>` : ''}
      ${evo.alignment  ? `<div class="mp-stat-card"><div class="mp-stat-icon">🌙</div><div class="mp-stat-val" style="font-size:10px">${evo.alignment}</div><div class="mp-stat-lbl">Alinhamento</div></div>` : ''}
      ${evo.element    ? `<div class="mp-stat-card"><div class="mp-stat-icon">⚡</div><div class="mp-stat-val" style="font-size:10px">${evo.element}</div><div class="mp-stat-lbl">Elemento</div></div>` : ''}
      ${evo.armor      ? `<div class="mp-stat-card"><div class="mp-stat-icon">🛡️</div><div class="mp-stat-val" style="font-size:10px">${evo.armor}</div><div class="mp-stat-lbl">Armadura</div></div>` : ''}
      ${evo.personality? `<div class="mp-stat-card"><div class="mp-stat-icon">❤️</div><div class="mp-stat-val" style="font-size:10px">${evo.personality}</div><div class="mp-stat-lbl">Personalidade</div></div>` : ''}`;
  },

  _renderEvoTree(evo, xp) {
    const el = document.getElementById('mp-evo-tree');
    if (!el) return;
    let html = '';
    for (const field of EVO_FIELD_ORDER) {
      const threshold = EVO_XP_THRESHOLDS[field];
      const chosen    = evo[field];
      const unlocked  = xp >= threshold;
      const cls       = chosen ? 'evo-node done' : unlocked ? 'evo-node unlocked' : 'evo-node locked';
      html += `
        <div class="${cls}">
          <div class="evo-node-icon">${chosen ? '✓' : unlocked ? '🔓' : '🔒'}</div>
          <div class="evo-node-info">
            <div class="evo-node-name">${EVO_FIELD_NAMES[field]}</div>
            <div class="evo-node-detail">${chosen ? chosen : unlocked ? 'Disponível para escolha!' : `Precisa de ${threshold} XP`}</div>
          </div>
          ${unlocked && !chosen ? `<button class="evo-node-btn" onclick="MimoEvo.closePanel();window.location.href='/evolution/index.html'">Escolher →</button>` : ''}
        </div>`;
      if (field !== EVO_FIELD_ORDER[EVO_FIELD_ORDER.length-1]) {
        html += `<div class="evo-connector ${unlocked?'done':''}">▼</div>`;
      }
    }
    el.innerHTML = html;
  },

  _renderNext(evo, xp, next) {
    const el = document.getElementById('mp-next-stage');
    if (!el) return;
    if (!next) {
      el.innerHTML = `
        <div class="mp-next-complete">
          <div style="font-size:48px;margin-bottom:12px">👑</div>
          <div class="mp-next-title">Mimo Completo!</div>
          <p>Você completou toda a árvore evolutiva. Parabéns, Mestra das Questões!</p>
        </div>`;
      return;
    }
    const threshold = next.needed;
    const prevXP    = EVO_XP_THRESHOLDS[EVO_FIELD_ORDER[EVO_FIELD_ORDER.indexOf(next.field)-1]] || 0;
    const segSize   = threshold - prevXP;
    const done      = Math.max(0, xp - prevXP);
    const pct       = Math.min(100, Math.round(done / segSize * 100));
    const ready     = xp >= threshold;
    el.innerHTML = `
      <div class="mp-next-card">
        <div class="mp-next-icon">${ready ? '🌟' : '🔒'}</div>
        <div class="mp-next-title">${EVO_FIELD_NAMES[next.field]}</div>
        <p class="mp-next-desc">${ready
          ? '✨ Desbloqueado! Vá para a Árvore Evolutiva e faça sua escolha!'
          : `Faltam <strong>${next.remaining} XP</strong> para desbloquear este estágio.`}</p>
        <div class="mp-next-bar-track">
          <div class="mp-next-bar-fill ${ready?'full':''}" style="width:${pct}%"></div>
        </div>
        <div class="mp-next-pct">${pct}% completo</div>
        ${ready ? `<button class="mp-go-btn" onclick="MimoEvo.closePanel();window.location.href='/evolution/index.html'">
          ✦ Ir para Árvore Evolutiva ✦</button>` : `
          <div class="mp-tip-box">
            💡 Complete mais atividades para ganhar XP e desbloquear este estágio!
          </div>`}
      </div>`;
  },

  /* ── Evolution XP trigger (called from app.js) ─────────────── */
  onXPGained(prevXP, newXP) {
    const unlockedField = this.checkUnlocks(prevXP, newXP);
    if (unlockedField) {
      this._triggerEvolutionReady(unlockedField);
    }
    // Refresh panel if open
    if (this._panelOpen) this._refreshPanel();
  },

  /* ── Trigger "evolution ready" notification ────────────────── */
  _triggerEvolutionReady(field) {
    this._pendingUnlock = field;
    this.celebrate();
    setTimeout(() => {
      this.tip('evolution_ready');
    }, 600);
  },

  /* ── Helper: get a name/stage for the current evo ──────────── */
  _getMimoName(evo) {
    const classNames = { mamifero:'Mamífero', reptil:'Réptil', ave:'Ave' };
    let name  = 'Mimo — Origem';
    let stage = 0;
    if (evo.personality) { name = `Mimo — ${evo.personality}`; stage = 6; }
    else if (evo.armor)  { name = `Mimo — ${evo.armor}`;       stage = 5; }
    else if (evo.element){ name = `Mimo — ${evo.element}`;     stage = 4; }
    else if (evo.alignment){ name = `Mimo — ${evo.alignment}`; stage = 3; }
    else if (evo.lineage){ name = `Mimo — ${evo.lineage}`;     stage = 2; }
    else if (evo.class_path){ name = `Mimo — ${classNames[evo.class_path]||evo.class_path}`; stage=1; }
    return { name, stage };
  },
};

/* ─────────────────────────────────────────────────────────────────
   Public API (window-level, matches spec)
   ───────────────────────────────────────────────────────────────── */
window.MimoEvo = MimoEvo;

function showMimoMessage(text, icon, label, dur) { MimoEvo.showMsg(text, icon, label, dur); }
function getMimoTip(ctx)                         { MimoEvo.tip(ctx); }
function minimizeMimo()                          { MimoEvo.minimise(); }
function restoreMimo()                           { MimoEvo.restore(); }
function updateMimoForm(evoData)                 { MimoEvo.applyEvo(evoData || {}); }
