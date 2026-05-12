// ============================================================
// Homepage — quick stats banner pulled from localStorage
// ============================================================
(() => {
  function init() {
    try {
      const raw = localStorage.getItem("icu_med_mastery_v1");
      if (!raw) return;
      const state = JSON.parse(raw);
      const drugs = state.drugs || {};
      const values = Object.values(drugs).map((d) => d.mastery || 0);
      if (values.length === 0) return;
      const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
      const mastered = values.filter((v) => v >= 80).length;
      const totalSessions =
        (state.sessions?.quiz || 0) +
        (state.sessions?.flashcard || 0) +
        (state.sessions?.recall || 0) +
        (state.sessions?.receptor || 0) +
        (state.sessions?.match || 0) +
        (state.sessions?.trivia || 0);

      if (avg <= 0 && totalSessions === 0) return;

      const banner = document.getElementById("readiness-banner");
      if (!banner) return;
      const message =
        avg >= 85 ? "receptors locked in 👑"
        : avg >= 65 ? "you're cooking 💖"
        : avg >= 35 ? "real progress 🌸"
        : "great start — keep going ✨";

      banner.style.display = "flex";
      banner.innerHTML = `
        <div class="rb-stat">
          <div class="rb-label">your readiness</div>
          <div class="rb-score">${avg}%</div>
        </div>
        <div class="rb-message">
          <div style="font-family:var(--font-fun);font-size:22px;color:var(--pink-deep);font-weight:700">${message}</div>
          <div style="color:var(--ink-soft);font-size:13px;margin-top:2px">${mastered} of ${values.length} drugs mastered · ${totalSessions} sessions logged</div>
        </div>
        <a href="/drugs">resume →</a>
      `;
    } catch (e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
