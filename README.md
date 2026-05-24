# 🐱 Academia das Questões — V3.6 (Mimo Flutuante)

Mascote MIMO com imagens reais WebP, camada flutuante, balões de fala contextuais e integração total com o sistema V3.5.

---

## 📁 Arquivos desta versão

Copie **somente estes arquivos** sobre o seu repositório existente:

```
/index.html                          ← atualizado (link mimo.css + mimo.js)
/sw.js                               ← atualizado (cache mime assets)
/evolution/index.html                ← atualizado (Mimo na árvore evolutiva)

/styles/mimo.css                     ← NOVO

/scripts/mimo.js                     ← NOVO
/scripts/app.js                      ← atualizado (integração Mimo)

/assets/mascots/mimo-base.webp       ← NOVO (gato branco)
/assets/mascots/mimo-mammal.webp     ← NOVO (leãozinho dourado)
/assets/mascots/mimo-reptile.webp    ← NOVO (dragãozinho verde)
/assets/mascots/mimo-bird.webp       ← NOVO (passarinho azul)
```

> Todos os outros arquivos (main.css, animations.css, evolution.css,
> data.js, db.js, auth.js, gamification.js, ui.js, evolution_data.js,
> evolution_db.js, evolution_widget.js) **permanecem inalterados**.

---

## 🖼️ Sobre as imagens do Mimo

Os 4 WebPs foram gerados a partir da imagem de referência enviada,
com fundo transparente e crop automático.

| Arquivo | Usado quando |
|---------|-------------|
| `mimo-base.webp` | Antes de escolher classe (estágio 0) |
| `mimo-mammal.webp` | Classe Mamífero escolhida |
| `mimo-reptile.webp` | Classe Réptil escolhida |
| `mimo-bird.webp` | Classe Ave escolhida |

**Para substituir por imagens melhores no futuro:**
Basta trocar os arquivos `.webp` mantendo os mesmos nomes.
O sistema escolhe automaticamente pelo campo `class_path` da evolução.

---

## 🐙 Deploy no GitHub + Vercel

```bash
cd Academia-das_questoes

# Copie os arquivos listados acima
git add .
git commit -m "feat: V3.6 — Mimo flutuante com WebP, balões de fala e integração total"
git push origin main
```

O Vercel detecta o push e faz deploy automático. ✓

---

## 🎭 Comportamento do Mimo

### Posicionamento
- **Desktop**: canto inferior direito, 18px das bordas
- **Mobile**: compacto, 10px das bordas
- **Durante atividades**: sobe 90px para não cobrir o botão "Concluir"

### Interações automáticas

| Momento | Reação do Mimo |
|---------|---------------|
| Login screen | Mensagem de boas-vindas |
| Erro de login | Shake + mensagem de erro |
| Entrar no dashboard | Tip de boas-vindas |
| Abrir atividade | Dica de início |
| Clicar no Mimo | Tip aleatório |
| Atividade incompleta | Shake + aviso |
| Antes de concluir | Tip de revisão |
| Concluir atividade | Celebração + bounce |
| 100% de acertos | Mensagem especial |
| Evolução de nível | Celebração |
| Estágio desbloqueado | Mensagem especial |
| Ficar online → offline | Mensagem de offline |
| Logout | Mensagem de despedida |
| A cada ~35-55s | Tip de idle aleatório |
| Na árvore evolutiva | Explica a evolução |
| Escolher classe | Mimo mostra nova forma + celebra |

### Minimizar / restaurar
- Botão **−** no topo esquerdo do mascote minimiza
- Pequena **pílula** aparece no canto inferior direito para restaurar
- Clique na pílula restaura o Mimo com mensagem de boas-vindas

---

## 🛠️ API pública do Mimo

Disponível globalmente em qualquer arquivo JS do projeto:

```js
// Mostrar uma mensagem no balão
showMimoMessage('Texto aqui! <em>Destaque em amarelo</em>', '💡', 'RÓTULO', 5000);

// Atualizar a imagem conforme a evolução
updateMimoForm(evolutionData); // evolutionData.class_path = 'mamifero' | 'reptil' | 'ave'

// Mostrar tip por contexto
getMimoTip('activity_start');    // dica de início de atividade
getMimoTip('hint_math');         // dica de matemática/frações
getMimoTip('hint_interpret');    // dica de interpretação
getMimoTip('before_finish');     // dica antes de concluir
getMimoTip('incomplete_warning');// aviso de questões em branco
getMimoTip('correct');           // comemoração de acerto
getMimoTip('activity_complete'); // comemoração de conclusão
getMimoTip('story_reading');     // dica durante história
getMimoTip('evolution_unlock');  // novo estágio desbloqueado
getMimoTip('idle');              // tip aleatório (sem contexto)
getMimoTip('welcome');           // boas-vindas

// Minimizar / restaurar
minimizeMimo();
restoreMimo();
```

---

## 🎨 Personalizar mensagens

Edite o objeto `MIMO_MESSAGES` em `/scripts/mimo.js`.
Cada contexto é um array — o sistema escolhe aleatoriamente.

```js
MIMO_MESSAGES.activity_start = [
  { icon: '📖', label: 'DICA', text: 'Sua mensagem aqui! <em>Destaque em amarelo</em>' },
  // ...
];
```

---

## ✅ Checklist de Deploy

- [ ] Arquivos copiados para o repositório
- [ ] `git push origin main`
- [ ] Vercel fez deploy
- [ ] Abrir o site → Mimo aparece no canto inferior direito
- [ ] Clicar no Mimo → balão de fala aparece
- [ ] Botão **−** minimiza, pílula restaura
- [ ] Completar atividade → Mimo bounce + balão de celebração
- [ ] Entrar na árvore evolutiva → Mimo fala sobre a árvore
- [ ] Escolher classe → Mimo muda de imagem + celebra

---

**Academia das Questões V3.6**  
Repositório: https://github.com/wwmotrix-collab/Academia-das_questoes  
Supabase: https://nqifdhsskestqytooeap.supabase.co
