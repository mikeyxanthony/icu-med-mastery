// ============================================================
// EKG Strip Generator — accurate 6-second rhythm strips
// Lead II conventions · 25 mm/sec · 10 mm/mV
// ============================================================
(() => {
  // ─── Paper / sampling constants ───
  const SAMPLE_RATE = 500;                // samples per second
  const DURATION = 6;                     // seconds
  const TOTAL_SAMPLES = SAMPLE_RATE * DURATION; // 3000

  const MM_PER_SEC = 25;
  const MM_PER_MV = 10;
  const PX_PER_MM = 10;                   // canvas resolution scale
  const CANVAS_W = DURATION * MM_PER_SEC * PX_PER_MM; // 1500
  const CANVAS_H = 40 * PX_PER_MM;        // 400 (40mm tall = ±2mV)
  const BASELINE_Y = CANVAS_H / 2;

  // ─── Math helpers ───
  function gaussian(t, center, width, amp) {
    const sigma = width / 5;              // width = ±2.5σ visible envelope
    return amp * Math.exp(-((t - center) ** 2) / (2 * sigma * sigma));
  }
  function asymGaussian(t, center, leftWidth, rightWidth, amp) {
    const w = t < center ? leftWidth : rightWidth;
    const sigma = w / 5;
    return amp * Math.exp(-((t - center) ** 2) / (2 * sigma * sigma));
  }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function rand(min, max) { return min + Math.random() * (max - min); }

  // Default Lead-II PQRST template (mV, seconds relative to R peak)
  const DEFAULT_BEAT = {
    p: { center: -0.16, width: 0.09,  amp: 0.15 },
    q: { center: -0.025, width: 0.025, amp: -0.06 },
    r: { center: 0,      width: 0.030, amp: 1.10 },
    s: { center: 0.030,  width: 0.025, amp: -0.25 },
    t: { center: 0.300,  leftWidth: 0.18, rightWidth: 0.11, amp: 0.32 },
  };

  function addBeat(samples, beatTime, override = {}) {
    const b = {
      p: override.p === null ? null : { ...DEFAULT_BEAT.p, ...(override.p || {}) },
      q: override.q === null ? null : { ...DEFAULT_BEAT.q, ...(override.q || {}) },
      r: override.r === null ? null : { ...DEFAULT_BEAT.r, ...(override.r || {}) },
      s: override.s === null ? null : { ...DEFAULT_BEAT.s, ...(override.s || {}) },
      t: override.t === null ? null : { ...DEFAULT_BEAT.t, ...(override.t || {}) },
    };
    // Affect ~0.5s window around the beat
    const startIdx = Math.max(0, Math.floor((beatTime - 0.35) * SAMPLE_RATE));
    const endIdx = Math.min(samples.length, Math.ceil((beatTime + 0.55) * SAMPLE_RATE));
    for (let i = startIdx; i < endIdx; i++) {
      const t = i / SAMPLE_RATE - beatTime;
      if (b.p) samples[i] += gaussian(t, b.p.center, b.p.width, b.p.amp);
      if (b.q) samples[i] += gaussian(t, b.q.center, b.q.width, b.q.amp);
      if (b.r) samples[i] += gaussian(t, b.r.center, b.r.width, b.r.amp);
      if (b.s) samples[i] += gaussian(t, b.s.center, b.s.width, b.s.amp);
      if (b.t) samples[i] += asymGaussian(t, b.t.center, b.t.leftWidth, b.t.rightWidth, b.t.amp);
    }
    if (override.stOffset) addSTShift(samples, beatTime, override.stOffset);
    if (override.invertedP) {
      // small retrograde P just after QRS
      const idx0 = Math.max(0, Math.floor((beatTime + 0.04) * SAMPLE_RATE));
      const idx1 = Math.min(samples.length, Math.floor((beatTime + 0.14) * SAMPLE_RATE));
      for (let i = idx0; i < idx1; i++) {
        const t = i / SAMPLE_RATE - beatTime;
        samples[i] += gaussian(t, 0.08, 0.05, -0.08);
      }
    }
  }

  function addSTShift(samples, beatTime, offsetMv) {
    // Smooth elevation/depression centered between J-point and T peak
    const peak = beatTime + 0.18;
    const sigma = 0.13;
    const start = Math.max(0, Math.floor((beatTime + 0.04) * SAMPLE_RATE));
    const end = Math.min(samples.length, Math.floor((beatTime + 0.42) * SAMPLE_RATE));
    for (let i = start; i < end; i++) {
      const t = i / SAMPLE_RATE;
      const factor = Math.exp(-((t - peak) ** 2) / (2 * sigma * sigma));
      samples[i] += offsetMv * factor;
    }
  }

  function addPOnly(samples, pTime, amp = 0.15, width = 0.09) {
    const start = Math.max(0, Math.floor((pTime - 0.08) * SAMPLE_RATE));
    const end = Math.min(samples.length, Math.floor((pTime + 0.08) * SAMPLE_RATE));
    for (let i = start; i < end; i++) {
      const t = i / SAMPLE_RATE - pTime;
      samples[i] += gaussian(t, 0, width, amp);
    }
  }

  function addPacerSpike(samples, time, amp = 1.8) {
    const idx = Math.round(time * SAMPLE_RATE);
    if (idx < 0 || idx >= samples.length) return;
    // 2ms thin pulse (1 sample at peak, neighbors ramped)
    samples[idx] += amp;
    if (idx > 0) samples[idx - 1] += amp * 0.4;
    if (idx + 1 < samples.length) samples[idx + 1] += amp * 0.4;
  }

  function addBaselineNoise(samples, amp = 0.012) {
    for (let i = 0; i < samples.length; i++) {
      samples[i] += (Math.random() - 0.5) * amp * 2;
    }
  }
  function addBaselineWander(samples, amp = 0.04, freq = 0.3) {
    for (let i = 0; i < samples.length; i++) {
      const t = i / SAMPLE_RATE;
      samples[i] += amp * Math.sin(2 * Math.PI * freq * t);
    }
  }

  // ──────────────────────────────────────────────────────────
  // Wide-QRS template for ventricular/paced/BBB beats
  // ──────────────────────────────────────────────────────────
  const WIDE_BEAT = {
    p: null,
    q: { center: -0.05, width: 0.04, amp: -0.18 },
    r: { center: 0,     width: 0.05, amp: 1.30 },
    s: { center: 0.06,  width: 0.05, amp: -0.55 },
    t: { center: 0.34,  leftWidth: 0.20, rightWidth: 0.14, amp: -0.45 }, // discordant
  };

  // ──────────────────────────────────────────────────────────
  // Rhythm generators — each returns Float32Array of TOTAL_SAMPLES
  // ──────────────────────────────────────────────────────────
  function genNSR(rate = 75) {
    const s = new Float32Array(TOTAL_SAMPLES);
    const interval = 60 / rate;
    let t = rand(0.15, 0.5);
    while (t < DURATION + 0.5) {
      addBeat(s, t);
      t += interval + rand(-0.025, 0.025); // tiny RSA variation
    }
    addBaselineNoise(s);
    addBaselineWander(s, 0.025);
    return s;
  }

  function genSinusBrady(rate = 48) {
    return genNSR(rate);
  }

  function genSinusTach(rate = 130) {
    const s = new Float32Array(TOTAL_SAMPLES);
    const interval = 60 / rate;
    // Slightly smaller P and shorter QT at higher rates
    const beatOpts = {
      p: { amp: 0.18, width: 0.08 },
      t: { center: clamp(0.28 - (rate - 75) * 0.0008, 0.18, 0.32) }
    };
    let t = rand(0.1, 0.4);
    while (t < DURATION + 0.5) {
      addBeat(s, t, beatOpts);
      t += interval + rand(-0.015, 0.015);
    }
    addBaselineNoise(s);
    return s;
  }

  function genAFib(rate = 110) {
    const s = new Float32Array(TOTAL_SAMPLES);
    // Chaotic fibrillatory baseline (3–7 Hz random oscillations)
    for (let i = 0; i < s.length; i++) {
      const t = i / SAMPLE_RATE;
      s[i] += 0.04 * Math.sin(2 * Math.PI * 5 * t + Math.sin(t * 3) * 4);
      s[i] += 0.025 * Math.sin(2 * Math.PI * 7 * t + 1.3);
      s[i] += 0.02 * Math.sin(2 * Math.PI * 9 * t + 2);
    }
    // Irregularly irregular ventricular response
    const meanInterval = 60 / rate;
    let t = rand(0.1, 0.35);
    while (t < DURATION + 0.5) {
      addBeat(s, t, { p: null });
      // Highly variable RR: ranges from 0.4× to 1.6× of mean
      t += meanInterval * (0.45 + Math.random() * 1.15);
    }
    addBaselineNoise(s);
    return s;
  }

  function genAFlutter(ventRate = 150) {
    const s = new Float32Array(TOTAL_SAMPLES);
    const fRate = 300;
    const fInt = 60 / fRate; // 0.2 s
    // Sawtooth flutter waves — descending ramp + sharp up
    for (let i = 0; i < s.length; i++) {
      const t = i / SAMPLE_RATE;
      const phase = (t % fInt) / fInt; // 0..1
      // Asymmetric sawtooth: slow descent, fast snap-up
      const f = phase < 0.85
        ? -0.15 * (phase / 0.85)
        : -0.15 + (0.20 * ((phase - 0.85) / 0.15));
      s[i] += f;
    }
    // QRS at ventricular rate (typically 2:1 → 150, 3:1 → 100, 4:1 → 75)
    const vInt = 60 / ventRate;
    let t = rand(0.15, 0.35);
    while (t < DURATION + 0.5) {
      addBeat(s, t, { p: null, t: { amp: 0.20 } });
      t += vInt;
    }
    addBaselineNoise(s, 0.008);
    return s;
  }

  function genSVT(rate = 180) {
    const s = new Float32Array(TOTAL_SAMPLES);
    const interval = 60 / rate;
    let t = rand(0.05, 0.3);
    while (t < DURATION + 0.5) {
      // P-waves typically buried in preceding T or absent on surface
      addBeat(s, t, { p: null, t: { center: 0.22, leftWidth: 0.14, rightWidth: 0.10, amp: 0.28 } });
      t += interval;
    }
    addBaselineNoise(s);
    return s;
  }

  function gen1stAVB(rate = 65) {
    const s = new Float32Array(TOTAL_SAMPLES);
    const interval = 60 / rate;
    let t = rand(0.25, 0.5);
    // PR ~ 240ms (long PR, every P conducted)
    while (t < DURATION + 0.5) {
      addBeat(s, t, { p: { center: -0.24, width: 0.09, amp: 0.15 } });
      t += interval + rand(-0.015, 0.015);
    }
    addBaselineNoise(s);
    return s;
  }

  function genWenckebach(rate = 60) {
    const s = new Float32Array(TOTAL_SAMPLES);
    const pInt = 60 / rate;
    // 4:3 group: PR 160, 220, 300, then dropped beat
    const cycle = [
      { conduct: true, pr: 0.16 },
      { conduct: true, pr: 0.24 },
      { conduct: true, pr: 0.32 },
      { conduct: false, pr: null },
    ];
    let t = rand(0.15, 0.35);
    let i = 0;
    while (t < DURATION + 0.5) {
      const beat = cycle[i % cycle.length];
      if (beat.conduct) {
        addBeat(s, t, { p: { center: -beat.pr, width: 0.09, amp: 0.15 } });
      } else {
        addPOnly(s, t - 0.18);
      }
      i++;
      t += pInt;
    }
    addBaselineNoise(s);
    return s;
  }

  function genMobitzII(rate = 70) {
    const s = new Float32Array(TOTAL_SAMPLES);
    const pInt = 60 / rate;
    // Constant PR ~180ms, every 3rd P fails to conduct
    let t = rand(0.15, 0.35);
    let i = 0;
    while (t < DURATION + 0.5) {
      if ((i + 1) % 3 === 0) {
        addPOnly(s, t - 0.18);
      } else {
        addBeat(s, t, { p: { center: -0.18, width: 0.09, amp: 0.15 } });
      }
      i++;
      t += pInt;
    }
    addBaselineNoise(s);
    return s;
  }

  function gen3rdAVB(atrialRate = 75) {
    const s = new Float32Array(TOTAL_SAMPLES);
    const pInt = 60 / atrialRate;
    const ventRate = 38;
    const vInt = 60 / ventRate;
    // P waves marching independently
    let pT = rand(0.05, pInt - 0.05);
    while (pT < DURATION + 0.3) {
      addPOnly(s, pT);
      pT += pInt;
    }
    // Wide ventricular escape marching at slower independent rate
    let qT = rand(0.2, 0.6);
    while (qT < DURATION + 0.3) {
      addBeat(s, qT, WIDE_BEAT);
      qT += vInt;
    }
    addBaselineNoise(s);
    return s;
  }

  function genPVCs(rate = 75) {
    const s = new Float32Array(TOTAL_SAMPLES);
    const interval = 60 / rate;
    let t = rand(0.15, 0.4);
    let count = 0;
    // Random PVCs at ~beat 3 and beat 7
    const pvcAt = new Set([3, 7]);
    while (t < DURATION + 0.5) {
      if (pvcAt.has(count)) {
        // PVC fires early (~70% of expected interval)
        const pvcT = t - interval * 0.25;
        addBeat(s, pvcT, WIDE_BEAT);
        // Compensatory pause: next sinus beat at original schedule + interval
        t = pvcT + interval * 1.7;
      } else {
        addBeat(s, t);
        t += interval + rand(-0.02, 0.02);
      }
      count++;
    }
    addBaselineNoise(s);
    return s;
  }

  function genBigeminy(rate = 75) {
    const s = new Float32Array(TOTAL_SAMPLES);
    const interval = 60 / rate;
    let t = rand(0.15, 0.35);
    let isPvc = false;
    while (t < DURATION + 0.5) {
      if (isPvc) {
        const pvcT = t - interval * 0.25;
        addBeat(s, pvcT, WIDE_BEAT);
        t = pvcT + interval * 1.4;
      } else {
        addBeat(s, t);
        t += interval;
      }
      isPvc = !isPvc;
    }
    addBaselineNoise(s);
    return s;
  }

  function genVTach(rate = 180) {
    const s = new Float32Array(TOTAL_SAMPLES);
    const interval = 60 / rate;
    let t = rand(0.05, 0.25);
    while (t < DURATION + 0.5) {
      addBeat(s, t, WIDE_BEAT);
      t += interval + rand(-0.01, 0.01);
    }
    addBaselineNoise(s);
    return s;
  }

  function genTorsades() {
    const s = new Float32Array(TOTAL_SAMPLES);
    const rate = 220;
    const interval = 60 / rate;
    let t = rand(0.05, 0.2);
    while (t < DURATION + 0.5) {
      // Twisting amplitude — sinusoidal envelope across the strip
      const phase = (t / DURATION) * Math.PI * 2.5;
      const envelope = Math.sin(phase);
      const scale = envelope; // ranges -1 → +1, flipping QRS polarity
      addBeat(s, t, {
        p: null,
        q: { center: -0.04, width: 0.04, amp: -0.12 * Math.abs(scale) },
        r: { center: 0, width: 0.05, amp: 1.1 * scale },
        s: { center: 0.06, width: 0.05, amp: -0.45 * scale },
        t: null,
      });
      t += interval + rand(-0.01, 0.01);
    }
    addBaselineNoise(s);
    return s;
  }

  function genVFib() {
    const s = new Float32Array(TOTAL_SAMPLES);
    for (let i = 0; i < s.length; i++) {
      const t = i / SAMPLE_RATE;
      // Coarse VF — large random oscillations 3–8 Hz
      s[i] =
        0.55 * Math.sin(2 * Math.PI * 4 * t + Math.sin(t * 6) * 3) * (0.5 + Math.random() * 0.5)
        + 0.30 * Math.sin(2 * Math.PI * 7 * t + Math.sin(t * 11) * 2)
        + 0.18 * Math.sin(2 * Math.PI * 11 * t + 1.7)
        + 0.10 * (Math.random() - 0.5);
    }
    return s;
  }

  function genAsystole() {
    const s = new Float32Array(TOTAL_SAMPLES);
    // Flat with minimal artifact
    addBaselineNoise(s, 0.02);
    addBaselineWander(s, 0.03, 0.2);
    return s;
  }

  function genJunctional(rate = 50) {
    const s = new Float32Array(TOTAL_SAMPLES);
    const interval = 60 / rate;
    let t = rand(0.15, 0.4);
    while (t < DURATION + 0.5) {
      // No P (or hidden); narrow QRS; sometimes retrograde P after
      addBeat(s, t, { p: null, invertedP: Math.random() < 0.6 });
      t += interval + rand(-0.015, 0.015);
    }
    addBaselineNoise(s);
    return s;
  }

  function genIdioventricular(rate = 32) {
    const s = new Float32Array(TOTAL_SAMPLES);
    const interval = 60 / rate;
    let t = rand(0.1, 0.5);
    while (t < DURATION + 0.5) {
      addBeat(s, t, WIDE_BEAT);
      t += interval + rand(-0.03, 0.03);
    }
    addBaselineNoise(s);
    return s;
  }

  function genAccelIdio(rate = 75) {
    return genIdioventricular(clamp(rate, 50, 110));
  }

  function genAtrialPaced(rate = 75) {
    const s = new Float32Array(TOTAL_SAMPLES);
    const interval = 60 / rate;
    let t = rand(0.2, 0.4);
    while (t < DURATION + 0.5) {
      addPacerSpike(s, t - 0.18);
      addBeat(s, t);
      t += interval;
    }
    addBaselineNoise(s);
    return s;
  }

  function genVentPaced(rate = 75) {
    const s = new Float32Array(TOTAL_SAMPLES);
    const interval = 60 / rate;
    let t = rand(0.15, 0.35);
    while (t < DURATION + 0.5) {
      addPacerSpike(s, t - 0.01);
      addBeat(s, t, WIDE_BEAT);
      t += interval;
    }
    addBaselineNoise(s);
    return s;
  }

  function genDualPaced(rate = 75) {
    const s = new Float32Array(TOTAL_SAMPLES);
    const interval = 60 / rate;
    let t = rand(0.15, 0.35);
    while (t < DURATION + 0.5) {
      addPacerSpike(s, t - 0.18);  // atrial spike
      addPacerSpike(s, t - 0.01);  // ventricular spike
      addBeat(s, t, WIDE_BEAT);
      t += interval;
    }
    addBaselineNoise(s);
    return s;
  }

  function genSTEMI(rate = 80) {
    const s = new Float32Array(TOTAL_SAMPLES);
    const interval = 60 / rate;
    let t = rand(0.2, 0.4);
    while (t < DURATION + 0.5) {
      addBeat(s, t, {
        stOffset: 0.30,                                  // ~3mm ST elevation
        t: { center: 0.30, leftWidth: 0.18, rightWidth: 0.10, amp: 0.55 } // hyperacute T
      });
      t += interval + rand(-0.02, 0.02);
    }
    addBaselineNoise(s);
    return s;
  }

  function genLBBB(rate = 75) {
    const s = new Float32Array(TOTAL_SAMPLES);
    const interval = 60 / rate;
    let t = rand(0.2, 0.4);
    // Wide notched QRS, discordant T
    while (t < DURATION + 0.5) {
      addBeat(s, t, {
        q: null,
        r: { center: 0,    width: 0.06, amp: 1.20 },
        s: null,
        // notch: small dip then second peak
        t: { center: 0.34, leftWidth: 0.18, rightWidth: 0.12, amp: -0.40 },
      });
      // Manually add the notch by superimposing a small negative bump on top of the R
      const notchT = t + 0.015;
      const notchIdx0 = Math.floor((notchT - 0.02) * SAMPLE_RATE);
      const notchIdx1 = Math.floor((notchT + 0.02) * SAMPLE_RATE);
      for (let i = Math.max(0, notchIdx0); i < Math.min(s.length, notchIdx1); i++) {
        s[i] += gaussian(i / SAMPLE_RATE, notchT, 0.025, -0.35);
      }
      t += interval + rand(-0.015, 0.015);
    }
    addBaselineNoise(s);
    return s;
  }

  function genRBBB(rate = 75) {
    const s = new Float32Array(TOTAL_SAMPLES);
    const interval = 60 / rate;
    let t = rand(0.2, 0.4);
    // Classic rsR' pattern (best seen in V1, approximated in II)
    while (t < DURATION + 0.5) {
      addBeat(s, t, {
        p: { center: -0.16, width: 0.09, amp: 0.13 },
        q: { center: -0.025, width: 0.020, amp: -0.05 },
        r: { center: 0,     width: 0.025, amp: 0.55 },
        s: { center: 0.030, width: 0.020, amp: -0.30 },
        // R' second peak
        t: { center: 0.34, leftWidth: 0.18, rightWidth: 0.11, amp: -0.30 }, // discordant
      });
      const rprimeT = t + 0.065;
      const idx0 = Math.floor((rprimeT - 0.04) * SAMPLE_RATE);
      const idx1 = Math.floor((rprimeT + 0.04) * SAMPLE_RATE);
      for (let i = Math.max(0, idx0); i < Math.min(s.length, idx1); i++) {
        s[i] += gaussian(i / SAMPLE_RATE, rprimeT, 0.04, 0.65);
      }
      t += interval + rand(-0.015, 0.015);
    }
    addBaselineNoise(s);
    return s;
  }

  function genHyperK(rate = 70) {
    const s = new Float32Array(TOTAL_SAMPLES);
    const interval = 60 / rate;
    let t = rand(0.2, 0.4);
    while (t < DURATION + 0.5) {
      // Peaked T waves, flat/absent P (advanced hyperK)
      addBeat(s, t, {
        p: { amp: 0.04, width: 0.07 },
        t: { center: 0.28, leftWidth: 0.07, rightWidth: 0.05, amp: 0.85 },
      });
      t += interval + rand(-0.015, 0.015);
    }
    addBaselineNoise(s);
    return s;
  }

  // ──────────────────────────────────────────────────────────
  // Rhythm registry — metadata + clinical info
  // ──────────────────────────────────────────────────────────
  const RHYTHMS = [
    {
      id: "nsr", name: "Normal Sinus Rhythm", group: "Normal",
      rateMin: 60, rateMax: 100, rateDefault: 75, generator: genNSR,
      info: {
        rate: "60–100 bpm",
        rhythm: "Regular",
        p: "Upright in II, before every QRS, uniform morphology",
        pr: "120–200 ms (3–5 small boxes)",
        qrs: "<120 ms (narrow)",
        significance: "The physiologic baseline. Sinus node is pacemaker; conduction is intact through AV node, His-Purkinje, and ventricles.",
        action: "No treatment. Sinus arrhythmia (slight variation with respiration) is a normal variant — do not chase.",
      },
    },
    {
      id: "sbrady", name: "Sinus Bradycardia", group: "Normal",
      rateMin: 30, rateMax: 59, rateDefault: 48, generator: genSinusBrady,
      info: {
        rate: "<60 bpm",
        rhythm: "Regular",
        p: "Normal upright P before every QRS",
        pr: "Normal (120–200 ms)",
        qrs: "Narrow",
        significance: "Normal in athletes / during sleep. Pathologic causes: ↑ vagal tone, sick sinus, ischemia (inferior MI), β-blockers, CCBs, digoxin, hypothyroidism, hypothermia, ↑ ICP.",
        action: "Symptomatic (hypotension, AMS, chest pain): atropine 1 mg IV, repeat to 3 mg; then transcutaneous pacing; epinephrine or dopamine infusion. Asymptomatic: address underlying cause.",
      },
    },
    {
      id: "stach", name: "Sinus Tachycardia", group: "Normal",
      rateMin: 100, rateMax: 180, rateDefault: 130, generator: genSinusTach,
      info: {
        rate: ">100 bpm",
        rhythm: "Regular",
        p: "Normal upright, may merge into preceding T at fast rates",
        pr: "Normal (often shortened)",
        qrs: "Narrow",
        significance: "Almost always a response to something — pain, fever, sepsis, hypovolemia, hypoxia, anemia, PE, anxiety, stimulants, thyroid storm. Rarely primary.",
        action: "Treat the cause, not the rate. Pressors, fluids, antipyretics, oxygen as appropriate. Don't slow it with beta-blockers without ruling out hypovolemia or hypoxia first.",
      },
    },
    {
      id: "afib", name: "Atrial Fibrillation", group: "Atrial",
      rateMin: 60, rateMax: 180, rateDefault: 110, generator: genAFib,
      info: {
        rate: "Variable — ventricular response usually 100–160",
        rhythm: "Irregularly irregular — no pattern",
        p: "Absent — chaotic fibrillatory baseline instead",
        pr: "Not measurable",
        qrs: "Narrow (unless aberrancy or BBB)",
        significance: "Loss of atrial contraction → ↓ CO ~20%, stasis in atria → thromboembolic risk (CHA₂DS₂-VASc). Triggers: PIRATES — Pulmonary, Ischemia, Rheumatic, Anemia/Atrial enlargement, Thyroid, Ethanol, Sepsis.",
        action: "Unstable: synchronized cardioversion. Stable rate control: diltiazem, metoprolol, amiodarone. Anticoagulate per CHA₂DS₂-VASc. New-onset <48 hr: rhythm or rate control.",
      },
    },
    {
      id: "aflut2", name: "Atrial Flutter (2:1)", group: "Atrial",
      rateMin: 150, rateMax: 150, rateDefault: 150,
      generator: () => genAFlutter(150),
      info: {
        rate: "Atrial 300, ventricular 150 (2:1 conduction)",
        rhythm: "Regular",
        p: "Sawtooth flutter (F) waves — best seen in II, III, aVF",
        pr: "Not applicable",
        qrs: "Narrow",
        significance: "Reentrant circuit in right atrium. Same stroke risk as AFib. The 150 bpm 'regular narrow tachy' is a board classic for atrial flutter with 2:1 block.",
        action: "Similar to AFib: rate control, rhythm control, anticoagulation. Often more responsive to cardioversion than AFib; ablation is highly effective.",
      },
    },
    {
      id: "aflut4", name: "Atrial Flutter (4:1)", group: "Atrial",
      rateMin: 75, rateMax: 75, rateDefault: 75,
      generator: () => genAFlutter(75),
      info: {
        rate: "Atrial 300, ventricular 75 (4:1 conduction)",
        rhythm: "Regular",
        p: "Sawtooth flutter waves clearly visible between QRS complexes",
        pr: "Not applicable",
        qrs: "Narrow",
        significance: "Slower ventricular response with same atrial rate — often pharmacologically rate-controlled. F waves easier to see at slower ventricular rates.",
        action: "Same management principles as 2:1 flutter. Anticoagulate.",
      },
    },
    {
      id: "svt", name: "SVT (PSVT / AVNRT)", group: "Atrial",
      rateMin: 150, rateMax: 220, rateDefault: 180, generator: genSVT,
      info: {
        rate: "150–250 bpm",
        rhythm: "Regular (machine-gun)",
        p: "Hidden in T, inverted retrograde, or pseudo-R' in V1",
        pr: "Not visible",
        qrs: "Narrow (unless aberrant conduction)",
        significance: "Reentry at AV node (AVNRT, most common) or accessory pathway (AVRT/WPW). Usually sudden onset/offset. Often young, healthy patient.",
        action: "Unstable: synchronized cardioversion. Stable: vagal maneuvers (modified Valsalva), then adenosine 6 mg → 12 mg rapid IV push followed by saline flush. Diltiazem or metoprolol if recurrent.",
      },
    },
    {
      id: "avb1", name: "1st-Degree AV Block", group: "AV Blocks",
      rateMin: 50, rateMax: 90, rateDefault: 65, generator: gen1stAVB,
      info: {
        rate: "Underlying sinus rate",
        rhythm: "Regular",
        p: "Normal — one P for every QRS",
        pr: ">200 ms (one big box) but constant",
        qrs: "Narrow",
        significance: "Slowed conduction through AV node. Usually benign. Watch in inferior MI, digoxin, CCBs, β-blockers, increased vagal tone.",
        action: "No treatment if asymptomatic. Hold AV-nodal blockers if PR markedly prolonged. Monitor for progression.",
      },
    },
    {
      id: "wenck", name: "2°AV Block Type I (Wenckebach)", group: "AV Blocks",
      rateMin: 50, rateMax: 80, rateDefault: 60, generator: genWenckebach,
      info: {
        rate: "Atrial regular; ventricular slightly slower",
        rhythm: "Regularly irregular — 'group beating'",
        p: "Normal P waves, regular P-P interval",
        pr: "Progressively LENGTHENS until a P is not conducted (dropped QRS), then resets",
        qrs: "Narrow",
        significance: "Block at AV node level — usually benign. Inferior MI, digoxin, ↑ vagal tone. Rarely progresses to complete block.",
        action: "Asymptomatic: observation. Symptomatic bradycardia: atropine. Hold offending drugs. Pacing rarely needed unless progressive.",
      },
    },
    {
      id: "mobitz2", name: "2°AV Block Type II (Mobitz II)", group: "AV Blocks",
      rateMin: 50, rateMax: 90, rateDefault: 70, generator: genMobitzII,
      info: {
        rate: "Atrial regular; ventricular variable",
        rhythm: "Regular sinus P with intermittently dropped QRS",
        p: "Normal P waves, regular",
        pr: "CONSTANT in conducted beats — no lengthening before drop",
        qrs: "Often wide (block below AV node, in His-Purkinje)",
        significance: "Infranodal block — danger of sudden progression to complete heart block and asystole. Anterior MI, fibrotic conducting system.",
        action: "Permanent pacemaker indicated even if asymptomatic. Transcutaneous pacing standby. Avoid atropine (can worsen by speeding atrial rate without improving conduction).",
      },
    },
    {
      id: "avb3", name: "3°AV Block (Complete)", group: "AV Blocks",
      rateMin: 60, rateMax: 100, rateDefault: 75, generator: gen3rdAVB,
      info: {
        rate: "Atrial 60–100; ventricular escape 20–40 (often wide)",
        rhythm: "AV dissociation — atria and ventricles march independently",
        p: "Regular P waves with NO relationship to QRS",
        pr: "Variable — no consistent relationship",
        qrs: "Wide if ventricular escape, narrow if junctional escape",
        significance: "No conduction across AV junction. Causes: AMI (especially inferior), Lyme carditis, drug toxicity, idiopathic fibrosis (Lenègre's), congenital. Emergency.",
        action: "Transcutaneous pacing immediately if symptomatic. Atropine often ineffective (block below AV node). Epi/dopamine bridge. Definitive: permanent pacemaker.",
      },
    },
    {
      id: "pvc", name: "PVCs (Occasional)", group: "Ventricular",
      rateMin: 60, rateMax: 100, rateDefault: 75, generator: genPVCs,
      info: {
        rate: "Underlying sinus rate",
        rhythm: "Mostly regular with premature wide beats",
        p: "Absent before the PVC",
        pr: "N/A for PVC",
        qrs: "Wide (>120 ms), bizarre morphology, often followed by full compensatory pause",
        significance: "Common in healthy hearts (caffeine, stress, fatigue). Concerning patterns: multiform, R-on-T, runs of ≥3 (= NSVT), >10/min, frequent in setting of ischemia.",
        action: "Asymptomatic isolated PVCs: reassurance, address triggers. Frequent or symptomatic: β-blocker first-line. Ischemic: amiodarone or lidocaine.",
      },
    },
    {
      id: "bigem", name: "Ventricular Bigeminy", group: "Ventricular",
      rateMin: 60, rateMax: 100, rateDefault: 75, generator: genBigeminy,
      info: {
        rate: "Variable — count only the sinus beats",
        rhythm: "Every other beat is a PVC",
        p: "Before each sinus beat only",
        pr: "Normal in sinus beats",
        qrs: "Sinus narrow, PVC wide — alternating",
        significance: "Often digoxin toxicity, ischemia, electrolyte abnormalities (low K⁺, low Mg²⁺). Effective rate may be half of counted rate if PVCs don't perfuse well.",
        action: "Check digoxin level, replete K⁺ and Mg²⁺, address ischemia. β-blocker if persistent.",
      },
    },
    {
      id: "vtach", name: "Ventricular Tachycardia", group: "Ventricular",
      rateMin: 120, rateMax: 220, rateDefault: 180, generator: genVTach,
      info: {
        rate: "120–250 bpm",
        rhythm: "Usually regular",
        p: "Absent or AV dissociation visible",
        pr: "N/A",
        qrs: "Wide (>120 ms), monomorphic",
        significance: "Sustained VT (>30 sec) = emergency. Common in structural heart disease, post-MI, cardiomyopathy. Distinguish from SVT with aberrancy — wide regular tachy = VT until proven otherwise.",
        action: "Unstable: synchronized cardioversion 100J → 200J. Pulseless: defibrillation per ACLS. Stable: amiodarone 150 mg IV over 10 min, procainamide, or lidocaine. Correct K⁺, Mg²⁺.",
      },
    },
    {
      id: "torsades", name: "Torsades de Pointes", group: "Ventricular",
      rateMin: 200, rateMax: 280, rateDefault: 220, generator: genTorsades,
      info: {
        rate: "200–280 bpm",
        rhythm: "Polymorphic VT with axis 'twisting' around the baseline",
        p: "Absent",
        pr: "N/A",
        qrs: "Wide, changing amplitude/polarity in sinusoidal pattern",
        significance: "Driven by prolonged QT. Causes: hypokalemia, hypomagnesemia, congenital long-QT, drugs (haloperidol, methadone, fluoroquinolones, ondansetron, antiemetics). Can degenerate to VFib.",
        action: "Magnesium sulfate 2 g IV (first-line, even with normal Mg²⁺). Stop QT-prolonging drugs. Overdrive pacing or isoproterenol if recurrent. Unstable: defibrillation.",
      },
    },
    {
      id: "vfib", name: "Ventricular Fibrillation", group: "Ventricular",
      rateMin: 0, rateMax: 0, rateDefault: 0, generator: genVFib,
      info: {
        rate: "Not measurable",
        rhythm: "Chaotic — no organized complexes",
        p: "Absent",
        pr: "N/A",
        qrs: "Not identifiable — coarse or fine fibrillatory wave",
        significance: "Cardiac arrest. No effective cardiac output. Fine VFib may look like asystole — always check leads and gain. Common in ischemia, infarction, electrolyte derangement, hypothermia.",
        action: "Defibrillation immediately (200J biphasic) + high-quality CPR. Epinephrine 1 mg IV q3–5 min, amiodarone 300 mg IV bolus after 3rd shock. ACLS algorithm.",
      },
    },
    {
      id: "asystole", name: "Asystole", group: "Ventricular",
      rateMin: 0, rateMax: 0, rateDefault: 0, generator: genAsystole,
      info: {
        rate: "0 bpm",
        rhythm: "Flat line",
        p: "Absent",
        pr: "N/A",
        qrs: "Absent",
        significance: "No electrical activity. Confirm in 2 leads, check gain, check leads attached. Poor prognosis — survival from out-of-hospital asystolic arrest <2%.",
        action: "High-quality CPR + epinephrine 1 mg IV q3–5 min. NO shock indicated. Search for reversible causes (Hs and Ts). Asystole is NOT shockable.",
      },
    },
    {
      id: "junc", name: "Junctional Rhythm", group: "Junctional",
      rateMin: 40, rateMax: 60, rateDefault: 50, generator: genJunctional,
      info: {
        rate: "40–60 bpm (intrinsic AV junctional rate)",
        rhythm: "Regular",
        p: "Absent, hidden in QRS, or INVERTED in lead II (retrograde)",
        pr: "Short (<120 ms) if visible before QRS, or P appears after QRS",
        qrs: "Narrow (escape from AV junction → normal His-Purkinje conduction)",
        significance: "AV junction takes over when SA node fails or conducts too slowly. Causes: sick sinus, digoxin, inferior MI, β-blockers, increased vagal tone.",
        action: "Treat underlying cause. Symptomatic bradycardia: atropine. Hold offending drugs.",
      },
    },
    {
      id: "idio", name: "Idioventricular Rhythm", group: "Junctional",
      rateMin: 20, rateMax: 40, rateDefault: 32, generator: genIdioventricular,
      info: {
        rate: "20–40 bpm (intrinsic ventricular escape rate)",
        rhythm: "Usually regular",
        p: "Absent",
        pr: "N/A",
        qrs: "Wide, bizarre",
        significance: "Ventricular pacemaker as escape — sign that higher pacemakers (SA, AV junction) have failed. Pre-terminal rhythm in dying hearts. Accelerated form (50–110 bpm) often seen during reperfusion after thrombolytic/PCI.",
        action: "Treat underlying cause. Symptomatic: atropine often ineffective; transcutaneous pacing; epi/dopamine infusion. Permanent pacemaker often required.",
      },
    },
    {
      id: "apaced", name: "Atrial Paced", group: "Pacemaker",
      rateMin: 60, rateMax: 100, rateDefault: 75, generator: genAtrialPaced,
      info: {
        rate: "Pacemaker-determined",
        rhythm: "Regular",
        p: "Preceded by sharp narrow pacer spike, then normal P morphology",
        pr: "Normal (intrinsic AV conduction)",
        qrs: "Narrow",
        significance: "Atrial pacing in setting of sinus node dysfunction with intact AV conduction. Restores AV synchrony and normal ventricular activation.",
        action: "Standard pacemaker follow-up. Failure to capture / failure to sense workup if abnormal.",
      },
    },
    {
      id: "vpaced", name: "Ventricular Paced", group: "Pacemaker",
      rateMin: 60, rateMax: 100, rateDefault: 75, generator: genVentPaced,
      info: {
        rate: "Pacemaker-determined",
        rhythm: "Regular",
        p: "Absent or independent (depending on indication)",
        pr: "N/A",
        qrs: "Wide — pacer spike immediately followed by wide LBBB-like QRS",
        significance: "Ventricular pacing for AV block or other indication. Lose normal AV synchrony unless dual-chamber.",
        action: "Routine pacemaker checks. Recognize 'paced-rhythm STEMI' patterns (Sgarbossa criteria) when ischemia suspected.",
      },
    },
    {
      id: "dpaced", name: "Dual-Chamber Paced", group: "Pacemaker",
      rateMin: 60, rateMax: 100, rateDefault: 75, generator: genDualPaced,
      info: {
        rate: "Pacemaker-determined",
        rhythm: "Regular",
        p: "Atrial spike followed by paced P",
        pr: "AV delay programmed by device",
        qrs: "Ventricular spike followed by wide QRS",
        significance: "AV sequential pacing — preserves atrial contribution to cardiac output (the 'atrial kick'). Standard for AV block.",
        action: "Routine pacemaker follow-up. Recognize that the device is doing what it should.",
      },
    },
    {
      id: "stemi", name: "STEMI (Inferior pattern)", group: "Ischemia",
      rateMin: 60, rateMax: 100, rateDefault: 80, generator: genSTEMI,
      info: {
        rate: "Variable — often sinus, may have bradycardia or block in inferior MI",
        rhythm: "Sinus underlying",
        p: "Normal",
        pr: "Normal",
        qrs: "Normal width with ST elevation following",
        significance: "ST elevation ≥1 mm in 2 contiguous limb leads or ≥2 mm in 2 contiguous precordial leads. Time = muscle. Hyperacute T waves may precede ST elevation.",
        action: "Activate cath lab — goal door-to-balloon ≤90 min. Aspirin 325 chewed, heparin or bivalirudin, P2Y12 inhibitor, statin. If no PCI available: thrombolytics within 30 min.",
      },
    },
    {
      id: "lbbb", name: "Left Bundle Branch Block", group: "Conduction",
      rateMin: 60, rateMax: 100, rateDefault: 75, generator: genLBBB,
      info: {
        rate: "Underlying rhythm",
        rhythm: "Sinus underlying",
        p: "Normal",
        pr: "Normal",
        qrs: "Wide (>120 ms), broad notched or slurred R wave in I/aVL/V5/V6, deep S in V1",
        significance: "Block of left bundle. New LBBB in setting of chest pain = STEMI equivalent (treat as STEMI). Causes: ischemic heart disease, HTN, cardiomyopathy, aortic valve disease.",
        action: "New LBBB + chest pain → cath lab. Sgarbossa criteria for diagnosing acute MI in existing LBBB. CRT consideration if HFrEF + LBBB.",
      },
    },
    {
      id: "rbbb", name: "Right Bundle Branch Block", group: "Conduction",
      rateMin: 60, rateMax: 100, rateDefault: 75, generator: genRBBB,
      info: {
        rate: "Underlying rhythm",
        rhythm: "Sinus underlying",
        p: "Normal",
        pr: "Normal",
        qrs: "Wide (>120 ms), classic rsR' ('rabbit ears') in V1, wide slurred S in I/V6",
        significance: "Block of right bundle. Can be normal variant (especially in young patients), or due to RV strain (PE), ischemia, cardiomyopathy. Less ominous than LBBB.",
        action: "Isolated incidental RBBB without symptoms: no treatment. New RBBB + chest pain or RV strain: workup for PE, MI. Watch for bi/trifascicular block patterns.",
      },
    },
    {
      id: "hyperK", name: "Hyperkalemia Pattern", group: "Ischemia",
      rateMin: 50, rateMax: 90, rateDefault: 70, generator: genHyperK,
      info: {
        rate: "Variable",
        rhythm: "Often sinus, can progress to junctional / sine wave",
        p: "Flattened or absent (advanced)",
        pr: "Prolonged",
        qrs: "Widens as K⁺ rises; T waves are PEAKED, narrow-based, symmetric",
        significance: "K⁺ >5.5: peaked T waves. >6.5: PR prolongation, P flattening. >7.0: QRS widening. >8.0: sine wave → arrest. EKG severity correlates loosely with level.",
        action: "Calcium gluconate 1 g IV (stabilize membrane) → insulin + D50 or albuterol → loop diuretic + bicarb if acidotic → kayexalate/lokelma → dialysis if severe.",
      },
    },
  ];

  // ──────────────────────────────────────────────────────────
  // Canvas drawing
  // ──────────────────────────────────────────────────────────
  function setupCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    canvas.style.aspectRatio = `${CANVAS_W} / ${CANVAS_H}`;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    return ctx;
  }

  function drawGrid(ctx) {
    ctx.fillStyle = "#fef7fb";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // 1mm small grid
    ctx.strokeStyle = "#fbcfe8";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let x = 0; x <= CANVAS_W; x += PX_PER_MM) {
      ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H);
    }
    for (let y = 0; y <= CANVAS_H; y += PX_PER_MM) {
      ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y);
    }
    ctx.stroke();

    // 5mm large grid
    ctx.strokeStyle = "#f9a8d4";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let x = 0; x <= CANVAS_W; x += PX_PER_MM * 5) {
      ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H);
    }
    for (let y = 0; y <= CANVAS_H; y += PX_PER_MM * 5) {
      ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y);
    }
    ctx.stroke();

    // 1-second tick labels at top
    ctx.fillStyle = "#be185d";
    ctx.font = "bold 11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    for (let s = 1; s <= 5; s++) {
      const x = s * MM_PER_SEC * PX_PER_MM;
      ctx.fillText(`${s}s`, x + 4, 14);
    }
  }

  function drawTrace(ctx, samples) {
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 1.8;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    for (let i = 0; i < samples.length; i++) {
      const x = (i / TOTAL_SAMPLES) * CANVAS_W;
      const y = BASELINE_Y - samples[i] * MM_PER_MV * PX_PER_MM;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  function renderStrip(canvas, samples) {
    const ctx = setupCanvas(canvas);
    drawGrid(ctx);
    drawTrace(ctx, samples);
  }

  // ──────────────────────────────────────────────────────────
  // UI wiring
  // ──────────────────────────────────────────────────────────
  let currentRhythm = RHYTHMS[0];
  let currentRate = currentRhythm.rateDefault;

  function fillRhythmSelect(selectEl) {
    selectEl.innerHTML = "";
    const groups = {};
    RHYTHMS.forEach((r) => {
      if (!groups[r.group]) groups[r.group] = [];
      groups[r.group].push(r);
    });
    Object.keys(groups).forEach((g) => {
      const og = document.createElement("optgroup");
      og.label = "✿ " + g;
      groups[g].forEach((r) => {
        const o = document.createElement("option");
        o.value = r.id;
        o.textContent = r.name;
        og.appendChild(o);
      });
      selectEl.appendChild(og);
    });
  }

  function updateRhythmPill() {
    document.getElementById("rhythm-pill").textContent = currentRhythm.name;
  }

  function updateRateSlider() {
    const slider = document.getElementById("rate-slider");
    const val = document.getElementById("rate-value");
    const fixed = currentRhythm.rateMin === currentRhythm.rateMax;
    const naRate = currentRhythm.rateDefault === 0;
    if (naRate) {
      slider.disabled = true;
      val.textContent = "—";
    } else {
      slider.disabled = fixed;
      slider.min = currentRhythm.rateMin;
      slider.max = currentRhythm.rateMax;
      slider.value = currentRate;
      val.textContent = currentRate;
    }
  }

  function renderInfo() {
    const info = currentRhythm.info;
    const grid = document.getElementById("info-grid");
    grid.innerHTML = `
      <div class="ekg-info-card">
        <h3>Strip Anatomy</h3>
        <dl class="ekg-info-table">
          <dt>Rate</dt><dd>${info.rate}</dd>
          <dt>Rhythm</dt><dd>${info.rhythm}</dd>
          <dt>P waves</dt><dd>${info.p}</dd>
          <dt>PR</dt><dd>${info.pr}</dd>
          <dt>QRS</dt><dd>${info.qrs}</dd>
        </dl>
      </div>
      <div class="ekg-info-card action">
        <h3>Clinical Picture &amp; Action</h3>
        <div style="margin-bottom:10px;font-size:14px"><strong style="color:var(--pink-deep)">Significance:</strong> ${info.significance}</div>
        <div style="font-size:14px"><strong style="color:var(--lavender-deep)">What to do:</strong> ${info.action}</div>
      </div>
    `;
  }

  function generateAndRender() {
    const canvas = document.getElementById("ekg-canvas");
    const samples = currentRhythm.generator(currentRate);
    renderStrip(canvas, samples);
    updateRhythmPill();
    renderInfo();
    loadNotesIntoUI();
  }

  // ──────────────────────────────────────────────────────────
  // Per-rhythm notes (localStorage)
  // ──────────────────────────────────────────────────────────
  function notesKey(rhythmId) { return `ekg_notes_v1::${rhythmId}`; }

  function loadNotes(rhythmId) {
    try { return localStorage.getItem(notesKey(rhythmId)) || ""; }
    catch (e) { return ""; }
  }

  function saveNotes(rhythmId, value) {
    try { localStorage.setItem(notesKey(rhythmId), value); }
    catch (e) { /* quota or disabled */ }
  }

  function loadNotesIntoUI() {
    const ta = document.getElementById("strip-notes");
    if (!ta) return;
    ta.value = loadNotes(currentRhythm.id);
    const status = document.getElementById("notes-status");
    if (status) {
      status.textContent = ta.value
        ? "loaded from your notes ✿"
        : "notes save per rhythm · in this browser";
      status.classList.remove("saved");
    }
  }

  let notesSaveTimer = null;
  function attachNotesAutoSave() {
    const ta = document.getElementById("strip-notes");
    if (!ta || ta.dataset.bound === "1") return;
    ta.dataset.bound = "1";
    const status = document.getElementById("notes-status");
    ta.addEventListener("input", () => {
      clearTimeout(notesSaveTimer);
      notesSaveTimer = setTimeout(() => {
        saveNotes(currentRhythm.id, ta.value);
        if (status) {
          status.textContent = "saved ✓";
          status.classList.add("saved");
          setTimeout(() => {
            if (status.textContent === "saved ✓") {
              status.textContent = ta.value
                ? "saved · auto-saves as you type"
                : "notes save per rhythm · in this browser";
              status.classList.remove("saved");
            }
          }, 1500);
        }
      }, 350);
    });
    // Save on blur immediately
    ta.addEventListener("blur", () => {
      clearTimeout(notesSaveTimer);
      saveNotes(currentRhythm.id, ta.value);
    });
  }

  // ──────────────────────────────────────────────────────────
  // Save Full Page — composite PNG (strip + meta + info + notes)
  // ──────────────────────────────────────────────────────────
  function wrapLines(ctx, text, maxWidth) {
    if (!text) return [""];
    const out = [];
    for (const paragraph of String(text).split("\n")) {
      if (!paragraph.trim()) { out.push(""); continue; }
      const words = paragraph.split(/\s+/);
      let cur = "";
      for (const w of words) {
        const test = cur ? cur + " " + w : w;
        if (ctx.measureText(test).width > maxWidth && cur) {
          out.push(cur);
          cur = w;
        } else {
          cur = test;
        }
      }
      if (cur) out.push(cur);
    }
    return out;
  }

  async function savePageAsPNG() {
    const r = currentRhythm;
    const rate = currentRate;
    const notes = (document.getElementById("strip-notes")?.value || "").trim();
    const sourceCanvas = document.getElementById("ekg-canvas");
    if (!sourceCanvas) return;

    const W = 1500;
    const M = 60;
    const innerW = W - 2 * M;
    const stripAspect = sourceCanvas.width / sourceCanvas.height;
    const stripW = innerW;
    const stripH = Math.round(stripW / stripAspect);

    const rateLabel = !rate || rate === 0 ? "—" : `${rate} bpm`;

    const sections = [
      { type: "brand" },
      { type: "title", text: r.name },
      { type: "meta", lines: [
          `Heart Rate: ${rateLabel}`,
          `Lead II  ·  25 mm/sec  ·  10 mm/mV  ·  6-second strip`,
        ] },
      { type: "strip" },
      { type: "kvSection", heading: "Strip Anatomy", items: [
          ["Rate", r.info.rate],
          ["Rhythm", r.info.rhythm],
          ["P waves", r.info.p],
          ["PR interval", r.info.pr],
          ["QRS complex", r.info.qrs],
        ] },
      { type: "textSection", heading: "Clinical Picture", label: "Significance", body: r.info.significance },
      { type: "textSection", heading: "What to Do", body: r.info.action },
    ];
    if (notes) {
      sections.push({ type: "textSection", heading: "Your Notes", body: notes, accent: true });
    }
    sections.push({ type: "footer" });

    // Measure heights
    const measure = document.createElement("canvas").getContext("2d");

    const H = {
      brand: 80,
      title: 64,
      meta: 64,
      strip: stripH + 28,
      sectionHeading: 56,
      kvRowMin: 32,
      kvKeyW: 200,
      kvLineH: 26,
      textBodyLineH: 28,
      sectionPadBottom: 24,
      footer: 50,
    };

    function sectionHeight(s) {
      if (s.type === "brand") return H.brand;
      if (s.type === "title") return H.title;
      if (s.type === "meta") return H.meta;
      if (s.type === "strip") return H.strip;
      if (s.type === "kvSection") {
        let h = H.sectionHeading;
        measure.font = '500 17px "Quicksand", Arial, sans-serif';
        for (const [, v] of s.items) {
          const lines = wrapLines(measure, v, innerW - H.kvKeyW - 20);
          h += Math.max(H.kvRowMin, lines.length * H.kvLineH + 6);
        }
        return h + H.sectionPadBottom;
      }
      if (s.type === "textSection") {
        let h = H.sectionHeading;
        if (s.label) h += 32;
        measure.font = '500 17px "Quicksand", Arial, sans-serif';
        const lines = wrapLines(measure, s.body, innerW - 32);
        h += lines.length * H.textBodyLineH + 16;
        return h + H.sectionPadBottom;
      }
      if (s.type === "footer") return H.footer;
      return 0;
    }

    const heights = sections.map(sectionHeight);
    const totalH = M + heights.reduce((a, b) => a + b, 0) + M;

    // Build canvas
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = totalH;
    const c = canvas.getContext("2d");

    // Background gradient
    const bg = c.createLinearGradient(0, 0, 0, totalH);
    bg.addColorStop(0, "#fff8fc");
    bg.addColorStop(1, "#f5e9fb");
    c.fillStyle = bg;
    c.fillRect(0, 0, W, totalH);

    // Top accent bar (pink → lavender gradient)
    const bar = c.createLinearGradient(0, 0, W, 0);
    bar.addColorStop(0, "#ec4899");
    bar.addColorStop(1, "#a78bfa");
    c.fillStyle = bar;
    c.fillRect(0, 0, W, 14);

    let yC = M;
    for (let i = 0; i < sections.length; i++) {
      const s = sections[i];
      const h = heights[i];

      if (s.type === "brand") {
        c.fillStyle = "#831843";
        c.font = '700 26px "Quicksand", Arial, sans-serif';
        c.fillText("ICU Med Mastery — EKG Study Strip", M, yC + 32);
        c.fillStyle = "#9d174d";
        c.font = '500 14px ui-monospace, Menlo, monospace';
        c.fillText("med-study-guide.vercel.app/ekg", M, yC + 56);
        c.strokeStyle = "#fbcfe8";
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(M, yC + 70);
        c.lineTo(W - M, yC + 70);
        c.stroke();
      }
      else if (s.type === "title") {
        const grad = c.createLinearGradient(M, yC, M + innerW, yC);
        grad.addColorStop(0, "#9d174d");
        grad.addColorStop(1, "#6d28d9");
        c.fillStyle = grad;
        c.font = '700 46px "Quicksand", Arial, sans-serif';
        c.fillText(s.text, M, yC + 48);
      }
      else if (s.type === "meta") {
        c.fillStyle = "#7e22ce";
        c.font = '700 18px ui-monospace, Menlo, monospace';
        c.fillText(s.lines[0], M, yC + 24);
        c.fillStyle = "#831843";
        c.font = '500 14px ui-monospace, Menlo, monospace';
        c.fillText(s.lines[1], M, yC + 50);
      }
      else if (s.type === "strip") {
        c.fillStyle = "#fef7fb";
        c.fillRect(M - 6, yC - 6, stripW + 12, stripH + 12);
        c.drawImage(sourceCanvas, M, yC, stripW, stripH);
        c.strokeStyle = "#fbcfe8";
        c.lineWidth = 2;
        c.strokeRect(M - 6, yC - 6, stripW + 12, stripH + 12);
      }
      else if (s.type === "kvSection") {
        // heading
        c.fillStyle = "#ec4899";
        c.font = '700 28px "Quicksand", Arial, sans-serif';
        c.fillText("✿  " + s.heading, M, yC + 32);
        c.fillStyle = "#fbcfe8";
        c.fillRect(M, yC + 44, 100, 3);

        let textY = yC + 84;
        for (const [k, v] of s.items) {
          // key
          c.fillStyle = "#9d174d";
          c.font = '700 16px "Quicksand", Arial, sans-serif';
          c.fillText(k, M, textY);
          // value (wrapped)
          c.fillStyle = "#1a1a1a";
          c.font = '500 17px "Quicksand", Arial, sans-serif';
          const lines = wrapLines(c, v, innerW - H.kvKeyW - 20);
          let lY = textY;
          for (const line of lines) {
            c.fillText(line, M + H.kvKeyW, lY);
            lY += H.kvLineH;
          }
          textY = Math.max(textY + H.kvRowMin, lY + 6);
        }
      }
      else if (s.type === "textSection") {
        // background card for notes accent
        if (s.accent) {
          const grad = c.createLinearGradient(M - 12, yC, M - 12, yC + h);
          grad.addColorStop(0, "#fce7f3");
          grad.addColorStop(1, "#ede9fe");
          c.fillStyle = grad;
          c.fillRect(M - 12, yC - 4, innerW + 24, h - H.sectionPadBottom + 8);
          c.strokeStyle = "#fbcfe8";
          c.lineWidth = 2;
          c.strokeRect(M - 12, yC - 4, innerW + 24, h - H.sectionPadBottom + 8);
        }
        // heading
        c.fillStyle = "#ec4899";
        c.font = '700 28px "Quicksand", Arial, sans-serif';
        c.fillText("✿  " + s.heading, M, yC + 32);
        c.fillStyle = "#fbcfe8";
        c.fillRect(M, yC + 44, 100, 3);

        let textY = yC + 84;
        if (s.label) {
          c.fillStyle = "#9d174d";
          c.font = '700 16px "Quicksand", Arial, sans-serif';
          c.fillText(s.label + ":", M, textY);
          textY += 30;
        }
        c.fillStyle = "#1a1a1a";
        c.font = '500 17px "Quicksand", Arial, sans-serif';
        const lines = wrapLines(c, s.body, innerW - 32);
        for (const line of lines) {
          c.fillText(line, M, textY);
          textY += H.textBodyLineH;
        }
      }
      else if (s.type === "footer") {
        c.fillStyle = "#9d174d";
        c.font = '500 13px ui-monospace, Menlo, monospace';
        const date = new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
        c.fillText(`generated ${date} · paper-standard 25 mm/sec, 10 mm/mV`, M, yC + 24);
        c.fillStyle = "#ec4899";
        c.font = '700 18px "Quicksand", Arial, sans-serif';
        c.textAlign = "right";
        c.fillText("✿  ICU Med Mastery", W - M, yC + 24);
        c.textAlign = "left";
      }
      yC += h;
    }

    // Bottom accent bar
    const bar2 = c.createLinearGradient(0, 0, W, 0);
    bar2.addColorStop(0, "#a78bfa");
    bar2.addColorStop(1, "#ec4899");
    c.fillStyle = bar2;
    c.fillRect(0, totalH - 8, W, 8);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ekg-${r.id}-${rate || "rhythm"}.png`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          URL.revokeObjectURL(url);
          a.remove();
        }, 600);
        resolve();
      }, "image/png", 0.95);
    });
  }

  function handleRhythmChange(rhythmId) {
    const r = RHYTHMS.find((x) => x.id === rhythmId);
    if (!r) return;
    // Flush any pending notes save for the OUTGOING rhythm before switching
    const ta = document.getElementById("strip-notes");
    if (ta && currentRhythm) {
      clearTimeout(notesSaveTimer);
      saveNotes(currentRhythm.id, ta.value);
    }
    currentRhythm = r;
    currentRate = r.rateDefault;
    updateRateSlider();
    generateAndRender();
  }

  function handleDownload() {
    const canvas = document.getElementById("ekg-canvas");
    const link = document.createElement("a");
    link.download = `ekg-${currentRhythm.id}-${currentRate}bpm.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  // ──────────────────────────────────────────────────────────
  // Quiz mode
  // ──────────────────────────────────────────────────────────
  let quizState = { current: null, options: [], correct: 0, total: 0, streak: 0, answered: false };

  function pickQuizRhythm() {
    const idx = Math.floor(Math.random() * RHYTHMS.length);
    return RHYTHMS[idx];
  }

  function newQuizStrip() {
    const r = pickQuizRhythm();
    quizState.current = r;
    quizState.answered = false;
    const rate = r.rateDefault || 75;
    const samples = r.generator(rate);
    const canvas = document.getElementById("quiz-canvas");
    renderStrip(canvas, samples);
    document.getElementById("quiz-rhythm-pill").classList.add("hidden");
    document.getElementById("quiz-result").textContent = "";

    // Build distractor options (3 random others + correct, shuffled)
    const pool = RHYTHMS.filter((x) => x.id !== r.id);
    const distractors = [];
    while (distractors.length < 3) {
      const pick = pool[Math.floor(Math.random() * pool.length)];
      if (!distractors.find((d) => d.id === pick.id)) distractors.push(pick);
    }
    quizState.options = [r, ...distractors].sort(() => Math.random() - 0.5);
    const optsEl = document.getElementById("quiz-options");
    optsEl.innerHTML = "";
    quizState.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "quiz-option";
      btn.innerHTML = `<span style="color:var(--pink-deep);font-family:var(--font-fun);font-size:18px;margin-right:8px">${"ABCD"[i]}</span> ${opt.name}`;
      btn.onclick = () => handleQuizAnswer(opt, btn);
      optsEl.appendChild(btn);
    });
  }

  function handleQuizAnswer(picked, btn) {
    if (quizState.answered) return;
    quizState.answered = true;
    quizState.total += 1;
    const correct = picked.id === quizState.current.id;
    const optButtons = document.querySelectorAll(".quiz-option");
    optButtons.forEach((b) => (b.disabled = true));
    if (correct) {
      quizState.correct += 1;
      quizState.streak += 1;
      btn.classList.add("correct");
      document.getElementById("quiz-result").textContent = `slay 💖 it's ${quizState.current.name}`;
    } else {
      quizState.streak = 0;
      btn.classList.add("wrong");
      // Highlight the correct one
      optButtons.forEach((b) => {
        if (b.textContent.includes(quizState.current.name)) b.classList.add("correct");
      });
      document.getElementById("quiz-result").textContent = `actually ${quizState.current.name} 💕 you got this next one`;
    }
    document.getElementById("quiz-rhythm-pill").textContent = quizState.current.name;
    document.getElementById("quiz-rhythm-pill").classList.remove("hidden");
    document.getElementById("quiz-correct").textContent = quizState.correct;
    document.getElementById("quiz-total").textContent = quizState.total;
    document.getElementById("quiz-streak").textContent = quizState.streak;
    persistQuiz();
  }

  function persistQuiz() {
    try {
      localStorage.setItem("ekg_quiz_state", JSON.stringify({
        correct: quizState.correct, total: quizState.total, streak: quizState.streak
      }));
    } catch (e) {}
  }
  function loadQuiz() {
    try {
      const saved = JSON.parse(localStorage.getItem("ekg_quiz_state") || "{}");
      quizState.correct = saved.correct || 0;
      quizState.total = saved.total || 0;
      quizState.streak = saved.streak || 0;
    } catch (e) {}
    document.getElementById("quiz-correct").textContent = quizState.correct;
    document.getElementById("quiz-total").textContent = quizState.total;
    document.getElementById("quiz-streak").textContent = quizState.streak;
  }

  // ──────────────────────────────────────────────────────────
  // Mode toggle
  // ──────────────────────────────────────────────────────────
  function switchMode(mode) {
    const explore = document.getElementById("explore-view");
    const quiz = document.getElementById("quiz-view");
    const btnE = document.getElementById("mode-explore");
    const btnQ = document.getElementById("mode-quiz");
    if (mode === "explore") {
      explore.style.display = "";
      quiz.style.display = "none";
      btnE.classList.add("active");
      btnQ.classList.remove("active");
    } else {
      explore.style.display = "none";
      quiz.style.display = "";
      btnE.classList.remove("active");
      btnQ.classList.add("active");
      if (!quizState.current) newQuizStrip();
    }
  }

  // ──────────────────────────────────────────────────────────
  // Init
  // ──────────────────────────────────────────────────────────
  function init() {
    const select = document.getElementById("rhythm-select");
    fillRhythmSelect(select);
    select.value = currentRhythm.id;
    updateRateSlider();
    generateAndRender();

    select.addEventListener("change", (e) => handleRhythmChange(e.target.value));
    document.getElementById("rate-slider").addEventListener("input", (e) => {
      currentRate = parseInt(e.target.value, 10);
      document.getElementById("rate-value").textContent = currentRate;
      generateAndRender();
    });
    document.getElementById("regenerate").addEventListener("click", generateAndRender);
    document.getElementById("download").addEventListener("click", handleDownload);
    const savePageBtn = document.getElementById("save-page");
    if (savePageBtn) savePageBtn.addEventListener("click", savePageAsPNG);

    attachNotesAutoSave();
    loadNotesIntoUI();

    document.getElementById("mode-explore").addEventListener("click", () => switchMode("explore"));
    document.getElementById("mode-quiz").addEventListener("click", () => switchMode("quiz"));
    document.getElementById("quiz-next").addEventListener("click", newQuizStrip);
    loadQuiz();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
