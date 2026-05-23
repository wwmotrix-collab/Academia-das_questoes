// ═══════════════════════════════════════════════════════════
// Academia das Questões V2 — Auth Module
// ═══════════════════════════════════════════════════════════

const Auth = {
  currentStudent: null,

  // Check for saved session
  async tryAutoLogin() {
    const saved = LS.get('student');
    if (!saved || !saved.name || !saved.class_code) return false;
    Auth.currentStudent = saved;
    return true;
  },

  // Login
  async login(name, classCode) {
    if (!name || name.trim().length < 2) throw new Error('Digite seu nome completo (mínimo 2 caracteres).');
    if (!classCode || classCode.trim().length < 1) throw new Error('Digite o código da turma.');

    const result = await DB.getOrCreateStudent(name, classCode);
    if (!result.ok) throw new Error('Não foi possível fazer login. Tente novamente.');
    Auth.currentStudent = result.student;

    // Load remote data into local
    await DB.getResults(result.student.id);
    await DB.getBadges(result.student.id);

    // Try to sync queued items
    try { await DB.processSyncQueue(result.student.id); } catch {}

    return result;
  },

  // Logout
  logout() {
    Auth.currentStudent = null;
    LS.remove('student');
    LS.remove('results');
    LS.remove('badges');
    LS.remove('sync_queue');
  },

  get student() { return Auth.currentStudent || LS.get('student'); },
};
