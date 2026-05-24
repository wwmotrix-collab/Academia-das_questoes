# 🎓 Academia das Questões — V3.5 (Sistema Evolutivo MIMO)

Evolução do sistema: agora com **Árvore Evolutiva do Mimo**, múltiplos estágios de escolha, persistência no Supabase e widget integrado ao dashboard.

---

## 📁 Estrutura Completa V3

```
/
├── index.html                  ← Dashboard principal (atualizado com widget Mimo)
├── manifest.json               ← PWA (com shortcut para árvore evolutiva)
├── sw.js                       ← Service Worker V3 (cache inclui evolution/)
├── vercel.json                 ← Deploy config (serve /evolution/)
├── .gitignore
│
├── evolution/
│   └── index.html              ← 🌟 NOVO: Página da Árvore Evolutiva completa
│
├── styles/
│   ├── main.css                ← Estilos principais (V2, sem alteração)
│   ├── animations.css          ← Animações (V2, sem alteração)
│   └── evolution.css           ← 🌟 NOVO: Estilos da árvore evolutiva
│
├── scripts/
│   ├── data.js                 ← Dados das 10 atividades (V2, sem alteração)
│   ├── db.js                   ← Supabase + LocalStorage (V2, sem alteração)
│   ├── auth.js                 ← Auth (V2, sem alteração)
│   ├── gamification.js         ← XP, ranks, badges (V2, sem alteração)
│   ├── ui.js                   ← Renderização (V2, sem alteração)
│   ├── evolution_data.js       ← 🌟 NOVO: Dados dos estágios, classes, linhagens
│   ├── evolution_db.js         ← 🌟 NOVO: Supabase + LS para evolução
│   ├── evolution_widget.js     ← 🌟 NOVO: Mini widget Mimo no dashboard
│   └── app.js                  ← 🔄 ATUALIZADO: integra evolution sem quebrar V2
│
├── assets/
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
│
└── supabase/
    └── migration_v3.sql        ← 🌟 NOVO: SQL de migração segura
```

---

## 🗄️ Passo 1 — Executar SQL de Migração no Supabase

1. Acesse [supabase.com](https://supabase.com) → seu projeto
2. Clique em **SQL Editor → New query**
3. Cole o conteúdo de `supabase/migration_v3.sql`
4. Clique em **Run**

> ✅ O SQL é 100% seguro: usa `IF NOT EXISTS` e `ALTER TABLE ... ADD COLUMN` — **não apaga nenhum dado existente**.

**Tabelas criadas/alteradas:**

| Ação | Tabela/Coluna |
|------|--------------|
| ADD COLUMN | `activity_results.chapter_id` |
| ADD COLUMN | `activity_results.story_completed` |
| CREATE TABLE | `story_progress` |
| CREATE TABLE | `student_evolution` |
| CREATE TABLE | `chapter_progress` |
| CREATE OR REPLACE VIEW | `leaderboard` (expandida) |

---

## 🐙 Passo 2 — Atualizar o GitHub

```bash
cd Academia-das_questoes

# Copiar apenas os arquivos NOVOS e ALTERADOS:
# - index.html           (substituir)
# - sw.js                (substituir)
# - vercel.json          (substituir)
# - manifest.json        (substituir)
# - evolution/           (pasta nova — copiar inteira)
# - styles/evolution.css (arquivo novo)
# - scripts/evolution_data.js    (arquivo novo)
# - scripts/evolution_db.js      (arquivo novo)
# - scripts/evolution_widget.js  (arquivo novo)
# - scripts/app.js       (substituir)

git add .
git commit -m "feat: V3.5 — Sistema Evolutivo MIMO com Árvore Evolutiva, Supabase e widget"
git push origin main
```

---

## 🚀 Passo 3 — Vercel (auto-deploy)

O Vercel detecta o push no `main` e faz deploy automaticamente se já estiver conectado.

Se precisar refazer manualmente:
```bash
vercel --prod
```

---

## 🌟 Como Funciona o Sistema Evolutivo

### Fluxo
```
Aluno estuda capítulo → Completa atividade → Ganha XP → XP vai para Mimo → Desbloqueio de estágio
```

### Estágios e Desbloqueios

| Estágio | Nome | Desbloqueado no |
|---------|------|----------------|
| 0 | Origem (Mimo base) | Sempre disponível |
| 1 | Classe Evolutiva | Capítulo 2 |
| 2 | Linhagem | Capítulo 4 |
| 3 | Alinhamento | Capítulo 6 |
| 4 | Elemento | Capítulo 8 |
| 5 | Armadura | Capítulo 11 |
| 6 | Personalidade e Objeto | Capítulo 15 |
| 7 | Evolução Final | Capítulo 20 |

### Escolhas por estágio

**Estágio 1 — Classe:**
- 🦁 Mamífero — Força, coragem e lealdade
- 🦎 Réptil — Adaptação, estratégia e resistência
- 🦅 Ave — Liberdade, visão aguçada e velocidade

**Estágio 2 — Linhagem (varia por classe):**

| Classe | Pré-Histórico | Lendário | Místico |
|--------|--------------|----------|---------|
| Mamífero | Tigre Dente-de-Sabre | Leão Alado | Tigre Branco Espiritual |
| Réptil | Raptor Primevo | Dragão Alado | Dragão Serpentino |
| Ave | Argentavis Primevo | Fênix Solar | Garuda Celestial |

**Estágio 3 — Alinhamento:** ☀️ Solar / 🌙 Lunar

**Estágio 4 — Elemento:** 🔥 Fogo / ❄️ Gelo / ⚡ Tempestade

**Estágio 5 — Armadura:** 🌿 Tribal / ⭐ Celestial / ⚙️ Mecânica

**Estágio 6 — Personalidade:** 🧙 Sábio / 🛡️ Protetor / ⚔️ Corajoso

**Estágio 7 — Evolução Final:** 👑 Forma Adulta

---

## 🔧 XP Evolutivo

```
Nível 0 → 1:  100 XP
Nível 1 → 2:  150 XP
Nível 2 → 3:  200 XP
Nível N → N+1: 100 + N×50 XP
```

O XP evolutivo é separado do XP global (ranking). O aluno acumula ambos ao completar atividades.

---

## 🧩 Integração no Dashboard

O widget do Mimo é injetado automaticamente na tela principal via `EvoWidget.init()`.  
Ao clicar, navega para `/evolution/index.html`.

```
┌─────────────────────────────────────────────┐
│  🐱  Mimo                                   │
│  LV3 • 🐾 Classe Evolutiva    [🌟 Árvore]  │
│  ████████░░  70%                             │
└─────────────────────────────────────────────┘
```

---

## 🏗️ Arquitetura Escalável

### Para adicionar Capítulo 2 (futuramente):
1. Em `scripts/data.js`, adicionar segundo capítulo ao array `ACTIVITIES` com `chapter_id: 2`
2. Criar `completedChapters` com `chapter_id: 2` ao finalizar o capítulo
3. O sistema de evolução desbloqueará automaticamente o estágio correspondente

### Para criar Dashboard do Professor:
- Usar a VIEW `leaderboard` no Supabase
- Filtrar por `class_code`
- Campos `evolution_stage`, `class_path`, `evolution_level` já disponíveis

---

## ✅ Checklist de Deploy

- [ ] SQL de migração executado no Supabase
- [ ] Arquivos novos copiados para o repositório
- [ ] `git push origin main` feito
- [ ] Vercel fez deploy (verificar em vercel.com)
- [ ] Testar: login → dashboard → widget Mimo clicável → árvore evolutiva
- [ ] Testar: completar atividade → XP do Mimo atualiza → toast aparece

---

## 📞 Projeto

**Academia das Questões V3.5**  
Repositório: https://github.com/wwmotrix-collab/Academia-das_questoes  
Supabase: https://nqifdhsskestqytooeap.supabase.co
