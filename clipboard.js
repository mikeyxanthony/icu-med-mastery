// ============================================================
// Clipboard utility — copy text + diagrams to Notability/notes
// ============================================================
(() => {
  function getSvgSize(svg) {
    const vb = svg.getAttribute("viewBox");
    if (vb) {
      const parts = vb.split(/\s+/).map(Number);
      return { w: parts[2], h: parts[3] };
    }
    const w = parseFloat(svg.getAttribute("width")) || svg.clientWidth || 800;
    const h = parseFloat(svg.getAttribute("height")) || svg.clientHeight || 600;
    return { w, h };
  }

  async function svgToPngBlob(svg, scale = 2.5) {
    const clone = svg.cloneNode(true);
    const { w, h } = getSvgSize(svg);
    clone.setAttribute("width", w);
    clone.setAttribute("height", h);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const xml = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });
      const canvas = document.createElement("canvas");
      canvas.width = w * scale;
      canvas.height = h * scale;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      return await new Promise((resolve) => canvas.toBlob(resolve, "image/png", 0.95));
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function clipToast(msg, type = "success") {
    let t = document.getElementById("clip-toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "clip-toast";
      t.className = "toast";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.display = "block";
    t.style.background = type === "error"
      ? "linear-gradient(135deg, #fb7185, #f43f5e)"
      : "linear-gradient(135deg, var(--pink), var(--lavender))";
    clearTimeout(t._timer);
    t._timer = setTimeout(() => (t.style.display = "none"), 2600);
  }

  async function copyForNotes(text, svgEl) {
    const items = {};
    if (text) items["text/plain"] = new Blob([text], { type: "text/plain" });
    if (svgEl) {
      try {
        items["image/png"] = await svgToPngBlob(svgEl);
      } catch (e) {
        // image conversion failed — fall back to text-only below
      }
    }
    try {
      if (typeof ClipboardItem !== "undefined" && Object.keys(items).length > 0) {
        await navigator.clipboard.write([new ClipboardItem(items)]);
        clipToast(svgEl ? "copied text + image — paste into notability 📋✨" : "copied to clipboard 📋");
        return true;
      }
      throw new Error("ClipboardItem not supported");
    } catch (e) {
      try {
        await navigator.clipboard.writeText(text || "");
        clipToast("text copied — image not supported on this browser 💕");
        return true;
      } catch (e2) {
        clipToast("couldn't copy — try save as png instead", "error");
        return false;
      }
    }
  }

  async function downloadAsPng(svgEl, filename = "image.png") {
    try {
      const blob = await svgToPngBlob(svgEl, 3);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        URL.revokeObjectURL(url);
        a.remove();
      }, 500);
      clipToast("downloaded ✨ open in notability");
    } catch (e) {
      clipToast("couldn't save image", "error");
    }
  }

  async function copyTextOnly(text) {
    try {
      await navigator.clipboard.writeText(text);
      clipToast("copied to clipboard 📋");
      return true;
    } catch (e) {
      clipToast("couldn't copy", "error");
      return false;
    }
  }

  // Render a standard "send to notes" button cluster
  function attachExportButtons(container, opts = {}) {
    const { getText, getSvg, baseFilename = "study-note" } = opts;
    const wrap = document.createElement("div");
    wrap.className = "export-buttons";
    wrap.innerHTML = `
      <button class="export-btn" data-action="copy">📋 send to notes</button>
      ${getSvg ? '<button class="export-btn ghost" data-action="png">💾 save png</button>' : ""}
    `;
    wrap.querySelector('[data-action="copy"]').onclick = () => {
      copyForNotes(getText ? getText() : "", getSvg ? getSvg() : null);
    };
    const pngBtn = wrap.querySelector('[data-action="png"]');
    if (pngBtn) {
      pngBtn.onclick = () => downloadAsPng(getSvg(), `${baseFilename}.png`);
    }
    container.appendChild(wrap);
    return wrap;
  }

  window.NotesExport = { copyForNotes, downloadAsPng, copyTextOnly, attachExportButtons, svgToPngBlob };

  // ─── AI Tutor — deeplink to ChatGPT / Gemini with pre-filled prompt ───
  const MAX_URL_LEN = 1900;

  function formatContent(content) {
    if (content == null) return "";
    if (typeof content === "string") return content;
    if (Array.isArray(content)) return content.map((c) => `• ${c}`).join("\n");
    return String(content);
  }

  function promptTemplate(topic, section, content) {
    return `I'm a critical care nurse studying ${topic} and want to go deeper on this specific part — "${section}". Here's what I have so far:

${content}

Please break this down in a way that goes beyond the textbook version. Use bedside examples I'd actually see in the ICU, draw connections to physiology I should already know, and use analogies where they help. After your explanation I'll have follow-up questions if anything is still fuzzy.`;
  }

  function buildAIPrompt(topic, section, rawContent) {
    const formatted = formatContent(rawContent);
    let prompt = promptTemplate(topic, section, formatted);
    const testUrl = `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
    if (testUrl.length > MAX_URL_LEN) {
      const overhead = encodeURIComponent(promptTemplate(topic, section, "")).length + 80;
      const availableEncoded = MAX_URL_LEN - "https://chatgpt.com/?q=".length - overhead;
      const maxRaw = Math.max(200, Math.floor(availableEncoded / 2.2));
      const truncated = formatted.length > maxRaw
        ? formatted.slice(0, maxRaw).replace(/\s+\S*$/, "") + "..."
        : formatted;
      prompt = promptTemplate(topic, section, truncated);
    }
    return prompt;
  }

  function openInAI(service, prompt) {
    const encoded = encodeURIComponent(prompt);
    const url = service === "gemini"
      ? `https://gemini.google.com/app?q=${encoded}`
      : `https://chatgpt.com/?q=${encoded}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function attachAIButtons(container, opts = {}) {
    const { topic, section, getContent } = opts;
    if (!container) return null;
    const wrap = document.createElement("div");
    wrap.className = "ai-buttons";
    wrap.innerHTML = `
      <button class="ai-btn chatgpt" data-svc="chatgpt" title="open ChatGPT with this section pre-loaded">
        <span class="ai-icon">💬</span><span>ask ChatGPT</span>
      </button>
      <button class="ai-btn gemini" data-svc="gemini" title="open Gemini with this section pre-loaded">
        <span class="ai-icon">✨</span><span>ask Gemini</span>
      </button>
    `;
    wrap.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const content = typeof getContent === "function" ? getContent() : (getContent || "");
        const prompt = buildAIPrompt(topic, section, content);
        openInAI(btn.dataset.svc, prompt);
      });
    });
    container.appendChild(wrap);
    return wrap;
  }

  window.AITutor = { buildAIPrompt, openInAI, attachAIButtons };
})();
