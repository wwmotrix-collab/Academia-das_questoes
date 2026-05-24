-- ═══════════════════════════════════════════════════════════════════
-- Academia das Questões V3 — Supabase Migration SQL
-- Execute no SQL Editor do Supabase
-- NÃO remove dados existentes — apenas adiciona
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. Adicionar chapter_id em activity_results (se não existir) ───
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='activity_results' AND column_name='chapter_id'
  ) THEN
    ALTER TABLE activity_results ADD COLUMN chapter_id INTEGER DEFAULT 1;
    COMMENT ON COLUMN activity_results.chapter_id IS 'Capítulo ao qual a atividade pertence';
  END IF;
END $$;

-- ─── 2. Adicionar story_completed em activity_results (se não existir) ───
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='activity_results' AND column_name='story_completed'
  ) THEN
    ALTER TABLE activity_results ADD COLUMN story_completed BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- ─── 3. Criar tabela story_progress (histórias lidas por aluno) ───
CREATE TABLE IF NOT EXISTS story_progress (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id    UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  chapter_id    INTEGER NOT NULL,
  story_id      TEXT NOT NULL,
  completed     BOOLEAN DEFAULT FALSE,
  last_page     INTEGER DEFAULT 0,
  completed_at  TIMESTAMP WITH TIME ZONE,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, chapter_id, story_id)
);

-- ─── 4. Criar tabela student_evolution ───
CREATE TABLE IF NOT EXISTS student_evolution (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id       UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE UNIQUE,

  -- Estágio atual (0–7)
  stage            INTEGER NOT NULL DEFAULT 0,

  -- Escolhas evolutivas
  class_path       TEXT,      -- mamifero | reptil | ave
  lineage          TEXT,      -- pré-histórico | lendário | místico
  alignment        TEXT,      -- solar | lunar
  element          TEXT,      -- fogo | gelo | tempestade
  armor            TEXT,      -- tribal | celestial | mecanica
  personality      TEXT,      -- sabio | protetor | corajoso
  weapon           TEXT,      -- oculos+varinha | escudo+elmo | espada | lanca

  -- Progresso
  xp_total         INTEGER NOT NULL DEFAULT 0,
  evolution_level  INTEGER NOT NULL DEFAULT 0,

  -- Meta
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── 5. Criar tabela chapter_progress ───
CREATE TABLE IF NOT EXISTS chapter_progress (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id        UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  chapter_id        INTEGER NOT NULL,
  story_completed   BOOLEAN DEFAULT FALSE,
  activities_done   INTEGER DEFAULT 0,
  total_activities  INTEGER DEFAULT 0,
  xp_earned         INTEGER DEFAULT 0,
  completed         BOOLEAN DEFAULT FALSE,
  completed_at      TIMESTAMP WITH TIME ZONE,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, chapter_id)
);

-- ─── 6. Índices ───
CREATE INDEX IF NOT EXISTS idx_story_progress_student    ON story_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_chapter_progress_student  ON chapter_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_evolution_student ON student_evolution(student_id);

-- ─── 7. RLS ───
ALTER TABLE story_progress     ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_evolution  ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapter_progress   ENABLE ROW LEVEL SECURITY;

-- Policies anon (mesmo padrão do sistema atual)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='story_progress' AND policyname='allow_all_story_progress') THEN
    CREATE POLICY "allow_all_story_progress"  ON story_progress    FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='student_evolution' AND policyname='allow_all_evolution') THEN
    CREATE POLICY "allow_all_evolution"       ON student_evolution  FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='chapter_progress' AND policyname='allow_all_chapter_progress') THEN
    CREATE POLICY "allow_all_chapter_progress" ON chapter_progress  FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ─── 8. Updated_at triggers ───
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS evolution_updated_at       ON student_evolution;
DROP TRIGGER IF EXISTS chapter_progress_updated   ON chapter_progress;

CREATE TRIGGER evolution_updated_at
  BEFORE UPDATE ON student_evolution
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER chapter_progress_updated
  BEFORE UPDATE ON chapter_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 9. Atualizar view leaderboard para incluir capítulos ───
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  s.id, s.name, s.class_code, s.total_xp, s.current_rank,
  COUNT(DISTINCT ar.id)::INTEGER   AS activities_completed,
  COUNT(DISTINCT b.id)::INTEGER    AS badges_count,
  COUNT(DISTINCT cp.id)::INTEGER   AS chapters_started,
  COALESCE(se.stage, 0)::INTEGER   AS evolution_stage,
  se.class_path,
  se.evolution_level
FROM students s
LEFT JOIN activity_results ar ON ar.student_id = s.id
LEFT JOIN badges b             ON b.student_id  = s.id
LEFT JOIN chapter_progress cp  ON cp.student_id = s.id
LEFT JOIN student_evolution se ON se.student_id = s.id
GROUP BY s.id, s.name, s.class_code, s.total_xp, s.current_rank,
         se.stage, se.class_path, se.evolution_level
ORDER BY s.total_xp DESC;

-- ─── Confirmação ───
SELECT 'Migration V3 concluída com sucesso!' AS status;
