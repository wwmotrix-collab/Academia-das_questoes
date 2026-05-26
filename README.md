# 🐱 Academia das Questões — V3.7.1 (Hotfix Questões + Evolução por XP)

Corrige os dois bugs críticos reportados e entrega o modal de escolha evolutiva funcional.

---

## 🐛 O que foi corrigido

### Bug 1 — "12 de 20 questões" (resultado fixo errado)

**Causa:** `max_score` era passado como valor fixo (`20`) em vários lugares.

**Correção em `app.js`:**
```js
// ANTES (errado)
const realMaxScore = act.maxScore; // podia ser 20 fixo

// DEPOIS (correto) — V3.7.1
const realMaxScore = totalItems; // sempre questions.length + tfItems
```

Todos os cálculos agora usam o total real:
- `correctAnswers / realMaxScore` → percentual correto
- `"Você acertou X de Y"` → Y é dinâmico
- XP ganho proporcional ao total real
- Salvo no Supabase com `max_score` correto

---

### Bug 2 — Evolução não libera mesmo com XP suficiente

**Causa:** Sistema antigo dependia de `completedChapters` (capítulos) para desbloquear, não de XP.

**Correção em `mimo-evolution.js`:**

```js
// Thresholds por XP total — SEM dependência de capítulos
const EVO_THRESHOLDS = {
  class_path:   100,
  lineage:      300,
  alignment:    600,
  element:      900,
  armor:        1300,
  personality:  1800,
  final:        2400,
};

// getFieldState() — lógica correta
getFieldState(evo, field, xp) {
  if (evo[field])          return { state:'done',      label: evo[field] };
  if (xp >= threshold)     return { state:'available', label: 'Disponível para escolher!' };
  return                          { state:'locked',     label: `Precisa de ${threshold} XP` };
}
```

**Visual corrigido na árvore:**
- ✓ **Escolhido** → verde, mostra o valor escolhido
- 🔓 **Disponível** → dourado, botão "Escolher →" visível e funcional
- 🔒 **Bloqueado** → roxo/acinzentado, mostra XP necessário

---

## 📦 Arquivos desta versão

Copie **somente estes** sobre o repositório:

```
/index.html                      ← atualizado (ordem de scripts)
/sw.js                           ← atualizado (cache v371)

/styles/mimo-evolution.css       ← atualizado (+ choice modal styles)

/scripts/mimo-evolution.js       ← REESCRITO (desbloqueio por XP + modal)
/scripts/app.js                  ← REESCRITO (contagem dinâmica de questões)
```

### NÃO alterar (permanecem iguais)
```
main.css · animations.css · evolution.css
data.js · db.js · auth.js · gamification.js · ui.js
evolution_data.js · evolution_db.js · evolution_widget.js
evolution/index.html
manifest.json · vercel.json
assets/mascots/*.webp
assets/icons/*
```

---

## 🚀 Deploy

```bash
cd Academia-das_questoes

# Copiar os 5 arquivos do ZIP
git add .
git commit -m "fix: V3.7.1 — questões dinâmicas, evolução por XP, modal de escolha"
git push origin main
```

Vercel detecta o push e faz deploy automático. ✓

---

## 🌟 Modal de escolha evolutiva

### Como funciona agora

1. Aluna acumula XP completando atividades
2. Ao cruzar threshold → Mimo bounce + balão "Posso evoluir!"
3. Aluna clica no Mimo → painel abre na aba "Evoluções"
4. Campo disponível mostra botão **"Escolher →"**
5. Clique abre o **modal de escolha** com as opções:
   - Ícone grande da opção
   - Nome + descrição
   - Clique escolhe, salva local + Supabase
6. Mimo muda de imagem (se classe escolhida)
7. Painel atualiza com a escolha registrada

### Thresholds de XP

| XP total | Estágio |
|----------|---------|
| 100 XP  | 🐾 Classe Evolutiva (Mamífero / Réptil / Ave) |
| 300 XP  | 🧬 Linhagem (depende da classe) |
| 600 XP  | 🌙 Alinhamento (Solar / Lunar) |
| 900 XP  | ⚡ Elemento (Fogo / Gelo / Tempestade) |
| 1300 XP | 🛡️ Armadura (Tribal / Celestial / Mecânica) |
| 1800 XP | ❤️ Personalidade (Sábio / Protetor / Corajoso) |
| 2400 XP | 👑 Evolução Final |

---

## 💾 Persistência da evolução

### localStorage
Chave: `academia_mimo_evolution`

```json
{
  "stage": 2,
  "class_path": "mamifero",
  "lineage": "lendario",
  "alignment": null,
  "element": null,
  "armor": null,
  "personality": null,
  "updatedAt": "2025-05-25T10:00:00.000Z"
}
```

### Supabase
Salvo silenciosamente via `EvoDB.saveChoice()` ou direto via `sbFetch()`.
Qualquer erro de rede vai apenas para `console.warn` — nunca aparece para a criança.

---

## ✅ Checklist de verificação

- [ ] Login sem erros no console
- [ ] Dashboard carrega sem `"EvoWidget is not defined"`
- [ ] Completar atividade: resultado mostra `"X de Y"` com Y = total real da atividade
- [ ] XP ganho proporcional ao total real (não a 20 fixo)
- [ ] Com 100+ XP: campo "Classe" aparece como 🔓 Disponível no painel
- [ ] Botão "Escolher →" abre o modal de escolha
- [ ] Modal mostra Mamífero / Réptil / Ave com ícones e descrições
- [ ] Escolher Mamífero → Mimo muda para `mimo-mammal.webp`
- [ ] Com 660+ XP: Classe + Linhagem + Alinhamento disponíveis
- [ ] Estágios sem XP suficiente mostram "Precisa de X XP"
- [ ] Estágios escolhidos mostram "Escolhido: [valor]" em verde
- [ ] Mimo não mostra erros técnicos (apenas console.warn)
- [ ] Mobile: modal não estoura a tela
- [ ] PWA: funciona offline após 1ª visita

---

**Academia das Questões V3.7.1**
Repo: https://github.com/wwmotrix-collab/Academia-das_questoes
Supabase: https://nqifdhsskestqytooeap.supabase.co
