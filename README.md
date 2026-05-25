# 🐱 Academia das Questões — V3.7 (Hotfix + Mimo Evolutivo Completo)

Corrige todos os bugs críticos da V3.6 e entrega o sistema evolutivo do Mimo funcionando de ponta a ponta.

---

## 🐛 Bugs corrigidos nesta versão

| # | Bug | Correção |
|---|-----|----------|
| 1 | `"12 de 20 questões"` quando a atividade tem só 12 | `app.js` agora usa `questions.length` — nunca valor fixo |
| 2 | `"EvoWidget is not defined"` persistente | Todos os calls ao EvoWidget envolvidos em `try/catch` + `if (window.EvoWidget)` |
| 3 | Transparência quebrada na cabeça do Mimo | Novo algoritmo de remoção de fundo (saturação + brilho + suavização de borda) |
| 4 | Evolução não dispara ao atingir XP | `MimoEvo.onXPGained(prevXP, newXP)` chamado em `finishActivity()` com detecção de threshold |

---

## 📁 Arquivos desta versão

Copie **somente estes arquivos** sobre o repositório existente:

```
/index.html                           ← atualizado
/sw.js                                ← atualizado (V3.7 cache name)
/evolution/index.html                 ← atualizado (usa MimoEvo)

/styles/mimo-evolution.css            ← NOVO (substitui mimo.css)

/scripts/mimo-evolution.js            ← NOVO (substitui mimo.js)
/scripts/app.js                       ← atualizado (todos os bugs corrigidos)

/assets/mascots/mimo-base.webp        ← NOVO (alpha corrigido)
/assets/mascots/mimo-mammal.webp      ← NOVO (alpha corrigido)
/assets/mascots/mimo-reptile.webp     ← NOVO (alpha corrigido)
/assets/mascots/mimo-bird.webp        ← NOVO (alpha corrigido)
/assets/mascots/mimo-base.png         ← PNG fallback
/assets/mascots/mimo-mammal.png       ← PNG fallback
/assets/mascots/mimo-reptile.png      ← PNG fallback
/assets/mascots/mimo-bird.png         ← PNG fallback
```

### Arquivos que NÃO mudam (manter como estão)
```
main.css · animations.css · evolution.css
data.js · db.js · auth.js · gamification.js · ui.js
evolution_data.js · evolution_db.js · evolution_widget.js
manifest.json · vercel.json
```

### Arquivos para REMOVER do repositório (substituídos)
```
/styles/mimo.css      → deletar, substituído por mimo-evolution.css
/scripts/mimo.js      → deletar, substituído por mimo-evolution.js
```

---

## 🚀 Deploy

```bash
cd Academia-das_questoes

# 1. Remover arquivos obsoletos
git rm styles/mimo.css scripts/mimo.js 2>/dev/null || true

# 2. Copiar os novos arquivos desta versão
# (copie sobre o repositório o conteúdo do ZIP)

# 3. Commit e push
git add .
git commit -m "fix: V3.7 — Hotfix questões, EvoWidget guard, alpha Mimo, trigger evolução"
git push origin main
```

O Vercel detecta o push e faz deploy automático. ✓

---

## 🌟 Sistema evolutivo do Mimo — como funciona agora

### Thresholds de XP (baseados em XP total do aluno)

| XP total | Estágio desbloqueado |
|----------|---------------------|
| 100 XP  | 🐾 Classe Evolutiva |
| 300 XP  | 🧬 Linhagem |
| 600 XP  | 🌙 Alinhamento |
| 900 XP  | ⚡ Elemento |
| 1300 XP | 🛡️ Armadura |
| 1800 XP | ❤️ Personalidade |
| 2500 XP | 👑 Evolução Final |

### Fluxo ao ganhar XP

```
Aluna completa atividade
    → finishActivity() calcula XP real
    → MimoEvo.onXPGained(prevXP, newXP) é chamado
    → checkUnlocks() detecta se threshold foi cruzado
    → celebrate() + tip('evolution_ready') dispara
    → Mimo bounce + balão "Posso evoluir! Vai na Árvore!"
    → Aluna clica no Mimo → openPanel('evolucoes')
    → Painel mostra o estágio desbloqueado com botão "Ir para Árvore"
```

### Painel do Mimo (clique no mascote)

Três abas:

**📊 Status** — XP, Rank, Estágio, Classe, todos os atributos escolhidos

**🌟 Evoluções** — Árvore com todos os 6 campos, mostrando: ✓ Feito / 🔓 Disponível / 🔒 Bloqueado

**🔓 Próximo** — Barra de progresso até o próximo estágio, com botão "Ir para Árvore Evolutiva" quando disponível

---

## 🎭 Dicas contextuais do Mimo

| Atividade | Tipo de dica |
|-----------|-------------|
| IDs 5-10 (Frações/Sequências) | `math` — dicas de cálculo |
| IDs 1-4 (Interpretação) | `start` / `reading` |
| Questões em branco | `incomplete` — Mimo balança + avisa |
| Antes de concluir | `finish` — Mimo pede revisão |
| Acerto / conclusão | `correct` / `activity_complete` + bounce |
| 100% de acertos | Mensagem especial de celebração |
| Evolução disponível | `evolution_ready` + bounce |
| Idle (~38–58s) | Verifica evolução disponível, senão `idle` |

---

## 🖼️ Sobre os assets

Os 4 WebPs foram recortados com algoritmo melhorado:

- Remove apenas branco **puro sem saturação** (brightness > 248 + saturation < 10)
- Transição suave nas bordas (sem corte abrupto)
- Preserva pelos brancos, penas e detalhes claros do personagem
- Fundo 100% transparente

Para substituir por versões melhores: basta trocar os `.webp` mantendo os mesmos nomes. O sistema detecta automaticamente pelo `class_path` da evolução.

---

## ✅ Checklist de verificação pós-deploy

- [ ] Login funciona sem erros no console
- [ ] Dashboard carrega sem `"EvoWidget is not defined"`
- [ ] Mimo aparece no canto inferior direito
- [ ] Mimo sem transparência quebrada na cabeça
- [ ] Clicar no Mimo abre o painel
- [ ] Painel tem 3 abas funcionando
- [ ] Completar atividade: pontuação `X de Y` correta (Y = total real da atividade)
- [ ] XP ganho aparece corretamente
- [ ] Ao atingir threshold: Mimo bounce + balão de evolução
- [ ] Árvore evolutiva: ao escolher classe, Mimo muda de imagem
- [ ] Minimizar / restaurar Mimo funciona
- [ ] Mobile: Mimo não cobre o botão "Concluir"

---

**Academia das Questões V3.7**
Repositório: https://github.com/wwmotrix-collab/Academia-das_questoes
Supabase: https://nqifdhsskestqytooeap.supabase.co
