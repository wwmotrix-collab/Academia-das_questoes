# 🎓 Academia das Questões — V2

Plataforma gamificada de aprendizado com PWA, Supabase e deploy na Vercel.

---

## 📁 Estrutura do Projeto

```
/
├── index.html              ← Entrada única do app
├── manifest.json           ← PWA manifest
├── sw.js                   ← Service Worker (offline)
├── vercel.json             ← Config de deploy
├── .gitignore
│
├── styles/
│   ├── main.css            ← Estilos principais
│   └── animations.css      ← Animações e keyframes
│
├── scripts/
│   ├── data.js             ← Dados das 10 atividades
│   ├── db.js               ← Supabase + LocalStorage
│   ├── auth.js             ← Login / sessão / logout
│   ├── gamification.js     ← XP, ranks, badges, partículas, confete
│   ├── ui.js               ← Renderização de telas
│   └── app.js              ← Controller principal
│
├── assets/
│   └── icons/
│       ├── icon-192.png    ← PWA icon
│       └── icon-512.png    ← PWA icon splash
│
└── supabase/
    └── schema.sql          ← SQL completo para criar tabelas
```

---

## 🗄️ Passo 1 — Configurar Supabase

1. Acesse [supabase.com](https://supabase.com) e entre no projeto `nqifdhsskestqytooeap`
2. Vá em **SQL Editor → New query**
3. Cole o conteúdo de `supabase/schema.sql` e execute
4. Verifique que as tabelas `students`, `activity_results` e `badges` foram criadas
5. Confirme que **Row Level Security** está habilitado com as policies `allow_all`

> ⚠️ A URL e chave Supabase já estão configuradas em `scripts/db.js`.

---

## 🐙 Passo 2 — Subir para o GitHub

```bash
# Clone o repositório existente
git clone https://github.com/wwmotrix-collab/Academia-das_questoes.git
cd Academia-das_questoes

# Copie todos os arquivos deste projeto para a pasta clonada
# (substituindo o conteúdo anterior)

# Adicione tudo e faça commit
git add .
git commit -m "feat: V2 — Plataforma gamificada com Supabase, PWA e gamificação"
git push origin main
```

---

## 🚀 Passo 3 — Deploy na Vercel

### Opção A — Via Vercel Dashboard (recomendado)
1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **Add New → Project**
3. Importe o repositório `Academia-das_questoes` do GitHub
4. Framework Preset: **Other** (Static Site)
5. Root Directory: `/` (raiz)
6. Clique em **Deploy**

### Opção B — Via Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

> O `vercel.json` já está configurado com headers corretos para PWA e service worker.

---

## ✅ Funcionalidades V2

### 🔐 Login
- Nome + código de turma
- Sessão persistida no localStorage
- Auto-login ao retornar
- Logout com confirmação

### 🗄️ Banco de Dados
| Tabela | Descrição |
|--------|-----------|
| `students` | Alunos com XP e rank |
| `activity_results` | Resultados por atividade |
| `badges` | Insígnias desbloqueadas |

- **Offline-first**: tudo salvo localmente primeiro
- **Sincronização automática** ao reconectar
- **Fila de sync** para operações offline

### 🎮 Gamificação
| XP | Situação |
|----|----------|
| +10 XP | Por questão correta |
| +50 XP | Bônus 100% em atividade padrão |
| +100 XP | Bônus 100% na Atividade 10 (final) |

**Ranks Globais (por XP total):**
| XP | Rank |
|----|------|
| 0–199 | 🌿 Aprendiz |
| 200–499 | 📘 Exploradora |
| 500–999 | 💎 Guardiã |
| 1000–1799 | ⚡ Heroína da Academia |
| 1800+ | 👑 Mestra das Questões |

**Insígnias disponíveis:**
- ⚔️ Primeira Missão — 1ª atividade concluída
- 🔍 Exploradora — 3 atividades concluídas
- ⭐ Metade do Caminho — 5 atividades concluídas
- 💫 Quase Lá — 8 atividades concluídas
- 🏆 Campeã — Todas as 10 atividades concluídas
- 💎 Perfeição — 100% em qualquer atividade
- ½ Mestra das Frações — 100% nas atividades 6, 7 ou 8
- 🧠 Lógica Pura — 100% na Atividade 5
- 🌟 Veterana — 500+ XP acumulados
- 👑 Lendária — 1000+ XP acumulados

### ✨ Animações
- Partículas mágicas flutuantes (canvas)
- Confete ao concluir atividade
- Cristal flutuante animado
- Brilho pulsante nos botões
- Hover com elevação nos cards
- Medal spin ao concluir
- Float de XP ao ganhar pontos
- Overlay de celebração com ranking

### 📱 PWA
- `manifest.json` configurado
- Service Worker com cache offline
- Instalável no celular (Android/iOS)
- Funciona offline após 1º acesso
- Sincronização em background

---

## 🏗️ Arquitetura para Dashboard Futuro

O banco já está preparado com:
- `leaderboard` VIEW para ranking geral
- `students.class_code` para filtro por turma
- `activity_results` com percentual e timestamp
- `badges` com data de desbloqueio

Para criar dashboard do professor, basta:
1. Criar nova página (`/dashboard/index.html`)
2. Usar as mesmas tabelas Supabase com filtro por `class_code`
3. Adicionar autenticação diferenciada para professores

---

## 🔧 Variáveis de Configuração

Em `scripts/db.js`:
```js
const SUPABASE_URL = 'https://nqifdhsskestqytooeap.supabase.co';
const SUPABASE_KEY = 'sb_publishable_DBWB3wM3SvJcsCJjcL6NoA_7hXkhWTd';
```

> ✅ A chave `sb_publishable_*` é segura para uso no frontend (anon key).

---

## 📞 Suporte

Projeto: Academia das Questões  
Repositório: https://github.com/wwmotrix-collab/Academia-das_questoes  
Supabase: https://nqifdhsskestqytooeap.supabase.co
