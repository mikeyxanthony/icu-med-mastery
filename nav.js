// ============================================================
// Global navigation — injects the site-nav into every page
// and highlights the active link based on URL
// ============================================================
(() => {
  const NAV_HTML = `
    <nav class="site-nav">
      <a href="/" class="site-nav-brand">
        <div class="site-nav-logo">Rx</div>
        <div class="site-nav-brand-text">
          <div class="site-nav-name">ICU Med Mastery</div>
          <div class="site-nav-sub">study cute ✨</div>
        </div>
      </a>
      <div class="site-nav-links">
        <a href="/" class="site-nav-link" data-page="home"><span class="nav-icon">🏠</span><span class="nav-label">Home</span></a>
        <a href="/drugs" class="site-nav-link" data-page="drugs"><span class="nav-icon">💊</span><span class="nav-label">Drugs</span></a>
        <a href="/pathology" class="site-nav-link" data-page="pathology"><span class="nav-icon">🫀</span><span class="nav-label">Pathology</span></a>
        <a href="/ekg" class="site-nav-link" data-page="ekg"><span class="nav-icon">🩺</span><span class="nav-label">EKG</span></a>
        <a href="/aline" class="site-nav-link" data-page="aline"><span class="nav-icon">🩸</span><span class="nav-label">A-Line</span></a>
        <a href="/ecmo" class="site-nav-link" data-page="ecmo"><span class="nav-icon">🫁</span><span class="nav-label">ECMO</span></a>
      </div>
      <div class="nav-actions">
        <a class="love-btn nav-love-btn" href="sms:+13057207147?&body=i%20love%20you" title="opens your messages app — just press send 💌">
          <span class="love-heart">💌</span>
          <span class="love-text">love mikey</span>
        </a>
        <a class="boost-btn nav-boost-btn" href="sms:+13057207147?&body=i%20need%20a%20lil%20boost%2C%20do%20that%20thing%20u%20do%20and%20make%20me%20feel%20better%20pls" title="mikey will do the thing 🌟">
          <span class="boost-icon">🌟</span>
          <span class="boost-text">click for motivation</span>
        </a>
      </div>
    </nav>
  `;

  function inject() {
    // Insert nav as first child of body
    const wrapper = document.createElement("div");
    wrapper.innerHTML = NAV_HTML.trim();
    document.body.insertBefore(wrapper.firstChild, document.body.firstChild);

    // Mark active page
    const path = window.location.pathname.replace(/\/$/, "") || "/";
    let activePage = "home";
    if (path === "/drugs" || path === "/drugs.html") activePage = "drugs";
    else if (path === "/pathology" || path === "/pathology.html") activePage = "pathology";
    else if (path === "/ekg" || path === "/ekg.html") activePage = "ekg";
    else if (path === "/aline" || path === "/aline.html") activePage = "aline";
    else if (path === "/ecmo" || path === "/ecmo.html") activePage = "ecmo";

    document.querySelectorAll(".site-nav-link").forEach((a) => {
      if (a.dataset.page === activePage) a.classList.add("active");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
})();
