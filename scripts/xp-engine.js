// ═══════════════════════════════════════════════════════════════════
// Academia das Questões V3.8 — XP Engine
// Regra: cada questão concede XP apenas uma vez, mesmo após refazer
// Persistência: localStorage (offline) + Supabase (online)
// ═══════════════════════════════════════════════════════════════════

'use strict';

const XP_PER_QUESTION = 10;   // XP base por questão correta inédita
const XP_COMPLETION_BONUS = 50; // bônus por completar atividade pela 1ª vez
const XP_PERFECT_BONUS    = 30; // bônus extra por 100% na primeira tentativa

/* ── localStorage keys ── */
const LS_QP_PREFIX  = 'academia_qp_';   // question progress por aluno+atividade
const LS_AP_PREFIX  = 'academia_ap_';   // activity progress por aluno+atividade

/* ─────────────────────────────────────────────────────────────────
   XPEngine — core object
   ───────────────────────────────────────────────────────────────── */
const XPEngine = {

  /* ── Build composite key ────────────────────────────────────── */
  _qKey(studentId, actId)   { return `${LS_QP_PREFIX}${studentId}_${actId}`; },
  _apKey(studentId, actId)  { return `${LS_AP_PREFIX}${studentId}_${actId}`; },

  /* ── Load/save question progress map ────────────────────────── */
  // Format: { "qi": { isCorrect, xpAwarded, xpAmount }, "qi_ii": {...} }
  _loadQP(studentId, actId) {
    try {
      return JSON.parse(localStorage.getItem(this._qKey(studentId, actId))) || {};
    } catch { return {}; }
  },
  _saveQP(studentId, actId, qp) {
    try { localStorage.setItem(this._qKey(studentId, actId), JSON.stringify(qp)); } catch {}
  },

  /* ── Load/save activity progress ────────────────────────────── */
  _loadAP(studentId, actId) {
    try {
      return JSON.parse(localStorage.getItem(this._apKey(studentId, actId))) || {
        attempts: 0, bestScore: 0, bestMaxScore: 0,
        totalXpEarned: 0, completionBonusAwarded: false, firstCompletedAt: null,
      };
    } catch {
      return { attempts:0, bestScore:0, bestMaxScore:0, totalXpEarned:0, completionBonusAwarded:false, firstCompletedAt:null };
    }
  },
  _saveAP(studentId, actId, ap) {
    try { localStorage.setItem(this._apKey(studentId, actId), JSON.stringify(ap)); } catch {}
  },

  /* ════════════════════════════════════════════════════════════
     calculateXP — main function called from app.js
     Returns { xpEarned, breakdown, newlyCorrect, alreadyCorrect }
     ════════════════════════════════════════════════════════════ */
  calculateXP(studentId, actId, answers, questions, isPerfect) {
    const qp = this._loadQP(studentId, actId);
    const ap = this._loadAP(studentId, actId);

    let xpEarned      = 0;
    let newlyCorrect  = 0;   // questões corretas pela 1ª vez nesta tentativa
    let alreadyCorrect = 0;  // questões que já tinham XP — não ganham de novo

    // Process each question/sub-item
    questions.forEach((q, qi) => {
      if (q.type === 'mc') {
        const key      = String(qi);
        const correct  = answers[qi] === q.correct;
        const existing = qp[key] || { isCorrect: false, xpAwarded: false, xpAmount: 0 };

        if (correct) {
          if (!existing.xpAwarded) {
            // First time correct → award XP
            xpEarned += XP_PER_QUESTION;
            newlyCorrect++;
            qp[key] = { isCorrect: true, xpAwarded: true, xpAmount: XP_PER_QUESTION };
          } else {
            // Already had XP → no duplicate
            alreadyCorrect++;
            qp[key].isCorrect = true;
          }
        } else {
          // Wrong answer — update record but no XP
          if (!existing.xpAwarded) {
            qp[key] = { ...existing, isCorrect: false };
          }
          // If was previously correct (xpAwarded=true) and now wrong,
          // we keep xpAwarded=true (they already earned it)
        }

      } else if (q.type === 'tf') {
        (q.tfItems || []).forEach((item, ii) => {
          const key     = `${qi}_${ii}`;
          const saved   = answers[qi] || {};
          const correct = saved[ii] === item.correct;
          const existing = qp[key] || { isCorrect: false, xpAwarded: false, xpAmount: 0 };

          if (correct) {
            if (!existing.xpAwarded) {
              xpEarned += XP_PER_QUESTION;
              newlyCorrect++;
              qp[key] = { isCorrect: true, xpAwarded: true, xpAmount: XP_PER_QUESTION };
            } else {
              alreadyCorrect++;
              qp[key].isCorrect = true;
            }
          } else {
            if (!existing.xpAwarded) {
              qp[key] = { ...existing, isCorrect: false };
            }
          }
        });
      }
    });

    // Completion bonus — only once per activity
    let completionBonusXP = 0;
    const totalItems = this._countItems(questions);
    const correct    = this._countCorrect(qp);
    const isComplete = correct >= totalItems * 0.5; // ≥50% = considered complete

    if (isComplete && !ap.completionBonusAwarded) {
      completionBonusXP = XP_COMPLETION_BONUS;
      xpEarned += completionBonusXP;
      ap.completionBonusAwarded = true;
      ap.firstCompletedAt = new Date().toISOString();
    }

    // Perfect bonus — only on first perfect attempt
    let perfectBonusXP = 0;
    if (isPerfect && !ap.completionBonusAwarded) {
      // Note: completionBonusAwarded just got set above if first complete
      // Perfect bonus is separate — check if all items already had xpAwarded
      const allPreviouslyCorrect = alreadyCorrect === correct;
      if (!allPreviouslyCorrect) {
        perfectBonusXP = XP_PERFECT_BONUS;
        xpEarned += perfectBonusXP;
      }
    }

    // Update activity progress
    const score    = this._countCurrentCorrect(answers, questions);
    const maxScore = totalItems;
    ap.attempts++;
    ap.lastAttemptedAt = new Date().toISOString();
    if (score > ap.bestScore) { ap.bestScore = score; ap.bestMaxScore = maxScore; }
    ap.totalXpEarned += xpEarned;

    // Persist locally
    this._saveQP(studentId, actId, qp);
    this._saveAP(studentId, actId, ap);

    return {
      xpEarned,
      newlyCorrect,
      alreadyCorrect,
      completionBonusXP,
      perfectBonusXP,
      totalXpEarned:  ap.totalXpEarned,
      attempts:        ap.attempts,
    };
  },

  /* ── Count helpers ──────────────────────────────────────────── */
  _countItems(questions) {
    let n = 0;
    questions.forEach(q => {
      if (q.type === 'mc') n++;
      else if (q.type === 'tf') n += (q.tfItems || []).length;
    });
    return n;
  },

  _countCurrentCorrect(answers, questions) {
    let n = 0;
    questions.forEach((q, qi) => {
      if (q.type === 'mc' && answers[qi] === q.correct) n++;
      else if (q.type === 'tf') {
        (q.tfItems || []).forEach((item, ii) => {
          if ((answers[qi] || {})[ii] === item.correct) n++;
        });
      }
    });
    return n;
  },

  _countCorrect(qp) {
    return Object.values(qp).filter(v => v.xpAwarded).length;
  },

  /* ── Get previous answers for re-do ────────────────────────── */
  getPreviousAnswers(studentId, actId) {
    return this._loadQP(studentId, actId);
  },

  /* ── Check if a specific question has already earned XP ─────── */
  hasEarnedXP(studentId, actId, qi, ii = null) {
    const qp  = this._loadQP(studentId, actId);
    const key = ii !== null ? `${qi}_${ii}` : String(qi);
    return qp[key]?.xpAwarded === true;
  },

  /* ── Activity summary for UI ────────────────────────────────── */
  getActivitySummary(studentId, actId, questions) {
    const qp   = this._loadQP(studentId, actId);
    const ap   = this._loadAP(studentId, actId);
    const total = this._countItems(questions);
    const earned = this._countCorrect(qp);
    return {
      totalItems:              total,
      questionsWithXP:         earned,
      questionsRemaining:      total - earned,
      attempts:                ap.attempts,
      totalXpEarned:           ap.totalXpEarned,
      completionBonusAwarded:  ap.completionBonusAwarded,
      pctComplete:             total > 0 ? Math.round(earned / total * 100) : 0,
    };
  },

  /* ════════════════════════════════════════════════════════════
     Supabase sync — fire-and-forget, silent on error
     ════════════════════════════════════════════════════════════ */
  async syncToSupabase(studentId, actId, answers, questions, xpResult) {
    if (typeof sbFetch !== 'function') return;
    if (!studentId || studentId.startsWith('offline_')) return;

    try {
      const qp    = this._loadQP(studentId, actId);
      const now   = new Date().toISOString();
      const rows  = [];

      questions.forEach((q, qi) => {
        if (q.type === 'mc') {
          const key = String(qi);
          const rec = qp[key] || {};
          rows.push({
            student_id:    studentId,
            activity_id:   actId,
            question_id:   qi,
            question_type: 'mc',
            tf_item_id:    null,
            selected_answer: String(answers[qi] ?? ''),
            is_correct:    rec.isCorrect   || false,
            xp_awarded:    rec.xpAwarded   || false,
            xp_amount:     rec.xpAmount    || 0,
            answered_at:   now,
          });
        } else if (q.type === 'tf') {
          (q.tfItems || []).forEach((_, ii) => {
            const key = `${qi}_${ii}`;
            const rec = qp[key] || {};
            rows.push({
              student_id:    studentId,
              activity_id:   actId,
              question_id:   qi,
              question_type: 'tf',
              tf_item_id:    ii,
              selected_answer: String((answers[qi] || {})[ii] ?? ''),
              is_correct:    rec.isCorrect   || false,
              xp_awarded:    rec.xpAwarded   || false,
              xp_amount:     rec.xpAmount    || 0,
              answered_at:   now,
            });
          });
        }
      });

      // Upsert question progress
      if (rows.length > 0) {
        await sbFetch('student_question_progress', {
          method: 'POST',
          body: JSON.stringify(rows),
          headers: { 'Prefer': 'resolution=merge-duplicates,return=minimal' },
        });
      }

      // Upsert activity progress
      const ap = this._loadAP(studentId, actId);
      await sbFetch('student_activity_progress', {
        method: 'POST',
        body: JSON.stringify({
          student_id:               studentId,
          activity_id:              actId,
          attempts:                 ap.attempts,
          best_score:               ap.bestScore,
          best_max_score:           ap.bestMaxScore,
          total_xp_earned:          ap.totalXpEarned,
          completion_bonus_awarded: ap.completionBonusAwarded,
          first_completed_at:       ap.firstCompletedAt,
          last_attempted_at:        ap.lastAttemptedAt,
        }),
        headers: { 'Prefer': 'resolution=merge-duplicates,return=minimal' },
      });

    } catch (e) {
      console.warn('[XPEngine] Supabase sync (non-critical):', e);
      // Queue for retry
      try {
        if (typeof DB !== 'undefined' && typeof DB._queueSync === 'function') {
          DB._queueSync({ type: 'xpSync', studentId, actId });
        }
      } catch {}
    }
  },

  /* ── Load question progress from Supabase on login ──────────── */
  async loadFromSupabase(studentId) {
    if (typeof sbFetch !== 'function') return;
    if (!studentId || studentId.startsWith('offline_')) return;

    try {
      // Load question progress
      const qpRows = await sbFetch(
        `student_question_progress?student_id=eq.${studentId}&select=*`,
        { method: 'GET' }
      );

      if (qpRows && qpRows.length > 0) {
        // Group by activity_id
        const byActivity = {};
        qpRows.forEach(row => {
          const actId = row.activity_id;
          if (!byActivity[actId]) byActivity[actId] = {};
          const key = row.tf_item_id !== null ? `${row.question_id}_${row.tf_item_id}` : String(row.question_id);
          byActivity[actId][key] = {
            isCorrect:  row.is_correct,
            xpAwarded:  row.xp_awarded,
            xpAmount:   row.xp_amount,
          };
        });
        // Merge into localStorage (remote wins on conflict)
        Object.entries(byActivity).forEach(([actId, qp]) => {
          this._saveQP(studentId, actId, qp);
        });
      }

      // Load activity progress
      const apRows = await sbFetch(
        `student_activity_progress?student_id=eq.${studentId}&select=*`,
        { method: 'GET' }
      );
      if (apRows && apRows.length > 0) {
        apRows.forEach(row => {
          this._saveAP(studentId, row.activity_id, {
            attempts:               row.attempts,
            bestScore:              row.best_score,
            bestMaxScore:           row.best_max_score,
            totalXpEarned:          row.total_xp_earned,
            completionBonusAwarded: row.completion_bonus_awarded,
            firstCompletedAt:       row.first_completed_at,
            lastAttemptedAt:        row.last_attempted_at,
          });
        });
      }

    } catch (e) {
      console.warn('[XPEngine] loadFromSupabase (non-critical):', e);
    }
  },
};

window.XPEngine = XPEngine;
