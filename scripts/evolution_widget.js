// ═══════════════════════════════════════════════════════════════════
// Academia das Questões V3 — Evolution Widget
// Injetado na tela principal (index) para mostrar o MIMO do aluno
// ═══════════════════════════════════════════════════════════════════

const EvoWidget = {

  currentEvo: null,

  // ── Load and render the mini widget ──────────────────────────
  async init(student) {
    try {
      EvoWidget.currentEvo = await EvoDB.getOrCreate(student.id);
    } catch (e) {
      console.warn('EvoWidget: could not load evolution', e);
      EvoWidget.currentEvo = EvoDB._defaultEvo(student.id);
    }
    EvoWidget.render();
  },

  // ── Render mini widget into #mimo-widget-slot ─────────────────
  render() {
    const slot = document.getElementById('mimo-widget-slot');
    if (!slot) return;

    const evo  = EvoWidget.currentEvo;
    if (!evo) return;

    const mimo   = getMimoDescription(evo);
    const lvInfo = getEvolutionLevel(evo.xp_total || 0);
    const stageInfo = STAGE_LABELS[evo.stage] || STAGE_LABELS[0];

    slot.innerHTML = `
    <div class="mimo-mini-widget" onclick="window.location.href='/evolution/index.html'" role="button" tabindex="0" aria-label="Ver Árvore Evolutiva do Mimo">
      <div class="mimo-mini-emoji">${mimo.emoji}</div>
      <div class="mimo-mini-info">
        <div class="mimo-mini-name">${mimo.name}</div>
        <div class="mimo-mini-level">LV${lvInfo.level} • ${stageInfo.icon} ${stageInfo.name}</div>
        <div class="mimo-mini-bar-track">
          <div class="mimo-mini-bar-fill" style="width:${lvInfo.percentage}%"></div>
        </div>
      </div>
      <div class="mimo-mini-btn">🌟 Árvore<br>Evolutiva</div>
    </div>`;
  },

  // ── Called after finishing an activity (add XP to evolution) ──
  async onActivityComplete(studentId, xpEarned) {
    try {
      const result = await EvoDB.addXP(studentId, xpEarned);
      EvoWidget.currentEvo = result.evo;
      EvoWidget.render();

      // Check if leveled up
      const prev = getEvolutionLevel((result.evo.xp_total || 0) - xpEarned);
      const next = result.levelInfo;
      if (next.level > prev.level) {
        return { levelUp: true, newLevel: next.level };
      }
    } catch (e) {
      console.warn('EvoWidget.onActivityComplete error', e);
    }
    return { levelUp: false };
  },

  // ── Check if a new evolution stage was unlocked ───────────────
  async checkStageUnlock(studentId) {
    const completedChapters = await EvoDB.getCompletedChapters(studentId);
    const evo = EvoWidget.currentEvo;
    if (!evo) return null;

    for (const [stage, reqCap] of Object.entries(EVOLUTION_UNLOCKS)) {
      const stageNum = parseInt(stage);
      if (stageNum <= evo.stage) continue; // already past this
      if (!reqCap) continue;
      if (completedChapters.some(c => c >= reqCap)) {
        // New stage unlocked!
        return { stage: stageNum, stageInfo: STAGE_LABELS[stageNum] };
      }
    }
    return null;
  },
};

// ── Patch: inject MIMO widget slot into index screen ─────────────
// This runs after the index screen renders. Call from App.showIndex()
function injectMimoWidgetSlot() {
  const grid = document.getElementById('activities-grid');
  if (!grid) return;

  // Check if slot already exists
  if (document.getElementById('mimo-widget-slot')) return;

  // Insert before the activities grid
  const slot = document.createElement('div');
  slot.id = 'mimo-widget-slot';
  grid.parentElement.insertBefore(slot, grid);
}

window.EvoWidget = window.EvoWidget || {
  init: function () {
    console.warn("EvoWidget fallback ativo");
  },
  render: function () {},
  update: function () {},
  refresh: function () {}
};
