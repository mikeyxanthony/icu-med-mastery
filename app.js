// ============================================================
// ICU Med Mastery — main app logic
// ============================================================
(() => {
  const MEDS = window.MEDICATIONS;
  const CATEGORIES = window.CATEGORIES;
  const STORAGE_KEY = "icu_med_mastery_v1";

  // ─────────────────────────── State ───────────────────────────
  const defaultState = () => ({
    drugs: Object.fromEntries(
      MEDS.map((m) => [m.id, { mastery: 0, seen: 0, correct: 0, wrong: 0, lastSeen: null }])
    ),
    sessions: { quiz: 0, flashcard: 0, recall: 0, receptor: 0 },
    totalQuestions: 0,
    totalCorrect: 0,
  });

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      // Migration: ensure new drugs are present
      const fresh = defaultState();
      Object.keys(fresh.drugs).forEach((id) => {
        if (!parsed.drugs[id]) parsed.drugs[id] = fresh.drugs[id];
      });
      return { ...fresh, ...parsed, drugs: { ...fresh.drugs, ...parsed.drugs } };
    } catch (e) {
      return defaultState();
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  let state = loadState();

  // ─────────────────────────── Progress / Mastery ───────────────────────────
  function bumpMastery(drugId, delta) {
    const d = state.drugs[drugId];
    if (!d) return;
    d.mastery = Math.max(0, Math.min(100, (d.mastery || 0) + delta));
    d.lastSeen = Date.now();
    saveState();
    updateReadinessUI();
  }

  function recordAnswer(drugId, correct) {
    const d = state.drugs[drugId];
    if (!d) return;
    d.seen += 1;
    if (correct) {
      d.correct += 1;
      // Diminishing returns curve: easier to climb from 0 than from 80
      const gain = Math.max(4, 16 - Math.floor((d.mastery || 0) / 10));
      bumpMastery(drugId, gain);
    } else {
      d.wrong += 1;
      bumpMastery(drugId, -8);
    }
    state.totalQuestions += 1;
    if (correct) state.totalCorrect += 1;
    saveState();
  }

  function overallReadiness() {
    const values = Object.values(state.drugs).map((d) => d.mastery || 0);
    if (values.length === 0) return 0;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }

  function updateReadinessUI() {
    const score = overallReadiness();
    document.getElementById("readiness-score").textContent = score + "%";
    document.getElementById("readiness-fill").style.width = score + "%";
  }

  // ─────────────────────────── View Switching ───────────────────────────
  function switchView(viewId) {
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
    document.querySelectorAll(".mode-tab").forEach((t) => t.classList.remove("active"));
    document.getElementById(viewId).classList.add("active");
    document.querySelector(`[data-view="${viewId}"]`)?.classList.add("active");
    // Hooks to refresh content
    if (viewId === "view-reference") renderReference();
    if (viewId === "view-flashcards") startFlashcards();
    if (viewId === "view-quiz") startQuiz();
    if (viewId === "view-receptor") startReceptor();
    if (viewId === "view-recall") startRecall();
    if (viewId === "view-progress") renderProgress();
  }

  // ─────────────────────────── Reference / Browse Mode ───────────────────────────
  let refFilter = { search: "", category: "All" };

  function renderReference() {
    const grid = document.getElementById("ref-grid");
    grid.innerHTML = "";
    const search = refFilter.search.toLowerCase();
    const filtered = MEDS.filter((m) => {
      if (refFilter.category !== "All" && m.category !== refFilter.category) return false;
      if (!search) return true;
      const haystack = `${m.name} ${m.aliases.join(" ")} ${m.category} ${m.mechanism}`.toLowerCase();
      return haystack.includes(search);
    });

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="empty-state"><h3>No medications match</h3><div>Try a different search or filter.</div></div>`;
      return;
    }

    filtered.forEach((m) => {
      const card = document.createElement("div");
      card.className = "drug-card";
      card.onclick = () => renderDrugDetail(m);
      const mastery = state.drugs[m.id]?.mastery || 0;
      card.innerHTML = `
        <span class="category-tag">${m.category}</span>
        <div class="name">${m.name}</div>
        <div class="aliases">${m.aliases.join(" · ")}</div>
        <div class="mastery">
          <div class="mastery-bar"><div class="fill" style="width:${mastery}%"></div></div>
          <div class="mastery-value">${mastery}%</div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  function renderDrugDetail(m) {
    const container = document.getElementById("view-reference");
    container.innerHTML = `
      <button class="back">← Back to all medications</button>
      <div class="drug-detail">
        <div class="header-row">
          <div>
            <span class="category-tag">${m.category}</span>
            <h2>${m.name}</h2>
            <div class="aliases">${m.aliases.join(" · ")}</div>
          </div>
          <div class="readiness-pill">
            <span class="label">Mastery</span>
            <span class="score">${state.drugs[m.id]?.mastery || 0}%</span>
          </div>
        </div>
        <div class="sections">
          <div class="detail-block full">
            <h3>Mechanism of Action</h3>
            <p>${m.mechanism}</p>
          </div>
          <div class="detail-block full info-block">
            <h3>Receptor-Level Effects</h3>
            <p>${m.receptors}</p>
          </div>
          <div class="detail-block">
            <h3>Clinical Uses</h3>
            <ul>${m.uses.map((u) => `<li>${u}</li>`).join("")}</ul>
          </div>
          <div class="detail-block">
            <h3>Typical Dosage</h3>
            <p>${m.dose}</p>
          </div>
          <div class="detail-block warn">
            <h3>Side Effects</h3>
            <ul>${m.sideEffects.map((s) => `<li>${s}</li>`).join("")}</ul>
          </div>
          <div class="detail-block danger-block">
            <h3>Contraindications</h3>
            <ul>${m.contraindications.map((c) => `<li>${c}</li>`).join("")}</ul>
          </div>
          <div class="detail-block full">
            <h3>ICU Pearls</h3>
            <ul>${m.icuPearls.map((p) => `<li>${p}</li>`).join("")}</ul>
          </div>
          <div class="detail-block full info-block">
            <h3>High-Yield / Nursing Knowledge</h3>
            <p>${m.highYield}</p>
          </div>
        </div>
      </div>
    `;
    container.querySelector(".back").onclick = () => {
      // Re-render the reference list view
      container.innerHTML = referenceShell();
      bindReferenceFilters();
      renderReference();
    };
    bumpMastery(m.id, 1);
  }

  function referenceShell() {
    return `
      <div class="view-header">
        <div>
          <h2>📖 Reference</h2>
          <div class="desc">All medications with receptor-level detail. Tap a card to drill in.</div>
        </div>
      </div>
      <div class="filter-bar">
        <input id="ref-search" type="search" placeholder="Search by name, brand, or keyword..."/>
      </div>
      <div class="chip-row" id="ref-chips"></div>
      <div style="height:14px"></div>
      <div class="drug-grid" id="ref-grid"></div>
    `;
  }

  function bindReferenceFilters() {
    const chipRow = document.getElementById("ref-chips");
    chipRow.innerHTML = "";
    ["All", ...CATEGORIES].forEach((cat) => {
      const chip = document.createElement("div");
      chip.className = "chip" + (refFilter.category === cat ? " active" : "");
      chip.textContent = cat;
      chip.onclick = () => {
        refFilter.category = cat;
        bindReferenceFilters();
        renderReference();
      };
      chipRow.appendChild(chip);
    });
    const search = document.getElementById("ref-search");
    search.value = refFilter.search;
    search.oninput = (e) => {
      refFilter.search = e.target.value;
      renderReference();
    };
  }

  // ─────────────────────────── Flashcards ───────────────────────────
  let fcState = { deck: [], idx: 0, flipped: false, faces: "name->all" };

  function startFlashcards() {
    const view = document.getElementById("view-flashcards");
    view.innerHTML = `
      <div class="view-header">
        <div>
          <h2>🃏 Flashcards</h2>
          <div class="desc">Tap card to flip. Rate your recall to update mastery.</div>
        </div>
        <div class="actions">
          <select id="fc-faces" style="background:var(--bg-card);color:var(--text);border:1px solid var(--border-strong);padding:8px 10px;border-radius:8px;font-family:inherit;font-size:13px">
            <option value="name->all">Name → Full info</option>
            <option value="moa->name">Mechanism → Name</option>
            <option value="receptor->name">Receptor → Name</option>
            <option value="dose->name">Dose → Name</option>
            <option value="name->moa">Name → Mechanism</option>
            <option value="name->receptor">Name → Receptor</option>
            <option value="name->dose">Name → Dose</option>
          </select>
          <button class="ghost" id="fc-shuffle">🔀 Shuffle</button>
        </div>
      </div>
      <div class="flashcard-container">
        <div class="flashcard" id="fc-card"></div>
        <div class="flashcard-controls">
          <button class="ghost" id="fc-prev">← Prev</button>
          <span class="counter" id="fc-counter"></span>
          <button class="ghost" id="fc-next">Next →</button>
        </div>
        <div class="confidence-buttons" id="fc-confidence" style="display:none">
          <button class="again">😩 Again</button>
          <button class="hard">😐 Hard</button>
          <button class="good">🙂 Good</button>
          <button class="easy">🤩 Easy</button>
        </div>
      </div>
    `;
    fcState.deck = shuffle([...MEDS]);
    fcState.idx = 0;
    fcState.flipped = false;
    renderFlashcard();
    document.getElementById("fc-faces").value = fcState.faces;
    document.getElementById("fc-faces").onchange = (e) => {
      fcState.faces = e.target.value;
      fcState.flipped = false;
      renderFlashcard();
    };
    document.getElementById("fc-shuffle").onclick = () => {
      fcState.deck = shuffle([...MEDS]);
      fcState.idx = 0;
      fcState.flipped = false;
      renderFlashcard();
      toast("Deck reshuffled");
    };
    document.getElementById("fc-prev").onclick = () => navFlashcard(-1);
    document.getElementById("fc-next").onclick = () => navFlashcard(1);
    document.querySelectorAll("#fc-confidence button").forEach((b, i) => {
      b.onclick = () => {
        const med = fcState.deck[fcState.idx];
        const deltas = [-10, 0, 8, 14];
        bumpMastery(med.id, deltas[i]);
        const d = state.drugs[med.id];
        d.seen += 1;
        saveState();
        toast(["Marked Again", "Marked Hard", "Marked Good", "Marked Easy"][i]);
        navFlashcard(1);
      };
    });
  }

  function navFlashcard(dir) {
    fcState.idx = (fcState.idx + dir + fcState.deck.length) % fcState.deck.length;
    fcState.flipped = false;
    renderFlashcard();
  }

  function renderFlashcard() {
    const med = fcState.deck[fcState.idx];
    if (!med) return;
    const card = document.getElementById("fc-card");
    document.getElementById("fc-counter").textContent =
      `${fcState.idx + 1} / ${fcState.deck.length}`;
    const [front, back] = fcState.faces.split("->");

    const facesContent = {
      name: () => `<div class="content">${med.name}</div><div class="aliases" style="margin-top:8px;color:var(--text-muted);font-family:var(--font-mono)">${med.aliases.join(" · ")}</div>`,
      moa: () => `<div class="content" style="font-size:18px">${med.mechanism}</div>`,
      receptor: () => `<div class="content" style="font-size:18px">${med.receptors}</div>`,
      dose: () => `<div class="content" style="font-size:18px">${med.dose}</div>`,
      all: () => `
        <div class="content"><strong>Mechanism:</strong> ${med.mechanism}<br><br>
        <strong>Receptors:</strong> ${med.receptors}<br><br>
        <strong>Dose:</strong> ${med.dose}<br><br>
        <strong>Key pearls:</strong> ${med.highYield}</div>
      `,
    };

    const prompts = {
      name: "Drug",
      moa: "Mechanism of action",
      receptor: "Receptor profile",
      dose: "Typical dose",
      all: "Full overview",
    };

    if (!fcState.flipped) {
      card.className = "flashcard";
      card.innerHTML = `
        <div class="face-label">FRONT</div>
        <div class="prompt">${prompts[front]}</div>
        ${facesContent[front]()}
        <div class="hint">Tap to reveal</div>
      `;
      document.getElementById("fc-confidence").style.display = "none";
    } else {
      card.className = "flashcard back";
      card.innerHTML = `
        <div class="face-label">BACK</div>
        <div class="prompt">${prompts[back]}</div>
        ${facesContent[back]()}
      `;
      document.getElementById("fc-confidence").style.display = "flex";
    }
    card.onclick = () => {
      fcState.flipped = !fcState.flipped;
      renderFlashcard();
    };
  }

  // ─────────────────────────── Multiple Choice Quiz ───────────────────────────
  let quizState = { questions: [], idx: 0, score: 0, answered: false };

  function buildQuestion(med) {
    // Question types
    const types = [
      "moa", "receptor", "primaryUse", "dose", "contraindication", "sideEffect", "pearl",
    ];
    const type = types[Math.floor(Math.random() * types.length)];
    let q, correct, distractorPool;

    switch (type) {
      case "moa":
        q = `Which agent has this mechanism: "${med.mechanism}"?`;
        correct = med.name;
        distractorPool = MEDS.filter((m) => m.id !== med.id).map((m) => m.name);
        break;
      case "receptor":
        q = `Which receptor profile matches ${med.name}?`;
        correct = med.receptors;
        distractorPool = MEDS.filter((m) => m.id !== med.id).map((m) => m.receptors);
        break;
      case "primaryUse":
        q = `What is a primary indication for ${med.name}?`;
        correct = med.uses[0];
        distractorPool = MEDS.filter((m) => m.id !== med.id).flatMap((m) => m.uses);
        break;
      case "dose":
        q = `Which is a typical dosing scheme for ${med.name}?`;
        correct = med.dose;
        distractorPool = MEDS.filter((m) => m.id !== med.id).map((m) => m.dose);
        break;
      case "contraindication":
        q = `Which is a contraindication or major caution for ${med.name}?`;
        correct = med.contraindications[0];
        distractorPool = MEDS.filter((m) => m.id !== med.id).flatMap((m) => m.contraindications);
        break;
      case "sideEffect":
        q = `Which is a recognized adverse effect of ${med.name}?`;
        correct = med.sideEffects[0];
        distractorPool = MEDS
          .filter((m) => m.id !== med.id)
          .flatMap((m) => m.sideEffects)
          .filter((s) => !med.sideEffects.includes(s));
        break;
      case "pearl":
        q = `Which high-yield statement applies to ${med.name}?`;
        correct = med.highYield;
        distractorPool = MEDS.filter((m) => m.id !== med.id).map((m) => m.highYield);
        break;
    }

    const distractors = shuffle(distractorPool).slice(0, 3);
    const choices = shuffle([correct, ...distractors]);
    return { drugId: med.id, q, correct, choices, type };
  }

  function startQuiz() {
    const view = document.getElementById("view-quiz");
    view.innerHTML = `
      <div class="view-header">
        <div>
          <h2>🎯 Quiz Mode</h2>
          <div class="desc">Mixed multiple-choice from mechanism, receptors, dosing, side effects.</div>
        </div>
        <div class="actions">
          <select id="quiz-length" style="background:var(--bg-card);color:var(--text);border:1px solid var(--border-strong);padding:8px 10px;border-radius:8px;font-family:inherit;font-size:13px">
            <option value="10">10 questions</option>
            <option value="20">20 questions</option>
            <option value="50">50 questions</option>
            <option value="100">100 questions</option>
          </select>
          <button class="primary" id="quiz-start">Start</button>
        </div>
      </div>
      <div id="quiz-body"></div>
    `;
    document.getElementById("quiz-start").onclick = () => {
      const n = parseInt(document.getElementById("quiz-length").value, 10);
      const questions = [];
      const sortedByLowMastery = [...MEDS].sort(
        (a, b) => (state.drugs[a.id]?.mastery || 0) - (state.drugs[b.id]?.mastery || 0)
      );
      for (let i = 0; i < n; i++) {
        // Bias toward low-mastery drugs (first half of pool)
        const pool = i % 2 === 0 ? sortedByLowMastery.slice(0, 8) : MEDS;
        const med = pool[Math.floor(Math.random() * pool.length)];
        questions.push(buildQuestion(med));
      }
      quizState = { questions, idx: 0, score: 0, answered: false };
      state.sessions.quiz += 1;
      saveState();
      renderQuiz();
    };
  }

  function renderQuiz() {
    const body = document.getElementById("quiz-body");
    if (quizState.idx >= quizState.questions.length) return renderQuizResults();
    const q = quizState.questions[quizState.idx];
    body.innerHTML = `
      <div class="quiz">
        <div class="quiz-stats">
          <div>Question ${quizState.idx + 1} of ${quizState.questions.length}</div>
          <div class="quiz-progress"><div class="fill" style="width:${((quizState.idx) / quizState.questions.length) * 100}%"></div></div>
          <div>Score: ${quizState.score}</div>
        </div>
        <div class="question-card">
          <div class="q-meta">${labelType(q.type)}</div>
          <div class="q-text">${q.q}</div>
          <div class="choice-list">
            ${q.choices.map((c, i) => `
              <button class="choice" data-choice="${escapeAttr(c)}">
                <span class="letter">${"ABCD"[i]}</span>
                <span>${c}</span>
              </button>
            `).join("")}
          </div>
          <div id="quiz-feedback"></div>
          <div style="margin-top:14px;display:flex;justify-content:flex-end">
            <button class="primary" id="quiz-next" disabled>Next →</button>
          </div>
        </div>
      </div>
    `;
    quizState.answered = false;
    body.querySelectorAll(".choice").forEach((btn) => {
      btn.onclick = () => {
        if (quizState.answered) return;
        quizState.answered = true;
        const picked = btn.dataset.choice;
        const correct = picked === q.correct;
        body.querySelectorAll(".choice").forEach((b) => {
          b.classList.add("disabled");
          if (b.dataset.choice === q.correct) b.classList.add("correct");
          else if (b.dataset.choice === picked) b.classList.add("wrong");
        });
        recordAnswer(q.drugId, correct);
        if (correct) quizState.score += 1;
        const fb = document.getElementById("quiz-feedback");
        const med = MEDS.find((m) => m.id === q.drugId);
        fb.className = "feedback " + (correct ? "correct" : "wrong");
        fb.innerHTML = correct
          ? `<strong>Correct.</strong> ${med.highYield}`
          : `<strong>Not quite.</strong> Answer: <strong>${q.correct}</strong>. ${med.highYield}`;
        document.getElementById("quiz-next").disabled = false;
      };
    });
    document.getElementById("quiz-next").onclick = () => {
      quizState.idx += 1;
      renderQuiz();
    };
  }

  function renderQuizResults() {
    const body = document.getElementById("quiz-body");
    const total = quizState.questions.length;
    const pct = Math.round((quizState.score / total) * 100);
    const msg =
      pct >= 90 ? "Mastery territory. Receptors locked in."
      : pct >= 75 ? "Solid. A few weak spots to tighten."
      : pct >= 60 ? "Getting there. Focus on the misses."
      : "Time to review. Hit the reference + flashcards.";
    body.innerHTML = `
      <div class="results">
        <h2>Quiz complete</h2>
        <div class="score-display">${pct}%</div>
        <div class="score-fraction">${quizState.score} / ${total} correct</div>
        <div class="stats-row">
          <div class="stat-card"><div class="label">Correct</div><div class="value" style="color:var(--success)">${quizState.score}</div></div>
          <div class="stat-card"><div class="label">Missed</div><div class="value" style="color:var(--danger)">${total - quizState.score}</div></div>
          <div class="stat-card"><div class="label">Readiness</div><div class="value" style="color:var(--accent)">${overallReadiness()}%</div></div>
        </div>
        <div style="margin-bottom:20px;color:var(--text-muted)">${msg}</div>
        <button class="primary" id="quiz-restart">Run another</button>
      </div>
    `;
    document.getElementById("quiz-restart").onclick = startQuiz;
  }

  function labelType(t) {
    return ({
      moa: "MECHANISM OF ACTION",
      receptor: "RECEPTOR DRILL",
      primaryUse: "INDICATION",
      dose: "DOSING",
      contraindication: "CONTRAINDICATIONS",
      sideEffect: "ADVERSE EFFECTS",
      pearl: "HIGH YIELD",
    })[t] || "QUESTION";
  }

  // ─────────────────────────── Receptor Match (drill) ───────────────────────────
  let recState = { questions: [], idx: 0, score: 0, answered: false };

  function startReceptor() {
    const view = document.getElementById("view-receptor");
    view.innerHTML = `
      <div class="view-header">
        <div>
          <h2>🧪 Receptor Drill</h2>
          <div class="desc">Pure receptor pharmacology. Identify the drug from its receptor profile.</div>
        </div>
        <div class="actions">
          <button class="primary" id="rec-start">Start drill</button>
        </div>
      </div>
      <div id="rec-body"></div>
    `;
    document.getElementById("rec-start").onclick = () => {
      const questions = shuffle([...MEDS]).map((med) => {
        const distractors = shuffle(MEDS.filter((m) => m.id !== med.id)).slice(0, 3).map((m) => m.name);
        return {
          drugId: med.id,
          q: med.receptors,
          correct: med.name,
          choices: shuffle([med.name, ...distractors]),
        };
      });
      recState = { questions, idx: 0, score: 0, answered: false };
      state.sessions.receptor += 1;
      saveState();
      renderReceptor();
    };
  }

  function renderReceptor() {
    const body = document.getElementById("rec-body");
    if (recState.idx >= recState.questions.length) {
      const total = recState.questions.length;
      const pct = Math.round((recState.score / total) * 100);
      body.innerHTML = `
        <div class="results">
          <h2>Receptor drill complete</h2>
          <div class="score-display">${pct}%</div>
          <div class="score-fraction">${recState.score} / ${total} correct</div>
          <button class="primary" id="rec-restart">Run another</button>
        </div>
      `;
      document.getElementById("rec-restart").onclick = startReceptor;
      return;
    }
    const q = recState.questions[recState.idx];
    body.innerHTML = `
      <div class="quiz">
        <div class="quiz-stats">
          <div>Question ${recState.idx + 1} of ${recState.questions.length}</div>
          <div class="quiz-progress"><div class="fill" style="width:${((recState.idx) / recState.questions.length) * 100}%"></div></div>
          <div>Score: ${recState.score}</div>
        </div>
        <div class="question-card">
          <div class="q-meta">RECEPTOR PROFILE</div>
          <div class="q-text">${q.q}</div>
          <div class="choice-list">
            ${q.choices.map((c, i) => `
              <button class="choice" data-choice="${escapeAttr(c)}">
                <span class="letter">${"ABCD"[i]}</span>
                <span>${c}</span>
              </button>
            `).join("")}
          </div>
          <div id="rec-feedback"></div>
          <div style="margin-top:14px;display:flex;justify-content:flex-end">
            <button class="primary" id="rec-next" disabled>Next →</button>
          </div>
        </div>
      </div>
    `;
    recState.answered = false;
    body.querySelectorAll(".choice").forEach((btn) => {
      btn.onclick = () => {
        if (recState.answered) return;
        recState.answered = true;
        const picked = btn.dataset.choice;
        const correct = picked === q.correct;
        body.querySelectorAll(".choice").forEach((b) => {
          b.classList.add("disabled");
          if (b.dataset.choice === q.correct) b.classList.add("correct");
          else if (b.dataset.choice === picked) b.classList.add("wrong");
        });
        recordAnswer(q.drugId, correct);
        if (correct) recState.score += 1;
        const fb = document.getElementById("rec-feedback");
        const med = MEDS.find((m) => m.id === q.drugId);
        fb.className = "feedback " + (correct ? "correct" : "wrong");
        fb.innerHTML = correct
          ? `<strong>${med.name}.</strong> ${med.mechanism}`
          : `<strong>${q.correct}.</strong> ${med.mechanism}`;
        document.getElementById("rec-next").disabled = false;
      };
    });
    document.getElementById("rec-next").onclick = () => {
      recState.idx += 1;
      renderReceptor();
    };
  }

  // ─────────────────────────── Free Recall ───────────────────────────
  let recallState = { current: null };

  function startRecall() {
    const view = document.getElementById("view-recall");
    pickRecallDrug();
    function pickRecallDrug() {
      // Weighted toward low-mastery
      const weighted = [...MEDS].sort(
        (a, b) => (state.drugs[a.id]?.mastery || 0) - (state.drugs[b.id]?.mastery || 0)
      );
      const candidates = weighted.slice(0, 8);
      const med = candidates[Math.floor(Math.random() * candidates.length)];
      recallState.current = med;
      view.innerHTML = `
        <div class="view-header">
          <div>
            <h2>✍️ Free Recall</h2>
            <div class="desc">Brain-dump everything you know, then check yourself. Self-graded mastery.</div>
          </div>
          <div class="actions">
            <button class="ghost" id="recall-skip">Skip →</button>
          </div>
        </div>
        <div class="recall-prompt">
          <span class="category-tag">${med.category}</span>
          <h3>${med.name}</h3>
          <div class="aliases" style="font-family:var(--font-mono);color:var(--text-muted);margin-bottom:14px">${med.aliases.join(" · ")}</div>
          <p style="color:var(--text-muted);font-size:13px;margin-bottom:10px">Write down: mechanism, receptors, uses, dose, side effects, contraindications, pearls.</p>
          <textarea id="recall-text" placeholder="Type your full breakdown here..."></textarea>
          <div style="margin-top:14px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">
            <button class="ghost" id="recall-reveal">Reveal answer</button>
            <div style="display:flex;gap:8px">
              <button class="danger" id="recall-bad">Missed too much</button>
              <button class="primary" id="recall-good">Got most of it</button>
            </div>
          </div>
          <div id="recall-answer" style="display:none;margin-top:18px"></div>
        </div>
      `;
      document.getElementById("recall-reveal").onclick = () => revealRecall();
      document.getElementById("recall-skip").onclick = () => pickRecallDrug();
      document.getElementById("recall-good").onclick = () => {
        bumpMastery(med.id, 12);
        state.sessions.recall += 1;
        saveState();
        toast("+12% mastery");
        pickRecallDrug();
      };
      document.getElementById("recall-bad").onclick = () => {
        bumpMastery(med.id, -4);
        state.sessions.recall += 1;
        saveState();
        toast("Marked for review");
        pickRecallDrug();
      };
    }
  }

  function revealRecall() {
    const m = recallState.current;
    const box = document.getElementById("recall-answer");
    box.style.display = "block";
    box.innerHTML = `
      <div class="detail-block full">
        <h3>Mechanism</h3><p>${m.mechanism}</p>
      </div>
      <div class="detail-block full info-block" style="margin-top:8px">
        <h3>Receptors</h3><p>${m.receptors}</p>
      </div>
      <div class="sections" style="margin-top:8px">
        <div class="detail-block"><h3>Uses</h3><ul>${m.uses.map((u) => `<li>${u}</li>`).join("")}</ul></div>
        <div class="detail-block"><h3>Dose</h3><p>${m.dose}</p></div>
        <div class="detail-block warn"><h3>Side Effects</h3><ul>${m.sideEffects.map((s) => `<li>${s}</li>`).join("")}</ul></div>
        <div class="detail-block danger-block"><h3>Contraindications</h3><ul>${m.contraindications.map((c) => `<li>${c}</li>`).join("")}</ul></div>
        <div class="detail-block full"><h3>ICU Pearls</h3><ul>${m.icuPearls.map((p) => `<li>${p}</li>`).join("")}</ul></div>
        <div class="detail-block full info-block"><h3>High Yield</h3><p>${m.highYield}</p></div>
      </div>
    `;
  }

  // ─────────────────────────── Progress Dashboard ───────────────────────────
  function renderProgress() {
    const view = document.getElementById("view-progress");
    const total = MEDS.length;
    const mastered = Object.values(state.drugs).filter((d) => (d.mastery || 0) >= 80).length;
    const weak = Object.values(state.drugs).filter((d) => (d.mastery || 0) < 40).length;
    const acc = state.totalQuestions === 0
      ? 0
      : Math.round((state.totalCorrect / state.totalQuestions) * 100);
    const sessionsTotal = state.sessions.quiz + state.sessions.flashcard + state.sessions.recall + state.sessions.receptor;

    view.innerHTML = `
      <div class="view-header">
        <div>
          <h2>📊 Progress</h2>
          <div class="desc">Readiness, per-drug mastery, and lifetime stats — all saved locally.</div>
        </div>
        <div class="actions">
          <button class="danger" id="prog-reset">Reset all progress</button>
        </div>
      </div>
      <div class="dashboard">
        <div class="stat-tile accent">
          <div class="label">Readiness Score</div>
          <div class="big">${overallReadiness()}%</div>
          <div class="sub">Average mastery across all medications</div>
        </div>
        <div class="stat-tile">
          <div class="label">Quiz Accuracy</div>
          <div class="big">${acc}%</div>
          <div class="sub">${state.totalCorrect} correct of ${state.totalQuestions} attempts</div>
        </div>
        <div class="stat-tile">
          <div class="label">Mastered (≥80%)</div>
          <div class="big" style="color:var(--success)">${mastered} / ${total}</div>
          <div class="sub">Receptor-level competency</div>
        </div>
        <div class="stat-tile">
          <div class="label">Weak Spots (&lt;40%)</div>
          <div class="big" style="color:var(--danger)">${weak}</div>
          <div class="sub">Focus area for next session</div>
        </div>
        <div class="stat-tile">
          <div class="label">Study Sessions</div>
          <div class="big">${sessionsTotal}</div>
          <div class="sub">Quizzes: ${state.sessions.quiz} · Flash: ${state.sessions.flashcard} · Recall: ${state.sessions.recall} · Receptor: ${state.sessions.receptor}</div>
        </div>
        <div class="stat-tile">
          <div class="label">Suggested Next</div>
          <div class="big" style="font-size:18px;line-height:1.4">${
            weak > 0
              ? "🎯 Run a Quiz — auto-targets weak drugs"
              : mastered < total
              ? "🃏 Review with Flashcards"
              : "🧪 Try the Receptor Drill"
          }</div>
        </div>
      </div>
      <div class="mastery-list">
        <h3>Per-Drug Mastery</h3>
        <div id="mastery-rows"></div>
      </div>
    `;
    const rows = document.getElementById("mastery-rows");
    const sorted = [...MEDS].sort((a, b) => (state.drugs[a.id]?.mastery || 0) - (state.drugs[b.id]?.mastery || 0));
    sorted.forEach((m) => {
      const mastery = state.drugs[m.id]?.mastery || 0;
      const row = document.createElement("div");
      row.className = "mastery-row";
      row.innerHTML = `
        <div class="name">${m.name} <span style="color:var(--text-dim);font-size:12px">· ${m.category}</span></div>
        <div class="mastery-bar"><div class="fill" style="width:${mastery}%; background:${
          mastery >= 80 ? "var(--success)" : mastery >= 40 ? "var(--accent)" : "var(--danger)"
        }"></div></div>
        <div class="pct">${mastery}%</div>
      `;
      rows.appendChild(row);
    });
    document.getElementById("prog-reset").onclick = () => {
      if (confirm("Reset all progress? This wipes mastery, scores, and session counts.")) {
        state = defaultState();
        saveState();
        updateReadinessUI();
        renderProgress();
        toast("Progress reset");
      }
    };
  }

  // ─────────────────────────── Utils ───────────────────────────
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function escapeAttr(str) {
    return String(str).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  let toastTimer;
  function toast(msg) {
    let t = document.getElementById("toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "toast";
      t.className = "toast";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.display = "block";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (t.style.display = "none"), 2200);
  }

  // ─────────────────────────── Init ───────────────────────────
  function init() {
    document.querySelectorAll(".mode-tab").forEach((tab) => {
      tab.onclick = () => switchView(tab.dataset.view);
    });
    document.getElementById("view-reference").innerHTML = referenceShell();
    bindReferenceFilters();
    updateReadinessUI();
    switchView("view-reference");

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      const activeView = document.querySelector(".view.active").id;
      if (activeView === "view-flashcards") {
        if (e.key === " ") { e.preventDefault(); fcState.flipped = !fcState.flipped; renderFlashcard(); }
        if (e.key === "ArrowLeft") navFlashcard(-1);
        if (e.key === "ArrowRight") navFlashcard(1);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
