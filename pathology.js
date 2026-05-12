// ============================================================
// Pathology — coronary anatomy + sounds/murmurs + conditions
// ============================================================
(() => {
  const CORONARIES = window.CORONARIES;
  const HEART_SOUNDS = window.HEART_SOUNDS;
  const MURMURS = window.MURMURS;
  const AUSCULTATION_AREAS = window.AUSCULTATION_AREAS;
  const CONDITIONS = window.CONDITIONS;

  // ──────────────────────────────────────────────────────────
  // Interactive Heart SVG (anterior view, schematic)
  // ──────────────────────────────────────────────────────────
  function heartSVG() {
    return `
      <svg viewBox="0 0 600 560" class="path-svg" id="heart-coronary-svg">
        <defs>
          <marker id="arrowSm" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M 0 0 L 8 4 L 0 8 z" fill="currentColor"/>
          </marker>
        </defs>

        <text x="300" y="30" text-anchor="middle" font-family="Quicksand" font-size="16" font-weight="700" fill="#831843">Coronary Anatomy (anterior view, schematic)</text>

        <!-- Heart silhouette (anterior projection) -->
        <path d="M 300 90
                 C 230 90 175 130 175 200
                 C 175 270 215 350 280 440
                 C 290 455 310 455 320 440
                 C 385 350 425 270 425 200
                 C 425 130 370 90 300 90 Z"
              fill="#fde2ec" stroke="#831843" stroke-width="2"/>

        <!-- Interventricular groove (where LAD runs) — subtle line -->
        <path d="M 300 110 Q 300 250 300 430" stroke="#fbcfe8" stroke-width="2" fill="none" stroke-dasharray="3 3"/>

        <!-- AV groove (where LCx + RCA run) -->
        <ellipse cx="300" cy="180" rx="100" ry="35" fill="none" stroke="#fbcfe8" stroke-width="2" stroke-dasharray="3 3"/>

        <!-- Chamber labels -->
        <text x="240" y="280" font-family="Quicksand" font-size="11" fill="#9d174d" font-style="italic">RV</text>
        <text x="350" y="280" font-family="Quicksand" font-size="11" fill="#9d174d" font-style="italic">LV</text>
        <text x="220" y="160" font-family="Quicksand" font-size="10" fill="#9d174d" font-style="italic">RA</text>
        <text x="370" y="160" font-family="Quicksand" font-size="10" fill="#9d174d" font-style="italic">LA</text>

        <!-- Aorta arch label -->
        <text x="300" y="80" text-anchor="middle" font-size="10" fill="#9d174d" font-style="italic">aorta</text>

        <!-- LEFT MAIN (purple) -->
        <g class="coronary-group" data-id="leftmain">
          <path d="M 305 105 L 305 130 L 290 145" stroke="#7c3aed" stroke-width="8" fill="none" stroke-linecap="round"/>
          <text x="245" y="125" font-family="Quicksand" font-size="11" font-weight="700" fill="#7c3aed">Left Main</text>
        </g>

        <!-- LAD (green) - down anterior interventricular groove -->
        <g class="coronary-group" data-id="lad">
          <path d="M 290 145 Q 295 175 298 210 Q 300 250 300 290 Q 302 330 308 380 Q 310 410 305 430"
                stroke="#16a34a" stroke-width="8" fill="none" stroke-linecap="round"/>
          <!-- diagonal branches -->
          <path d="M 305 200 Q 340 210 365 220" stroke="#16a34a" stroke-width="4" fill="none" opacity="0.7"/>
          <path d="M 305 270 Q 345 280 370 285" stroke="#16a34a" stroke-width="4" fill="none" opacity="0.7"/>
          <text x="155" y="320" font-family="Quicksand" font-size="11" font-weight="700" fill="#15803d">LAD</text>
          <text x="155" y="335" font-family="Quicksand" font-size="9" fill="#15803d">anterior wall</text>
        </g>

        <!-- LCx (blue) - wraps around left side in AV groove -->
        <g class="coronary-group" data-id="lcx">
          <path d="M 290 145 Q 320 160 360 175 Q 395 200 405 240 Q 405 280 390 320 Q 375 360 350 390"
                stroke="#2563eb" stroke-width="8" fill="none" stroke-linecap="round"/>
          <!-- obtuse marginals -->
          <path d="M 400 230 Q 410 260 412 290" stroke="#2563eb" stroke-width="4" fill="none" opacity="0.7"/>
          <text x="430" y="240" font-family="Quicksand" font-size="11" font-weight="700" fill="#1e40af">LCx</text>
          <text x="430" y="255" font-family="Quicksand" font-size="9" fill="#1e40af">lateral wall</text>
        </g>

        <!-- RCA (red) - down the right side in AV groove, around to PDA -->
        <g class="coronary-group" data-id="rca">
          <path d="M 295 115 Q 260 130 230 155 Q 200 180 195 220 Q 190 270 200 310 Q 215 360 245 395 Q 270 415 295 425"
                stroke="#dc2626" stroke-width="8" fill="none" stroke-linecap="round"/>
          <!-- acute marginal branches (to RV) -->
          <path d="M 200 220 Q 220 240 245 250" stroke="#dc2626" stroke-width="4" fill="none" opacity="0.7"/>
          <path d="M 205 280 Q 225 295 245 305" stroke="#dc2626" stroke-width="4" fill="none" opacity="0.7"/>
          <!-- PDA continuation (right-dominant) -->
          <path d="M 245 395 Q 275 405 295 425" stroke="#dc2626" stroke-width="6" fill="none" opacity="0.85"/>
          <text x="115" y="270" font-family="Quicksand" font-size="11" font-weight="700" fill="#991b1b">RCA</text>
          <text x="115" y="285" font-family="Quicksand" font-size="9" fill="#991b1b">inferior + RV</text>
          <text x="240" y="430" font-family="Quicksand" font-size="9" fill="#991b1b">PDA (right-dom)</text>
        </g>

        <!-- Click hint -->
        <text x="300" y="510" text-anchor="middle" font-family="Caveat" font-size="20" fill="#9d174d">tap any vessel to see its territory + MI pattern ✿</text>

        <!-- Legend -->
        <g transform="translate(100, 530)">
          <circle cx="0" cy="0" r="6" fill="#7c3aed"/><text x="12" y="4" font-family="Quicksand" font-size="11" fill="#7c3aed">L. Main</text>
          <circle cx="80" cy="0" r="6" fill="#16a34a"/><text x="92" y="4" font-family="Quicksand" font-size="11" fill="#15803d">LAD</text>
          <circle cx="160" cy="0" r="6" fill="#2563eb"/><text x="172" y="4" font-family="Quicksand" font-size="11" fill="#1e40af">LCx</text>
          <circle cx="240" cy="0" r="6" fill="#dc2626"/><text x="252" y="4" font-family="Quicksand" font-size="11" fill="#991b1b">RCA</text>
        </g>
      </svg>
    `;
  }

  // ──────────────────────────────────────────────────────────
  // Auscultation chest schematic
  // ──────────────────────────────────────────────────────────
  function chestSVG() {
    return `
      <svg viewBox="0 0 320 380" class="path-svg" id="auscultation-svg">
        <text x="160" y="22" text-anchor="middle" font-family="Quicksand" font-size="13" font-weight="700" fill="#831843">Auscultation Areas</text>
        <!-- Chest outline -->
        <path d="M 60 50 L 60 320 Q 60 360 100 360 L 220 360 Q 260 360 260 320 L 260 50 Z"
              fill="#fef7fb" stroke="#9d174d" stroke-width="2"/>
        <!-- Sternum -->
        <line x1="160" y1="60" x2="160" y2="310" stroke="#fbcfe8" stroke-width="2" stroke-dasharray="2 2"/>
        <!-- Ribs (sketched) -->
        ${[80, 120, 160, 200, 240, 280].map((y) => `
          <path d="M 60 ${y} Q 160 ${y - 10} 260 ${y}" stroke="#fde2ec" stroke-width="1.5" fill="none"/>
        `).join("")}

        <!-- Aortic - 2nd ICS R -->
        <circle cx="185" cy="100" r="9" fill="#fbbf24" stroke="#92400e" stroke-width="2" class="ausc-spot" data-id="aortic"/>
        <text x="220" y="104" font-size="10" font-weight="700" fill="#92400e">A — Aortic</text>

        <!-- Pulmonic - 2nd ICS L -->
        <circle cx="135" cy="100" r="9" fill="#22c55e" stroke="#15803d" stroke-width="2" class="ausc-spot" data-id="pulmonic"/>
        <text x="40" y="104" font-size="10" font-weight="700" fill="#15803d">P — Pulmonic</text>

        <!-- Erb's point - 3rd ICS L -->
        <circle cx="140" cy="145" r="9" fill="#a78bfa" stroke="#6d28d9" stroke-width="2" class="ausc-spot" data-id="erbs"/>
        <text x="40" y="149" font-size="10" font-weight="700" fill="#6d28d9">E — Erb's</text>

        <!-- Tricuspid - LLSB 4-5 ICS L -->
        <circle cx="145" cy="220" r="9" fill="#60a5fa" stroke="#1e40af" stroke-width="2" class="ausc-spot" data-id="tricuspid"/>
        <text x="40" y="224" font-size="10" font-weight="700" fill="#1e40af">T — Tricuspid</text>

        <!-- Mitral - apex - 5th ICS L midclavicular -->
        <circle cx="110" cy="260" r="9" fill="#ec4899" stroke="#9d174d" stroke-width="2" class="ausc-spot" data-id="mitral"/>
        <text x="40" y="280" font-size="10" font-weight="700" fill="#9d174d">M — Mitral / Apex</text>

        <!-- Memory cue -->
        <text x="160" y="350" text-anchor="middle" font-family="Caveat" font-size="20" fill="#9d174d">"All Physicians Take Money" ✿</text>
      </svg>
    `;
  }

  // ──────────────────────────────────────────────────────────
  // Murmur timing diagram (S1-S2 cycle with shaded murmur region)
  // ──────────────────────────────────────────────────────────
  function murmurTimingSVG(murmur) {
    const isSystolic = murmur.type === "Systolic";
    const isHolosystolic = /holo|pan/i.test(murmur.timing);
    const isMidSystolic = /mid-systolic|ejection|crescendo/i.test(murmur.shape);
    const isEarlyDiastolic = /early diastolic/i.test(murmur.timing);
    const isMidLateDiastolic = /mid-to-late|mid-diastolic|opening snap/i.test(murmur.timing);

    // Cycle: 0-30% = S1, 30-50% = systole, 50% = S2, 50-100% = diastole
    let murmurPath = "";
    let shape = "rect";
    if (isSystolic) {
      if (isHolosystolic) {
        murmurPath = "M 90 50 L 200 50 L 200 80 L 90 80 Z";
      } else if (isMidSystolic) {
        // Crescendo-decrescendo diamond
        murmurPath = "M 100 75 L 145 50 L 190 75 Z";
        shape = "diamond";
      } else {
        murmurPath = "M 100 60 L 200 60 L 200 80 L 100 80 Z";
      }
    } else if (isEarlyDiastolic) {
      // Decrescendo
      murmurPath = "M 220 50 L 220 80 L 290 80 Z";
      shape = "decrescendo";
    } else if (isMidLateDiastolic) {
      // Mid-late diastolic rumble, possibly with pre-systolic accentuation
      murmurPath = "M 250 75 L 320 75 L 340 60 L 340 80 L 250 80 Z";
    } else {
      murmurPath = "M 220 60 L 320 60 L 320 80 L 220 80 Z";
    }

    return `
      <svg viewBox="0 0 380 130" class="murmur-svg">
        <!-- Time axis -->
        <line x1="40" y1="100" x2="360" y2="100" stroke="#9d174d" stroke-width="1.5"/>
        <!-- S1 -->
        <line x1="80" y1="40" x2="80" y2="105" stroke="#9d174d" stroke-width="3"/>
        <text x="80" y="120" text-anchor="middle" font-family="Quicksand" font-weight="700" font-size="11" fill="#9d174d">S1</text>
        <!-- S2 -->
        <line x1="210" y1="40" x2="210" y2="105" stroke="#9d174d" stroke-width="3"/>
        <text x="210" y="120" text-anchor="middle" font-family="Quicksand" font-weight="700" font-size="11" fill="#9d174d">S2</text>
        <!-- Next S1 -->
        <line x1="350" y1="40" x2="350" y2="105" stroke="#9d174d" stroke-width="3" opacity="0.5"/>
        <text x="350" y="120" text-anchor="middle" font-family="Quicksand" font-weight="700" font-size="11" fill="#9d174d" opacity="0.5">S1</text>

        <!-- Systole label -->
        <text x="145" y="30" text-anchor="middle" font-family="Quicksand" font-size="10" fill="#831843" font-style="italic">systole</text>
        <!-- Diastole label -->
        <text x="280" y="30" text-anchor="middle" font-family="Quicksand" font-size="10" fill="#831843" font-style="italic">diastole</text>

        <!-- Murmur shape -->
        <path d="${murmurPath}" fill="${isSystolic ? '#fda4af' : '#bfdbfe'}" stroke="${isSystolic ? '#be123c' : '#1e40af'}" stroke-width="2" opacity="0.85"/>

        <text x="190" y="14" text-anchor="middle" font-family="Quicksand" font-size="11" font-weight="700" fill="#831843">${murmur.name} — ${murmur.shape}</text>
      </svg>
    `;
  }

  // ──────────────────────────────────────────────────────────
  // Renderers
  // ──────────────────────────────────────────────────────────
  function renderCoronary() {
    const view = document.getElementById("view-coronary");
    view.innerHTML = `
      <div class="view-header">
        <div>
          <h2>❤️ Coronary Anatomy &amp; MI Mapping</h2>
          <div class="desc">tap any artery — see what it perfuses, the EKG leads that light up, and what to watch for ✿</div>
        </div>
      </div>
      <div class="coronary-layout">
        <div class="coronary-svg-wrap">${heartSVG()}</div>
        <div id="coronary-detail" class="coronary-detail">
          <div class="empty-prompt">👆 tap an artery to see its territory</div>
        </div>
      </div>
    `;
    bindCoronaryHotspots();
  }

  function bindCoronaryHotspots() {
    document.querySelectorAll(".coronary-group").forEach((g) => {
      g.style.cursor = "pointer";
      g.addEventListener("click", () => {
        const id = g.dataset.id;
        showCoronary(id);
        document.querySelectorAll(".coronary-group").forEach((x) => x.classList.remove("selected"));
        g.classList.add("selected");
      });
    });
  }

  function showCoronary(id) {
    const c = CORONARIES.find((x) => x.id === id);
    const target = document.getElementById("coronary-detail");
    if (!c) return;
    target.innerHTML = `
      <div class="coronary-card" style="border-color:${c.color}">
        <div class="coronary-header" style="background:linear-gradient(135deg, ${c.color}22, ${c.color}11)">
          <h3 style="color:${c.color}">${c.fullName}</h3>
          <div class="coronary-origin">${c.origin}</div>
        </div>
        <div class="coronary-body">
          <div class="coronary-section" data-ai="branches">
            <h4>Branches</h4>
            <ul>${c.branches.map((b) => `<li>${b}</li>`).join("")}</ul>
          </div>
          <div class="coronary-section" data-ai="perfuses">
            <h4>Perfuses</h4>
            <ul>${c.perfuses.map((p) => `<li>${p}</li>`).join("")}</ul>
          </div>
          <div class="coronary-section danger-block" data-ai="mi">
            <h4>If blocked → ${c.mi.region}</h4>
            <div class="ekg-leads-row">
              <div><strong>ST elevation leads:</strong> <code>${c.mi.leads}</code></div>
              <div><strong>Reciprocal changes:</strong> <code>${c.mi.reciprocal}</code></div>
            </div>
            <h5>Complications</h5>
            <ul>${c.mi.complications.map((c) => `<li>${c}</li>`).join("")}</ul>
          </div>
          <div class="key-pearl">
            <strong>Pearl:</strong> ${c.keyPearl}
          </div>
          <div class="export-buttons-mount"></div>
        </div>
      </div>
    `;
    if (window.NotesExport) {
      window.NotesExport.attachExportButtons(target.querySelector(".export-buttons-mount"), {
        getText: () => coronaryToText(c),
        getSvg: () => document.getElementById("heart-coronary-svg"),
        baseFilename: `coronary-${c.id}`,
      });
    }
    if (window.AITutor) {
      const topic = `${c.fullName} (${c.name})`;
      const miContent = `Region: ${c.mi.region}\nST elevation leads: ${c.mi.leads}\nReciprocal: ${c.mi.reciprocal}\n\nComplications:\n${c.mi.complications.map((x) => `• ${x}`).join("\n")}`;
      const aiSections = [
        ["branches", "Branches", c.branches],
        ["perfuses", "Perfused territory", c.perfuses],
        ["mi", `MI pattern: ${c.mi.region}`, miContent],
      ];
      aiSections.forEach(([key, label, content]) => {
        const el = target.querySelector(`[data-ai="${key}"]`);
        if (el) window.AITutor.attachAIButtons(el, { topic, section: label, getContent: () => content });
      });
    }
  }

  function coronaryToText(c) {
    return [
      `# ${c.fullName}`,
      "",
      `ORIGIN: ${c.origin}`,
      "",
      `BRANCHES`,
      ...c.branches.map((b) => `• ${b}`),
      "",
      `PERFUSES`,
      ...c.perfuses.map((p) => `• ${p}`),
      "",
      `MI PATTERN`,
      `Region: ${c.mi.region}`,
      `Leads: ${c.mi.leads}`,
      `Reciprocal: ${c.mi.reciprocal}`,
      "",
      `COMPLICATIONS`,
      ...c.mi.complications.map((x) => `• ${x}`),
      "",
      `PEARL: ${c.keyPearl}`,
    ].join("\n");
  }

  function renderSounds() {
    const view = document.getElementById("view-sounds");
    view.innerHTML = `
      <div class="view-header">
        <div>
          <h2>🎶 Heart Sounds &amp; Murmurs</h2>
          <div class="desc">timing diagrams, location, maneuvers, the whole reference ✨</div>
        </div>
      </div>

      <!-- Sounds -->
      <div class="sound-grid">
        ${HEART_SOUNDS.map((s) => `
          <div class="sound-card">
            <div class="sound-header">
              <span class="sound-letter">${s.name}</span>
              <div>
                <div class="sound-timing">${s.timing}</div>
              </div>
            </div>
            <div class="sound-section">
              <h4>Cause</h4>
              <p>${s.cause}</p>
            </div>
            <div class="sound-section">
              <h4>Clinical</h4>
              <p>${s.clinical}</p>
            </div>
          </div>
        `).join("")}
      </div>

      <!-- Auscultation map -->
      <div class="ausc-layout">
        <div class="ausc-svg-wrap">${chestSVG()}</div>
        <div class="ausc-table-wrap">
          <table class="ausc-table">
            <thead><tr><th>Area</th><th>Location</th><th>Best heard</th></tr></thead>
            <tbody>
              ${AUSCULTATION_AREAS.map((a) => `
                <tr>
                  <td><strong>${a.area}</strong></td>
                  <td>${a.location}</td>
                  <td>${a.best}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <div class="ausc-mnemonic">
            <strong>Mnemonic:</strong> "All Physicians Take Money" — Aortic → Pulmonic → Tricuspid → Mitral (or add E for Erb's between P and T)
          </div>
        </div>
      </div>

      <!-- Murmur tabs -->
      <div class="murmur-section">
        <div class="chip-row" id="murmur-filter">
          <div class="chip active" data-filter="all">all murmurs</div>
          <div class="chip" data-filter="Systolic">systolic</div>
          <div class="chip" data-filter="Diastolic">diastolic</div>
        </div>
        <div class="murmur-grid" id="murmur-grid"></div>
      </div>
    `;
    renderMurmurs("all");
    view.querySelectorAll("#murmur-filter .chip").forEach((c) => {
      c.addEventListener("click", () => {
        view.querySelectorAll("#murmur-filter .chip").forEach((x) => x.classList.remove("active"));
        c.classList.add("active");
        renderMurmurs(c.dataset.filter);
      });
    });
  }

  function renderMurmurs(filter) {
    const grid = document.getElementById("murmur-grid");
    const list = filter === "all" ? MURMURS : MURMURS.filter((m) => m.type === filter);
    grid.innerHTML = list.map((m, i) => `
      <div class="murmur-card" data-id="${m.id}">
        <div class="murmur-header">
          <h3>${m.name}</h3>
          <span class="murmur-type ${m.type.toLowerCase()}">${m.type}</span>
        </div>
        ${murmurTimingSVG(m)}
        <div class="murmur-details">
          <div class="murmur-row"><strong>Location:</strong> ${m.location}</div>
          <div class="murmur-row"><strong>Radiates:</strong> ${m.radiates}</div>
          <div class="murmur-row"><strong>Pitch:</strong> ${m.pitch}</div>
          <div class="murmur-row"><strong>Maneuvers:</strong> ${m.maneuvers}</div>
          ${m.classic ? `<div class="murmur-classic"><strong>Classic:</strong> ${m.classic}</div>` : ""}
          ${m.triadOfSeverity ? `<div class="murmur-classic"><strong>Severity triad:</strong> ${m.triadOfSeverity}</div>` : ""}
          <div class="murmur-section">
            <strong>Associated signs:</strong>
            <ul>${m.associatedSigns.map((s) => `<li>${s}</li>`).join("")}</ul>
          </div>
          <div class="murmur-section">
            <strong>Causes:</strong>
            <ul>${m.causes.map((s) => `<li>${s}</li>`).join("")}</ul>
          </div>
          <div class="murmur-nursing"><strong>Nursing pearl:</strong> ${m.nursing}</div>
          <div class="export-buttons-mount" data-i="${i}"></div>
          <div class="ai-mount-wrap" data-i="${i}"></div>
        </div>
      </div>
    `).join("");
    if (window.NotesExport) {
      grid.querySelectorAll(".export-buttons-mount").forEach((mount) => {
        const i = parseInt(mount.dataset.i, 10);
        window.NotesExport.attachExportButtons(mount, {
          getText: () => murmurToText(list[i]),
          baseFilename: `murmur-${list[i].id}`,
        });
      });
    }
    if (window.AITutor) {
      grid.querySelectorAll(".ai-mount-wrap").forEach((mount) => {
        const i = parseInt(mount.dataset.i, 10);
        const m = list[i];
        window.AITutor.attachAIButtons(mount, {
          topic: `${m.name} murmur`,
          section: `${m.name} — ${m.type} murmur`,
          getContent: () => murmurToText(m),
        });
      });
    }
  }

  function murmurToText(m) {
    return [
      `# ${m.name} (${m.type} murmur)`,
      "",
      `Timing: ${m.timing}`,
      `Shape: ${m.shape}`,
      `Location: ${m.location}`,
      `Radiates: ${m.radiates}`,
      `Pitch: ${m.pitch}`,
      `Maneuvers: ${m.maneuvers}`,
      m.classic ? `\nClassic: ${m.classic}` : "",
      m.triadOfSeverity ? `\nSeverity triad: ${m.triadOfSeverity}` : "",
      "",
      `Associated signs:`,
      ...m.associatedSigns.map((x) => `• ${x}`),
      "",
      `Causes:`,
      ...m.causes.map((x) => `• ${x}`),
      "",
      `NURSING: ${m.nursing}`,
    ].filter(Boolean).join("\n");
  }

  function renderConditions() {
    const view = document.getElementById("view-conditions");
    view.innerHTML = `
      <div class="view-header">
        <div>
          <h2>📋 Conditions</h2>
          <div class="desc">ARDS · sepsis · COPD · HCM · MI patterns — pick one to drill in 💕</div>
        </div>
      </div>
      <div class="condition-grid">
        ${CONDITIONS.map((c) => `
          <div class="condition-card" data-id="${c.id}">
            <div class="condition-icon">${c.emoji}</div>
            <h3>${c.name}</h3>
            <div class="condition-full">${c.fullName}</div>
            <span class="condition-category">${c.category}</span>
            <button class="condition-open">open ↓</button>
          </div>
        `).join("")}
      </div>
      <div id="condition-detail"></div>
    `;
    view.querySelectorAll(".condition-open").forEach((btn, i) => {
      btn.addEventListener("click", () => showCondition(CONDITIONS[i]));
    });
    view.querySelectorAll(".condition-card").forEach((card, i) => {
      card.addEventListener("click", (e) => {
        if (e.target.classList.contains("condition-open")) return;
        showCondition(CONDITIONS[i]);
      });
    });
  }

  function showCondition(c) {
    const target = document.getElementById("condition-detail");
    target.innerHTML = `
      <div class="condition-detail-card">
        <button class="condition-back">← back to all conditions</button>
        <div class="condition-detail-header">
          <div class="condition-icon-lg">${c.emoji}</div>
          <div>
            <h2>${c.name}</h2>
            <div class="condition-full-lg">${c.fullName}</div>
            <span class="condition-category">${c.category}</span>
          </div>
        </div>
        ${c.sections.map((s, idx) => `
          <div class="condition-section" data-ai-section-idx="${idx}">
            <h3>${s.title}</h3>
            <ul>${s.items.map((i) => `<li>${i}</li>`).join("")}</ul>
          </div>
        `).join("")}
        <div class="export-buttons-mount" id="cond-export-mount"></div>
      </div>
    `;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    target.querySelector(".condition-back").addEventListener("click", () => {
      target.innerHTML = "";
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    if (window.NotesExport) {
      window.NotesExport.attachExportButtons(document.getElementById("cond-export-mount"), {
        getText: () => conditionToText(c),
        baseFilename: `condition-${c.id}`,
      });
    }
    if (window.AITutor) {
      target.querySelectorAll("[data-ai-section-idx]").forEach((el) => {
        const idx = parseInt(el.dataset.aiSectionIdx, 10);
        const s = c.sections[idx];
        window.AITutor.attachAIButtons(el, {
          topic: `${c.name} (${c.fullName})`,
          section: s.title,
          getContent: () => s.items,
        });
      });
    }
  }

  function conditionToText(c) {
    const lines = [`# ${c.name} — ${c.fullName}`, `Category: ${c.category}`, ""];
    c.sections.forEach((s) => {
      lines.push(`## ${s.title}`);
      s.items.forEach((i) => lines.push(`• ${i}`));
      lines.push("");
    });
    return lines.join("\n");
  }

  // ──────────────────────────────────────────────────────────
  // View switching
  // ──────────────────────────────────────────────────────────
  function switchView(viewId) {
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
    document.querySelectorAll(".mode-tab").forEach((t) => t.classList.remove("active"));
    document.getElementById(viewId).classList.add("active");
    document.querySelector(`[data-view="${viewId}"]`)?.classList.add("active");
    if (viewId === "view-coronary") renderCoronary();
    if (viewId === "view-sounds") renderSounds();
    if (viewId === "view-conditions") renderConditions();
  }

  function init() {
    document.querySelectorAll(".mode-tab").forEach((tab) => {
      tab.addEventListener("click", () => switchView(tab.dataset.view));
    });
    switchView("view-coronary");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
