// ═══════════════════════════════════════════════════════════════════
// Academia das Questões V3.8 — App Controller
// Integra XPEngine (XP por questão único) + MascotResolver (asset path)
// ═══════════════════════════════════════════════════════════════════

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

    try { Gamification.initParticles(); } catch(e){ console.warn('[App] Particles:', e); }
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
      console.error('[App] init:', e);
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

    // V3.8: Load question progress from Supabase
    try { await XPEngine.loadFromSupabase(student.id); } catch(e){ console.warn('[App] XPEngine load:', e); }

    const [results, badges] = await Promise.all([
      DB.getResults(student.id),
      DB.getBadges(student.id),
    ]);

    await App.showIndex(student, results, badges);

    // V3.8: EvoWidget guard
    try {
      if (window.EvoWidget && typeof EvoWidget.init === 'function') {
        await EvoWidget.init(student);
        if (EvoWidget.currentEvo) MimoEvo.applyEvo(EvoWidget.currentEvo);
      }
    } catch(e) { console.warn('[App] EvoWidget.init:', e); }

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
              `Oi, <em>${student.name.split(' ')[0]}</em>! Sou o <strong>Mimo</strong>! Clica em mim para dicas! 💜`,
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

    // Inject widget slot + render evo bar
    try {
      if (typeof injectMimoWidgetSlot === 'function') injectMimoWidgetSlot();
    } catch{}

    // V3.8: Render mascot dashboard bar
    try {
      const evo = MimoEvo.getEvo();
      const xp  = student.total_xp || 0;
      MascotResolver.renderDashboardBar(evo, xp, 'mimo-widget-slot');
    } catch(e) { console.warn('[App] MascotResolver bar:', e); }

    // EvoWidget guard
    try {
      if (window.EvoWidget && typeof EvoWidget.init === 'function') {
        await EvoWidget.init(student);
        if (EvoWidget.currentEvo) {
          MimoEvo.applyEvo(EvoWidget.currentEvo);
          // Re-render bar with full evo data
          MascotResolver.renderDashboardBar(EvoWidget.currentEvo, student.total_xp || 0, 'mimo-widget-slot');
        }
      }
    } catch(e) { console.warn('[App] EvoWidget index:', e); }

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
          const mathIds = [5,6,7,8,9,10];
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

    // Count total items dynamically
    let totalItems = 0;
    act.questions.forEach(q => {
      if (q.type === 'mc') totalItems++;
      else if (q.type === 'tf') totalItems += (q.tfItems || []).length;
    });

    // Count unanswered
    let unanswered = 0;
    act.questions.forEach((q, qi) => {
      if (q.type === 'mc' && answers[qi] === undefined) unanswered++;
      if (q.type === 'tf') {
        const saved = answers[qi] || {};
        (q.tfItems || []).forEach((_, ii) => { if (saved[ii] === undefined) unanswered++; });
      }
    });

    if (unanswered > 0) {
      try { MimoEvo.worry(); MimoEvo.tip('incomplete'); } catch{}
      if (!confirm(`Ainda há ${unanswered} questão(ões) sem resposta. Deseja concluir mesmo assim?`)) return;
    } else {
      try { MimoEvo.tip('finish'); } catch{}
    }
    if (!confirm('Deseja concluir a atividade? As respostas serão corrigidas.')) return;

    // Count correct answers (for display)
    let correctAnswers = 0;
    act.questions.forEach((q, qi) => {
      if (q.type === 'mc' && answers[qi] === q.correct) correctAnswers++;
      else if (q.type === 'tf') {
        const saved = answers[qi] || {};
        (q.tfItems || []).forEach((item, ii) => { if (saved[ii] === item.correct) correctAnswers++; });
      }
    });

    const isPerfect   = correctAnswers === totalItems;
    const percentage  = Math.round(correctAnswers / totalItems * 100);

    // ═══════════════════════════════════════════════════════════
    // V3.8 — XPEngine: calculate XP without duplicates
    // ═══════════════════════════════════════════════════════════
    const prevTotalXP = student.total_xp || 0;
    let xpEarned      = 0;
    let xpBreakdown   = null;

    try {
      xpBreakdown = XPEngine.calculateXP(
        student.id, actId, answers, act.questions, isPerfect
      );
      xpEarned = xpBreakdown.xpEarned;
    } catch(e) {
      console.warn('[App] XPEngine.calculateXP (fallback):', e);
      // Fallback to simple calc if engine fails
      xpEarned = Gamification.calcXP(correctAnswers, totalItems);
    }
    // ═══════════════════════════════════════════════════════════

    const rankLabel    = getRankLabel(correctAnswers, act.ranks);
    const newTotalXP   = prevTotalXP + xpEarned;
    const newRankLabel = Gamification.getGlobalRank(newTotalXP).label;
    const oldRank      = Gamification.getGlobalRank(prevTotalXP).label;

    UI.showSync('syncing', 'Salvando...');
    await DB.saveResult(student.id, actId, correctAnswers, totalItems, rankLabel, answers);
    await DB.updateStudentXP(student.id, newTotalXP, newRankLabel);
    Auth.currentStudent = { ...student, total_xp: newTotalXP, current_rank: newRankLabel };
    LS.set('student', Auth.currentStudent);
    UI.showSync('online', '✓ Salvo!');

    // V3.8: Sync question-level progress to Supabase (fire and forget)
    try {
      XPEngine.syncToSupabase(student.id, actId, answers, act.questions, xpBreakdown);
    } catch(e) { console.warn('[App] XPEngine sync:', e); }

    const resultMap = LS.get('resultMap') || {};
    resultMap[actId] = {
      activity_id: actId,
      score:       correctAnswers,
      max_score:   totalItems,
      percentage,
      rank_label:  rankLabel,
      xp_earned:   xpEarned,
    };
    LS.set('resultMap', resultMap);

    let newBadges = [];
    try {
      const results = await DB.getResults(student.id);
      newBadges = await Gamification.checkBadges(
        student.id, results.length, actId, correctAnswers, totalItems, newTotalXP
      );
      await DB.getBadges(student.id);
    } catch(e) { console.warn('[App] Badges:', e); }

    // EvoWidget guard
    let evoLevelUp = false, newEvoStage = null;
    try {
      if (window.EvoWidget && typeof EvoWidget.onActivityComplete === 'function') {
        const evoRes = await EvoWidget.onActivityComplete(student.id, xpEarned);
        evoLevelUp   = evoRes?.levelUp || false;
        if (typeof EvoWidget.checkStageUnlock === 'function') {
          newEvoStage = await EvoWidget.checkStageUnlock(student.id);
        }
        if (EvoWidget.currentEvo) MimoEvo.applyEvo(EvoWidget.currentEvo);
      }
    } catch(e) { console.warn('[App] EvoWidget activity:', e); }

    // MimoEvo XP trigger
    try { MimoEvo.onXPGained(prevTotalXP, newTotalXP); } catch{}

    // V3.8: Update mascot images
    try {
      const evo = MimoEvo.getEvo();
      MascotResolver.updateAllMascotImages(evo);
    } catch{}

    // XP flash
    setTimeout(() => {
      try {
        if (xpEarned > 0) {
          const btn = document.querySelector('.btn-finish');
          if (btn) {
            const rect = btn.getBoundingClientRect();
            Gamification.showXPGain(xpEarned, rect.left + rect.width/2, rect.top);
          }
        }
      } catch{}
    }, 300);

    // Mimo reaction
    setTimeout(() => {
      try {
        if (xpEarned === 0 && correctAnswers > 0) {
          MimoEvo.showMsg(
            'Você já ganhou XP por essas questões antes! <em>Continue tentando as outras!</em>',
            '💜', 'MIMO', 6000
          );
        } else if (percentage === 100) {
          MimoEvo.celebrate();
          setTimeout(() => MimoEvo.showMsg(
            '🏆 <strong>100% de acertos!</strong> Você é incrível! 💜',
            '🏆', 'PERFEITO!', 7500
          ), 700);
        } else {
          MimoEvo.celebrate();
          setTimeout(() => MimoEvo.tip('correct'), 600);
        }
      } catch{}
    }, 500);

    UI.renderActivity(act, answers, true, resultMap[actId]);
    UI.updateHeader(Auth.currentStudent);

    // ── Build result modal text with XP breakdown ──────────────
    const rankUpMsg = newRankLabel !== oldRank
      ? `🎊 Você subiu para <strong>${newRankLabel}</strong>!`
      : `Ganhou <strong>+${xpEarned} XP</strong>! Total: <strong>${newTotalXP} XP</strong>`;

    let breakdownHtml = '';
    if (xpBreakdown) {
      const hasAlready = xpBreakdown.alreadyCorrect > 0;
      breakdownHtml = `
        <div class="xp-breakdown">
          <div class="xp-breakdown-title">DETALHES DO XP</div>
          <div class="xp-breakdown-row">
            <span class="xbd-label">Questões corretas inéditas</span>
            <span class="xbd-val ${xpBreakdown.newlyCorrect === 0 ? 'zero' : ''}">
              ${xpBreakdown.newlyCorrect > 0 ? '+' + (xpBreakdown.newlyCorrect * 10) + ' XP' : '0 XP'}
            </span>
          </div>
          ${xpBreakdown.completionBonusXP > 0 ? `
          <div class="xp-breakdown-row">
            <span class="xbd-label">Bônus de conclusão</span>
            <span class="xbd-val bonus">+${xpBreakdown.completionBonusXP} XP</span>
          </div>` : ''}
          ${xpBreakdown.perfectBonusXP > 0 ? `
          <div class="xp-breakdown-row">
            <span class="xbd-label">Bônus de perfeição</span>
            <span class="xbd-val bonus">+${xpBreakdown.perfectBonusXP} XP</span>
          </div>` : ''}
          ${hasAlready ? `
          <div class="xp-breakdown-row">
            <span class="xbd-label">Já premiadas (sem duplicata)</span>
            <span class="xbd-val zero">${xpBreakdown.alreadyCorrect} questão(ões)</span>
          </div>` : ''}
          <div class="xp-breakdown-total">
            <span>XP ganho hoje</span>
            <span class="xbd-total-val">${xpEarned > 0 ? '+' + xpEarned : '0'} XP</span>
          </div>
        </div>`;
    }

    let evoMsg = '';
    if (newEvoStage) evoMsg = `<br>🌟 <strong>Novo estágio desbloqueado!</strong> Clique no Mimo!`;
    if (evoLevelUp) {
      const evo = window.EvoWidget?.currentEvo;
      if (evo) evoMsg += `<br>⭐ <strong>Mimo evoluiu para Nível ${evo.evolution_level}!</strong>`;
    }

    const celebEmoji = percentage === 100 ? '🏆' : percentage >= 75 ? '⭐' : percentage >= 50 ? '💎' : '📘';
    const celebTitle = percentage === 100 ? 'Atividade Perfeita!' : percentage >= 75 ? 'Excelente resultado!' : percentage >= 50 ? 'Boa missão!' : 'Missão concluída!';
    const extraBadges = newEvoStage ? [{ icon:'🌟', name:'Novo Estágio Desbloqueado!' }] : [];

    setTimeout(() => {
      try {
        Gamification.showCelebration(
          celebTitle,
          `Você acertou <strong>${correctAnswers} de ${totalItems}</strong> questões (${percentage}%)! ${rankUpMsg}${evoMsg}${breakdownHtml}`,
          celebEmoji,
          [...newBadges, ...extraBadges],
          null
        );
      } catch(e) { console.warn('[App] Celebration:', e); }
    }, 500);
  },

  /* ── Redo ───────────────────────────────────────────────────── */
  redoActivity(actId) {
    // V3.8: Redo allowed freely — XPEngine tracks per-question, no reset needed
    const student = Auth.student;
    if (student) {
      const summary = XPEngine.getActivitySummary(student.id, actId, ACTIVITIES.find(a=>a.id===actId)?.questions || []);
      if (summary.questionsRemaining === 0) {
        // All questions already earned XP — inform but still allow
        try {
          MimoEvo.showMsg(
            'Você já ganhou todo o XP dessa atividade! Pode refazer para <em>estudar</em>, mas não haverá XP novo. 💜',
            '📚', 'INFORMAÇÃO', 7000
          );
        } catch{}
      }
    }
    if (!confirm('Deseja refazer a atividade? XP já conquistado será mantido.')) return;
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
      navigator.serviceWorker.register('/sw.js').catch(e => console.warn('[App] SW:', e));
    }
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      App._deferredInstall = e;
      setTimeout(() => { try { UI.showInstallPrompt(e); } catch{} }, 3000);
    });
  },

  _initOnlineDetection() {
    window.addEventListener('online', () => {
      App._isOnline = true;
      UI.showSync('online', '✓ Reconectado!');
      const student = Auth.student;
      if (student) DB.processSyncQueue(student.id).then(() => UI.showSync('online', '✓ Sincronizado!')).catch(()=>{});
    });
    window.addEventListener('offline', () => {
      App._isOnline = false;
      UI.showSync('offline', '⚡ Modo offline');
      try { MimoEvo.showMsg('Ficamos <em>offline</em>. Salvo localmente! 💜', '📡', 'OFFLINE', 5500); } catch{}
    });
  },

  _syncPendingData() {
    const student = Auth.student;
    if (student && App._isOnline) DB.processSyncQueue(student.id).catch(()=>{});
  },
};

document.addEventListener('DOMContentLoaded', App.init);
