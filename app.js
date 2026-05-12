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
    sessions: { quiz: 0, flashcard: 0, recall: 0, receptor: 0, match: 0, trivia: 0 },
    totalQuestions: 0,
    totalCorrect: 0,
    triviaHighScore: 0,
    triviaBestStreak: 0,
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
    if (viewId === "view-match") startMatch();
    if (viewId === "view-quiz") startQuiz();
    if (viewId === "view-receptor") startReceptor();
    if (viewId === "view-recall") startRecall();
    if (viewId === "view-trivia") startTrivia();
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
          <div class="detail-block full" data-ai="moa">
            <h3>Mechanism of Action</h3>
            <p>${m.mechanism}</p>
          </div>
          <div class="detail-block full info-block" data-ai="receptors">
            <h3>Receptor-Level Effects</h3>
            <p>${m.receptors}</p>
          </div>
          <div class="detail-block" data-ai="uses">
            <h3>Clinical Uses</h3>
            <ul>${m.uses.map((u) => `<li>${u}</li>`).join("")}</ul>
          </div>
          <div class="detail-block" data-ai="dose">
            <h3>Typical Dosage</h3>
            <p>${m.dose}</p>
          </div>
          <div class="detail-block warn" data-ai="sideEffects">
            <h3>Side Effects</h3>
            <ul>${m.sideEffects.map((s) => `<li>${s}</li>`).join("")}</ul>
          </div>
          <div class="detail-block danger-block" data-ai="contra">
            <h3>Contraindications</h3>
            <ul>${m.contraindications.map((c) => `<li>${c}</li>`).join("")}</ul>
          </div>
          <div class="detail-block full" data-ai="pearls">
            <h3>ICU Pearls</h3>
            <ul>${m.icuPearls.map((p) => `<li>${p}</li>`).join("")}</ul>
          </div>
          <div class="detail-block full info-block" data-ai="highYield">
            <h3>High-Yield / Nursing Knowledge</h3>
            <p>${m.highYield}</p>
          </div>
        </div>
      </div>
    `;
    container.querySelector(".back").onclick = () => {
      container.innerHTML = referenceShell();
      bindReferenceFilters();
      renderReference();
    };
    // Attach AI tutor buttons to each detail block
    const aiSections = [
      ["moa", "Mechanism of Action", m.mechanism],
      ["receptors", "Receptor-Level Effects", m.receptors],
      ["uses", "Clinical Uses", m.uses],
      ["dose", "Typical Dosage", m.dose],
      ["sideEffects", "Side Effects", m.sideEffects],
      ["contra", "Contraindications", m.contraindications],
      ["pearls", "ICU Pearls", m.icuPearls],
      ["highYield", "High-Yield / Nursing Knowledge", m.highYield],
    ];
    if (window.AITutor) {
      aiSections.forEach(([key, label, content]) => {
        const el = container.querySelector(`[data-ai="${key}"]`);
        if (el) window.AITutor.attachAIButtons(el, { topic: m.name, section: label, getContent: () => content });
      });
    }
    bumpMastery(m.id, 1);
  }

  function referenceShell() {
    return `
      <div class="view-header">
        <div>
          <h2>📖 Drug Library</h2>
          <div class="desc">all your faves, receptor-level detail — tap any card to dive in 💕</div>
        </div>
      </div>
      <div class="filter-bar">
        <input id="ref-search" type="search" placeholder="search by name, brand, or keyword ✿"/>
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
          <h2>💖 Flashcards</h2>
          <div class="desc">tap to flip ✿ rate your recall to grow your mastery</div>
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
          <button class="ghost" id="fc-prev">← prev</button>
          <span class="counter" id="fc-counter"></span>
          <button class="ghost" id="fc-next">next →</button>
        </div>
        <div class="confidence-buttons" id="fc-confidence" style="display:none">
          <button class="again">💔 again</button>
          <button class="hard">🥲 hard</button>
          <button class="good">💗 good</button>
          <button class="easy">👑 easy</button>
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
      toast("deck reshuffled ✨");
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
        toast(["marked again 💔", "marked hard 🥲", "marked good 💗", "marked easy 👑"][i]);
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
          <h2>🌸 Quiz Mode</h2>
          <div class="desc">mixed MCQs — mechanism, receptors, dosing, side effects ✨</div>
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
      pct >= 90 ? "slay queen 👑 receptors locked in"
      : pct >= 75 ? "you're cooking ✨ tighten the weak spots"
      : pct >= 60 ? "getting there bestie 💕 focus on the misses"
      : "time to review boo — hit the library + flashcards 🌸";
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
        <button class="primary" id="quiz-restart">run another ✿</button>
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
          <h2>🧬 Receptor Drill</h2>
          <div class="desc">pure pharm — identify the drug from its receptor profile 💕</div>
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
          <button class="primary" id="rec-restart">run another ✿</button>
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
            <h2>✨ Free Recall</h2>
            <div class="desc">brain dump everything you know, then check yourself ✿</div>
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
        toast("+12% mastery 💖");
        pickRecallDrug();
      };
      document.getElementById("recall-bad").onclick = () => {
        bumpMastery(med.id, -4);
        state.sessions.recall += 1;
        saveState();
        toast("marked for review 💕");
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

  // ─────────────────────────── Match Game ───────────────────────────
  let matchState = {
    type: "moa",
    pairs: [],
    pairCount: 6,
    leftSelected: null,
    matched: new Set(),
    attempts: 0,
    correctAttempts: 0,
    startTime: null,
    finished: false,
  };

  const MATCH_TYPES = [
    { key: "moa", label: "Mechanism", short: "MOA", truncate: 220 },
    { key: "receptors", label: "Receptors", short: "Receptors", truncate: 180 },
    { key: "uses", label: "Top Indication", short: "Use", truncate: 120 },
    { key: "dose", label: "Dose", short: "Dose", truncate: 160 },
    { key: "side", label: "Side Effect", short: "AE", truncate: 100 },
    { key: "contra", label: "Contraindication", short: "Contra", truncate: 160 },
  ];

  function extractMatchValue(drug, type) {
    switch (type) {
      case "moa": return drug.mechanism;
      case "receptors": return drug.receptors;
      case "uses": return drug.uses[0];
      case "dose": return drug.dose;
      case "side": return drug.sideEffects[0];
      case "contra": return drug.contraindications[0];
    }
  }
  function truncateText(s, n) {
    if (!s) return "";
    return s.length > n ? s.slice(0, n - 1).trim() + "…" : s;
  }

  function startMatch() {
    const view = document.getElementById("view-match");
    view.innerHTML = `
      <div class="view-header">
        <div>
          <h2>🍓 Match Game</h2>
          <div class="desc">pair each drug with its match — pick a type below to start ✨</div>
        </div>
        <div class="actions">
          <select id="match-count">
            <option value="6">6 pairs</option>
            <option value="8">8 pairs</option>
            <option value="10">10 pairs</option>
          </select>
        </div>
      </div>
      <div class="chip-row" id="match-chips" style="margin-bottom:18px"></div>
      <div id="match-body"></div>
    `;
    const chipRow = document.getElementById("match-chips");
    MATCH_TYPES.forEach((t) => {
      const chip = document.createElement("div");
      chip.className = "chip" + (matchState.type === t.key ? " active" : "");
      chip.textContent = "✿ " + t.label;
      chip.onclick = () => {
        matchState.type = t.key;
        startMatch();
      };
      chipRow.appendChild(chip);
    });
    document.getElementById("match-count").value = String(matchState.pairCount);
    document.getElementById("match-count").onchange = (e) => {
      matchState.pairCount = parseInt(e.target.value, 10);
      newMatchRound();
    };
    newMatchRound();
  }

  function newMatchRound() {
    const sample = shuffle([...MEDS]).slice(0, Math.min(matchState.pairCount, MEDS.length));
    const typeDef = MATCH_TYPES.find((t) => t.key === matchState.type);
    matchState.pairs = sample.map((drug) => ({
      id: drug.id,
      name: drug.name,
      aliases: drug.aliases,
      category: drug.category,
      value: extractMatchValue(drug, matchState.type),
      preview: truncateText(extractMatchValue(drug, matchState.type), typeDef.truncate),
    }));
    matchState.leftSelected = null;
    matchState.matched = new Set();
    matchState.attempts = 0;
    matchState.correctAttempts = 0;
    matchState.startTime = Date.now();
    matchState.finished = false;
    renderMatch();
  }

  function renderMatch() {
    const body = document.getElementById("match-body");
    const typeDef = MATCH_TYPES.find((t) => t.key === matchState.type);
    const leftOrder = matchState.pairs;
    const rightOrder = shuffle([...matchState.pairs]);

    const elapsed = Math.floor((Date.now() - matchState.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString();
    const seconds = (elapsed % 60).toString().padStart(2, "0");

    if (matchState.finished) {
      const accuracy = matchState.attempts === 0 ? 0 : Math.round((matchState.correctAttempts / matchState.attempts) * 100);
      const msg =
        accuracy >= 90 ? "flawless 👑✨"
        : accuracy >= 75 ? "you ate that 💖"
        : accuracy >= 60 ? "solid effort 🌸"
        : "let's try again bestie 💕";
      body.innerHTML = `
        <div class="results">
          <h2>round complete</h2>
          <div class="score-display">${accuracy}%</div>
          <div class="score-fraction">${matchState.correctAttempts} correct of ${matchState.attempts} attempts</div>
          <div class="stats-row">
            <div class="stat-card"><div class="label">Pairs</div><div class="value" style="color:var(--lavender-deep)">${matchState.pairs.length}</div></div>
            <div class="stat-card"><div class="label">Time</div><div class="value" style="color:var(--pink-deep)">${minutes}:${seconds}</div></div>
            <div class="stat-card"><div class="label">Readiness</div><div class="value" style="color:var(--mint)">${overallReadiness()}%</div></div>
          </div>
          <div style="margin-bottom:20px;color:var(--ink-soft);font-family:var(--font-fun);font-size:20px">${msg}</div>
          <button class="primary" id="match-again">run another ✿</button>
        </div>
      `;
      document.getElementById("match-again").onclick = newMatchRound;
      return;
    }

    body.innerHTML = `
      <div class="match-stats">
        <div><span style="color:var(--ink-mute)">matching</span> <strong style="color:var(--pink-deep)">drug → ${typeDef.label.toLowerCase()}</strong></div>
        <div class="match-progress"><div class="fill" style="width:${(matchState.matched.size / matchState.pairs.length) * 100}%"></div></div>
        <div><span style="color:var(--ink-mute)">${matchState.matched.size}/${matchState.pairs.length}</span> · <span style="color:var(--lavender-deep)">${matchState.attempts} tries</span></div>
      </div>
      <div class="match-board">
        <div class="match-col">
          <div class="match-col-header">💊 drugs</div>
          ${leftOrder.map((p) => {
            const isMatched = matchState.matched.has(p.id);
            const isSelected = matchState.leftSelected === p.id;
            return `
              <button class="match-card left ${isMatched ? "matched" : ""} ${isSelected ? "selected" : ""}" data-id="${p.id}" ${isMatched ? "disabled" : ""}>
                <div class="match-card-title">${p.name}</div>
                <div class="match-card-sub">${p.category}</div>
              </button>
            `;
          }).join("")}
        </div>
        <div class="match-col">
          <div class="match-col-header">✨ ${typeDef.label.toLowerCase()}</div>
          ${rightOrder.map((p) => {
            const isMatched = matchState.matched.has(p.id);
            return `
              <button class="match-card right ${isMatched ? "matched" : ""}" data-id="${p.id}" ${isMatched ? "disabled" : ""}>
                <div class="match-card-value">${p.preview}</div>
              </button>
            `;
          }).join("")}
        </div>
      </div>
    `;

    body.querySelectorAll(".match-card.left").forEach((el) => {
      el.onclick = () => {
        if (matchState.matched.has(el.dataset.id)) return;
        matchState.leftSelected = matchState.leftSelected === el.dataset.id ? null : el.dataset.id;
        renderMatch();
      };
    });
    body.querySelectorAll(".match-card.right").forEach((el) => {
      el.onclick = () => {
        if (matchState.matched.has(el.dataset.id)) return;
        if (!matchState.leftSelected) {
          el.classList.add("shake");
          setTimeout(() => el.classList.remove("shake"), 350);
          return;
        }
        const rightId = el.dataset.id;
        const leftId = matchState.leftSelected;
        matchState.attempts += 1;
        if (rightId === leftId) {
          matchState.matched.add(rightId);
          matchState.correctAttempts += 1;
          matchState.leftSelected = null;
          bumpMastery(rightId, 7);
          const d = state.drugs[rightId]; d.seen += 1; saveState();
          if (matchState.matched.size === matchState.pairs.length) {
            matchState.finished = true;
            state.sessions.match = (state.sessions.match || 0) + 1;
            saveState();
            toast("round complete 👑");
          }
          renderMatch();
        } else {
          el.classList.add("wrong-flash");
          const leftEl = body.querySelector(`.match-card.left[data-id="${leftId}"]`);
          if (leftEl) leftEl.classList.add("wrong-flash");
          bumpMastery(rightId, -2);
          bumpMastery(leftId, -2);
          setTimeout(() => {
            matchState.leftSelected = null;
            renderMatch();
          }, 450);
        }
      };
    });
  }

  // ─────────────────────────── Trivia (Speed Round) ───────────────────────────
  let triviaState = {
    active: false,
    timeLeft: 60,
    duration: 60,
    score: 0,
    streak: 0,
    bestStreak: 0,
    total: 0,
    correct: 0,
    current: null,
    timerId: null,
    answered: false,
  };

  function startTrivia() {
    const view = document.getElementById("view-trivia");
    if (triviaState.active) {
      renderTriviaGame();
      return;
    }
    view.innerHTML = `
      <div class="view-header">
        <div>
          <h2>🎀 Trivia Time</h2>
          <div class="desc">60 seconds, infinite questions, streaks for bonus points 🔥</div>
        </div>
        <div class="actions">
          <select id="trivia-duration">
            <option value="30">30 sec</option>
            <option value="60" selected>60 sec</option>
            <option value="120">2 min</option>
          </select>
        </div>
      </div>
      <div class="trivia-intro">
        <div class="trivia-highscore">
          <div class="hs-label">highscore ✨</div>
          <div class="hs-value">${state.triviaHighScore || 0}</div>
          <div class="hs-sub">best streak: ${state.triviaBestStreak || 0} 🔥</div>
        </div>
        <div class="trivia-rules">
          <h3>how to play 💕</h3>
          <ul>
            <li>each correct answer = <strong>10 points</strong></li>
            <li>3-in-a-row streak = <strong>2× multiplier</strong> 🔥</li>
            <li>5-in-a-row streak = <strong>3× multiplier</strong> 🔥🔥</li>
            <li>wrong answer breaks the streak — but no penalty</li>
            <li>questions pull from every mode — mechanism, receptors, dosing, side effects, pearls</li>
          </ul>
          <button class="primary" id="trivia-start" style="margin-top:14px;font-size:16px;padding:14px 28px">start round ✨</button>
        </div>
      </div>
    `;
    document.getElementById("trivia-start").onclick = () => {
      triviaState.duration = parseInt(document.getElementById("trivia-duration").value, 10);
      beginTrivia();
    };
  }

  function beginTrivia() {
    triviaState.active = true;
    triviaState.timeLeft = triviaState.duration;
    triviaState.score = 0;
    triviaState.streak = 0;
    triviaState.bestStreak = 0;
    triviaState.total = 0;
    triviaState.correct = 0;
    triviaState.answered = false;
    triviaState.current = pickTriviaQuestion();
    triviaState.timerId = setInterval(() => {
      triviaState.timeLeft -= 1;
      if (triviaState.timeLeft <= 0) endTrivia();
      else updateTriviaTimerUI();
    }, 1000);
    renderTriviaGame();
  }

  function pickTriviaQuestion() {
    const med = MEDS[Math.floor(Math.random() * MEDS.length)];
    return buildQuestion(med);
  }

  function streakMultiplier(streak) {
    if (streak >= 5) return 3;
    if (streak >= 3) return 2;
    return 1;
  }

  function updateTriviaTimerUI() {
    const tEl = document.getElementById("trivia-time");
    const fEl = document.getElementById("trivia-time-fill");
    if (tEl) tEl.textContent = triviaState.timeLeft + "s";
    if (fEl) fEl.style.width = (triviaState.timeLeft / triviaState.duration) * 100 + "%";
    if (tEl && triviaState.timeLeft <= 10) tEl.classList.add("urgent");
  }

  function renderTriviaGame() {
    const view = document.getElementById("view-trivia");
    const q = triviaState.current;
    const mult = streakMultiplier(triviaState.streak);
    view.innerHTML = `
      <div class="trivia-hud">
        <div class="trivia-time-box ${triviaState.timeLeft <= 10 ? "urgent" : ""}">
          <div class="trivia-time-label">time</div>
          <div class="trivia-time" id="trivia-time">${triviaState.timeLeft}s</div>
          <div class="trivia-time-bar"><div class="fill" id="trivia-time-fill" style="width:${(triviaState.timeLeft / triviaState.duration) * 100}%"></div></div>
        </div>
        <div class="trivia-score-box">
          <div class="trivia-score-label">score</div>
          <div class="trivia-score">${triviaState.score}</div>
        </div>
        <div class="trivia-streak-box ${triviaState.streak >= 3 ? "fire" : ""}">
          <div class="trivia-streak-label">streak ${mult > 1 ? `<span class="mult">${mult}×</span>` : ""}</div>
          <div class="trivia-streak">${triviaState.streak} ${"🔥".repeat(Math.min(3, Math.floor(triviaState.streak / 3)))}</div>
        </div>
      </div>
      <div class="question-card trivia-card">
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
      </div>
      <div style="text-align:center;margin-top:14px">
        <button class="ghost" id="trivia-end">end early</button>
      </div>
    `;
    view.querySelectorAll(".choice").forEach((btn) => {
      btn.onclick = () => answerTrivia(btn.dataset.choice, q, btn);
    });
    document.getElementById("trivia-end").onclick = endTrivia;
  }

  function answerTrivia(picked, q, btn) {
    if (triviaState.answered || !triviaState.active) return;
    triviaState.answered = true;
    const correct = picked === q.correct;
    triviaState.total += 1;
    recordAnswer(q.drugId, correct);
    if (correct) {
      triviaState.correct += 1;
      triviaState.streak += 1;
      triviaState.bestStreak = Math.max(triviaState.bestStreak, triviaState.streak);
      const pts = 10 * streakMultiplier(triviaState.streak);
      triviaState.score += pts;
      btn.classList.add("correct");
      showFloatingPoints(btn, "+" + pts);
    } else {
      triviaState.streak = 0;
      btn.classList.add("wrong");
      const correctBtn = [...document.querySelectorAll(".choice")].find((b) => b.dataset.choice === q.correct);
      if (correctBtn) correctBtn.classList.add("correct");
    }
    setTimeout(() => {
      if (!triviaState.active) return;
      triviaState.answered = false;
      triviaState.current = pickTriviaQuestion();
      renderTriviaGame();
    }, correct ? 450 : 750);
  }

  function showFloatingPoints(anchor, text) {
    const el = document.createElement("div");
    el.className = "floating-points";
    el.textContent = text;
    const rect = anchor.getBoundingClientRect();
    el.style.left = rect.left + rect.width / 2 + "px";
    el.style.top = rect.top + "px";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }

  function endTrivia() {
    clearInterval(triviaState.timerId);
    triviaState.active = false;
    state.sessions.trivia = (state.sessions.trivia || 0) + 1;
    const newHigh = triviaState.score > (state.triviaHighScore || 0);
    if (newHigh) state.triviaHighScore = triviaState.score;
    if (triviaState.bestStreak > (state.triviaBestStreak || 0)) state.triviaBestStreak = triviaState.bestStreak;
    saveState();
    renderTriviaResults(newHigh);
  }

  function renderTriviaResults(newHigh) {
    const view = document.getElementById("view-trivia");
    const acc = triviaState.total === 0 ? 0 : Math.round((triviaState.correct / triviaState.total) * 100);
    view.innerHTML = `
      <div class="results">
        ${newHigh ? '<div class="new-high">🏆 new high score!</div>' : ""}
        <h2>${newHigh ? "yasss queen 👑" : "round over ✨"}</h2>
        <div class="score-display">${triviaState.score}</div>
        <div class="score-fraction">${triviaState.correct}/${triviaState.total} correct · ${acc}% accuracy</div>
        <div class="stats-row">
          <div class="stat-card"><div class="label">Best Streak</div><div class="value" style="color:var(--pink-deep)">${triviaState.bestStreak} 🔥</div></div>
          <div class="stat-card"><div class="label">Highscore</div><div class="value" style="color:var(--lavender-deep)">${state.triviaHighScore || 0}</div></div>
          <div class="stat-card"><div class="label">Readiness</div><div class="value" style="color:var(--mint)">${overallReadiness()}%</div></div>
        </div>
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
          <button class="primary" id="trivia-replay">play again ✿</button>
          <button class="ghost" id="trivia-home">back to menu</button>
        </div>
      </div>
    `;
    document.getElementById("trivia-replay").onclick = beginTrivia;
    document.getElementById("trivia-home").onclick = startTrivia;
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
    const sessionsTotal = state.sessions.quiz + state.sessions.flashcard + state.sessions.recall + state.sessions.receptor + (state.sessions.match || 0) + (state.sessions.trivia || 0);

    view.innerHTML = `
      <div class="view-header">
        <div>
          <h2>📊 Progress</h2>
          <div class="desc">your readiness, per-drug mastery, all your stats ✨ saved locally</div>
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
          <div class="sub">Quiz: ${state.sessions.quiz} · Flash: ${state.sessions.flashcard} · Match: ${state.sessions.match || 0} · Trivia: ${state.sessions.trivia || 0} · Recall: ${state.sessions.recall} · Receptor: ${state.sessions.receptor}</div>
        </div>
        <div class="stat-tile">
          <div class="label">Suggested Next ✿</div>
          <div class="big" style="font-size:20px;line-height:1.4">${
            weak > 0
              ? "🌸 run a quiz — targets your weak drugs"
              : mastered < total
              ? "💖 review with flashcards"
              : "🧬 try the receptor drill"
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
        toast("fresh start ✨");
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
