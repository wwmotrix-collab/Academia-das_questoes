# 🐱 Academia das Questões — V3.8
## Sistema evolutivo visual + XP por questão única

---

## 📋 O que foi implementado

### 1. XP Engine — sem duplicatas por questão (`xp-engine.js`)
Cada questão só pode conceder XP **uma única vez**. Refazer atividades é permitido para estudo, mas sem XP extra em questões já premiadas.

**Regra:**
```
Aluna acerta questão → xp_awarded = true → +10 XP
Refaz e erra mesma questão → xp_awarded mantido → 0 XP
Refaz e acerta questão que errou antes → xp_awarded false → torna true → +10 XP
Refaz questão já com xp_awarded = true → sem XP extra
```

### 2. Mascot Resolver — asset path dinâmico (`mascot-resolver.js`)
Resolve o arquivo PNG correto com base nas escolhas evolutivas e renderiza a barra de progresso no dashboard.

### 3. Dashboard Bar — barra evolutiva visual (`mascot-bar.css`)
Mostra no dashboard:
- Imagem atual do Mimo
- Nome da forma atual
- Barra de progresso para próxima evolução
- "Faltam X atividades para a próxima evolução"
- Botão "Evoluir →" quando disponível

### 4. Migração Supabase — tabelas e campos (`migration_v38.sql`)

---

## 📁 Arquivos desta versão

### Copiar no repositório:
```
/index.html                          ← atualizado
/sw.js                               ← atualizado (v38 cache)

/styles/mascot-bar.css               ← NOVO

/scripts/xp-engine.js                ← NOVO
/scripts/mascot-resolver.js          ← NOVO
/scripts/app.js                      ← atualizado (XPEngine + MascotResolver)
```

### Não alterar (permanecem iguais):
```
main.css · animations.css · evolution.css · mimo-evolution.css
data.js · db.js · auth.js · gamification.js · ui.js
evolution_data.js · evolution_db.js · evolution_widget.js · mimo-evolution.js
evolution/index.html
manifest.json · vercel.json
```

---

## 🗄️ Supabase — Executar SQL

1. Acesse o projeto Supabase → **SQL Editor**
2. Cole o conteúdo de `supabase/migration_v38.sql`
3. Clique em **Run**

**Tabelas criadas:**

| Tabela | Propósito |
|--------|-----------|
| `student_question_progress` | XP por questão, com flag `xp_awarded` |
| `student_activity_progress` | Bônus de conclusão único por atividade |

**Colunas adicionadas em `students`:**
`mascot_base`, `mascot_stage`, `mascot_class`, `mascot_lineage`, `mascot_alignment`, `mascot_element`, `mascot_armor`, `mascot_personality`, `mascot_final_unlocked`, `mascot_xp_progress`

---

## 🖼️ Estrutura de assets do Mimo

Crie esta estrutura na pasta `/assets/mascots/mimo/` do repositório e adicione as imagens PNG:

```
/assets/mascots/mimo/
├── stage-0/
│   └── origem.png                  ← Mimo gato branco base
│
├── stage-1/
│   ├── mamifero.png                ← Mimo classe Mamífero
│   ├── reptil.png                  ← Mimo classe Réptil
│   └── ave.png                     ← Mimo classe Ave
│
├── stage-2/
│   ├── mamifero/
│   │   ├── prehistorico.png        ← Tigre Dente-de-Sabre
│   │   ├── lendario.png            ← Leão Alado
│   │   └── mistico.png             ← Tigre Branco Espiritual
│   ├── reptil/
│   │   ├── prehistorico.png        ← Raptor Primevo
│   │   ├── lendario.png            ← Dragão Alado
│   │   └── mistico.png             ← Dragão Serpentino
│   └── ave/
│       ├── prehistorico.png        ← Argentavis Primevo
│       ├── lendario.png            ← Fênix Solar
│       └── mistico.png             ← Garuda Celestial
│
├── stage-3/
│   ├── solar.png
│   └── lunar.png
│
├── stage-4/
│   ├── fogo.png
│   ├── gelo.png
│   └── tempestade.png
│
├── stage-5/
│   ├── tribal.png
│   ├── celestial.png
│   └── mecanica.png
│
├── stage-6/
│   ├── sabio.png
│   ├── protetor.png
│   └── corajoso.png
│
└── stage-7/
    └── final.png                   ← Forma adulta/final
```

**Fallback automático:** Se um PNG não existir, o sistema usa os `.webp` da pasta `/assets/mascots/` (V3.6/V3.7). Se esses também falharem, exibe um badge de texto discreto — nunca quebra.

**Formatos suportados:** PNG (preferido) e WebP (o resolver tenta WebP primeiro se `.png` falhar). Fundo transparente recomendado.

---

## 🔢 XP detalhado no modal de resultado

Ao concluir uma atividade, o modal agora mostra:

```
DETALHES DO XP
Questões corretas inéditas   +50 XP
Bônus de conclusão           +50 XP
───────────────────────────────────
XP ganho hoje                +100 XP
```

Se a aluna refizer e não tiver questões novas:
```
DETALHES DO XP
Questões corretas inéditas    0 XP
Já premiadas (sem duplicata)  6 questão(ões)
───────────────────────────────────
XP ganho hoje                  0 XP
```

---

## 🎮 Dashboard bar — comportamentos

| Estado | Exibição |
|--------|----------|
| XP insuficiente | Barra de progresso + "Faltam X atividades" |
| XP suficiente | "Mimo pode evoluir!" + botão "Evoluir →" |
| Evolução final alcançada | "Mimo Completo! 👑" |

Clicar na barra abre o painel evolutivo do Mimo.

---

## 🚀 Deploy

```bash
cd Academia-das_questoes

# 1. Executar SQL no Supabase (migration_v38.sql)

# 2. Copiar os arquivos desta versão
git add .
git commit -m "feat: V3.8 — XP por questão única, mascot resolver, dashboard bar evolutiva"
git push origin main
```

Vercel faz deploy automático. ✓

---

## ✅ Checklist de verificação

- [ ] SQL executado no Supabase sem erros
- [ ] Dashboard mostra barra do Mimo com imagem
- [ ] Barra mostra "Faltam X atividades" corretamente
- [ ] Completar atividade → modal mostra "X de Y" com Y dinâmico
- [ ] Modal mostra detalhes de XP (questões inéditas vs já premiadas)
- [ ] Refazer atividade com questões já premiadas → XP = 0 para elas
- [ ] Refazer atividade com questões erradas → XP ganho apenas nas novas
- [ ] Console: nenhum erro visível para a criança (apenas console.warn)
- [ ] Imagem do Mimo muda ao escolher classe na árvore evolutiva
- [ ] Fallback elegante se imagem PNG não existir
- [ ] Mobile: barra responsiva e legível

---

**Academia das Questões V3.8**
Repo: https://github.com/wwmotrix-collab/Academia-das_questoes
Supabase: https://nqifdhsskestqytooeap.supabase.co
