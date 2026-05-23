// ═══════════════════════════════════════════════════════════
// Academia das Questões V2 — UI Module
// ═══════════════════════════════════════════════════════════

const UI = {

  // ── Screen navigation ──────────────────────────────────
  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) { el.classList.add('active'); window.scrollTo(0, 0); }
  },

  // ── Sync indicator ─────────────────────────────────────
  showSync(type, msg) {
    const el  = document.getElementById('sync-indicator');
    const dot = el.querySelector('.sync-dot');
    const txt = el.querySelector('.sync-text');
    el.className = `sync-indicator show ${type}`;
    txt.textContent = msg;
    if (type !== 'syncing') setTimeout(() => el.classList.remove('show'), 2500);
  },

  // ── Header update ──────────────────────────────────────
  updateHeader(student) {
    const el = document.getElementById('header-name');
    const xpEl = document.getElementById('header-xp');
    const rankEl = document.getElementById('header-rank');
    if (el) el.textContent = student.name;
    if (xpEl) xpEl.textContent = student.total_xp || 0;
    if (rankEl) rankEl.textContent = Gamification.getGlobalRank(student.total_xp || 0).icon + ' ' + Gamification.getGlobalRank(student.total_xp || 0).label;
  },

  // ── Index screen ───────────────────────────────────────
  renderIndex(student, results, badges) {
    // Hero section
    const greetEl = document.getElementById('student-greeting');
    const nameEl  = document.getElementById('student-display-name');
    const classEl = document.getElementById('student-class');
    if (greetEl) greetEl.textContent = 'Bem-vinda de volta,';
    if (nameEl)  nameEl.textContent  = student.name;
    if (classEl) classEl.textContent = '📚 Turma ' + student.class_code;

    // XP + Rank panel
    const totalXP = student.total_xp || 0;
    const rank    = Gamification.getGlobalRank(totalXP);
    const nextXP  = Gamification.xpToNextRank(totalXP);
    const prog    = Gamification.rankProgress(totalXP);

    const xpNumEl   = document.getElementById('xp-number');
    const rankBdgEl = document.getElementById('rank-badge');
    const barEl     = document.getElementById('xp-bar-fill');
    const nextEl    = document.getElementById('xp-next');
    const badgesRow = document.getElementById('badges-row');

    if (xpNumEl)   xpNumEl.textContent   = totalXP.toLocaleString('pt-BR');
    if (rankBdgEl) rankBdgEl.textContent  = rank.icon + ' ' + rank.label;
    if (barEl)     { barEl.style.width = `${prog}%`; }
    if (nextEl)    nextEl.textContent     = nextXP > 0 ? `${nextXP} XP para ${GLOBAL_RANKS[GLOBAL_RANKS.indexOf(rank)+1]?.label || '★'}` : '✦ Rank máximo!';

    // Badges
    if (badgesRow) {
      if (badges.length === 0) {
        badgesRow.innerHTML = '<span style="font-size:12px;color:rgba(243,232,255,0.4);">Nenhuma insígnia ainda — complete atividades!</span>';
      } else {
        badgesRow.innerHTML = badges.map(b => {
          const def = BADGE_DEFS.find(d => d.name === b.badge_name) || {};
          return `<div class="badge-chip" title="${b.badge_desc || def.desc || ''}"><span class="badge-icon">${def.icon || '🏅'}</span>${b.badge_name}</div>`;
        }).join('');
      }
    }

    // Build results map
    const resultMap = {};
    results.forEach(r => { resultMap[r.activity_id] = r; });
    LS.set('resultMap', resultMap);

    // Render activity cards
    const grid = document.getElementById('activities-grid');
    if (!grid) return;
    grid.innerHTML = '';

    ACTIVITIES.forEach((act, idx) => {
      const res = resultMap[act.id];
      const done = !!res;
      const inProgress = !done && (LS.get('answers_' + act.id) !== null);
      const statusClass = done ? 'done' : inProgress ? 'in-progress' : '';
      const statusLbl   = done ? '✅ Concluída' : inProgress ? '🔵 Em andamento' : '⬜ Não iniciada';
      const statusCls   = done ? 'status-done' : inProgress ? 'status-inprogress' : 'status-notstarted';
      const btnLbl      = done ? '🔎 Ver resultado' : inProgress ? '▶ Continuar' : '⚔ Iniciar missão';
      const btnCls      = done ? 'done' : '';
      const pct         = done ? Math.round(res.score / res.max_score * 100) : 0;
      const xpEarned    = done ? Gamification.calcXP(res.score, res.max_score) : 0;

      const scoreRow = done ? `
        <div class="card-score-row">
          <span class="card-score-val">${res.score}/${res.max_score} (${pct}%)</span>
          <span class="card-xp-badge">+${xpEarned} XP</span>
        </div>
        <div class="card-progress-bar"><div class="card-progress-fill" style="width:${pct}%"></div></div>` : '';

      grid.innerHTML += `
        <div class="activity-card ${statusClass}" onclick="App.openActivity(${act.id})">
          <div class="card-header">
            <div class="card-num">${act.id}</div>
            <div>
              <div class="card-title">${act.title}</div>
              <div class="card-subtitle">${act.subtitle}</div>
            </div>
          </div>
          <div class="card-body">
            <div class="card-topic">📚 ${act.topic}</div>
            <span class="card-status ${statusCls}">${statusLbl}</span>
            ${scoreRow}
            <button class="btn-start ${btnCls}" onclick="event.stopPropagation();App.openActivity(${act.id})">${btnLbl}</button>
          </div>
        </div>`;
    });
  },

  // ── Activity screen ────────────────────────────────────
  renderActivity(act, savedAnswers, isFinished, savedResult) {
    const container = document.getElementById('screen-activity');
    if (!container) return;

    const rankRows = act.rankTable.map(r =>
      `<tr><td>${r.a}</td><td>${r.r}</td></tr>`
    ).join('');

    let qHtml = '';
    act.questions.forEach((q, qi) => {
      const saved = savedAnswers[qi];
      if (q.type === 'mc') {
        const seqHtml = q.seq ? `<div class="sequence-box">${q.seq}</div>` : '';
        let optHtml = '';
        q.options.forEach((opt, oi) => {
          let cls = '';
          if (isFinished) {
            if (oi === q.correct) cls = 'correct';
            else if (saved === oi) cls = 'wrong';
          } else if (saved === oi) cls = 'selected';
          const dis = isFinished ? 'pointer-events:none;' : '';
          optHtml += `<div class="option ${cls}" style="${dis}"
            onclick="App.selectOption(${act.id},${qi},${oi},this)">
            <span class="option-letter">${String.fromCharCode(65+oi)}</span>
            <span>${opt}</span>
          </div>`;
        });
        const secHtml = q.section ? `<div class="q-section">📍 ${q.section}</div>` : '';
        qHtml += `<div class="question-card" data-qi="${qi}">
          <div class="q-number">${q.n}</div>${secHtml}
          <div class="q-text">${q.text}</div>${seqHtml}
          <div class="options">${optHtml}</div>
        </div>`;

      } else if (q.type === 'tf') {
        const savedTF = saved || {};
        let tfHtml = '';
        q.tfItems.forEach((item, ii) => {
          const vSel = savedTF[ii] === 'V';
          const fSel = savedTF[ii] === 'F';
          let vCls = vSel ? 'selected' : '';
          let fCls = fSel ? 'selected' : '';
          if (isFinished) {
            vCls = item.correct === 'V' ? (vSel ? 'correct' : '') : (vSel ? 'wrong' : '');
            fCls = item.correct === 'F' ? (fSel ? 'correct' : '') : (fSel ? 'wrong' : '');
          }
          const dis = isFinished ? 'pointer-events:none;' : '';
          tfHtml += `<div class="tf-item">
            <div class="tf-text">${item.text}</div>
            <div class="tf-buttons" style="${dis}">
              <button class="tf-btn ${vCls}" onclick="App.selectTF(${act.id},${qi},${ii},'V',this)">V</button>
              <button class="tf-btn ${fCls}" onclick="App.selectTF(${act.id},${qi},${ii},'F',this)">F</button>
            </div>
          </div>`;
        });
        qHtml += `<div class="question-card q-full" data-qi="${qi}">
          <div class="q-number">${q.n}</div>
          <div class="q-text">${q.text}</div>
          <div class="tf-options">${tfHtml}</div>
        </div>`;
      }
    });

    // Result panel
    let resultHtml = '';
    if (isFinished && savedResult) {
      const pct = Math.round(savedResult.score / act.maxScore * 100);
      const xpEarned = Gamification.calcXP(savedResult.score, act.maxScore);
      let msg = '';
      if (pct === 100) msg = '🎉 Perfeição absoluta! Você é incrível!';
      else if (pct >= 90) msg = '🌟 Quase perfeita! Você mandou muito bem!';
      else if (pct >= 75) msg = '⚡ Ótimo resultado! Continue assim, heroína!';
      else if (pct >= 55) msg = '💎 Bom progresso! Revise e tente melhorar!';
      else if (pct >= 30) msg = '📘 Bom começo! Revise o conteúdo e refaça!';
      else msg = '🌿 Continue aprendendo! Cada tentativa conta!';
      resultHtml = `<div class="result-panel show">
        <div class="result-title">✦ Resultado da Atividade ✦</div>
        <div class="result-score">${savedResult.score} / ${act.maxScore}</div>
        <div class="result-rank">${savedResult.rank_label}</div>
        <div class="result-xp">+${xpEarned} XP ganhos!</div>
        <div class="result-msg">${msg}</div>
      </div>`;
    }

    // Action buttons
    const actionHtml = isFinished
      ? `<div class="action-bar">
          <button class="btn-back" onclick="App.showIndex()">← Voltar ao Índice</button>
          <button class="btn-redo" onclick="App.redoActivity(${act.id})">🔄 Refazer</button>
         </div>`
      : `<div class="action-bar">
          <button class="btn-back" onclick="App.showIndex()">← Voltar ao Índice</button>
          <button class="btn-finish" onclick="App.finishActivity(${act.id})">✦ Concluir Atividade ✦</button>
         </div>`;

    container.innerHTML = `
      <div class="act-header">
        <div class="act-label">✦ Academia das Questões — Livro de Atividades ✦</div>
        <h2>${act.title}</h2>
        <div class="act-subtitle">${act.subtitle}</div>
        <div class="act-chapter">Capítulo 1 — A Grande Avaliação Inicial</div>
        <div class="act-medal">
          <div class="medal-label">MEDALHA DA<br>ATIVIDADE</div>
          <div class="medal-icon ${isFinished ? 'medal-spin' : ''}">${act.medal}</div>
        </div>
      </div>

      <div class="heroine-bar">
        <div class="heroine-field">
          <label>NOME DA HEROÍNA</label>
          <input type="text" value="${Auth.student?.name || ''}" readonly>
        </div>
        <div class="heroine-field" style="max-width:200px;">
          <label>DATA</label>
          <input type="text" value="${new Date().toLocaleDateString('pt-BR')}" readonly>
        </div>
      </div>

      <div class="info-row">
        <div class="info-box">
          <h4>INSTRUÇÕES DA ACADEMIA</h4>
          <ul>${act.instructions.map(i => `<li>${i}</li>`).join('')}</ul>
        </div>
        <div class="info-box">
          <h4>SISTEMA DE RANKING</h4>
          <table class="ranking-table">
            <thead><tr><th>ACERTOS</th><th>RANK</th></tr></thead>
            <tbody>${rankRows}</tbody>
          </table>
        </div>
        <div class="remember-box">
          <h4>✨ ${act.remember.title}</h4>
          <p>${act.remember.text}</p>
        </div>
      </div>

      ${resultHtml}

      <div class="questions-grid">${qHtml}</div>

      ${actionHtml}

      <div class="extra-challenge">
        <h4>⭐ DESAFIO EXTRA!</h4>
        <p>${act.extra}</p>
        <textarea class="extra-textarea" placeholder="Escreva sua resposta aqui..."></textarea>
      </div>

      <div class="academy-message">
        <span class="gem">💎</span>
        <p><strong>MENSAGEM DA ACADEMIA</strong><br>${act.msg}</p>
      </div>

      <div class="act-footer">${act.footer}</div>`;
  },

  // ── Loading screen ─────────────────────────────────────
  showLoading(show) {
    const el = document.getElementById('loading-screen');
    if (!el) return;
    if (show) el.classList.remove('hidden');
    else      el.classList.add('hidden');
  },

  // ── Install prompt ─────────────────────────────────────
  showInstallPrompt(deferredPrompt) {
    const el = document.getElementById('install-prompt');
    if (!el) return;
    el.classList.add('show');
    document.getElementById('btn-install').onclick = async () => {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      el.classList.remove('show');
    };
    document.getElementById('btn-dismiss').onclick = () => el.classList.remove('show');
  },
};
