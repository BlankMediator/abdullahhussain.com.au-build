const state = {
  docs: [],
  filteredDocs: [],
  currentPath: "README.md"
};

const $ = (id) => document.getElementById(id);

window.addEventListener("hashchange", handleHashChange);
window.addEventListener("resize", drawPipeline);
$("docSearch").addEventListener("input", applyDocFilter);
$("docSelect").addEventListener("change", () => selectDoc($("docSelect").value));
$("docContent").addEventListener("click", handleDocClick);

init();

async function init() {
  drawPipeline();
  const response = await fetch("docs-manifest.json", { cache: "no-cache" });
  const payload = await response.json();
  state.docs = payload.docs || [];
  state.filteredDocs = state.docs;
  fillDocSelect();
  renderDocList();
  handleHashChange();
}

function handleHashChange() {
  const path = pathFromHash();
  selectDoc(path || state.currentPath || "README.md", { updateHash: false });
}

function pathFromHash() {
  const match = window.location.hash.match(/doc=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

async function selectDoc(path, options = {}) {
  const doc = state.docs.find((item) => item.path === path) || state.docs[0];
  if (!doc) return;
  state.currentPath = doc.path;
  if (options.updateHash !== false) {
    window.location.hash = `doc=${encodeURIComponent(doc.path)}`;
  }
  $("docSelect").value = doc.path;
  $("rawDocLink").href = doc.path;
  $("docMeta").textContent = `${doc.path} - ${formatBytes(doc.bytes || 0)}`;
  renderDocList();

  const response = await fetch(doc.path, { cache: "no-cache" });
  const markdown = await response.text();
  $("docContent").innerHTML = renderMarkdown(markdown, doc.path);
  if (window.MathJax && window.MathJax.typesetPromise) {
    window.MathJax.typesetPromise([$("docContent")]);
  }
}

function fillDocSelect() {
  $("docSelect").innerHTML = state.docs.map((doc) => {
    return `<option value="${escapeHtml(doc.path)}">${escapeHtml(doc.title)}</option>`;
  }).join("");
}

function applyDocFilter() {
  const query = $("docSearch").value.trim().toLowerCase();
  state.filteredDocs = state.docs.filter((doc) => {
    const haystack = `${doc.title} ${doc.path} ${doc.summary || ""}`.toLowerCase();
    return haystack.includes(query);
  });
  renderDocList();
}

function renderDocList() {
  $("docList").innerHTML = state.filteredDocs.map((doc) => {
    const active = doc.path === state.currentPath ? " active" : "";
    return `<button class="doc-button${active}" type="button" data-path="${escapeHtml(doc.path)}">
      <strong>${escapeHtml(doc.title)}</strong>
      <small>${escapeHtml(doc.path)}</small>
    </button>`;
  }).join("");
  document.querySelectorAll(".doc-button").forEach((button) => {
    button.addEventListener("click", () => selectDoc(button.dataset.path));
  });
}

function handleDocClick(event) {
  const link = event.target.closest("a[data-doc-path]");
  if (!link) return;
  event.preventDefault();
  selectDoc(link.dataset.docPath);
}

function renderMarkdown(markdown, currentPath) {
  const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
  const html = [];
  const listStack = [];
  let paragraph = [];
  let table = [];
  let inCode = false;
  let codeLines = [];
  let codeLang = "";

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${renderInline(paragraph.join(" "), currentPath)}</p>`);
    paragraph = [];
  };
  const flushTable = () => {
    if (!table.length) return;
    const rows = table.filter((line) => !/^\|\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line));
    html.push(`<div class="doc-table-wrap"><table>${rows.map((line, index) => {
      const cells = line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|");
      return `<tr>${cells.map((cell) => {
        const tag = index === 0 ? "th" : "td";
        return `<${tag}>${renderInline(cell.trim(), currentPath)}</${tag}>`;
      }).join("")}</tr>`;
    }).join("")}</table></div>`);
    table = [];
  };
  const closeLists = (depth = 0) => {
    while (listStack.length > depth) {
      html.push(`</${listStack.pop()}>`);
    }
  };

  for (const line of lines) {
    const fence = line.match(/^```(.*)$/);
    if (fence) {
      if (inCode) {
        html.push(`<pre><code class="language-${escapeHtml(codeLang)}">${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        inCode = false;
        codeLines = [];
        codeLang = "";
      } else {
        flushParagraph();
        flushTable();
        closeLists();
        inCode = true;
        codeLang = fence[1].trim();
      }
      continue;
    }
    if (inCode) {
      codeLines.push(line);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushTable();
      closeLists();
      continue;
    }

    if (line.includes("|") && /^\s*\|?.+\|.+/.test(line)) {
      flushParagraph();
      closeLists();
      table.push(line);
      continue;
    }
    flushTable();

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      closeLists();
      const level = heading[1].length;
      const text = heading[2].replace(/\s+#*$/, "");
      html.push(`<h${level} id="${slugify(text)}">${renderInline(text, currentPath)}</h${level}>`);
      continue;
    }

    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      flushParagraph();
      closeLists();
      html.push(`<blockquote>${renderInline(quote[1], currentPath)}</blockquote>`);
      continue;
    }

    const list = line.match(/^(\s*)([-*]|\d+\.)\s+(.+)$/);
    if (list) {
      flushParagraph();
      const depth = Math.floor(list[1].length / 2) + 1;
      const type = /\d+\./.test(list[2]) ? "ol" : "ul";
      while (listStack.length > depth) closeLists(depth);
      while (listStack.length < depth) {
        listStack.push(type);
        html.push(`<${type}>`);
      }
      if (listStack[listStack.length - 1] !== type) {
        closeLists(depth - 1);
        listStack.push(type);
        html.push(`<${type}>`);
      }
      html.push(`<li>${renderInline(list[3], currentPath)}</li>`);
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  flushTable();
  closeLists();
  return html.join("\n");
}

function renderInline(text, currentPath) {
  let value = escapeHtml(text);
  value = value.replace(/`([^`]+)`/g, "<code>$1</code>");
  value = value.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  value = value.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  value = value.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, rawHref) => {
    const href = rawHref.trim();
    const normalized = normalizeDocPath(href, currentPath);
    if (normalized) {
      return `<a href="#doc=${encodeURIComponent(normalized)}" data-doc-path="${escapeHtml(normalized)}">${label}</a>`;
    }
    const external = /^https?:\/\//.test(href);
    const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : "";
    return `<a href="${escapeHtml(href)}"${attrs}>${label}</a>`;
  });
  return value;
}

function normalizeDocPath(href, currentPath) {
  const [pathPart] = href.split("#");
  const clean = pathPart.replace(/^\.?\//, "");
  if (!clean.endsWith(".md")) return "";
  if (clean === "README.md") return clean;
  if (clean.startsWith("docs/")) return clean;
  if (currentPath.startsWith("docs/")) return `docs/${clean}`;
  return clean;
}

function drawPipeline() {
  const canvas = $("pipelineCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#f5faf7";
  ctx.fillRect(0, 0, width, height);

  const colors = ["#0b7a53", "#1f5f99", "#b7791f", "#a83f39"];
  for (let i = 0; i < 46; i += 1) {
    const x = 28 + i * 15;
    const base = 270 - Math.sin(i / 4) * 32;
    const high = base - 56 - Math.sin(i / 2.7) * 28;
    const low = base + 34 + Math.cos(i / 2.3) * 20;
    ctx.strokeStyle = colors[i % colors.length];
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, high);
    ctx.lineTo(x, low);
    ctx.stroke();
    ctx.fillStyle = colors[(i + 1) % colors.length];
    ctx.fillRect(x - 5, Math.min(base, high + 28), 10, Math.max(18, Math.abs(base - high)));
  }

  ctx.strokeStyle = "#17211d";
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let i = 0; i < 160; i += 1) {
    const x = 28 + i * 4.1;
    const y = 310 - i * 0.86 + Math.sin(i / 8) * 20 + Math.cos(i / 19) * 12;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.fillStyle = "#17211d";
  ctx.font = "700 24px system-ui, sans-serif";
  ctx.fillText("Point-in-time factor pipeline", 32, 48);
  ctx.font = "14px system-ui, sans-serif";
  ctx.fillStyle = "#5e6a66";
  ctx.fillText("CSV data, Yahoo Finance inputs, QP construction, and auditable run logs", 32, 76);
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function slugify(text) {
  return String(text).toLowerCase().replace(/<[^>]+>/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[char]);
}
