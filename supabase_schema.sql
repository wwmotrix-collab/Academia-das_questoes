-- ═══════════════════════════════════════════════════════════
-- Academia das Questões — Supabase Schema
-- Execute este SQL no SQL Editor do Supabase
-- ═══════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- STUDENTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  class_code    TEXT NOT NULL,
  total_xp      INTEGER NOT NULL DEFAULT 0,
  current_rank  TEXT NOT NULL DEFAULT 'Aprendiz',
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, class_code)
);

-- ─────────────────────────────────────────────────────────────
-- ACTIVITY RESULTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_results (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id    UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  activity_id   INTEGER NOT NULL,
  score         INTEGER NOT NULL DEFAULT 0,
  max_score     INTEGER NOT NULL DEFAULT 20,
  percentage    NUMERIC(5,2) NOT NULL DEFAULT 0,
  rank_label    TEXT NOT NULL DEFAULT 'Aprendiz',
  answers_json  JSONB,
  completed_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, activity_id)
);

-- ─────────────────────────────────────────────────────────────
-- BADGES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS badges (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id    UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  badge_name    TEXT NOT NULL,
  badge_desc    TEXT,
  unlocked_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, badge_name)
);

-- ─────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_activity_results_student ON activity_results(student_id);
CREATE INDEX IF NOT EXISTS idx_badges_student ON badges(student_id);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_code);

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- Allow full anon access (simple student auth — no JWT)
CREATE POLICY "allow_all_students" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_results"  ON activity_results FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_badges"   ON badges FOR ALL USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- LEADERBOARD VIEW (para dashboard futuro)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  s.id,
  s.name,
  s.class_code,
  s.total_xp,
  s.current_rank,
  COUNT(ar.id)::INTEGER AS activities_completed,
  COUNT(b.id)::INTEGER  AS badges_count
FROM students s
LEFT JOIN activity_results ar ON ar.student_id = s.id
LEFT JOIN badges b ON b.student_id = s.id
GROUP BY s.id, s.name, s.class_code, s.total_xp, s.current_rank
ORDER BY s.total_xp DESC;
