// ═══════════════════════════════════════════════════════════════════
// Academia das Questões V3 — Evolution DB Module
// Persistência no Supabase + fallback localStorage
// ═══════════════════════════════════════════════════════════════════

// Reutiliza SUPABASE_URL, SUPABASE_KEY, sbFetch e LS de db.js

const EvoDB = {

  // ── Buscar ou criar evolução do aluno ─────────────────────────
  async getOrCreate(studentId) {
    const local = LS.get('evolution_' + studentId);

    if (studentId.startsWith('offline_')) {
      return local || EvoDB._defaultEvo(studentId);
    }

    try {
      const rows = await sbFetch(
        `student_evolution?student_id=eq.${studentId}&select=*`,
        { method: 'GET' }
      );
      if (rows && rows.length > 0) {
        LS.set('evolution_' + studentId, rows[0]);
        return rows[0];
      }
      // Criar nova
      const created = await sbFetch('student_evolution', {
        method: 'POST',
        body: JSON.stringify(EvoDB._defaultEvo(studentId)),
        prefer: 'return=representation',
      });
      const evo = Array.isArray(created) ? created[0] : created;
      LS.set('evolution_' + studentId, evo);
      return evo;
    } catch (e) {
      console.warn('EvoDB offline', e);
      return local || EvoDB._defaultEvo(studentId);
    }
  },

  _defaultEvo(studentId) {
    return {
      student_id: studentId,
      stage: 0,
      class_path: null,
      lineage: null,
      alignment: null,
      element: null,
      armor: null,
      personality: null,
      weapon: null,
      xp_total: 0,
      evolution_level: 0,
    };
  },

  // ── Salvar escolha evolutiva ───────────────────────────────────
  async saveChoice(studentId, field, value) {
    const local = LS.get('evolution_' + studentId) || EvoDB._defaultEvo(studentId);
    local[field] = value;

    // Recalcular stage
    local.stage = EvoDB._calcStage(local);
    LS.set('evolution_' + studentId, local);

    if (studentId.startsWith('offline_')) return { ok: true, evo: local };

    try {
      const rows = await sbFetch(
        `student_evolution?student_id=eq.${studentId}&select=id`,
        { method: 'GET' }
      );
      if (rows && rows.length > 0) {
        await sbFetch(`student_evolution?student_id=eq.${studentId}`, {
          method: 'PATCH',
          body: JSON.stringify({ [field]: value, stage: local.stage }),
          prefer: 'return=minimal',
        });
      } else {
        await sbFetch('student_evolution', {
          method: 'POST',
          body: JSON.stringify(local),
          prefer: 'return=minimal',
        });
      }
      return { ok: true, evo: local };
    } catch (e) {
      console.warn('saveChoice offline', e);
      DB._queueSync({ type: 'evoChoice', studentId, field, value, stage: local.stage });
      return { ok: true, evo: local, offline: true };
    }
  },

  // ── Adicionar XP evolutivo ─────────────────────────────────────
  async addXP(studentId, xpAmount) {
    const local = LS.get('evolution_' + studentId) || EvoDB._defaultEvo(studentId);
    local.xp_total += xpAmount;
    const lvInfo = getEvolutionLevel(local.xp_total);
    local.evolution_level = lvInfo.level;
    LS.set('evolution_' + studentId, local);

    if (studentId.startsWith('offline_')) return { ok: true, evo: local, levelInfo: lvInfo };

    try {
      await sbFetch(`student_evolution?student_id=eq.${studentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ xp_total: local.xp_total, evolution_level: local.evolution_level }),
        prefer: 'return=minimal',
      });
    } catch (e) {
      DB._queueSync({ type: 'evoXP', studentId, xp_total: local.xp_total, evolution_level: local.evolution_level });
    }
    return { ok: true, evo: local, levelInfo: lvInfo };
  },

  // ── Salvar progresso de história ──────────────────────────────
  async saveStoryProgress(studentId, chapterId, storyId, lastPage, completed) {
    const key   = `story_${studentId}_${chapterId}_${storyId}`;
    const local = { student_id: studentId, chapter_id: chapterId, story_id: storyId, last_page: lastPage, completed };
    LS.set(key, local);

    if (studentId.startsWith('offline_')) return { ok: true };

    try {
      await sbFetch('story_progress', {
        method: 'POST',
        body: JSON.stringify({ ...local, completed_at: completed ? new Date().toISOString() : null }),
        headers: { 'Prefer': 'resolution=merge-duplicates,return=minimal' },
      });
    } catch (e) {
      DB._queueSync({ type: 'storyProgress', ...local });
    }
    return { ok: true };
  },

  async getStoryProgress(studentId, chapterId, storyId) {
    const key = `story_${studentId}_${chapterId}_${storyId}`;
    const local = LS.get(key);
    if (studentId.startsWith('offline_')) return local;
    try {
      const rows = await sbFetch(
        `story_progress?student_id=eq.${studentId}&chapter_id=eq.${chapterId}&story_id=eq.${storyId}&select=*`,
        { method: 'GET' }
      );
      if (rows && rows.length > 0) { LS.set(key, rows[0]); return rows[0]; }
    } catch {}
    return local;
  },

  // ── Capítulos concluídos (para verificar desbloqueio de estágio) ─
  async getCompletedChapters(studentId) {
    const local = LS.get('completed_chapters_' + studentId) || [];
    if (studentId.startsWith('offline_')) return local;
    try {
      const rows = await sbFetch(
        `chapter_progress?student_id=eq.${studentId}&completed=eq.true&select=chapter_id`,
        { method: 'GET' }
      );
      const ids = (rows || []).map(r => r.chapter_id);
      LS.set('completed_chapters_' + studentId, ids);
      return ids;
    } catch { return local; }
  },

  // ── Salvar progresso de capítulo ──────────────────────────────
  async saveChapterProgress(studentId, chapterId, data) {
    const key   = `chap_progress_${studentId}_${chapterId}`;
    const local = { student_id: studentId, chapter_id: chapterId, ...data };
    LS.set(key, local);
    if (studentId.startsWith('offline_')) return { ok: true };
    try {
      await sbFetch('chapter_progress', {
        method: 'POST',
        body: JSON.stringify(local),
        headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
      });
    } catch (e) {
      DB._queueSync({ type: 'chapterProgress', studentId, chapterId, data });
    }
    return { ok: true };
  },

  // ── Verificar se estágio está desbloqueado ────────────────────
  async isStageUnlocked(studentId, stage) {
    const requiredChap = EVOLUTION_UNLOCKS[stage];
    if (!requiredChap) return true;
    const completed = await EvoDB.getCompletedChapters(studentId);
    return completed.some(c => c >= requiredChap);
  },

  // ── Calcular estágio máximo com base nas escolhas ─────────────
  _calcStage(evo) {
    if (evo.personality) return 6;
    if (evo.armor)       return 5;
    if (evo.element)     return 4;
    if (evo.alignment)   return 3;
    if (evo.lineage)     return 2;
    if (evo.class_path)  return 1;
    return 0;
  },
};
