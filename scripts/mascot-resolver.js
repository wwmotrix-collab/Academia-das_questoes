// ═══════════════════════════════════════════════════════════════════
// Academia das Questões V3.8 — Mascot Resolver
// Resolve o asset visual correto do Mimo com base nas escolhas
// Gera a barra evolutiva do dashboard
// ═══════════════════════════════════════════════════════════════════

'use strict';

const MASCOT_BASE_PATH = '/assets/mascots/mimo';

/* ── XP thresholds para evolução do mascote (igual ao MimoEvo) ── */
const MASCOT_XP_THRESHOLDS = {
  stage_1: 100,   // Classe
  stage_2: 300,   // Linhagem
  stage_3: 600,   // Alinhamento
  stage_4: 900,   // Elemento
  stage_5: 1300,  // Armadura
  stage_6: 1800,  // Personalidade
  stage_7: 2400,  // Evolução Final
};

/* ── Stage labels ── */
const MASCOT_STAGE_LABELS = {
  0: 'Origem',
  1: 'Classe Evolutiva',
  2: 'Linhagem',
  3: 'Alinhamento',
  4: 'Elemento',
  5: 'Armadura',
  6: 'Personalidade',
  7: 'Evolução Final',
};

/* ── Atividades necessárias por estágio (para mensagem "Faltam X") ──
   Baseado em ~10 XP por questão, ~12 questões por atividade = ~120 XP/atividade ── */
const XP_PER_ACTIVITY_AVG = 110;

/* ─────────────────────────────────────────────────────────────────
   MascotResolver — resolve path e estado
   ───────────────────────────────────────────────────────────────── */
const MascotResolver = {

  /* ── Resolve o asset path com base nas escolhas evolutivas ──── */
  resolvePath(evo) {
    if (!evo) return `${MASCOT_BASE_PATH}/stage-0/origem.png`;

    const stage = evo.mascot_stage || evo.stage || 0;

    // Stage 0 — base
    if (stage === 0 || !evo.mascot_class) {
      return `${MASCOT_BASE_PATH}/stage-0/origem.png`;
    }

    // Stage 1 — classe
    const cls = evo.mascot_class || evo.class_path;
    if (stage === 1 || !evo.mascot_lineage) {
      return `${MASCOT_BASE_PATH}/stage-1/${cls}.png`;
    }

    // Stage 2 — linhagem
    const lineage = evo.mascot_lineage || evo.lineage;
    if (stage === 2 || !evo.mascot_alignment) {
      return `${MASCOT_BASE_PATH}/stage-2/${cls}/${lineage}.png`;
    }

    // Stage 3 — alinhamento (combina linhagem + alinhamento)
    const align = evo.mascot_alignment || evo.alignment;
    if (stage === 3 || !evo.mascot_element) {
      return `${MASCOT_BASE_PATH}/stage-3/${align}.png`;
    }

    // Stage 4 — elemento
    const element = evo.mascot_element || evo.element;
    if (stage === 4 || !evo.mascot_armor) {
      return `${MASCOT_BASE_PATH}/stage-4/${element}.png`;
    }

    // Stage 5 — armadura
    const armor = evo.mascot_armor || evo.armor;
    if (stage === 5 || !evo.mascot_personality) {
      return `${MASCOT_BASE_PATH}/stage-5/${armor}.png`;
    }

    // Stage 6 — personalidade
    const personality = evo.mascot_personality || evo.personality;
    if (stage === 6) {
      return `${MASCOT_BASE_PATH}/stage-6/${personality}.png`;
    }

    // Stage 7 — evolução final
    return `${MASCOT_BASE_PATH}/stage-7/final.png`;
  },

  /* ── WebP with PNG fallback ─────────────────────────────────── */
  resolvePathWebP(evo) {
    return this.resolvePath(evo).replace('.png', '.webp');
  },

  /* ── Resolve fallback chain: webp → png → emoji text ───────── */
  buildImgTag(evo, cssClass = '', altText = 'Mimo') {
    const webp = this.resolvePathWebP(evo);
    const png  = this.resolvePath(evo);
    return `<picture>
      <source srcset="${webp}" type="image/webp">
      <img src="${png}" alt="${altText}" class="${cssClass}"
           onerror="MascotResolver.handleImgError(this)"
           draggable="false">
    </picture>`;
  },

  handleImgError(img) {
    // Try PNG if WebP failed
    if (img.src.endsWith('.webp')) {
      img.src = img.src.replace('.webp', '.png');
      return;
    }
    // Final fallback: hide img, show text badge
    img.style.display = 'none';
    const parent = img.closest('picture') || img.parentElement;
    if (parent && !parent.querySelector('.mascot-text-fallback')) {
      const fb = document.createElement('div');
      fb.className = 'mascot-text-fallback';
      fb.textContent = 'MIMO';
      parent.parentElement?.appendChild(fb);
    }
  },

  /* ── Get stage from evo data (supports both naming conventions) */
  getStage(evo) {
    if (!evo) return 0;
    return evo.mascot_stage ?? evo.stage ?? 0;
  },

  /* ── Get human-readable label for current form ──────────────── */
  getCurrentFormName(evo) {
    if (!evo) return 'Mimo — Origem';
    const stage = this.getStage(evo);
    const cls   = evo.mascot_class || evo.class_path;
    const lin   = evo.mascot_lineage || evo.lineage;
    const align = evo.mascot_alignment || evo.alignment;
    const elem  = evo.mascot_element || evo.element;
    const armor = evo.mascot_armor || evo.armor;
    const pers  = evo.mascot_personality || evo.personality;

    const classNames = { mamifero:'Mamífero', reptil:'Réptil', ave:'Ave' };
    const lineageMap = {
      prehistorico:'Pré-Histórico', lendario:'Lendário', mistico:'Místico',
    };
    const alignMap    = { solar:'Solar', lunar:'Lunar' };
    const elemMap     = { fogo:'Fogo', gelo:'Gelo', tempestade:'Tempestade' };
    const armorMap    = { tribal:'Tribal', celestial:'Celestial', mecanica:'Mecânica' };
    const persMap     = { sabio:'Sábio', protetor:'Protetor', corajoso:'Corajoso' };

    if (stage >= 7) return 'Mimo — Forma Final';
    if (stage >= 6 && pers)   return `Mimo — ${persMap[pers]  || pers}`;
    if (stage >= 5 && armor)  return `Mimo — ${armorMap[armor] || armor}`;
    if (stage >= 4 && elem)   return `Mimo — ${elemMap[elem]   || elem}`;
    if (stage >= 3 && align)  return `Mimo — ${alignMap[align] || align}`;
    if (stage >= 2 && lin)    return `Mimo — ${lineageMap[lin] || lin}`;
    if (stage >= 1 && cls)    return `Mimo — ${classNames[cls] || cls}`;
    return 'Mimo — Origem';
  },

  /* ── Get next evolution info ────────────────────────────────── */
  getNextEvolution(evo, currentXP) {
    const stage     = this.getStage(evo);
    const nextStage = stage + 1;
    if (nextStage > 7) return null;

    const thresholdKey = `stage_${nextStage}`;
    const threshold    = MASCOT_XP_THRESHOLDS[thresholdKey];
    if (!threshold) return null;

    const remaining   = Math.max(0, threshold - currentXP);
    const activitiesLeft = Math.ceil(remaining / XP_PER_ACTIVITY_AVG);
    const pct           = Math.min(100, Math.round((currentXP / threshold) * 100));

    return {
      nextStage,
      nextStageName:   MASCOT_STAGE_LABELS[nextStage] || 'Próxima Evolução',
      threshold,
      remaining,
      activitiesLeft,
      pct,
      isReady:         remaining === 0,
    };
  },

  /* ════════════════════════════════════════════════════════════
     Dashboard evolution bar — inject into #mascot-evo-bar slot
     ════════════════════════════════════════════════════════════ */
  renderDashboardBar(evo, currentXP, slotId = 'mascot-evo-bar') {
    const slot = document.getElementById(slotId);
    if (!slot) return;

    const stage    = this.getStage(evo);
    const formName = this.getCurrentFormName(evo);
    const next     = this.getNextEvolution(evo, currentXP);
    const imgTag   = this.buildImgTag(evo, 'mascot-bar-img', 'Mimo');

    let barContent = '';
    if (!next) {
      barContent = `
        <div class="mascot-bar-complete">
          <div class="mbc-badge">👑</div>
          <div class="mbc-text">
            <div class="mbc-title">Mimo Completo!</div>
            <div class="mbc-sub">Você alcançou a Forma Final. Parabéns!</div>
          </div>
        </div>`;
    } else if (next.isReady) {
      barContent = `
        <div class="mascot-bar-ready">
          <div class="mbr-glow">⚡</div>
          <div class="mbr-text">
            <div class="mbr-title">Mimo pode evoluir!</div>
            <div class="mbr-sub">Clique para desbloquear: <strong>${next.nextStageName}</strong></div>
          </div>
          <button class="mbr-btn" onclick="MimoEvo && MimoEvo.openPanel('evolucoes')">Evoluir →</button>
        </div>`;
    } else {
      const dots = Array.from({ length: 7 }, (_, i) => {
        const s = i + 1;
        if (s < stage)  return `<span class="evo-dot done"  title="Estágio ${s}">✓</span>`;
        if (s === stage) return `<span class="evo-dot active" title="Estágio ${s}">${s}</span>`;
        return              `<span class="evo-dot future" title="Estágio ${s}">${s}</span>`;
      }).join('<span class="evo-dot-sep">›</span>');

      barContent = `
        <div class="mascot-bar-progress">
          <div class="mbp-top">
            <span class="mbp-form">${formName}</span>
            <span class="mbp-stage">Estágio ${stage}</span>
          </div>
          <div class="mbp-bar-wrap">
            <div class="mbp-bar-track">
              <div class="mbp-bar-fill" style="width:${next.pct}%">
                <div class="mbp-bar-shimmer"></div>
              </div>
            </div>
            <span class="mbp-pct">${next.pct}%</span>
          </div>
          <div class="mbp-hint">
            ${next.activitiesLeft > 0
              ? `Faltam <strong>${next.activitiesLeft}</strong> ${next.activitiesLeft === 1 ? 'atividade' : 'atividades'} para a próxima evolução`
              : `Faltam <strong>${next.remaining} XP</strong> para ${next.nextStageName}`}
          </div>
          <div class="mbp-dots">${dots}</div>
        </div>`;
    }

    slot.innerHTML = `
      <div class="mascot-evo-bar" onclick="try{MimoEvo.openPanel('status')}catch{}">
        <div class="meb-avatar">
          ${imgTag}
          <div class="meb-glow-ring"></div>
        </div>
        <div class="meb-content">${barContent}</div>
        <div class="meb-arrow">›</div>
      </div>`;
  },

  /* ── Update mascot image everywhere on page ─────────────────── */
  updateAllMascotImages(evo) {
    const path = this.resolvePath(evo);
    document.querySelectorAll('[data-mascot-img]').forEach(el => {
      el.src = path;
      el.onerror = () => this.handleImgError(el);
    });
    // Also update companion
    try {
      const mimoImg = document.getElementById('mimo-img');
      if (mimoImg) {
        mimoImg.src = this.resolvePathWebP(evo);
        mimoImg.onerror = () => { mimoImg.src = path; };
      }
    } catch {}
  },
};

window.MascotResolver = MascotResolver;
