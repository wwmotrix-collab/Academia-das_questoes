// ═══════════════════════════════════════════════════════════════
// Academia das Questões V3.6 — Mimo Companion Controller
// Mascote flutuante com balão de fala contextual
// ═══════════════════════════════════════════════════════════════

const MIMO_ASSET_BASE = '/assets/mascots/';
const MIMO_ASSETS = {
  base:    'mimo-base.webp',
  mamifero:'mimo-mammal.webp',
  reptil:  'mimo-reptile.webp',
  ave:     'mimo-bird.webp',
};

// ── Message banks by context ──────────────────────────────────
const MIMO_MESSAGES = {
  welcome: [
    { icon: '👋', label: 'OLÁ!',       text: 'Ei, heroína! Estou aqui para te ajudar. <em>Vamos juntas!</em>' },
    { icon: '🌟', label: 'BEM-VINDA!', text: '<em>Que bom te ver!</em> Hoje vamos aprender coisas incríveis!' },
    { icon: '💎', label: 'PRONTA?',    text: 'Sua jornada continua! <strong>Cada passo conta!</strong>' },
  ],
  activity_start: [
    { icon: '📖', label: 'DICA',       text: 'Leia cada questão com <em>atenção total</em>. As pistas estão no texto!' },
    { icon: '🧠', label: 'ESTRATÉGIA', text: '<em>Respira fundo</em> e comece pela mais fácil. Você consegue!' },
    { icon: '⚡', label: 'ENERGIA',    text: 'Essa atividade vai te dar <strong>XP para minha evolução!</strong> Vamos lá!' },
  ],
  encouragement: [
    { icon: '💪', label: 'FORÇA!',     text: 'Está indo <em>muito bem!</em> Continue assim, heroína!' },
    { icon: '⭐', label: 'INCRÍVEL!',  text: 'Você é mais capaz do que imagina. <em>Acredita em você!</em>' },
    { icon: '🔥', label: 'FOCO!',      text: '<strong>Não desiste!</strong> Cada resposta certa nos aproxima da vitória.' },
  ],
  hint_interpret: [
    { icon: '🔍', label: 'PISTA',      text: 'Procura <em>emoções escondidas</em> no texto. O que o personagem está sentindo?' },
    { icon: '📝', label: 'DICA',       text: 'Releia o trecho com <em>calma</em>. A resposta está nas entrelinhas!' },
    { icon: '💡', label: 'IDEIA',      text: 'Pensa nas <em>pistas</em>: contexto, palavras-chave e emoções!' },
  ],
  hint_math: [
    { icon: '🔢', label: 'CONTA',      text: 'Resolve <em>passo a passo</em>. Não precisa fazer tudo de uma vez!' },
    { icon: '📐', label: 'LÓGICA',     text: 'Pensa na <em>sequência</em>: qual é a regra que está se repetindo?' },
    { icon: '🧮', label: 'DICA',       text: 'Em frações, lembra: <em>numerador</em> é a parte, <em>denominador</em> é o todo!' },
  ],
  incomplete_warning: [
    { icon: '⚠️', label: 'ATENÇÃO!',   text: 'Psiu! Parece que tem <em>questões sem resposta</em>. Confere antes de concluir!' },
    { icon: '👀', label: 'OI!',         text: 'Vi que ainda tem questões abertas. <em>Revisa tudo!</em> Você consegue!' },
    { icon: '💬', label: 'ESPERA!',    text: '<strong>Não esquece</strong> das questões de baixo! Vai lá, rola a tela!' },
  ],
  before_finish: [
    { icon: '🎯', label: 'QUASE LÁ!',  text: '<em>Revisa suas respostas</em> antes de concluir! Uma segunda olhada sempre ajuda.' },
    { icon: '✅', label: 'PRONTA?',    text: 'Confere se <em>todas as questões</em> estão respondidas. Aí é só arrasar!' },
    { icon: '🌟', label: 'CAPRICHA!',  text: 'Dá uma olhadinha final. <strong>Você é detalhista!</strong> Isso faz diferença!' },
  ],
  correct: [
    { icon: '🎉', label: 'ARRASOU!',   text: '<em>Que resposta incrível!</em> Você está evoluindo muito!' },
    { icon: '🏆', label: 'PERFEITO!',  text: '<strong>Essa foi difícil e você acertou!</strong> Orgulho total!' },
    { icon: '⚡', label: 'XP!',        text: 'Mais <em>XP para mim!</em> Obrigada, heroína! Continuamos juntas!' },
  ],
  activity_complete: [
    { icon: '🎊', label: 'MISSÃO!',    text: '<em>MISSÃO CONCLUÍDA!</em> Você foi absolutamente incrível hoje!' },
    { icon: '👑', label: 'LENDÁRIA!',  text: '<strong>Você é uma heroína de verdade!</strong> Seu conhecimento brilhou!' },
    { icon: '💎', label: 'CRISTAL!',   text: 'Mais um cristal conquistado! <em>Sua jornada continua ficando mais épica!</em>' },
  ],
  story_reading: [
    { icon: '📚', label: 'HISTÓRIA',   text: 'Atenção à história! As <em>pistas das atividades</em> estão aqui!' },
    { icon: '🌙', label: 'MERGULHA!',  text: '<em>Imagina o cenário</em> enquanto lê. Isso ajuda muito a entender!' },
    { icon: '✨', label: 'FOCO!',      text: 'Cada detalhe da história <strong>pode aparecer nas questões</strong>. Fica atenta!' },
  ],
  evolution_unlock: [
    { icon: '🌟', label: 'EVOLUÇÃO!',  text: 'Novo <em>estágio desbloqueado!</em> Vai na árvore evolutiva fazer sua escolha!' },
    { icon: '🎮', label: 'NOVO!',      text: '<strong>Uau!</strong> Você desbloqueou uma nova parte da minha evolução! Escolhe!' },
  ],
  idle: [
    { icon: '😊', label: 'OI!',        text: 'Clica em mim para uma <em>dica!</em> Estou sempre aqui pra te ajudar!' },
    { icon: '🐱', label: 'MIMO',       text: 'Psiu! <em>Já fez suas atividades</em> de hoje? Vamos evoluir juntas!' },
    { icon: '💜', label: 'AQUI!',      text: 'Lembra: <strong>cada atividade</strong> me faz evoluir um pouquinho mais!' },
  ],
};

// ── Mimo state ────────────────────────────────────────────────
const Mimo = {
  _companion: null,
  _avatarWrap: null,
  _img: null,
  _bubble: null,
  _bubbleText: null,
  _bubbleContextIcon: null,
  _bubbleContextLabel: null,
  _glowRing: null,
  _burst: null,
  _restorePill: null,
  _minimised: false,
  _currentClass: null,
  _hideTimer: null,
  _idleTimer: null,
  _mounted: false,

  // ── Build DOM ───────────────────────────────────────────────
  mount() {
    if (Mimo._mounted) return;
    Mimo._mounted = true;

    // Main companion div
    const wrap = document.createElement('div');
    wrap.id = 'mimo-companion';
    wrap.innerHTML = `
      <!-- Bubble -->
      <div class="mimo-bubble-wrap" id="mimo-bubble-wrap" style="display:none;">
        <div class="mimo-bubble">
          <div class="mimo-bubble-close" onclick="Mimo.hideBubble()" title="Fechar">✕</div>
          <div class="mimo-bubble-context">
            <span class="mimo-context-icon" id="mimo-ctx-icon">💡</span>
            <span class="mimo-context-label" id="mimo-ctx-label">MIMO</span>
          </div>
          <p class="mimo-bubble-text" id="mimo-bubble-text">Olá, heroína!</p>
        </div>
      </div>

      <!-- Avatar -->
      <div class="mimo-avatar-wrap" id="mimo-avatar-wrap"
           onclick="Mimo._onAvatarClick()"
           title="Clique para dica!">
        <div class="mimo-glow-ring" id="mimo-glow"></div>
        <div class="mimo-burst"     id="mimo-burst"></div>
        <img class="mimo-img" id="mimo-img"
             src="${MIMO_ASSET_BASE}mimo-base.webp"
             alt="Mimo, seu mascote"
             draggable="false"
             onerror="Mimo._onImgError(this)">
        <div class="mimo-toggle-btn" onclick="event.stopPropagation();Mimo.minimizeMimo()" title="Minimizar">−</div>
      </div>`;

    document.body.appendChild(wrap);

    // Restore pill
    const pill = document.createElement('div');
    pill.className = 'mimo-restore-pill';
    pill.id = 'mimo-restore-pill';
    pill.innerHTML = `
      <img class="mimo-restore-img" id="mimo-restore-img"
           src="${MIMO_ASSET_BASE}mimo-base.webp" alt="Mimo">
      <span class="mimo-restore-text">Mimo 🌟</span>`;
    pill.addEventListener('click', Mimo.restoreMimo);
    document.body.appendChild(pill);

    // Cache refs
    Mimo._companion         = wrap;
    Mimo._avatarWrap        = document.getElementById('mimo-avatar-wrap');
    Mimo._img               = document.getElementById('mimo-img');
    Mimo._bubbleWrap        = document.getElementById('mimo-bubble-wrap');
    Mimo._bubbleText        = document.getElementById('mimo-bubble-text');
    Mimo._bubbleContextIcon = document.getElementById('mimo-ctx-icon');
    Mimo._bubbleContextLabel= document.getElementById('mimo-ctx-label');
    Mimo._burst             = document.getElementById('mimo-burst');
    Mimo._restorePill       = document.getElementById('mimo-restore-pill');
    Mimo._restoreImg        = document.getElementById('mimo-restore-img');

    // Idle message cycle
    Mimo._scheduleIdle();
  },

  // ── Image error fallback ────────────────────────────────────
  _onImgError(imgEl) {
    // Replace img with a styled div fallback (no giant emoji)
    const wrap = imgEl.parentElement;
    imgEl.style.display = 'none';
    if (!wrap.querySelector('.mimo-fallback')) {
      const fb = document.createElement('div');
      fb.className = 'mimo-fallback';
      // Tiny tasteful text, not a giant emoji
      fb.innerHTML = '<span style="font-size:10px;color:#fde68a;font-family:Cinzel,serif;letter-spacing:1px;">MIMO</span>';
      wrap.appendChild(fb);
    }
  },

  // ── Update form based on evolution data ────────────────────
  updateMimoForm(evolutionData) {
    const cls = evolutionData?.class_path || null;
    Mimo._currentClass = cls;

    // Update companion data-class for CSS glow
    if (Mimo._companion) {
      Mimo._companion.dataset.class = cls || 'base';
    }

    // Select image
    const assetKey  = MIMO_ASSETS[cls] || MIMO_ASSETS.base;
    const assetPath = MIMO_ASSET_BASE + assetKey;

    if (Mimo._img) {
      Mimo._img.src = assetPath;
      Mimo._img.onerror = function() { Mimo._onImgError(this); };
    }
    if (Mimo._restoreImg) {
      Mimo._restoreImg.src = assetPath;
    }
  },

  // ── Show a message bubble ───────────────────────────────────
  showMimoMessage(text, icon = '💡', label = 'MIMO', duration = 5000) {
    if (!Mimo._bubbleWrap || Mimo._minimised) return;

    // Clear pending hide
    clearTimeout(Mimo._hideTimer);

    // Remove hiding class if present
    Mimo._bubbleWrap.classList.remove('hiding');

    // Set content
    Mimo._bubbleText.innerHTML        = text;
    Mimo._bubbleContextIcon.textContent  = icon;
    Mimo._bubbleContextLabel.textContent = label;

    // Show
    Mimo._bubbleWrap.style.display = '';
    // Force reflow for animation restart
    void Mimo._bubbleWrap.offsetWidth;
    Mimo._bubbleWrap.style.animation = 'none';
    Mimo._bubbleWrap.offsetWidth;
    Mimo._bubbleWrap.style.animation = '';

    // Auto-hide
    if (duration > 0) {
      Mimo._hideTimer = setTimeout(() => Mimo.hideBubble(), duration);
    }
  },

  // ── Hide bubble with animation ──────────────────────────────
  hideBubble() {
    if (!Mimo._bubbleWrap) return;
    clearTimeout(Mimo._hideTimer);
    Mimo._bubbleWrap.classList.add('hiding');
    setTimeout(() => {
      if (Mimo._bubbleWrap) {
        Mimo._bubbleWrap.style.display = 'none';
        Mimo._bubbleWrap.classList.remove('hiding');
      }
    }, 280);
  },

  // ── Context-aware tips ──────────────────────────────────────
  getMimoTip(context) {
    const bank = MIMO_MESSAGES[context] || MIMO_MESSAGES.encouragement;
    const msg  = bank[Math.floor(Math.random() * bank.length)];
    Mimo.showMimoMessage(msg.text, msg.icon, msg.label);
    return msg;
  },

  // ── Minimise ────────────────────────────────────────────────
  minimizeMimo() {
    Mimo._minimised = true;
    Mimo.hideBubble();
    if (Mimo._companion)   Mimo._companion.style.display   = 'none';
    if (Mimo._restorePill) Mimo._restorePill.classList.add('visible');
    clearTimeout(Mimo._idleTimer);
  },

  // ── Restore ─────────────────────────────────────────────────
  restoreMimo() {
    Mimo._minimised = false;
    if (Mimo._companion)   Mimo._companion.style.display   = '';
    if (Mimo._restorePill) Mimo._restorePill.classList.remove('visible');
    Mimo._scheduleIdle();
    // Greet on restore
    setTimeout(() => Mimo.getMimoTip('welcome'), 400);
  },

  // ── Happy celebration burst ──────────────────────────────────
  celebrate() {
    if (!Mimo._avatarWrap) return;
    Mimo._avatarWrap.classList.remove('happy', 'worried');
    void Mimo._avatarWrap.offsetWidth;
    Mimo._avatarWrap.classList.add('happy');
    setTimeout(() => Mimo._avatarWrap?.classList.remove('happy'), 1100);

    if (Mimo._burst) {
      Mimo._burst.classList.remove('active');
      void Mimo._burst.offsetWidth;
      Mimo._burst.style.background =
        'radial-gradient(circle, rgba(245,158,11,0.6) 0%, transparent 70%)';
      Mimo._burst.classList.add('active');
      setTimeout(() => Mimo._burst?.classList.remove('active'), 750);
    }
  },

  // ── Worried shake ───────────────────────────────────────────
  worry() {
    if (!Mimo._avatarWrap) return;
    Mimo._avatarWrap.classList.remove('happy', 'worried');
    void Mimo._avatarWrap.offsetWidth;
    Mimo._avatarWrap.classList.add('worried');
    setTimeout(() => Mimo._avatarWrap?.classList.remove('worried'), 900);
  },

  // ── Avatar click: random tip ────────────────────────────────
  _onAvatarClick() {
    Mimo.getMimoTip('idle');
  },

  // ── Idle cycle: show tip every ~35s ─────────────────────────
  _scheduleIdle() {
    clearTimeout(Mimo._idleTimer);
    Mimo._idleTimer = setTimeout(() => {
      if (!Mimo._minimised) {
        Mimo.getMimoTip('idle');
      }
      Mimo._scheduleIdle();
    }, 35000 + Math.random() * 20000);
  },

  // ── Shortcut helpers for common contexts ────────────────────
  onActivityStart()    { Mimo.getMimoTip('activity_start'); },
  onBeforeFinish()     { Mimo.getMimoTip('before_finish'); Mimo.worry(); },
  onIncomplete()       { Mimo.getMimoTip('incomplete_warning'); Mimo.worry(); },
  onActivityComplete() { Mimo.getMimoTip('activity_complete'); Mimo.celebrate(); },
  onCorrectAnswer()    { /* called sparingly to avoid spam */ Mimo.celebrate(); },
  onStoryReading()     { Mimo.getMimoTip('story_reading'); },
  onEvolutionUnlock()  { Mimo.getMimoTip('evolution_unlock'); Mimo.celebrate(); },
  onWelcome()          { Mimo.getMimoTip('welcome'); },

  // ── Context helpers for activity type ────────────────────────
  onHintRequest(activityType) {
    const ctx = activityType === 'math' || activityType === 'fracao' || activityType === 'sequencia'
      ? 'hint_math' : 'hint_interpret';
    Mimo.getMimoTip(ctx);
  },

  // ── Body class toggle for activity screen ────────────────────
  setActivityScreen(open) {
    document.body.classList.toggle('activity-open', open);
  },
};

// ── Public API (matches spec) ─────────────────────────────────
function showMimoMessage(text, icon, label, duration) {
  Mimo.showMimoMessage(text, icon, label, duration);
}
function updateMimoForm(evolutionData) {
  Mimo.updateMimoForm(evolutionData);
}
function getMimoTip(context) {
  return Mimo.getMimoTip(context);
}
function minimizeMimo() {
  Mimo.minimizeMimo();
}
function restoreMimo() {
  Mimo.restoreMimo();
}
