// ============================================================
// Arterial Line Waveform Study
// Mathematical waveform generation modeled on classical arterial
// pulse anatomy: anacrotic upstroke, systolic peak, dicrotic
// notch (incisura), dicrotic wave, diastolic exponential decay.
// References: Marino's ICU Book, ESICM technical recommendations.
// ============================================================
(() => {
  // ─── Canvas paper constants ───
  const CANVAS_W = 1200;
  const CANVAS_H = 360;
  const PX_PER_MM_X = 4;       // 1 second ≈ 100 px (5 large boxes/sec @ ~20 px ea)
  const Y_MIN = 0;             // mmHg
  const Y_MAX = 200;           // mmHg
  const SAMPLE_RATE = 200;     // Hz

  // ─── Pulse shape model (normalized 0..1 across one cardiac cycle) ───
  // Builds an anatomically reasonable arterial pulse:
  // 0 → 0.08: rapid anacrotic upstroke (concave power curve)
  // 0.08 → 0.32: systolic peak, gradual decline to incisura
  // 0.32 → 0.36: dicrotic NOTCH (sharp dip from aortic valve closure)
  // 0.36 → 0.50: dicrotic WAVE (peripheral reflection bump)
  // 0.50 → 1.00: exponential diastolic runoff
  function normalPulseShape(tNorm) {
    if (tNorm < 0.08) {
      return Math.pow(tNorm / 0.08, 0.55);                  // 0 → 1 (rapid)
    }
    if (tNorm < 0.32) {
      const p = (tNorm - 0.08) / 0.24;
      return 1 - p * 0.32;                                  // 1 → 0.68
    }
    if (tNorm < 0.36) {
      const p = (tNorm - 0.32) / 0.04;
      return 0.68 - p * 0.18;                               // 0.68 → 0.50 (notch)
    }
    if (tNorm < 0.50) {
      const p = (tNorm - 0.36) / 0.14;
      return 0.50 + Math.sin(p * Math.PI) * 0.10;           // dicrotic wave bump
    }
    const p = (tNorm - 0.50) / 0.50;
    return 0.50 * Math.exp(-p * 3.5);                       // exponential decay
  }

  // Overdamped pulse shape — slow rise, blunted peak, no notch
  function overdampedPulseShape(tNorm) {
    if (tNorm < 0.15) {
      return Math.sin((tNorm / 0.15) * Math.PI / 2);        // slow rise
    }
    if (tNorm < 0.45) {
      const p = (tNorm - 0.15) / 0.30;
      return 1 - p * 0.55;                                  // gradual decline
    }
    const p = (tNorm - 0.45) / 0.55;
    return 0.45 * Math.exp(-p * 2.5);                       // slow decay
  }

  // Underdamped pulse shape — sharp peak with ringing oscillations
  function underdampedPulseShape(tNorm) {
    if (tNorm < 0.05) {
      return Math.pow(tNorm / 0.05, 0.35);                  // very fast rise
    }
    if (tNorm < 0.20) {
      // overshoot + ringing
      const p = (tNorm - 0.05) / 0.15;
      const decay = Math.exp(-p * 3);
      return 1.15 * decay - 0.20 * decay * Math.sin(p * Math.PI * 4);
    }
    if (tNorm < 0.50) {
      const p = (tNorm - 0.20) / 0.30;
      return 0.55 * Math.exp(-p * 1.5);
    }
    const p = (tNorm - 0.50) / 0.50;
    return 0.20 * Math.exp(-p * 3);
  }

  // ─── Generator helpers ───
  function generateSamples(opts = {}) {
    const {
      duration = 6,            // seconds shown
      hr = 75,                 // bpm
      sbp = 120,
      dbp = 70,
      shape = "normal",        // normal | over | under
      respPPV = 0,             // 0..0.4 (fraction respiratory variation)
      respHz = 1 / 5,          // respiratory frequency Hz
      alternans = 0,           // 0..0.5 fraction amp drop on alt beats
      bisferiens = 0,          // 0..1 strength of second peak
      smallSlowPulse = false,  // parvus et tardus
      waterHammer = false,     // sharp rise + collapse (AR)
      noise = 0.4,             // mmHg
    } = opts;

    const total = Math.floor(duration * SAMPLE_RATE);
    const samples = new Float32Array(total);
    const period = 60 / hr;
    const shapeFn = shape === "over" ? overdampedPulseShape
                  : shape === "under" ? underdampedPulseShape
                  : normalPulseShape;

    let beatStart = 0;
    let beatIdx = 0;
    for (let i = 0; i < total; i++) {
      const t = i / SAMPLE_RATE;
      if (t - beatStart >= period) {
        beatStart += period;
        beatIdx++;
      }
      const tNorm = (t - beatStart) / period;

      // Effective amplitude with respiratory modulation
      let amp = sbp - dbp;
      let baseline = dbp;

      if (respPPV > 0) {
        amp *= (1 + respPPV * Math.sin(2 * Math.PI * respHz * t));
        baseline += (respPPV * 0.3) * (sbp - dbp) * Math.sin(2 * Math.PI * respHz * t + Math.PI);
      }

      if (alternans > 0 && beatIdx % 2 === 1) {
        amp *= (1 - alternans);
      }

      let pulse = shapeFn(tNorm);

      if (smallSlowPulse) {
        // Parvus et tardus — small, delayed peak, prolonged upstroke
        if (tNorm < 0.25) pulse = Math.pow(tNorm / 0.25, 0.7) * 0.55;
        else if (tNorm < 0.55) pulse = 0.55 - (tNorm - 0.25) * 0.8;
        else pulse = Math.max(0, 0.31 - (tNorm - 0.55) * 0.55);
        amp *= 1; // already attenuated in pulse
      }

      if (waterHammer) {
        // Sharp upstroke + collapse
        if (tNorm < 0.04) pulse = Math.pow(tNorm / 0.04, 0.3);
        else if (tNorm < 0.10) pulse = 1.0;
        else if (tNorm < 0.40) {
          const p = (tNorm - 0.10) / 0.30;
          pulse = 1.0 * Math.exp(-p * 2.2);
        } else pulse = 0.1 * Math.exp(-(tNorm - 0.40) * 4);
      }

      if (bisferiens > 0) {
        // Bisferiens — add a second peak around tNorm 0.22
        if (tNorm > 0.10 && tNorm < 0.35) {
          const peak2 = Math.exp(-Math.pow((tNorm - 0.23) / 0.05, 2));
          pulse = Math.max(pulse, 0.55 + bisferiens * 0.40 * peak2);
        }
      }

      samples[i] = baseline + amp * pulse + (Math.random() - 0.5) * noise * 2;
    }
    return samples;
  }

  // ─── Canvas drawing ───
  function setupCanvas(canvas, w = CANVAS_W, h = CANVAS_H) {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.aspectRatio = `${w} / ${h}`;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx._w = w;
    ctx._h = h;
    return ctx;
  }

  function drawGrid(ctx) {
    const w = ctx._w, h = ctx._h;
    ctx.fillStyle = "#fef7fb";
    ctx.fillRect(0, 0, w, h);

    // Pressure scale: 0–200 mmHg
    // Minor grid every 10 mmHg, major every 50
    ctx.strokeStyle = "#fbcfe8";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let p = 0; p <= 200; p += 10) {
      const y = h - (p / 200) * h;
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    // Time grid: minor every 0.2s
    const secW = w / 6; // assume 6 second strip default; render scales accordingly
    for (let s = 0; s <= 30; s++) {
      const x = (s * 0.2 / 6) * w;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    ctx.stroke();

    // Major lines
    ctx.strokeStyle = "#f9a8d4";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let p = 0; p <= 200; p += 50) {
      const y = h - (p / 200) * h;
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    for (let s = 0; s <= 6; s++) {
      const x = (s / 6) * w;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    ctx.stroke();

    // Y-axis labels (pressure)
    ctx.fillStyle = "#be185d";
    ctx.font = "bold 11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    for (let p = 50; p <= 200; p += 50) {
      const y = h - (p / 200) * h;
      ctx.fillText(`${p}`, 6, y - 4);
    }
    ctx.fillStyle = "#9d174d";
    ctx.font = "bold 10px ui-monospace, Menlo, monospace";
    ctx.fillText("mmHg", 6, 14);

    // Time tick labels
    for (let s = 1; s <= 5; s++) {
      const x = (s / 6) * w;
      ctx.fillStyle = "#be185d";
      ctx.font = "bold 10px ui-monospace, Menlo, monospace";
      ctx.fillText(`${s}s`, x + 3, h - 4);
    }
  }

  function drawTrace(ctx, samples, color = "#dc2626") {
    const w = ctx._w, h = ctx._h;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    for (let i = 0; i < samples.length; i++) {
      const x = (i / samples.length) * w;
      const y = h - (samples[i] / 200) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  function renderWaveform(canvas, samples, color) {
    const ctx = setupCanvas(canvas);
    drawGrid(ctx);
    drawTrace(ctx, samples, color);
  }

  // ─────────────────────────────────────────────────────────
  // ANATOMY VIEW — interactive labeled waveform
  // ─────────────────────────────────────────────────────────
  const ANATOMY_PARTS = [
    {
      id: "diastolic",
      name: "End-Diastolic Pressure (DBP)",
      label: "DBP",
      pos: 0.005,
      pressure: 70,
      desc: "The lowest pressure of the cycle, just before the aortic valve opens. Determined by aortic compliance, peripheral resistance, and heart rate (longer diastole = more runoff = lower DBP).",
      pearl: "DBP perfuses the coronaries — too low (<60 in a chronic HTN patient) and you're starving the myocardium during diastole.",
    },
    {
      id: "upstroke",
      name: "Anacrotic Upstroke",
      label: "Upstroke",
      pos: 0.04,
      pressure: 100,
      desc: "Steep rise as the left ventricle ejects blood into the aorta. Slope reflects LV contractility (dP/dt). A slow upstroke suggests outflow obstruction (severe aortic stenosis) or weak contractility.",
      pearl: "Slope of the upstroke = surrogate for contractility. Flat = parvus et tardus → severe AS until proven otherwise.",
    },
    {
      id: "peak",
      name: "Systolic Peak (SBP)",
      label: "SBP",
      pos: 0.08,
      pressure: 120,
      desc: "The maximum pressure during ventricular ejection. Determined by stroke volume, aortic compliance, and the rate of ejection. Affected by location: SBP amplifies the further you measure from the aortic root (radial > femoral > aortic).",
      pearl: "Peripheral amplification means a radial SBP of 130 may correspond to a central aortic SBP of ~115. MAP changes much less between sites.",
    },
    {
      id: "incisura",
      name: "Dicrotic Notch (Incisura)",
      label: "Notch",
      pos: 0.32,
      pressure: 95,
      desc: "Brief downward deflection caused by aortic valve closure and the elastic recoil of the proximal aorta. Marks the transition from systole to diastole.",
      pearl: "Loss of the dicrotic notch = overdamping. Position high on the down-slope = increased SVR. Position low = decreased SVR (vasodilation / shock).",
    },
    {
      id: "dicrotic-wave",
      name: "Dicrotic Wave",
      label: "Dicrotic",
      pos: 0.42,
      pressure: 88,
      desc: "Small positive deflection after the notch. Represents the reflected pressure wave returning from the periphery — more prominent in compliant young aortas, often absent in elderly stiff aortas.",
      pearl: "Used to estimate the position on the cardiac cycle visually. PA catheter waveforms have a similar but anatomically different feature.",
    },
    {
      id: "runoff",
      name: "Diastolic Runoff",
      label: "Runoff",
      pos: 0.65,
      pressure: 80,
      desc: "Exponential pressure decay as blood drains from aorta into the periphery. The slope reflects systemic vascular resistance — fast decay (steep) suggests vasodilation; slow decay suggests high SVR.",
      pearl: "Steep diastolic decay + wide pulse pressure = vasoplegia (septic shock, aortic regurgitation). Slow decay + narrow PP = vasoconstriction.",
    },
  ];

  function pressureToY(pressure, h) {
    return h - (pressure / 200) * h;
  }

  function anatomySVG() {
    // Build the labeled pulse SVG using anatomy-pulse model.
    // Draw two cycles for clarity.
    const w = 1000;
    const h = 320;
    const period = 0.8; // visual cycle width
    const cycles = 2;
    const totalT = period * cycles;

    // Path string
    let d = "";
    const samplesPerPx = totalT / w;
    for (let x = 0; x <= w; x++) {
      const t = x * samplesPerPx;
      const beatT = (t % period) / period;
      const p = 70 + 50 * normalPulseShape(beatT);  // DBP 70, SBP ~120
      const y = pressureToY(p, h);
      d += (x === 0 ? "M" : "L") + x + "," + y.toFixed(1) + " ";
    }

    // Hotspot positions on the first cycle
    const hotspots = ANATOMY_PARTS.map((part) => {
      const cycleX = (part.pos / 1.0) * (w / cycles);
      const y = pressureToY(part.pressure, h);
      return { ...part, x: cycleX, y };
    });

    return `
      <svg viewBox="0 0 ${w} ${h + 60}" class="aline-anatomy-svg" id="anatomy-svg" preserveAspectRatio="xMidYMid meet">
        <!-- gridlines -->
        <g stroke="#fbcfe8" stroke-width="0.5">
          ${[40, 80, 120, 160].map((p) => {
            const y = pressureToY(p, h);
            return `<line x1="0" y1="${y}" x2="${w}" y2="${y}"/>`;
          }).join("")}
        </g>
        <g stroke="#f9a8d4" stroke-width="1">
          <line x1="0" y1="${pressureToY(50, h)}" x2="${w}" y2="${pressureToY(50, h)}"/>
          <line x1="0" y1="${pressureToY(100, h)}" x2="${w}" y2="${pressureToY(100, h)}"/>
          <line x1="0" y1="${pressureToY(150, h)}" x2="${w}" y2="${pressureToY(150, h)}"/>
        </g>
        <!-- axis labels -->
        ${[50, 100, 150].map((p) => `
          <text x="4" y="${pressureToY(p, h) - 3}" font-family="monospace" font-size="11" font-weight="700" fill="#be185d">${p} mmHg</text>
        `).join("")}
        <!-- waveform path -->
        <path d="${d}" fill="none" stroke="#dc2626" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>

        <!-- hotspots (first cycle) -->
        ${hotspots.map((hs) => `
          <g class="anatomy-hotspot" data-id="${hs.id}" tabindex="0">
            <circle cx="${hs.x}" cy="${hs.y}" r="9" fill="#ec4899" stroke="white" stroke-width="3"/>
            <text x="${hs.x}" y="${hs.y - 16}" text-anchor="middle" font-family="Quicksand, sans-serif" font-size="12" font-weight="700" fill="#831843">${hs.label}</text>
          </g>
        `).join("")}

        <!-- Title row -->
        <text x="${w / 2}" y="${h + 30}" text-anchor="middle" font-family="Caveat, cursive" font-size="20" fill="#9d174d">tap any pink dot to learn that component ✿</text>
      </svg>
    `;
  }

  function renderAnatomy() {
    const view = document.getElementById("view-anatomy");
    view.innerHTML = `
      <div class="view-header">
        <div>
          <h2>🫀 Waveform Anatomy</h2>
          <div class="desc">the normal arterial pulse, labeled — tap any dot to dive in 💕</div>
        </div>
      </div>
      ${anatomySVG()}
      <div id="anatomy-detail-mount"></div>
    `;
    bindAnatomyHotspots();
    // Default: select upstroke
    showAnatomyDetail("upstroke");
  }

  function bindAnatomyHotspots() {
    document.querySelectorAll(".anatomy-hotspot").forEach((g) => {
      g.addEventListener("click", () => {
        const id = g.dataset.id;
        showAnatomyDetail(id);
        document.querySelectorAll(".anatomy-hotspot").forEach((x) => x.classList.remove("selected"));
        g.classList.add("selected");
      });
    });
  }

  function showAnatomyDetail(id) {
    const part = ANATOMY_PARTS.find((p) => p.id === id);
    if (!part) return;
    const mount = document.getElementById("anatomy-detail-mount");
    mount.innerHTML = `
      <div class="anatomy-detail">
        <h3>${part.name}</h3>
        <div class="desc">${part.desc}</div>
        <div class="pearl"><strong>Pearl:</strong> ${part.pearl}</div>
        <div class="ai-mount-anatomy"></div>
      </div>
    `;
    document.querySelectorAll(".anatomy-hotspot").forEach((g) => {
      if (g.dataset.id === id) g.classList.add("selected");
    });
    if (window.AITutor) {
      window.AITutor.attachAIButtons(mount.querySelector(".ai-mount-anatomy"), {
        topic: "Arterial line waveform",
        section: part.name,
        getContent: () => `${part.desc}\n\nPearl: ${part.pearl}`,
      });
    }
  }

  // ─────────────────────────────────────────────────────────
  // DAMPING VIEW — interactive slider + flush test
  // ─────────────────────────────────────────────────────────
  let dampingValue = 0.7; // 0=over, 0.7=optimal, 1=under (visual coefficient)

  function renderDamping() {
    const view = document.getElementById("view-damping");
    view.innerHTML = `
      <div class="view-header">
        <div>
          <h2>📊 Damping</h2>
          <div class="desc">slide between overdamped → optimal → underdamped. watch the dicrotic notch appear / disappear ✿</div>
        </div>
      </div>

      <div class="damping-controls">
        <div>
          <div class="damping-slider-label">
            <span>damping coefficient</span>
            <span class="value" id="damping-value">optimal</span>
          </div>
          <div class="damping-row">
            <span style="font-size:12px;color:var(--ink-soft);font-weight:700">over</span>
            <input type="range" min="0" max="1" step="0.01" value="${dampingValue}" id="damping-slider"/>
            <span style="font-size:12px;color:var(--ink-soft);font-weight:700">under</span>
          </div>
        </div>
        <button class="flush-test-btn" id="flush-test-btn">⚡ run flush test (square wave)</button>
      </div>

      <div class="aline-canvas-wrap">
        <div class="aline-canvas-meta">
          <div class="aline-strip-label">art line · 0–200 mmHg · 6 sec</div>
          <div class="aline-pill" id="damping-pill">optimal damping</div>
        </div>
        <div class="aline-canvas-container">
          <canvas class="aline-canvas" id="damping-canvas"></canvas>
        </div>
      </div>

      <div class="info-block-grid">
        <div class="info-block-card">
          <h3>What damping means</h3>
          <p>The arterial pressure transducer is a mechanical system — fluid-filled tubing connecting an indwelling catheter to a strain-gauge transducer. Like any mechanical system it has a <strong>natural frequency</strong> (how fast it can faithfully follow pressure changes) and a <strong>damping coefficient</strong> (how quickly oscillations die out).</p>
          <p>The optimal range is a damping coefficient of <strong>0.4 – 0.7</strong> with a natural frequency above ~20 Hz, validated by the <strong>square-wave (fast-flush) test</strong>.</p>
        </div>
        <div class="info-block-card">
          <h3>Flush test interpretation</h3>
          <ul>
            <li><strong>Optimal damping:</strong> 1 small oscillation (≤2) after the square wave</li>
            <li><strong>Underdamped:</strong> 3+ oscillations — sharp, ringing waveform</li>
            <li><strong>Overdamped:</strong> No oscillation, slow return to baseline</li>
          </ul>
        </div>
        <div class="info-block-card">
          <h3>Overdamped — causes &amp; effect</h3>
          <ul>
            <li><strong>Causes:</strong> air bubble in tubing, partial clot at catheter tip, kinked or compliant tubing, loose connections, long extension</li>
            <li><strong>Reading effect:</strong> underestimates SBP, overestimates DBP — pulse pressure looks narrow</li>
            <li><strong>MAP relatively preserved</strong> — when damping is questionable, trust the MAP</li>
            <li><strong>Fix:</strong> flush line, check for air, tighten connections, replace tubing</li>
          </ul>
        </div>
        <div class="info-block-card">
          <h3>Underdamped — causes &amp; effect</h3>
          <ul>
            <li><strong>Causes:</strong> stiff non-compliant tubing, tachycardia + hyperdynamic state, calcifications</li>
            <li><strong>Reading effect:</strong> overestimates SBP (whip artifact), underestimates DBP</li>
            <li><strong>MAP again relatively preserved</strong></li>
            <li><strong>Fix:</strong> use a damping device (e.g., Accudynamic), shorten tubing, ensure no kinks introducing resonance</li>
          </ul>
        </div>
      </div>
    `;
    document.getElementById("damping-slider").addEventListener("input", (e) => {
      dampingValue = parseFloat(e.target.value);
      updateDampingDisplay();
    });
    document.getElementById("flush-test-btn").addEventListener("click", () => {
      runFlushTest();
    });
    updateDampingDisplay();
  }

  function updateDampingDisplay() {
    const v = dampingValue;
    const label = v < 0.35 ? "overdamped" : v > 0.85 ? "underdamped" : "optimal";
    document.getElementById("damping-value").textContent = label;
    document.getElementById("damping-pill").textContent = label + " damping";

    let shape = "normal";
    if (v < 0.35) shape = "over";
    else if (v > 0.85) shape = "under";

    const samples = generateSamples({
      duration: 6,
      hr: 75,
      sbp: 120,
      dbp: 70,
      shape,
      noise: 0.5,
    });
    const canvas = document.getElementById("damping-canvas");
    renderWaveform(canvas, samples);
  }

  function runFlushTest() {
    const canvas = document.getElementById("damping-canvas");
    const ctx = setupCanvas(canvas);
    const w = ctx._w, h = ctx._h;

    // Generate a strip: 2 cycles arterial → flush spike → return
    const dur = 6;
    const total = dur * SAMPLE_RATE;
    const samples = new Float32Array(total);
    const period = 60 / 75;
    let beatStart = 0;
    const flushStart = 2;       // sec
    const flushEnd = 3;         // sec
    const oscPeriod = 0.04;     // rapid oscillations after flush

    // Damping affects post-flush ringing count
    const v = dampingValue;
    const oscCount = v < 0.35 ? 0 : v > 0.85 ? 5 : 1; // overdamped = 0, optimal = 1, underdamped = 5
    const oscDecay = v < 0.35 ? 6 : v > 0.85 ? 1.2 : 4;

    const shape = v < 0.35 ? "over" : v > 0.85 ? "under" : "normal";
    const shapeFn = shape === "over" ? overdampedPulseShape
                  : shape === "under" ? underdampedPulseShape
                  : normalPulseShape;

    for (let i = 0; i < total; i++) {
      const t = i / SAMPLE_RATE;

      // Default arterial pulse
      while (t - beatStart >= period) beatStart += period;
      const tNorm = (t - beatStart) / period;
      let p = 70 + 50 * shapeFn(tNorm);

      // Flush region
      if (t >= flushStart && t < flushEnd) {
        // Square wave at ~300 mmHg (flush bag pressure)
        p = 300;
      } else if (t >= flushEnd && t < flushEnd + 0.8) {
        // Post-flush ringing
        const tp = t - flushEnd;
        const decay = Math.exp(-tp * oscDecay);
        // ringing oscillation
        const ring = Math.sin(2 * Math.PI * tp / oscPeriod) * 50 * decay;
        p = 70 + 50 * shapeFn(tNorm) + ring + (Math.random() - 0.5) * 1.5;
      }

      samples[i] = Math.max(0, Math.min(330, p)) + (Math.random() - 0.5) * 0.8;
    }

    drawGrid(ctx);
    // Note: above 200 will clip the trace, but mark the flush region for clarity
    drawTrace(ctx, samples);

    // Overlay flush annotation
    ctx.fillStyle = "rgba(168, 85, 247, 0.08)";
    const fx0 = (flushStart / dur) * w;
    const fxW = ((flushEnd - flushStart) / dur) * w;
    ctx.fillRect(fx0, 0, fxW, h);
    ctx.fillStyle = "#7e22ce";
    ctx.font = 'bold 13px "Quicksand", sans-serif';
    ctx.textAlign = "center";
    ctx.fillText("FLUSH", fx0 + fxW / 2, 24);
    ctx.fillText(`${oscCount === 0 ? "no oscillations → overdamped" : oscCount === 1 ? "1 oscillation → optimal" : `${oscCount} oscillations → underdamped`}`, fx0 + fxW + 80, 24);
    ctx.textAlign = "left";
  }

  // ─────────────────────────────────────────────────────────
  // VARIANTS VIEW — abnormal waveform library
  // ─────────────────────────────────────────────────────────
  const VARIANTS = [
    {
      id: "normal",
      name: "Normal",
      feature: "Sharp anacrotic upstroke, clear systolic peak, visible dicrotic notch, exponential diastolic decay.",
      seenIn: "Healthy patient with intact AV and adequate volume status.",
      hallmark: "All features visible; reasonable pulse pressure (~40 mmHg).",
      pathophys: "Normal LV ejection into a compliant aorta with intact aortic valve closure and normal peripheral resistance.",
      bedsideClues: ["Pulse pressure 30–50 mmHg", "Visible dicrotic notch on close inspection", "1 oscillation on flush test"],
      management: ["No intervention — this is the reference"],
      generate: () => generateSamples({ hr: 75, sbp: 120, dbp: 70 }),
    },
    {
      id: "overdamped",
      name: "Overdamped",
      feature: "Slow upstroke, rounded peak, NO dicrotic notch, narrow-looking pulse pressure.",
      seenIn: "Air bubbles, kinked tubing, clot, loose connection, compliant tubing.",
      hallmark: "No notch, sluggish trace, no flush ringing.",
      pathophys: "Mechanical attenuation of high-frequency components of the pressure wave by the tubing/transducer system.",
      bedsideClues: ["Falsely low SBP", "Falsely high DBP", "MAP relatively preserved — trust it", "Flush test: no oscillations"],
      management: ["Check for air — flush thoroughly", "Check connections", "Replace tubing if persistent", "Re-zero and re-level"],
      generate: () => generateSamples({ hr: 75, sbp: 120, dbp: 70, shape: "over" }),
    },
    {
      id: "underdamped",
      name: "Underdamped",
      feature: "Sharp narrow peaks with whip / oscillation artifact, falsely tall SBP.",
      seenIn: "Stiff non-compliant tubing, tachyarrhythmia, hyperdynamic state.",
      hallmark: "Whip after each systolic peak, exaggerated pulse pressure.",
      pathophys: "Resonance: the transducer system natural frequency is close to the cardiac frequency, amplifying pressure components.",
      bedsideClues: ["Falsely high SBP", "Falsely low DBP", "Flush test: 3+ oscillations after square wave"],
      management: ["Shorten tubing", "Use a damping device (e.g., Accudynamic)", "Eliminate kinks", "Trust MAP, not SBP/DBP"],
      generate: () => generateSamples({ hr: 75, sbp: 130, dbp: 65, shape: "under" }),
    },
    {
      id: "ppv",
      name: "Respiratory Variation (PPV)",
      feature: "Beat-to-beat amplitude varies cyclically with respiration.",
      seenIn: "Hypovolemia in mechanically ventilated patients — preload responsiveness.",
      hallmark: "PPV > 13% predicts fluid responsiveness in a deeply sedated, sinus-rhythm, tidal-volume-6+ vent patient.",
      pathophys: "Positive-pressure ventilation transiently increases intrathoracic pressure → decreases RV preload → after 2–3 beats, decreases LV preload and stroke volume → narrows pulse pressure on those beats.",
      bedsideClues: ["Cyclical amplitude variation matching the vent rate", "Greater swing = more volume responsive"],
      management: ["Fluid challenge if PPV > 13% AND clinically hypoperfused", "PPV is INVALID in: spontaneous breathing, arrhythmias, low TV (<7 ml/kg), open chest, ↑↑ PEEP, RV failure"],
      generate: () => generateSamples({ hr: 90, sbp: 110, dbp: 65, respPPV: 0.30, respHz: 1 / 4 }),
    },
    {
      id: "paradoxus",
      name: "Pulsus Paradoxus",
      feature: "Systolic BP drops > 10 mmHg during INSPIRATION (spontaneous breathing).",
      seenIn: "Cardiac tamponade (classic), severe asthma, COPD exacerbation, tension pneumothorax, massive PE.",
      hallmark: "Exaggerated respiratory variation in a SPONTANEOUSLY breathing patient.",
      pathophys: "In tamponade: pericardial effusion limits cardiac volume. During inspiration, RV fills more (negative intrathoracic pressure increases venous return) → septum bows into LV → LV filling and SV drop → SBP drops.",
      bedsideClues: ["Drop > 10 mmHg with normal breathing", "Drop > 20 mmHg is severe", "JVD with clear lungs + paradoxus + muffled heart sounds = Beck's triad of tamponade"],
      management: ["Find the cause — echo for tamponade, treat the trigger", "Tamponade: pericardiocentesis", "Severe asthma: aggressive bronchodilation"],
      generate: () => generateSamples({ hr: 95, sbp: 110, dbp: 65, respPPV: 0.45, respHz: 1 / 4 }),
    },
    {
      id: "alternans",
      name: "Pulsus Alternans",
      feature: "Regular alternation between strong and weak beats with constant R-R interval.",
      seenIn: "Severe LV systolic dysfunction — ominous finding.",
      hallmark: "Strong-weak-strong-weak in a regular rhythm.",
      pathophys: "Calcium cycling abnormality in failing myocytes — alternating ineffective and effective contractions despite consistent loading conditions.",
      bedsideClues: ["Often appears late in decompensated heart failure", "Best appreciated on art line waveform amplitude", "Sometimes detectable on palpated pulse"],
      management: ["Treat underlying HF — diuresis, afterload reduction, inotropes if needed", "Frequently bridges to MCS or transplant evaluation"],
      generate: () => generateSamples({ hr: 75, sbp: 110, dbp: 70, alternans: 0.30 }),
    },
    {
      id: "bisferiens",
      name: "Pulsus Bisferiens",
      feature: "Two distinct systolic peaks within a single beat (\"twice-beating pulse\").",
      seenIn: "Hypertrophic obstructive cardiomyopathy (HOCM), mixed aortic regurgitation + stenosis (significant AR predominant).",
      hallmark: "Two upstrokes per cardiac cycle — palpable on carotid.",
      pathophys: "HOCM: initial peak from rapid ejection, mid-systolic dip from dynamic LVOT obstruction, second peak as obstruction releases. Mixed AS/AR: percussion wave + tidal wave both prominent.",
      bedsideClues: ["Distinct from dicrotic notch (which is later, after S2)", "Both peaks occur in systole"],
      management: ["HOCM: β-blockers, avoid vasodilators / inotropes / diuretics", "Mixed valve disease: TEE, surgical evaluation"],
      generate: () => generateSamples({ hr: 75, sbp: 120, dbp: 75, bisferiens: 0.7 }),
    },
    {
      id: "parvus-tardus",
      name: "Pulsus Parvus et Tardus",
      feature: "Small (parvus) amplitude and slow / delayed (tardus) upstroke.",
      seenIn: "Severe aortic stenosis.",
      hallmark: "Diminished pulse pressure + visibly slow rise time on the waveform.",
      pathophys: "Fixed outflow obstruction limits the rate and total volume of LV ejection.",
      bedsideClues: ["Delayed carotid upstroke (carotid is closer to aorta — most reliable site)", "Soft / absent A2 in severe disease", "Narrow pulse pressure < 30 mmHg"],
      management: ["Echo to confirm — symptomatic severe AS = surgical / TAVR referral", "AVOID vasodilators, venodilators, neuraxial anesthesia without preparation"],
      generate: () => generateSamples({ hr: 75, sbp: 95, dbp: 70, smallSlowPulse: true }),
    },
    {
      id: "water-hammer",
      name: "Water-Hammer Pulse (Corrigan)",
      feature: "Rapid, forceful upstroke with immediate collapse — wide pulse pressure.",
      seenIn: "Severe aortic regurgitation, large PDA, AV fistula, high-output states (sepsis, thyrotoxicosis, anemia).",
      hallmark: "Bounding pulse + wide pulse pressure (often > 80 mmHg).",
      pathophys: "Regurgitation creates a large stroke volume with rapid backflow into the LV during diastole → high SBP, low DBP.",
      bedsideClues: ["Corrigan's pulse (visible neck pulsation)", "Quincke's sign (nail-bed pulsation)", "de Musset's head bobbing"],
      management: ["Acute severe AR (endocarditis, dissection) = surgical emergency", "Chronic severe AR with symptoms or LVEF < 50% = surgical referral"],
      generate: () => generateSamples({ hr: 80, sbp: 160, dbp: 50, waterHammer: true }),
    },
    {
      id: "low-pulsatility",
      name: "Reduced Pulsatility",
      feature: "Flattened, low-amplitude waveform with narrow pulse pressure.",
      seenIn: "VA-ECMO, severe LV failure, deep shock, mechanical circulatory support (LVAD), continuous-flow devices.",
      hallmark: "Pulse pressure often < 15 mmHg; aortic valve may not open every beat.",
      pathophys: "Continuous-flow devices and severe pump failure produce non-pulsatile or minimally-pulsatile flow.",
      bedsideClues: ["MAP becomes the primary monitoring number", "Pulse oximeter may not detect a pulse", "Echo to confirm AV opening"],
      management: ["MAP-guided support", "Goal MAP per ECMO/LVAD protocol", "Consider LV venting (Impella, IABP) if LV distension develops on ECMO"],
      generate: () => generateSamples({ hr: 75, sbp: 78, dbp: 70, shape: "over", noise: 0.5 }),
    },
  ];

  function renderAbnormal() {
    const view = document.getElementById("view-abnormal");
    view.innerHTML = `
      <div class="view-header">
        <div>
          <h2>🌊 Waveform Variants</h2>
          <div class="desc">tap any thumbnail to see the full breakdown — what causes it, what to do ✿</div>
        </div>
      </div>
      <div class="abnormal-grid" id="abnormal-grid"></div>
      <div id="variant-detail"></div>
    `;
    const grid = document.getElementById("abnormal-grid");
    VARIANTS.forEach((v) => {
      const card = document.createElement("div");
      card.className = "abnormal-card";
      card.dataset.id = v.id;
      card.innerHTML = `
        <canvas></canvas>
        <h3>${v.name}</h3>
        <div class="feature">${v.feature}</div>
        <div class="seen-in"><strong>seen in:</strong> ${v.seenIn}</div>
      `;
      grid.appendChild(card);
      const canvas = card.querySelector("canvas");
      // Smaller preview canvases
      const ctx = setupCanvas(canvas, 480, 160);
      drawGrid(ctx);
      drawTrace(ctx, v.generate());
      card.addEventListener("click", () => showVariantDetail(v.id));
    });
  }

  function showVariantDetail(id) {
    const v = VARIANTS.find((x) => x.id === id);
    if (!v) return;
    const target = document.getElementById("variant-detail");
    target.innerHTML = `
      <div class="abnormal-detail">
        <button class="back-btn" id="variant-back">← back to variants</button>
        <h3>${v.name}</h3>
        <div style="font-size:14px;color:var(--ink);margin-bottom:14px"><strong style="color:var(--pink-deep)">Hallmark:</strong> ${v.hallmark}</div>

        <div class="aline-canvas-wrap">
          <div class="aline-canvas-meta">
            <div class="aline-strip-label">art line · 0–200 mmHg · 6 sec</div>
            <div class="aline-pill">${v.name}</div>
          </div>
          <div class="aline-canvas-container">
            <canvas class="aline-canvas" id="variant-detail-canvas"></canvas>
          </div>
        </div>

        <div class="abnormal-detail-grid">
          <div class="abnormal-detail-card">
            <h4>Pathophysiology</h4>
            <p style="font-size:14px;line-height:1.6">${v.pathophys}</p>
          </div>
          <div class="abnormal-detail-card warn">
            <h4>Bedside Clues</h4>
            <ul>${v.bedsideClues.map((c) => `<li>${c}</li>`).join("")}</ul>
          </div>
          <div class="abnormal-detail-card info">
            <h4>Management</h4>
            <ul>${v.management.map((m) => `<li>${m}</li>`).join("")}</ul>
          </div>
          <div class="abnormal-detail-card">
            <h4>Seen In</h4>
            <p style="font-size:14px;line-height:1.55">${v.seenIn}</p>
          </div>
        </div>
        <div class="ai-mount-variant" style="margin-top:14px"></div>
      </div>
    `;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    // Big render
    const canvas = document.getElementById("variant-detail-canvas");
    renderWaveform(canvas, v.generate());
    document.getElementById("variant-back").addEventListener("click", () => {
      target.innerHTML = "";
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    if (window.AITutor) {
      const content = `${v.feature}\n\nHallmark: ${v.hallmark}\n\nPathophysiology: ${v.pathophys}\n\nBedside clues:\n${v.bedsideClues.map((c) => "• " + c).join("\n")}\n\nManagement:\n${v.management.map((m) => "• " + m).join("\n")}`;
      window.AITutor.attachAIButtons(target.querySelector(".ai-mount-variant"), {
        topic: `Arterial line waveform: ${v.name}`,
        section: v.name,
        getContent: () => content,
      });
    }
  }

  // ─────────────────────────────────────────────────────────
  // SETUP & PRESSURES VIEW
  // ─────────────────────────────────────────────────────────
  function renderSetup() {
    const view = document.getElementById("view-setup");
    view.innerHTML = `
      <div class="view-header">
        <div>
          <h2>📐 Setup &amp; Pressures</h2>
          <div class="desc">leveling, zeroing, MAP / pulse pressure / PPV — the math you need at the bedside ✿</div>
        </div>
      </div>

      <div class="pressure-calc">
        <h3 style="margin:0 0 14px;font-size:18px;color:var(--pink-deep);font-weight:700;letter-spacing:0.05em">✿ Pressure Calculator</h3>
        <div class="pressure-inputs">
          <div class="pressure-input">
            <label>Systolic (mmHg)</label>
            <input type="number" id="calc-sbp" value="120" min="40" max="250"/>
          </div>
          <div class="pressure-input">
            <label>Diastolic (mmHg)</label>
            <input type="number" id="calc-dbp" value="70" min="20" max="150"/>
          </div>
          <div class="pressure-input">
            <label>Heart Rate (bpm)</label>
            <input type="number" id="calc-hr" value="75" min="20" max="220"/>
          </div>
        </div>
        <div class="pressure-results">
          <div class="pressure-result-card">
            <div class="label">Mean Arterial Pressure</div>
            <div class="value" id="calc-map">87</div>
            <div class="formula">(SBP + 2×DBP) ÷ 3</div>
          </div>
          <div class="pressure-result-card">
            <div class="label">Pulse Pressure</div>
            <div class="value" id="calc-pp">50</div>
            <div class="formula">SBP − DBP</div>
          </div>
        </div>
      </div>

      <div class="info-block-grid">
        <div class="info-block-card">
          <h3>Phlebostatic Axis (zeroing reference)</h3>
          <p>Level the transducer at the <strong>phlebostatic axis</strong>: the intersection of the <strong>4th intercostal space</strong> and the <strong>midaxillary line</strong> — approximately the level of the right atrium / tricuspid annulus.</p>
          <ul>
            <li>Above the axis = falsely LOW reading (gravity column adds pressure to transducer)</li>
            <li>Below the axis = falsely HIGH reading</li>
            <li>≈ 1 inch (2.5 cm) off = ~2 mmHg error</li>
            <li>Re-level any time the patient is repositioned (head of bed up/down)</li>
          </ul>
        </div>
        <div class="info-block-card">
          <h3>Zero to atmosphere</h3>
          <ul>
            <li>Close stopcock to the patient, open to air</li>
            <li>Press "zero" on the monitor</li>
            <li>Confirms 0 mmHg = atmospheric — eliminates barometric offset</li>
            <li>Re-zero: shift change, after disconnections, before clinical decisions, when readings seem off</li>
          </ul>
        </div>
        <div class="info-block-card">
          <h3>MAP — why it's the truth</h3>
          <ul>
            <li>MAP = (SBP + 2·DBP) / 3 — weighted toward diastole because diastole occupies ~⅔ of the cycle at normal HR</li>
            <li>At fast heart rates the diastolic fraction shrinks — formula becomes less accurate</li>
            <li>The monitor calculates MAP from the area under the actual pressure curve — more accurate than the formula</li>
            <li><strong>MAP is the parameter most resistant to damping artifact</strong> — when SBP / DBP look off, trust MAP</li>
            <li>Standard target: MAP ≥ 65 mmHg; higher (75–85) in chronic HTN, neuro (SAH, stroke), and per institutional protocols</li>
          </ul>
        </div>
        <div class="info-block-card">
          <h3>Pulse Pressure clues</h3>
          <ul>
            <li><strong>Wide</strong> (> 60): aortic regurgitation, high-output state (sepsis, thyrotoxicosis, AV fistula, anemia)</li>
            <li><strong>Narrow</strong> (< 25): cardiogenic shock, severe aortic stenosis, hypovolemia, tamponade</li>
            <li><strong>PP/SBP &lt; 25%</strong> in HF = low CO and poor prognosis</li>
            <li>Trend it — sudden narrowing = something just changed</li>
          </ul>
        </div>
        <div class="info-block-card">
          <h3>PPV (Pulse Pressure Variation)</h3>
          <p><strong>PPV = (PP<sub>max</sub> − PP<sub>min</sub>) / PP<sub>mean</sub> × 100</strong></p>
          <ul>
            <li><strong>&gt; 13%</strong> in a properly conditioned patient = likely fluid-responsive</li>
            <li>Requirements: mechanical ventilation, deeply sedated (no spontaneous effort), sinus rhythm, tidal volume ≥ 7–8 mL/kg, no significant arrhythmia, no open chest, normal RV function</li>
            <li>If ANY of those are off, PPV is unreliable — use passive leg raise, fluid challenge, echo, or other dynamic indices instead</li>
          </ul>
        </div>
        <div class="info-block-card">
          <h3>Site choice (typical insertion order)</h3>
          <ul>
            <li><strong>Radial</strong> (1st choice) — collateral via ulnar, accessible, low complication rate; Allen test optional per institution</li>
            <li><strong>Femoral</strong> — usable when radial fails or in arrest; deeper, less site infection if well-managed, watch for retroperitoneal bleed</li>
            <li><strong>Brachial</strong> — fewer collaterals, end-artery situation; some institutions avoid</li>
            <li><strong>Axillary</strong> — closer to central pressure, useful in vasoconstricted shock; specialized placement</li>
            <li><strong>Dorsalis pedis</strong> — rare in adults, more in peds</li>
          </ul>
        </div>
      </div>
    `;
    const updateCalc = () => {
      const sbp = parseFloat(document.getElementById("calc-sbp").value) || 0;
      const dbp = parseFloat(document.getElementById("calc-dbp").value) || 0;
      const map = Math.round((sbp + 2 * dbp) / 3);
      const pp = Math.round(sbp - dbp);
      document.getElementById("calc-map").textContent = map;
      document.getElementById("calc-pp").textContent = pp;
    };
    document.getElementById("calc-sbp").addEventListener("input", updateCalc);
    document.getElementById("calc-dbp").addEventListener("input", updateCalc);
    document.getElementById("calc-hr").addEventListener("input", updateCalc);
    updateCalc();
  }

  // ─────────────────────────────────────────────────────────
  // COMPLICATIONS / PEARLS VIEW
  // ─────────────────────────────────────────────────────────
  function renderPearls() {
    const view = document.getElementById("view-pearls");
    view.innerHTML = `
      <div class="view-header">
        <div>
          <h2>💊 Complications &amp; Pearls</h2>
          <div class="desc">what can go wrong, what to watch, and what every CCN should know ✿</div>
        </div>
      </div>
      <div class="info-block-grid">
        <div class="info-block-card danger">
          <h3>Distal Ischemia</h3>
          <ul>
            <li>Most common serious complication</li>
            <li>Risks: large catheter relative to vessel, vasoconstriction (pressors), pre-existing PVD, prolonged duration</li>
            <li>Monitor: distal capillary refill, color, temperature, pulse oximetry on ipsilateral fingers</li>
            <li>Act fast on color change — pull line, vascular consult if severe</li>
          </ul>
        </div>
        <div class="info-block-card danger">
          <h3>Accidental Disconnection / Bleeding</h3>
          <ul>
            <li>Catastrophic — arterial bleeding can be massive within minutes</li>
            <li>Keep all connections Luer-locked and visible (don't bury under linens)</li>
            <li>Patient agitation or transfers are highest-risk moments</li>
            <li>Direct pressure first; emergency response if needed</li>
          </ul>
        </div>
        <div class="info-block-card">
          <h3>Infection</h3>
          <ul>
            <li>Lower risk than central lines but real</li>
            <li>Maximal barrier precautions at insertion; chlorhexidine prep; sterile dressing</li>
            <li>Femoral > radial for infection risk</li>
            <li>Replace only with clinical concern — no routine replacement evidence</li>
            <li>Watch for site redness, warmth, drainage, unexplained fever</li>
          </ul>
        </div>
        <div class="info-block-card">
          <h3>Thrombosis</h3>
          <ul>
            <li>Decreases with continuous heparinized flush (1–3 mL/hr) — institution-dependent</li>
            <li>Larger catheter, longer duration, vasopressors all increase risk</li>
            <li>Pulse loss after removal usually transient but document baseline distal pulses before insertion</li>
          </ul>
        </div>
        <div class="info-block-card">
          <h3>Nerve Injury</h3>
          <ul>
            <li>Median nerve (radial site) — uncommon</li>
            <li>Hematoma compression > direct injury</li>
            <li>Patient reports paresthesias / numbness → re-evaluate site</li>
          </ul>
        </div>
        <div class="info-block-card">
          <h3>Sampling Errors (false labs)</h3>
          <ul>
            <li>Discard volume: at least 3× the dead-space (usually 3–5 mL) before sampling — ensures clean sample</li>
            <li>Return discarded blood to patient via closed system to minimize blood loss</li>
            <li>Air bubbles in sample → falsely high PaO₂, falsely low PaCO₂</li>
            <li>Delay in processing → falling pH, rising K⁺ (anaerobic glycolysis)</li>
            <li>Heparin too dilute → microclots; too concentrated → falsely low pH/PaCO₂</li>
          </ul>
        </div>
        <div class="info-block-card">
          <h3>Allen Test (per institution)</h3>
          <ul>
            <li>Occlude radial + ulnar arteries with thumbs while patient pumps fist → hand pales</li>
            <li>Release ulnar only → palmar arch should pink up within ~7 seconds</li>
            <li>Prolonged refill (&gt;10 sec) suggests poor collateral — choose another site</li>
            <li>Evidence for utility is mixed; many institutions no longer require it but it's still tested on boards</li>
          </ul>
        </div>
        <div class="info-block-card">
          <h3>Bedside Troubleshooting</h3>
          <ul>
            <li>Sudden flat / dampened tracing → check for clot, kink, air, loose connection, stopcock position</li>
            <li>Wildly oscillating → check tubing length, kinks, system natural frequency</li>
            <li>Discrepancy with NIBP > 20 mmHg → re-zero, re-level, run flush test before doubting NIBP</li>
            <li>"Square wave" of flush ABSENT → no patency; full ringing → underdamped system</li>
          </ul>
        </div>
      </div>
    `;
  }

  // ─────────────────────────────────────────────────────────
  // QUIZ VIEW — identify the waveform
  // ─────────────────────────────────────────────────────────
  const QUIZ_STATE = { score: 0, total: 0, streak: 0, current: null, answered: false };

  function loadAlineQuiz() {
    try {
      const saved = JSON.parse(localStorage.getItem("aline_quiz_state") || "{}");
      QUIZ_STATE.score = saved.score || 0;
      QUIZ_STATE.total = saved.total || 0;
      QUIZ_STATE.streak = saved.streak || 0;
    } catch (e) {}
  }
  function saveAlineQuiz() {
    try {
      localStorage.setItem("aline_quiz_state", JSON.stringify({
        score: QUIZ_STATE.score, total: QUIZ_STATE.total, streak: QUIZ_STATE.streak
      }));
    } catch (e) {}
  }

  function pickQuizVariant() {
    return VARIANTS[Math.floor(Math.random() * VARIANTS.length)];
  }

  function newQuizStrip() {
    const v = pickQuizVariant();
    QUIZ_STATE.current = v;
    QUIZ_STATE.answered = false;
    const canvas = document.getElementById("aline-quiz-canvas");
    if (canvas) renderWaveform(canvas, v.generate());
    document.getElementById("aline-quiz-pill").style.display = "none";
    document.getElementById("aline-quiz-feedback").textContent = "";

    // 4 options: correct + 3 distractors
    const distractors = [];
    const pool = VARIANTS.filter((x) => x.id !== v.id);
    while (distractors.length < 3) {
      const pick = pool[Math.floor(Math.random() * pool.length)];
      if (!distractors.find((d) => d.id === pick.id)) distractors.push(pick);
    }
    const options = [v, ...distractors].sort(() => Math.random() - 0.5);
    const opts = document.getElementById("aline-quiz-options");
    opts.innerHTML = "";
    options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "quiz-option";
      btn.innerHTML = `<span style="color:var(--pink-deep);font-family:var(--font-fun);font-size:18px;margin-right:8px">${"ABCD"[i]}</span> ${opt.name}`;
      btn.onclick = () => handleQuizAnswer(opt, btn);
      opts.appendChild(btn);
    });
  }

  function handleQuizAnswer(picked, btn) {
    if (QUIZ_STATE.answered) return;
    QUIZ_STATE.answered = true;
    QUIZ_STATE.total += 1;
    const correct = picked.id === QUIZ_STATE.current.id;
    document.querySelectorAll("#aline-quiz-options .quiz-option").forEach((b) => b.disabled = true);
    if (correct) {
      QUIZ_STATE.score += 1;
      QUIZ_STATE.streak += 1;
      btn.classList.add("correct");
      document.getElementById("aline-quiz-feedback").textContent = `slay ✨ that's ${QUIZ_STATE.current.name}`;
    } else {
      QUIZ_STATE.streak = 0;
      btn.classList.add("wrong");
      document.querySelectorAll("#aline-quiz-options .quiz-option").forEach((b) => {
        if (b.textContent.includes(QUIZ_STATE.current.name)) b.classList.add("correct");
      });
      document.getElementById("aline-quiz-feedback").textContent = `it's ${QUIZ_STATE.current.name} 💕 you got this next one`;
    }
    document.getElementById("aline-quiz-pill").textContent = QUIZ_STATE.current.name;
    document.getElementById("aline-quiz-pill").style.display = "";
    document.getElementById("aline-quiz-correct").textContent = QUIZ_STATE.score;
    document.getElementById("aline-quiz-total").textContent = QUIZ_STATE.total;
    document.getElementById("aline-quiz-streak").textContent = QUIZ_STATE.streak;
    saveAlineQuiz();
  }

  function renderQuiz() {
    const view = document.getElementById("view-quiz");
    view.innerHTML = `
      <div class="view-header">
        <div>
          <h2>🎀 A-Line Quiz</h2>
          <div class="desc">identify the waveform variant — score &amp; streak save automatically ✨</div>
        </div>
      </div>
      <div class="quiz-banner">
        <div>
          <h3>what's wrong with this waveform?</h3>
          <div style="color:var(--ink-soft);font-size:13px">study the strip, then pick</div>
        </div>
        <div class="quiz-stats">
          <div class="stat"><span id="aline-quiz-correct">${QUIZ_STATE.score}</span><div class="label">correct</div></div>
          <div class="stat"><span id="aline-quiz-total">${QUIZ_STATE.total}</span><div class="label">total</div></div>
          <div class="stat"><span id="aline-quiz-streak">${QUIZ_STATE.streak}</span> 🔥<div class="label">streak</div></div>
        </div>
      </div>
      <div class="aline-canvas-wrap">
        <div class="aline-canvas-meta">
          <div class="aline-strip-label">art line · 0–200 mmHg · 6 sec</div>
          <div class="aline-pill" id="aline-quiz-pill" style="display:none"></div>
        </div>
        <div class="aline-canvas-container">
          <canvas class="aline-canvas" id="aline-quiz-canvas"></canvas>
        </div>
      </div>
      <div class="quiz-options" id="aline-quiz-options"></div>
      <div style="text-align:center;margin-top:14px">
        <button class="primary" id="aline-quiz-next">next strip ✿</button>
      </div>
      <div class="quiz-result" id="aline-quiz-feedback" style="text-align:center"></div>
    `;
    document.getElementById("aline-quiz-next").addEventListener("click", newQuizStrip);
    newQuizStrip();
  }

  // ─────────────────────────────────────────────────────────
  // View switching
  // ─────────────────────────────────────────────────────────
  function switchView(viewId) {
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
    document.querySelectorAll(".mode-tab").forEach((t) => t.classList.remove("active"));
    document.getElementById(viewId).classList.add("active");
    document.querySelector(`[data-view="${viewId}"]`)?.classList.add("active");
    if (viewId === "view-anatomy") renderAnatomy();
    if (viewId === "view-damping") renderDamping();
    if (viewId === "view-abnormal") renderAbnormal();
    if (viewId === "view-setup") renderSetup();
    if (viewId === "view-pearls") renderPearls();
    if (viewId === "view-quiz") renderQuiz();
  }

  function init() {
    document.querySelectorAll(".mode-tab").forEach((tab) => {
      tab.addEventListener("click", () => switchView(tab.dataset.view));
    });
    loadAlineQuiz();
    switchView("view-anatomy");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
