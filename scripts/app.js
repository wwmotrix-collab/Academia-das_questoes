// ═══════════════════════════════════════════════════════════════
// Academia das Questões V3.7.1 — App Controller
// BUG FIX: contagem dinâmica de questões em todo o fluxo
// BUG FIX: EvoWidget protegido com guard em todos os calls
// BUG FIX: MimoEvo.onXPGained chamado com XP real
// ═══════════════════════════════════════════════════════════════

'use strict';

const App = {
  _currentActivityId: null,
  _deferredInstall:   null,
  _isOnline:          navigator.onLine,

  /* ── Boot ──────────────────────────────────────────────────── */
  async init() {
    UI.showLoading(true);
    App._initPWA();
    App._initOnlineDetection();

    // Particles — non-critical
    try { Gamification.initParticles(); } catch(e){ console.warn('[App] Particles:', e); }

    // Mimo — mount immediately, no dependencies
    try { MimoEvo.mount(); } catch(e){ console.warn('[App] Mimo mount:', e); }

    try {
      const loggedIn = await Auth.tryAutoLogin();
      if (loggedIn) {
        UI.showLoading(false);
        await App.postLogin(Auth.student, false);
      } else {
        UI.showLoading(false);
        UI.showScreen('screen-login');
        setTimeout(() => { try { MimoEvo.tip('welcome'); } catch{} }, 1200);
      }
    } catch(e) {
      console.error('[App] init error:', e);
      UI.showLoading(false);
      UI.showScreen('screen-login');
    }

    document.getElementById('login-form')
      ?.addEventListener('submit', App.handleLogin);
    document.getElementById('btn-logout')
      ?.addEventListener('click', App.handleLogout);

    navigator.serviceWorker?.addEventListener('message', e => {
      if (e.data?.type === 'SYNC_RESULTS') App._syncPendingData();
    });
  },

  /* ── Login ─────────────────────────────────────────────────── */
  async handleLogin(e) {
    e.preventDefault();
    const name      = document.getElementById('login-name')?.value  || '';
    const classCode = document.getElementById('login-class')?.value || '';
    const errEl     = document.getElementById('login-error');
    const btnEl     = document.getElementById('btn-login');

    errEl.classList.remove('show');
    btnEl.textContent = 'Entrando...';
    btnEl.disabled    = true;

    try {
      const result = await Auth.login(name, classCode);
      UI.showSync('online', '✓ Conectado!');
      await App.postLogin(result.student, result.isNew);
    } catch(err) {
      errEl.textContent = err.message || 'Erro ao entrar. Verifique sua conexão.';
      errEl.classList.add('show');
      try { MimoEvo.worry(); MimoEvo.showMsg('Hmm... algo deu errado. <em>Tenta de novo!</em>', '⚠️', 'ERRO'); } catch{}
    } finally {
      btnEl.textContent = '✦ Entrar na Academia ✦';
      btnEl.disabled    = false;
    }
  },

  /* ── Post-login ─────────────────────────────────────────────── */
  async postLogin(student, isNew) {
    document.getElementById('app-header').style.display = 'flex';
    UI.updateHeader(student);

    const [results, badges] = await Promise.all([
      DB.getResults(student.id),
      DB.getBadges(student.id),
    ]);

    await App.showIndex(student, results, badges);

    // ── V3.7.1: EvoWidget guard ─────────────────────────────────
    try {
      if (window.EvoWidget && typeof EvoWidget.init === 'function') {
        await EvoWidget.init(student);
        if (EvoWidget.currentEvo) MimoEvo.applyEvo(EvoWidget.currentEvo);
      }
    } catch(e) { console.warn('[App] EvoWidget.init (non-critical):', e); }

    // Sync XP into MimoEvo local state
    try {
      const localEvo = MimoEvo.getEvo();
      MimoEvo.saveEvoLocal(localEvo); // ensure key exists
    } catch{}

    if (isNew) {
      setTimeout(() => {
        try {
          Gamification.showCelebration(
            'Bem-vinda à Academia!',
            `Olá, <strong>${student.name}</strong>! Sua jornada começa agora. Complete atividades, evolua o Mimo e torne-se uma <strong>Mestra das Questões</strong>!`,
            '🎓', [], null
          );
        } catch{}
        setTimeout(() => {
          try {
            MimoEvo.showMsg(
              `Oi, <em>${student.name.split(' ')[0]}</em>! Sou o <strong>Mimo</strong>! Clica em mim quando quiser uma dica! 💜`,
              '🐱', 'MIMO', 7000
            );
          } catch{}
        }, 1600);
      }, 600);
    } else {
      setTimeout(() => { try { MimoEvo.tip('welcome'); } catch{} }, 900);
    }
  },

  /* ── Index ──────────────────────────────────────────────────── */
  async showIndex() {
    const student = Auth.student;
    if (!student) { UI.showScreen('screen-login'); return; }

    const [results, badges] = await Promise.all([
      DB.getResults(student.id),
      DB.getBadges(student.id),
    ]);

    UI.renderIndex(student, results, badges);
    UI.updateHeader(student);
    UI.showScreen('screen-index');
    App._currentActivityId = null;

    try { MimoEvo.setActivityOpen(false); } catch{}

    // ── V3.7.1: EvoWidget widget slot — guarded ──────────────────
    try {
      if (typeof injectMimoWidgetSlot === 'function') injectMimoWidgetSlot();
      if (window.EvoWidget && typeof EvoWidget.init === 'function') {
        await EvoWidget.init(student);
        if (EvoWidget.currentEvo) MimoEvo.applyEvo(EvoWidget.currentEvo);
      }
    } catch(e) { console.warn('[App] EvoWidget widget (non-critical):', e); }

    if (App._isOnline) {
      try { await DB.processSyncQueue(student.id); } catch{}
    }
  },

  /* ── Open activity ──────────────────────────────────────────── */
  openActivity(id) {
    const act = ACTIVITIES.find(a => a.id === id);
    if (!act) return;
    App._currentActivityId = id;

    const savedAnswers = LS.get('answers_' + id) || {};
    const resultMap    = LS.get('resultMap') || {};
    const isFinished   = !!resultMap[id];

    UI.renderActivity(act, savedAnswers, isFinished, resultMap[id] || null);
    UI.showScreen('screen-activity');

    try { MimoEvo.setActivityOpen(true); } catch{}

    if (!isFinished) {
      setTimeout(() => {
        try {
          // Math/frações for activities 5-10, reading for 1-4
          const mathIds = [5, 6, 7, 8, 9, 10];
          MimoEvo.tip(mathIds.includes(id) ? 'math' : 'start');
        } catch{}
      }, 900);
    }
  },

  /* ── Select MC ──────────────────────────────────────────────── */
  selectOption(actId, qi, oi, el) {
    const resultMap = LS.get('resultMap') || {};
    if (resultMap[actId]) return;
    const answers = LS.get('answers_' + actId) || {};
    answers[qi] = oi;
    LS.set('answers_' + actId, answers);
    el.closest('.options').querySelectorAll('.option')
      .forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
  },

  /* ── Select TF ──────────────────────────────────────────────── */
  selectTF(actId, qi, ii, val, el) {
    const resultMap = LS.get('resultMap') || {};
    if (resultMap[actId]) return;
    const answers = LS.get('answers_' + actId) || {};
    if (!answers[qi]) answers[qi] = {};
    answers[qi][ii] = val;
    LS.set('answers_' + actId, answers);
    el.closest('.tf-buttons').querySelectorAll('.tf-btn')
      .forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
  },

  /* ── Finish activity ────────────────────────────────────────── */
  async finishActivity(actId) {
    const act     = ACTIVITIES.find(a => a.id === actId);
    const student = Auth.student;
    if (!act || !student) return;

    const answers = LS.get('answers_' + actId) || {};

    // ╔══════════════════════════════════════════════════════════╗
    // ║  V3.7.1 BUG FIX — CONTAGEM DINÂMICA DE QUESTÕES         ║
    // ║  Nunca usar valor fixo. Sempre questions.length          ║
    // ╚══════════════════════════════════════════════════════════╝

    // Count total answerable items (includes TF sub-items)
    let totalItems = 0;
    act.questions.forEach(q => {
      if (q.type === 'mc')  totalItems += 1;
      if (q.type === 'tf')  totalItems += (q.tfItems || []).length;
    });

    // Count unanswered
    let unanswered = 0;
    act.questions.forEach((q, qi) => {
      if (q.type === 'mc' && answers[qi] === undefined) unanswered++;
      if (q.type === 'tf') {
        const saved = answers[qi] || {};
        (q.tfItems || []).forEach((_, ii) => {
          if (saved[ii] === undefined) unanswered++;
        });
      }
    });

    if (unanswered > 0) {
      try { MimoEvo.worry(); MimoEvo.tip('incomplete'); } catch{}
      const plural = unanswered === 1 ? 'questão' : 'questões';
      if (!confirm(`Ainda há ${unanswered} ${plural} sem resposta. Deseja concluir mesmo assim?`)) return;
    } else {
      try { MimoEvo.tip('finish'); } catch{}
    }

    if (!confirm('Deseja concluir a atividade? As respostas serão corrigidas.')) return;

    // Score — dynamic
    let correctAnswers = 0;
    act.questions.forEach((q, qi) => {
      if (q.type === 'mc') {
        if (answers[qi] === q.correct) correctAnswers++;
      } else if (q.type === 'tf') {
        const saved = answers[qi] || {};
        (q.tfItems || []).forEach((item, ii) => {
          if (saved[ii] === item.correct) correctAnswers++;
        });
      }
    });

    // ── realMaxScore = real question count (dynamic, never 20) ──
    const realMaxScore = totalItems;                             // ← BUG FIX
    const percentage   = Math.round(correctAnswers / realMaxScore * 100); // ← BUG FIX
    const rankLabel    = getRankLabel(correctAnswers, act.ranks);
    const xpEarned     = Gamification.calcXP(correctAnswers, realMaxScore); // ← BUG FIX
    const prevTotalXP  = student.total_xp || 0;

    // Save result with real counts
    UI.showSync('syncing', 'Salvando...');
    await DB.saveResult(
      student.id, actId,
      correctAnswers,   // score
      realMaxScore,     // max_score — dynamic ← BUG FIX
      rankLabel,
      answers
    );

    const newTotalXP   = prevTotalXP + xpEarned;
    const newRankLabel = Gamification.getGlobalRank(newTotalXP).label;
    const oldRank      = Gamification.getGlobalRank(prevTotalXP).label;

    await DB.updateStudentXP(student.id, newTotalXP, newRankLabel);
    Auth.currentStudent = { ...student, total_xp: newTotalXP, current_rank: newRankLabel };
    LS.set('student', Auth.currentStudent);
    UI.showSync('online', '✓ Salvo!');

    // Store result with correct dynamic max_score
    const resultMap = LS.get('resultMap') || {};
    resultMap[actId] = {
      activity_id: actId,
      score:       correctAnswers,    // ← BUG FIX: real correct
      max_score:   realMaxScore,      // ← BUG FIX: real total
      percentage,                     // ← BUG FIX: real %
      rank_label:  rankLabel,
      xp_earned:   xpEarned,
    };
    LS.set('resultMap', resultMap);

    // Badges
    let newBadges = [];
    try {
      const results = await DB.getResults(student.id);
      newBadges = await Gamification.checkBadges(
        student.id, results.length, actId,
        correctAnswers, realMaxScore, newTotalXP
      );
      await DB.getBadges(student.id);
    } catch(e) { console.warn('[App] Badges (non-critical):', e); }

    // ── V3.7.1: EvoWidget — fully guarded ───────────────────────
    let evoLevelUp  = false;
    let newEvoStage = null;
    try {
      if (window.EvoWidget && typeof EvoWidget.onActivityComplete === 'function') {
        const evoRes = await EvoWidget.onActivityComplete(student.id, xpEarned);
        evoLevelUp  = evoRes?.levelUp || false;
        if (typeof EvoWidget.checkStageUnlock === 'function') {
          newEvoStage = await EvoWidget.checkStageUnlock(student.id);
        }
        if (EvoWidget.currentEvo) MimoEvo.applyEvo(EvoWidget.currentEvo);
      }
    } catch(e) { console.warn('[App] EvoWidget activity (non-critical):', e); }

    // ── V3.7.1: MimoEvo XP trigger ──────────────────────────────
    try {
      MimoEvo.onXPGained(prevTotalXP, newTotalXP);
    } catch(e) { console.warn('[App] MimoEvo.onXPGained (non-critical):', e); }

    // XP flash
    setTimeout(() => {
      try {
        const btn = document.querySelector('.btn-finish');
        if (btn) {
          const rect = btn.getBoundingClientRect();
          Gamification.showXPGain(xpEarned, rect.left + rect.width / 2, rect.top);
        }
      } catch{}
    }, 300);

    // Mimo celebration
    setTimeout(() => {
      try {
        MimoEvo.celebrate();
        if (percentage === 100) {
          setTimeout(() => MimoEvo.showMsg(
            '🏆 <strong>100% de acertos!!</strong> Você é absolutamente incrível! Obrigada! 💜',
            '🏆', 'PERFEITO!', 7500
          ), 700);
        } else if (newEvoStage) {
          setTimeout(() => MimoEvo.tip('evolution_ready'), 900);
        } else {
          setTimeout(() => MimoEvo.tip('correct'), 600);
        }
      } catch{}
    }, 500);

    // Re-render activity screen with corrected values
    UI.renderActivity(act, answers, true, resultMap[actId]);
    UI.updateHeader(Auth.currentStudent);

    // ── Build celebration message with DYNAMIC counts ────────────
    // "Você acertou X de Y questões" — Y = real total ← BUG FIX
    const rankUpMsg = newRankLabel !== oldRank
      ? `🎊 Você subiu para <strong>${newRankLabel}</strong>!`
      : `Ganhou <strong>+${xpEarned} XP</strong>! Total: <strong>${newTotalXP} XP</strong>`;

    let evoMsg = '';
    if (evoLevelUp) {
      const evo = window.EvoWidget?.currentEvo;
      if (evo) evoMsg += `<br><br>⭐ <strong>Mimo evoluiu para Nível ${evo.evolution_level}!</strong>`;
    }
    if (newEvoStage) {
      evoMsg += `<br>🌟 <strong>Novo estágio desbloqueado!</strong> Clique no Mimo para escolher!`;
    }

    const celebEmoji = percentage === 100 ? '🏆' : percentage >= 75 ? '⭐' : percentage >= 50 ? '💎' : '📘';
    const celebTitle = percentage === 100 ? 'Atividade Perfeita!'
      : percentage >= 75 ? 'Excelente resultado!'
      : percentage >= 50 ? 'Boa missão!'
      : 'Missão concluída!';

    const extraBadges = newEvoStage
      ? [{ icon:'🌟', name:'Novo Estágio Desbloqueado!' }] : [];

    setTimeout(() => {
      try {
        Gamification.showCelebration(
          celebTitle,
          // ← BUG FIX: "X de Y" usa valores dinâmicos
          `Você acertou <strong>${correctAnswers} de ${realMaxScore}</strong> questões (${percentage}%)! ${rankUpMsg}${evoMsg}`,
          celebEmoji,
          [...newBadges, ...extraBadges],
          null
        );
      } catch(e) { console.warn('[App] Celebration (non-critical):', e); }
    }, 500);
  },

  /* ── Redo ───────────────────────────────────────────────────── */
  redoActivity(actId) {
    if (!confirm('Deseja refazer a atividade?')) return;
    LS.remove('answers_' + actId);
    const resultMap = LS.get('resultMap') || {};
    delete resultMap[actId];
    LS.set('resultMap', resultMap);
    App.openActivity(actId);
  },

  /* ── Logout ─────────────────────────────────────────────────── */
  handleLogout() {
    if (!confirm('Deseja sair? Seu progresso está salvo.')) return;
    try { MimoEvo.showMsg('Até logo! <em>Volte logo!</em> 💜', '👋', 'TCHAU!', 3000); } catch{}
    Auth.logout();
    document.getElementById('app-header').style.display = 'none';
    document.getElementById('login-name').value  = '';
    document.getElementById('login-class').value = '';
    setTimeout(() => UI.showScreen('screen-login'), 400);
  },

  /* ── PWA ─────────────────────────────────────────────────────── */
  _initPWA() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .catch(e => console.warn('[App] SW:', e));
    }
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      App._deferredInstall = e;
      setTimeout(() => { try { UI.showInstallPrompt(e); } catch{} }, 3000);
    });
  },

  /* ── Online/offline ─────────────────────────────────────────── */
  _initOnlineDetection() {
    window.addEventListener('online', () => {
      App._isOnline = true;
      UI.showSync('online', '✓ Reconectado!');
      const student = Auth.student;
      if (student) {
        DB.processSyncQueue(student.id)
          .then(() => UI.showSync('online', '✓ Sincronizado!'))
          .catch(() => {});
      }
    });
    window.addEventListener('offline', () => {
      App._isOnline = false;
      UI.showSync('offline', '⚡ Modo offline');
      try {
        MimoEvo.showMsg(
          'Ficamos <em>offline</em>. Não se preocupa, salvo localmente! 💜',
          '📡', 'OFFLINE', 5500
        );
      } catch{}
    });
  },

  _syncPendingData() {
    const student = Auth.student;
    if (student && App._isOnline) {
      DB.processSyncQueue(student.id).catch(() => {});
    }
  },
};

document.addEventListener('DOMContentLoaded', App.init);
