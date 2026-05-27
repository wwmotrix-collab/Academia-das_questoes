-- ═══════════════════════════════════════════════════════════════════
-- Academia das Questões V3.8 — Supabase Migration
-- Execute no SQL Editor do Supabase
-- 100% seguro: não apaga dados existentes
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. student_question_progress — XP por questão, nunca duplicado ───
CREATE TABLE IF NOT EXISTS student_question_progress (
  id            UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id    UUID    NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  activity_id   INTEGER NOT NULL,
  question_id   INTEGER NOT NULL,   -- índice da questão dentro da atividade
  question_type TEXT    NOT NULL DEFAULT 'mc',  -- 'mc' | 'tf'
  tf_item_id    INTEGER,            -- sub-item para questões V/F (null se mc)
  selected_answer TEXT,             -- resposta selecionada (serializada)
  is_correct    BOOLEAN NOT NULL DEFAULT false,
  xp_awarded    BOOLEAN NOT NULL DEFAULT false,
  xp_amount     INTEGER NOT NULL DEFAULT 0,
  answered_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, activity_id, question_id, COALESCE(tf_item_id, -1))
);

-- ─── 2. student_activity_progress — bônus de conclusão único ──────────
CREATE TABLE IF NOT EXISTS student_activity_progress (
  id                       UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id               UUID    NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  activity_id              INTEGER NOT NULL,
  attempts                 INTEGER NOT NULL DEFAULT 0,
  best_score               INTEGER NOT NULL DEFAULT 0,
  best_max_score           INTEGER NOT NULL DEFAULT 0,
  total_xp_earned          INTEGER NOT NULL DEFAULT 0,
  completion_bonus_awarded BOOLEAN NOT NULL DEFAULT false,
  first_completed_at       TIMESTAMP WITH TIME ZONE,
  last_attempted_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, activity_id)
);

-- ─── 3. Adicionar campos de mascote na tabela students ─────────────────
DO $$
BEGIN
  -- mascot base
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='mascot_base') THEN
    ALTER TABLE students ADD COLUMN mascot_base TEXT NOT NULL DEFAULT 'mimo';
  END IF;
  -- mascot stage
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='mascot_stage') THEN
    ALTER TABLE students ADD COLUMN mascot_stage INTEGER NOT NULL DEFAULT 0;
  END IF;
  -- mascot class
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='mascot_class') THEN
    ALTER TABLE students ADD COLUMN mascot_class TEXT;
  END IF;
  -- mascot lineage
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='mascot_lineage') THEN
    ALTER TABLE students ADD COLUMN mascot_lineage TEXT;
  END IF;
  -- mascot alignment
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='mascot_alignment') THEN
    ALTER TABLE students ADD COLUMN mascot_alignment TEXT;
  END IF;
  -- mascot element
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='mascot_element') THEN
    ALTER TABLE students ADD COLUMN mascot_element TEXT;
  END IF;
  -- mascot armor
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='mascot_armor') THEN
    ALTER TABLE students ADD COLUMN mascot_armor TEXT;
  END IF;
  -- mascot personality
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='mascot_personality') THEN
    ALTER TABLE students ADD COLUMN mascot_personality TEXT;
  END IF;
  -- mascot final unlocked
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='mascot_final_unlocked') THEN
    ALTER TABLE students ADD COLUMN mascot_final_unlocked BOOLEAN NOT NULL DEFAULT false;
  END IF;
  -- mascot xp progress (XP acumulado especificamente para evolução)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='mascot_xp_progress') THEN
    ALTER TABLE students ADD COLUMN mascot_xp_progress INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- ─── 4. Índices de performance ──────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_sqp_student_activity
  ON student_question_progress(student_id, activity_id);

CREATE INDEX IF NOT EXISTS idx_sqp_student_activity_question
  ON student_question_progress(student_id, activity_id, question_id);

CREATE INDEX IF NOT EXISTS idx_sap_student
  ON student_activity_progress(student_id);

-- ─── 5. RLS ─────────────────────────────────────────────────────────────
ALTER TABLE student_question_progress  ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_activity_progress  ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='student_question_progress' AND policyname='allow_all_sqp') THEN
    CREATE POLICY "allow_all_sqp" ON student_question_progress FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='student_activity_progress' AND policyname='allow_all_sap') THEN
    CREATE POLICY "allow_all_sap" ON student_activity_progress FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ─── 6. Updated_at trigger ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sqp_updated_at ON student_question_progress;
CREATE TRIGGER sqp_updated_at
  BEFORE UPDATE ON student_question_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 7. View: XP real por aluno (sem duplicatas) ────────────────────────
CREATE OR REPLACE VIEW student_xp_summary AS
SELECT
  s.id                              AS student_id,
  s.name,
  s.class_code,
  s.total_xp,
  s.current_rank,
  s.mascot_stage,
  s.mascot_class,
  COALESCE(SUM(sqp.xp_amount) FILTER (WHERE sqp.xp_awarded = true), 0)::INTEGER AS xp_from_questions,
  COALESCE(SUM(sap.total_xp_earned), 0)::INTEGER                                 AS xp_from_activities,
  COUNT(DISTINCT sqp.activity_id)::INTEGER                                        AS activities_attempted,
  COUNT(DISTINCT CASE WHEN sap.completion_bonus_awarded THEN sap.activity_id END)::INTEGER AS activities_completed
FROM students s
LEFT JOIN student_question_progress sqp ON sqp.student_id = s.id
LEFT JOIN student_activity_progress sap ON sap.student_id = s.id
GROUP BY s.id, s.name, s.class_code, s.total_xp, s.current_rank, s.mascot_stage, s.mascot_class;

-- ─── Confirmação ────────────────────────────────────────────────────────
SELECT 'Migration V3.8 executada com sucesso!' AS status;
