// ═══════════════════════════════════════════════════════════
// Academia das Questões V2 — Database (Supabase + LocalStorage)
// ═══════════════════════════════════════════════════════════

const SUPABASE_URL  = 'https://nqifdhsskestqytooeap.supabase.co';
const SUPABASE_KEY  = 'sb_publishable_DBWB3wM3SvJcsCJjcL6NoA_7hXkhWTd';
const LS_PREFIX     = 'academia_v2_';

// ── Supabase fetch helper ──────────────────────────────────
async function sbFetch(path, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const headers = {
    'apikey':        SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type':  'application/json',
    'Prefer':        options.prefer || 'return=representation',
    ...options.headers
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase error ${res.status}: ${err}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ── LocalStorage helpers ───────────────────────────────────
const LS = {
  get:    (k)    => { try { return JSON.parse(localStorage.getItem(LS_PREFIX + k)); } catch { return null; } },
  set:    (k, v) => localStorage.setItem(LS_PREFIX + k, JSON.stringify(v)),
  remove: (k)    => localStorage.removeItem(LS_PREFIX + k),
};

// ═══════════════════════════════════════════════════════════
// STUDENTS
// ═══════════════════════════════════════════════════════════

const DB = {
  // Get or create student
  async getOrCreateStudent(name, classCode) {
    const trimName  = name.trim();
    const trimClass = classCode.trim().toUpperCase();

    try {
      // Try to find existing
      const existing = await sbFetch(
        `students?name=eq.${encodeURIComponent(trimName)}&class_code=eq.${encodeURIComponent(trimClass)}&select=*`,
        { method: 'GET' }
      );
      if (existing && existing.length > 0) {
        LS.set('student', existing[0]);
        return { ok: true, student: existing[0], isNew: false };
      }

      // Create new
      const created = await sbFetch('students', {
        method: 'POST',
        body: JSON.stringify({ name: trimName, class_code: trimClass, total_xp: 0, current_rank: 'Aprendiz' }),
        prefer: 'return=representation'
      });
      const student = Array.isArray(created) ? created[0] : created;
      LS.set('student', student);
      return { ok: true, student, isNew: true };

    } catch (e) {
      console.warn('DB offline — using localStorage', e);
      // Offline fallback
      const offlineKey = `${trimName}_${trimClass}`;
      let student = LS.get('student');
      if (!student || student.name !== trimName || student.class_code !== trimClass) {
        student = {
          id: 'offline_' + offlineKey,
          name: trimName, class_code: trimClass,
          total_xp: 0, current_rank: 'Aprendiz',
          created_at: new Date().toISOString()
        };
      }
      LS.set('student', student);
      return { ok: true, student, isNew: false, offline: true };
    }
  },

  // Update student XP and rank
  async updateStudentXP(studentId, totalXP, rank) {
    LS.set('student', { ...LS.get('student'), total_xp: totalXP, current_rank: rank });
    if (studentId.startsWith('offline_')) return;
    try {
      await sbFetch(`students?id=eq.${studentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ total_xp: totalXP, current_rank: rank }),
        prefer: 'return=minimal'
      });
    } catch (e) {
      console.warn('XP update queued for sync', e);
      DB._queueSync({ type: 'updateXP', studentId, totalXP, rank });
    }
  },

  // ── Activity Results ───────────────────────────────────
  async saveResult(studentId, activityId, score, maxScore, rankLabel, answersJson) {
    const percentage = Math.round(score / maxScore * 100 * 100) / 100;
    const record = { student_id: studentId, activity_id: activityId, score, max_score: maxScore, percentage, rank_label: rankLabel, answers_json: answersJson, completed_at: new Date().toISOString() };

    // Always save locally first
    const localResults = LS.get('results') || {};
    localResults[activityId] = record;
    LS.set('results', localResults);

    if (studentId.startsWith('offline_')) return { ok: true, offline: true };
    try {
      await sbFetch('activity_results', {
        method: 'POST',
        body: JSON.stringify(record),
        prefer: 'resolution=merge-duplicates,return=representation',
        headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' }
      });
      return { ok: true };
    } catch (e) {
      console.warn('Result save queued', e);
      DB._queueSync({ type: 'saveResult', record });
      return { ok: true, offline: true };
    }
  },

  async getResults(studentId) {
    // Always check local first
    const local = LS.get('results') || {};
    if (studentId.startsWith('offline_')) return Object.values(local);
    try {
      const remote = await sbFetch(
        `activity_results?student_id=eq.${studentId}&select=*&order=activity_id.asc`,
        { method: 'GET' }
      );
      // Merge remote into local
      if (remote && remote.length > 0) {
        remote.forEach(r => { local[r.activity_id] = r; });
        LS.set('results', local);
      }
      return Object.values(local);
    } catch (e) {
      console.warn('Results fetch offline', e);
      return Object.values(local);
    }
  },

  // ── Badges ────────────────────────────────────────────
  async unlockBadge(studentId, badgeName, badgeDesc) {
    const localBadges = LS.get('badges') || [];
    if (localBadges.some(b => b.badge_name === badgeName)) return { ok: true, alreadyHas: true };

    const record = { student_id: studentId, badge_name: badgeName, badge_desc: badgeDesc, unlocked_at: new Date().toISOString() };
    localBadges.push(record);
    LS.set('badges', localBadges);

    if (studentId.startsWith('offline_')) return { ok: true, isNew: true };
    try {
      await sbFetch('badges', {
        method: 'POST',
        body: JSON.stringify(record),
        headers: { 'Prefer': 'resolution=ignore-duplicates,return=minimal' }
      });
    } catch (e) {
      DB._queueSync({ type: 'badge', record });
    }
    return { ok: true, isNew: true };
  },

  async getBadges(studentId) {
    const local = LS.get('badges') || [];
    if (studentId.startsWith('offline_')) return local;
    try {
      const remote = await sbFetch(
        `badges?student_id=eq.${studentId}&select=*`,
        { method: 'GET' }
      );
      if (remote && remote.length > 0) {
        // Merge
        remote.forEach(r => { if (!local.some(l => l.badge_name === r.badge_name)) local.push(r); });
        LS.set('badges', local);
      }
      return local;
    } catch (e) {
      return local;
    }
  },

  // ── Sync Queue ────────────────────────────────────────
  _queueSync(item) {
    const q = LS.get('sync_queue') || [];
    q.push({ ...item, queuedAt: Date.now() });
    LS.set('sync_queue', q);
  },

  async processSyncQueue(studentId) {
    const q = LS.get('sync_queue') || [];
    if (!q.length) return;
    const failed = [];
    for (const item of q) {
      try {
        if (item.type === 'updateXP') {
          await sbFetch(`students?id=eq.${item.studentId}`, {
            method: 'PATCH',
            body: JSON.stringify({ total_xp: item.totalXP, current_rank: item.rank }),
            prefer: 'return=minimal'
          });
        } else if (item.type === 'saveResult') {
          await sbFetch('activity_results', {
            method: 'POST',
            body: JSON.stringify(item.record),
            headers: { 'Prefer': 'resolution=merge-duplicates,return=minimal' }
          });
        } else if (item.type === 'badge') {
          await sbFetch('badges', {
            method: 'POST',
            body: JSON.stringify(item.record),
            headers: { 'Prefer': 'resolution=ignore-duplicates,return=minimal' }
          });
        }
      } catch { failed.push(item); }
    }
    LS.set('sync_queue', failed);
    return failed.length === 0;
  }
};
