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
})();
