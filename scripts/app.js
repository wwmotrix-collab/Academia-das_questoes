// ═══════════════════════════════════════════════════════════════════
// Academia das Questões V3 — App.js Patch
// Integra o sistema evolutivo sem quebrar nada do V2
//
// COMO APLICAR:
// Substitua o conteúdo de /scripts/app.js pelo código abaixo,
// ou adicione os blocos marcados com "V3 PATCH" no app.js existente.
// ═══════════════════════════════════════════════════════════════════

const App = {
  _currentActivityId: null,
  _deferredInstall:   null,
  _isOnline:          navigator.onLine,

  // ── Boot ────────────────────────────────────────────────────
  async init() {
    UI.showLoading(true);
    App._initPWA();
    App._initOnlineDetection();
    Gamification.initParticles();

    try {
      const loggedIn = await Auth.tryAutoLogin();
      if (loggedIn) {
        UI.showLoading(false);
        await App.postLogin(Auth.student, false);
      } else {
        UI.showLoading(false);
        UI.showScreen('screen-login');
      }
    } catch (e) {
      console.error('Init error', e);
      UI.showLoading(false);
      UI.showScreen('screen-login');
    }

    document.getElementById('login-form')?.addEventListener('submit', App.handleLogin);
    document.getElementById('btn-logout')?.addEventListener('click', App.handleLogout);

    navigator.serviceWorker?.addEventListener('message', e => {
      if (e.data?.type === 'SYNC_RESULTS') App._syncPendingData();
    });
  },

  // ── Login handler ────────────────────────────────────────────
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
    } catch (err) {
      errEl.textContent = err.message || 'Erro ao entrar. Verifique sua conexão.';
      errEl.classList.add('show');
    } finally {
      btnEl.textContent = '✦ Entrar na Academia ✦';
      btnEl.disabled    = false;
    }
  },

  // ── Post-login ───────────────────────────────────────────────
  async postLogin(student, isNew) {
    document.getElementById('app-header').style.display = 'flex';
    UI.updateHeader(student);

    const [results, badges] = await Promise.all([
      DB.getResults(student.id),
      DB.getBadges(student.id),
    ]);

    await App.showIndex(student, results, badges);

    if (isNew) {
      setTimeout(() => {
        Gamification.showCelebration(
          'Bem-vinda à Academia!',
          `Olá, <strong>${student.name}</strong>! Sua jornada começa agora. Complete atividades, evolua o seu Mimo e torne-se uma <strong>Mestra das Questões</strong>!`,
          '🎓', [], null
        );
      }, 600);
    }
  },

  // ── Show index ───────────────────────────────────────────────
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

    // ── V3 PATCH: inject + load MIMO widget ──────────────────
    injectMimoWidgetSlot();
    await EvoWidget.init(student);
    // ── END V3 PATCH ─────────────────────────────────────────

    if (App._isOnline) {
      try { await DB.processSyncQueue(student.id); } catch {}
    }
  },

  // ── Open activity ────────────────────────────────────────────
  openActivity(id) {
    const act = ACTIVITIES.find(a => a.id === id);
    if (!act) return;
    App._currentActivityId = id;

    const savedAnswers = LS.get('answers_' + id) || {};
    const resultMap    = LS.get('resultMap') || {};
    const savedResult  = resultMap[id] || null;
    const isFinished   = !!savedResult;

    UI.renderActivity(act, savedAnswers, isFinished, savedResult);
    UI.showScreen('screen-activity');
  },

  // ── Select MC option ─────────────────────────────────────────
  selectOption(actId, qi, oi, el) {
    const resultMap = LS.get('resultMap') || {};
    if (resultMap[actId]) return;
    const answers = LS.get('answers_' + actId) || {};
    answers[qi] = oi;
    LS.set('answers_' + actId, answers);
    el.closest('.options').querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
  },

  // ── Select TF ────────────────────────────────────────────────
  selectTF(actId, qi, ii, val, el) {
    const resultMap = LS.get('resultMap') || {};
    if (resultMap[actId]) return;
    const answers = LS.get('answers_' + actId) || {};
    if (!answers[qi]) answers[qi] = {};
    answers[qi][ii] = val;
    LS.set('answers_' + actId, answers);
    el.closest('.tf-buttons').querySelectorAll('.tf-btn').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
  },

  // ── Finish activity ──────────────────────────────────────────
  async finishActivity(actId) {
    if (!confirm('Deseja concluir a atividade? As respostas serão corrigidas.')) return;

    const act     = ACTIVITIES.find(a => a.id === actId);
    const student = Auth.student;
    if (!act || !student) return;

    const answers = LS.get('answers_' + actId) || {};

    // Score
    let score = 0;
    act.questions.forEach((q, qi) => {
      if (q.type === 'mc') {
        if (answers[qi] === q.correct) score++;
      } else if (q.type === 'tf') {
        const saved = answers[qi] || {};
        q.tfItems.forEach((item, ii) => { if (saved[ii] === item.correct) score++; });
      }
    });

    const rankLabel = getRankLabel(score, act.ranks);
    const xpEarned  = Gamification.calcXP(score, act.maxScore);

    UI.showSync('syncing', 'Salvando...');
    await DB.saveResult(student.id, actId, score, act.maxScore, rankLabel, answers);

    const newTotalXP   = (student.total_xp || 0) + xpEarned;
    const newRankLabel = Gamification.getGlobalRank(newTotalXP).label;
    const oldRank      = Gamification.getGlobalRank(student.total_xp || 0).label;

    await DB.updateStudentXP(student.id, newTotalXP, newRankLabel);
    Auth.currentStudent = { ...student, total_xp: newTotalXP, current_rank: newRankLabel };
    LS.set('student', Auth.currentStudent);

    UI.showSync('online', '✓ Salvo!');

    const resultMap = LS.get('resultMap') || {};
    resultMap[actId] = {
      activity_id: actId, score, max_score: act.maxScore,
      percentage: score / act.maxScore * 100, rank_label: rankLabel,
    };
    LS.set('resultMap', resultMap);

    const results      = await DB.getResults(student.id);
    const completedCount = results.length;
    const newBadges    = await Gamification.checkBadges(
      student.id, completedCount, actId, score, act.maxScore, newTotalXP
    );
    await DB.getBadges(student.id);

    // ── V3 PATCH: add XP to evolution + check stage unlock ───
    let evoLevelUp    = false;
    let newEvoStage   = null;
    try {
      const evoResult = await EvoWidget.onActivityComplete(student.id, xpEarned);
      evoLevelUp = evoResult.levelUp;

      // Check if a new evolution stage was unlocked
      newEvoStage = await EvoWidget.checkStageUnlock(student.id);
    } catch (e) {
      console.warn('Evolution update error (non-critical):', e);
    }
    // ── END V3 PATCH ─────────────────────────────────────────

    // XP flash
    setTimeout(() => {
      const btn = document.querySelector('.btn-finish');
      if (btn) {
        const rect = btn.getBoundingClientRect();
        Gamification.showXPGain(xpEarned, rect.left + rect.width / 2, rect.top);
      }
    }, 300);

    UI.renderActivity(act, answers, true, resultMap[actId]);
    UI.updateHeader(Auth.currentStudent);

    const rankUpMsg = newRankLabel !== oldRank
      ? `🎊 Você subiu para <strong>${newRankLabel}</strong>!`
      : `Você ganhou <strong>+${xpEarned} XP</strong>! Total: <strong>${newTotalXP} XP</strong>`;

    // ── V3 PATCH: enrich celebration with evo info ───────────
    let evoMsg = '';
    if (evoLevelUp) {
      const evo = EvoWidget.currentEvo;
      evoMsg = `<br><br>⭐ <strong>Seu Mimo evoluiu para o Nível ${evo?.evolution_level}!</strong>`;
    }
    if (newEvoStage) {
      evoMsg += `<br>🌟 <strong>Estágio ${newEvoStage.stage} desbloqueado: ${newEvoStage.stageInfo.name}!</strong> Visite a Árvore Evolutiva para fazer sua escolha!`;
    }
    // ── END V3 PATCH ─────────────────────────────────────────

    const pct        = Math.round(score / act.maxScore * 100);
    const celebEmoji = pct === 100 ? '🏆' : pct >= 75 ? '⭐' : pct >= 50 ? '💎' : '📘';
    const celebTitle = pct === 100 ? 'Atividade Perfeita!' : pct >= 75 ? 'Excelente resultado!' : pct >= 50 ? 'Boa missão, heroína!' : 'Missão concluída!';

    // Add evo button to new badges if stage unlocked
    const extraBadges = newEvoStage
      ? [{ icon: '🌟', name: 'Novo Estágio Desbloqueado!' }]
      : [];

    setTimeout(() => {
      Gamification.showCelebration(
        celebTitle,
        `Você acertou <strong>${score} de ${act.maxScore}</strong> questões (${pct}%)! ${rankUpMsg}${evoMsg}`,
        celebEmoji,
        [...newBadges, ...extraBadges],
        null
      );
    }, 500);
  },

  // ── Redo activity ────────────────────────────────────────────
  redoActivity(actId) {
    if (!confirm('Deseja refazer a atividade? Seu resultado anterior será mantido, mas as respostas serão apagadas.')) return;
    LS.remove('answers_' + actId);
    const resultMap = LS.get('resultMap') || {};
    delete resultMap[actId];
    LS.set('resultMap', resultMap);
    App.openActivity(actId);
  },

  // ── Logout ───────────────────────────────────────────────────
  handleLogout() {
    if (!confirm('Deseja sair da Academia? Seu progresso está salvo.')) return;
    Auth.logout();
    document.getElementById('app-header').style.display = 'none';
    document.getElementById('login-name').value  = '';
    document.getElementById('login-class').value = '';
    UI.showScreen('screen-login');
  },

  // ── PWA ──────────────────────────────────────────────────────
  _initPWA() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.warn);
    }
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      App._deferredInstall = e;
      setTimeout(() => UI.showInstallPrompt(e), 3000);
    });
  },

  // ── Online/offline ───────────────────────────────────────────
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
    });
  },

  _syncPendingData() {
    const student = Auth.student;
    if (student && App._isOnline) {
      DB.processSyncQueue(student.id).catch(() => {});
    }
  },
};

// Boot
document.addEventListener('DOMContentLoaded', App.init);
