const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const DATA_BASE = new URL("data/", document.currentScript.src);

const formatNumber = (value, digits = 2) => {
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString(undefined, { maximumFractionDigits: digits }) : "n/a";
};

const formatPercent = (value, digits = 2) => `${formatNumber(Number(value) * 100, digits)}%`;

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;",
  "'": "&#39;",
})[char]);

const downloadText = (name, content, type = "text/plain;charset=utf-8") => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

async function loadJson(name) {
  const response = await fetch(new URL(name, DATA_BASE), { cache: "no-cache" });
  if (!response.ok) throw new Error(`Could not load ${name}`);
  return response.json();
}

function setStatus(selector, message, kind = "") {
  const node = $(selector);
  if (!node) return;
  node.textContent = message;
  node.dataset.kind = kind;
}

function drawLineChart(canvas, rows, series) {
  if (!canvas || !rows.length) return;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const pad = 48;
  const values = rows.flatMap((row) => series.map((item) => Number(row[item.key]))).filter(Number.isFinite);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || 1;
  const x = (index) => pad + (index / Math.max(1, rows.length - 1)) * (width - pad * 1.7);
  const y = (value) => height - pad - ((Number(value) - min) / spread) * (height - pad * 1.8);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#f8faf9";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#d8dfdd";
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i += 1) {
    const yy = pad + i * ((height - pad * 1.7) / 4);
    ctx.beginPath();
    ctx.moveTo(pad, yy);
    ctx.lineTo(width - pad, yy);
    ctx.stroke();
  }
  series.forEach((item) => {
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    rows.forEach((row, index) => {
      if (index === 0) ctx.moveTo(x(index), y(row[item.key]));
      else ctx.lineTo(x(index), y(row[item.key]));
    });
    ctx.stroke();
  });
  ctx.fillStyle = "#111418";
  ctx.font = "700 16px system-ui";
  ctx.fillText(rows[0].date, pad, height - 16);
  ctx.fillText(rows[rows.length - 1].date, width - 138, height - 16);
}

function renderTable(selector, headers, rows) {
  const node = $(selector);
  if (!node) return;
  node.innerHTML = `
    <thead><tr>${headers.map((header) => `<th>${escapeHtml(header.label)}</th>`).join("")}</tr></thead>
    <tbody>
      ${rows.map((row) => `
        <tr>${headers.map((header) => `<td>${header.render ? header.render(row) : escapeHtml(row[header.key])}</td>`).join("")}</tr>
      `).join("")}
    </tbody>
  `;
}

async function initQuantBot() {
  try {
    const data = await loadJson("quantbot-report.json");
    const summary = data.summary;
    const metrics = [
      ["Total return", formatPercent(summary.total_return)],
      ["Annualized return", formatPercent(summary.annualized_return)],
      ["Benchmark return", formatPercent(summary.benchmark_total_return)],
      ["Information ratio", formatNumber(summary.information_ratio, 2)],
      ["Rebalances", formatNumber(summary.rebalance_count, 0)],
      ["Avg active exposure", formatPercent(summary.average_active_gross_exposure, 2)],
    ];
    $("#quant-metrics").innerHTML = metrics.map(([label, value]) => `
      <div><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>
    `).join("");

    drawLineChart($("#equity-canvas"), data.equity, [
      { key: "equity", color: "#0f766e" },
      { key: "benchmark", color: "#d14f3f" },
    ]);

    renderTable("#factor-table", [
      { label: "Factor", render: (row) => escapeHtml(row.factor.replaceAll("_", " ")) },
      { label: "Weight", render: (row) => formatPercent(row.weight, 1) },
      { label: "Rolling IC", render: (row) => formatNumber(row.rollingIc, 4) },
      { label: "Spread return", render: (row) => formatPercent(row.spreadReturn, 2) },
      { label: "Hit rate", render: (row) => formatPercent(row.hitRate, 1) },
    ], data.factors);

    renderTable("#signal-table", [
      { label: "Ticker", key: "ticker" },
      { label: "Sector", key: "sector" },
      { label: "Momentum", render: (row) => formatNumber(row.momentum, 3) },
      { label: "Reversal", render: (row) => formatNumber(row.reversal, 3) },
      { label: "Low vol", render: (row) => formatNumber(row.lowVol, 3) },
      { label: "Next return", render: (row) => formatPercent(row.nextReturn, 2) },
    ], data.latestSignals);

    renderTable("#trace-table", [
      { label: "Block", key: "block" },
      { label: "Variable", key: "variable" },
      { label: "Rows", render: (row) => formatNumber(row.rows, 0) },
      { label: "Nulls", render: (row) => formatNumber(row.nulls, 0) },
      { label: "Mean", render: (row) => formatNumber(row.mean, 4) },
      { label: "Std", render: (row) => formatNumber(row.std, 4) },
    ], data.trace);

    $("#quant-workflow").innerHTML = data.workflow.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    $("#quant-docs").innerHTML = data.docs.map((doc) => `<li>${escapeHtml(doc.title)} <span>${escapeHtml(doc.path)}</span></li>`).join("");
    $("#quant-artifact").textContent = `${data.artifact} - latest signal date ${data.latestSignalsDate}`;
    $("#quant-download").addEventListener("click", () => {
      downloadText("quantbot-static-report.json", JSON.stringify(data, null, 2), "application/json;charset=utf-8");
    });
    setStatus("#quant-status", `Loaded ${data.equity.length} equity rows, ${data.factors.length} factors, ${data.latestSignals.length} latest signal rows.`);
  } catch (error) {
    setStatus("#quant-status", error.message, "error");
  }
}

function parseTranscriptRows(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^((?:\d+:)?\d{1,2}:\d{2})\s+(.+)$/);
      return match ? { timestamp: match[1], text: match[2] } : { timestamp: "", text: line };
    });
}

async function initTranscript() {
  const input = $("#transcript-input");
  const output = $("#transcript-output");
  const includeTime = $("#include-time");
  let rows = [];
  let assets = null;

  const parse = () => {
    rows = parseTranscriptRows(input.value);
    output.value = rows.map((row) => includeTime.checked && row.timestamp ? `${row.timestamp} ${row.text}` : row.text).join("\n");
    setStatus("#transcript-status", `${rows.length} rows parsed locally`);
    return rows;
  };

  try {
    assets = await loadJson("youtube-transcript-assets.json");
    $("#transcript-assets").innerHTML = `
      <div><strong>${escapeHtml(assets.extensionName)}</strong><span>Extension name</span></div>
      <div><strong>${escapeHtml(assets.version)}</strong><span>Version</span></div>
      <div><strong>${formatNumber(assets.contentJsBytes, 0)} B</strong><span>Content script</span></div>
      <div><strong>${assets.browserFiles.length}</strong><span>Browser files</span></div>
    `;
    $("#transcript-features").innerHTML = assets.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("");
    $("#snippet-code").textContent = assets.snippet;
    $("#bookmarklet-link").href = `javascript:${encodeURIComponent(assets.snippet)}`;
  } catch (error) {
    setStatus("#transcript-status", error.message, "error");
  }

  const sample = `0:00 Welcome to the demo\n0:04 This page formats transcript rows in the browser\n0:08 You can copy, download TXT, or download JSON`;
  $("#load-sample").addEventListener("click", () => {
    input.value = sample;
    parse();
  });
  $("#parse-transcript").addEventListener("click", parse);
  includeTime.addEventListener("change", parse);
  $("#copy-transcript").addEventListener("click", async () => {
    await navigator.clipboard.writeText(output.value);
    setStatus("#transcript-status", "Copied to clipboard");
  });
  $("#copy-snippet").addEventListener("click", async () => {
    await navigator.clipboard.writeText(assets?.snippet || "");
    setStatus("#transcript-status", "Copied source snippet");
  });
  $("#download-transcript-txt").addEventListener("click", () => downloadText("transcript.txt", output.value));
  $("#download-transcript-json").addEventListener("click", () => {
    downloadText("transcript.json", JSON.stringify(parse(), null, 2), "application/json;charset=utf-8");
  });
  input.value = sample;
  parse();
}

function visibilityModels(values) {
  return {
    Ilyas: values.moonAlt > 10 && values.elongation > 11 ? "Visible" : values.moonAlt > 5 && values.elongation > 8 ? "Marginal" : "Not visible",
    Yallop: values.arcV > 14.8 && values.diffAlt > 4.1 ? "A: easily visible" : values.arcV > 12.1 ? "B: visible under perfect conditions" : values.arcV > 10.5 ? "C: may need optical aid" : values.arcV > 9.5 ? "D: will need optical aid" : values.arcV > 8.4 ? "E: visible with telescope" : values.arcV > 7 ? "F: photographic only" : "G: not visible",
    Odeh: values.elongation < 8 || values.moonAge < 15 ? "Not visible" : values.elongation > 10 && values.moonAge > 20 ? "Easily visible" : "Possibly visible",
    Shaukat: values.moonAlt > 10 && values.elongation > 12 && values.moonAge > 20 ? "Visible" : values.moonAlt > 6 && values.elongation > 9 && values.moonAge > 16 ? "Marginal" : "Not visible",
    SAAO: values.moonAge > 20 && values.lag > 40 ? "Visible" : values.moonAge > 15 && values.lag > 30 ? "Marginal" : "Not visible",
  };
}

function estimateCrescent(date, lat, lon) {
  const known = Date.UTC(2000, 0, 6, 18, 14);
  const age = (((date.getTime() - known) / 86400000) % 29.53058867 + 29.53058867) % 29.53058867;
  const phase = (age / 29.53058867) * 360;
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60;
  const localHour = (hour + lon / 15 + 24) % 24;
  const sunsetProximity = Math.max(0, 1 - Math.abs(localHour - 18.25) / 6);
  const seasonal = Math.cos((date.getUTCMonth() + 1 - 3) / 12 * Math.PI * 2) * 4;
  const moonAlt = -8 + sunsetProximity * 24 + Math.sin((phase - 50) * Math.PI / 180) * 9 - Math.abs(lat) / 28 + seasonal;
  const sunAlt = -6 + sunsetProximity * 8 - Math.abs(localHour - 18.25) * 2;
  const elongation = Math.max(0, Math.min(180, phase));
  const illumination = (1 - Math.cos(phase * Math.PI / 180)) / 2;
  const lag = Math.max(0, (moonAlt - sunAlt) * 4 + age * 1.2);
  return { moonAge: age, moonAlt, sunAlt, elongation, illumination, crescentWidth: illumination * 180, arcV: elongation, diffAlt: moonAlt - sunAlt, lag };
}

async function initCrescent() {
  const form = $("#crescent-form");
  let metadata = null;

  const setManualInputs = (values) => {
    $("#moon-altitude").value = formatNumber(values.moonAlt, 2);
    $("#sun-altitude").value = formatNumber(values.sunAlt, 2);
    $("#elongation").value = formatNumber(values.elongation, 2);
    $("#moon-age").value = formatNumber(values.moonAge, 2);
    $("#lag-time").value = formatNumber(values.lag, 2);
  };

  const readManualInputs = () => {
    const moonAlt = Number($("#moon-altitude").value);
    const sunAlt = Number($("#sun-altitude").value);
    const elongation = Number($("#elongation").value);
    const moonAge = Number($("#moon-age").value);
    const lag = Number($("#lag-time").value);
    return { moonAlt, sunAlt, elongation, moonAge, lag, arcV: elongation, diffAlt: moonAlt - sunAlt, illumination: Math.max(0, Math.min(1, (1 - Math.cos((moonAge / 29.53058867) * Math.PI * 2)) / 2)) };
  };

  const render = () => {
    const values = readManualInputs();
    const labels = visibilityModels(values);
    $("#crescent-result").innerHTML = `
      <div class="result-metrics">
        <div><strong>${formatNumber(values.moonAge, 1)} d</strong><span>Moon age</span></div>
        <div><strong>${formatNumber(values.moonAlt, 1)} deg</strong><span>Moon altitude</span></div>
        <div><strong>${formatNumber(values.elongation, 1)} deg</strong><span>Elongation</span></div>
        <div><strong>${formatPercent(values.illumination, 2)}</strong><span>Estimated illumination</span></div>
      </div>
      <div class="model-results">
        ${Object.entries(labels).map(([name, label]) => `<div><strong>${escapeHtml(name)}</strong><span>${escapeHtml(label)}</span></div>`).join("")}
      </div>
    `;
  };

  const estimateAndRender = () => {
    const data = Object.fromEntries(new FormData(form).entries());
    const date = new Date(`${data.date}T${data.time || "08:00"}:00Z`);
    setManualInputs(estimateCrescent(date, Number(data.lat), Number(data.lon)));
    render();
  };

  try {
    metadata = await loadJson("crescent-models.json");
    $("#model-thresholds").innerHTML = metadata.models.map((model) => `
      <article class="mini-card">
        <p class="repo-meta">${escapeHtml(model.inputs.join(", "))}</p>
        <h3>${escapeHtml(model.name)}</h3>
        <ul>${model.thresholds.map((threshold) => `<li>${escapeHtml(threshold)}</li>`).join("")}</ul>
      </article>
    `).join("");
    $("#scenario-buttons").innerHTML = metadata.scenarios.map((scenario) => `
      <button class="button" type="button" data-scenario="${escapeHtml(scenario.name)}">${escapeHtml(scenario.name)}</button>
    `).join("");
    $$("#scenario-buttons [data-scenario]").forEach((button) => {
      button.addEventListener("click", () => {
        const scenario = metadata.scenarios.find((item) => item.name === button.dataset.scenario);
        if (!scenario) return;
        form.elements.lat.value = scenario.lat;
        form.elements.lon.value = scenario.lon;
        form.elements.date.value = scenario.date;
        form.elements.time.value = scenario.time;
        estimateAndRender();
      });
    });
  } catch (error) {
    setStatus("#crescent-status", error.message, "error");
  }

  form.addEventListener("input", estimateAndRender);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    estimateAndRender();
  });
  $$(".manual-model-input").forEach((input) => input.addEventListener("input", render));
  estimateAndRender();
}

async function initAssabile() {
  let data = null;
  let pageSize = 60;

  const render = () => {
    if (!data) return;
    const query = $("#assabile-search").value.trim().toLowerCase();
    const kind = $("#assabile-kind").value;
    const country = $("#assabile-country").value;
    const sort = $("#assabile-sort").value;
    const filtered = data.people.filter((person) => {
      const text = `${person.name} ${person.country} ${person.roles.join(" ")} ${person.bio}`.toLowerCase();
      const kindOk = kind === "all" || person[kind] > 0 || person.roles.includes(kind);
      const countryOk = country === "all" || person.country === country;
      return (!query || text.includes(query)) && kindOk && countryOk;
    }).sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "country") return a.country.localeCompare(b.country) || a.name.localeCompare(b.name);
      return b.totalMedia - a.totalMedia || a.name.localeCompare(b.name);
    });
    const visible = filtered.slice(0, pageSize);
    $("#assabile-results").innerHTML = visible.map((person) => `
      <article class="mini-card person-card">
        <div>
          <p class="repo-meta">${escapeHtml(person.country)}</p>
          <h3>${escapeHtml(person.name)}</h3>
          <p>${escapeHtml(person.roles.join(", ") || "catalogue profile")}</p>
        </div>
        <dl class="compact-stats">
          <div><dt>Recitations</dt><dd>${formatNumber(person.recitations, 0)}</dd></div>
          <div><dt>Lessons</dt><dd>${formatNumber(person.audioLessons + person.videoLessons, 0)}</dd></div>
          <div><dt>Other media</dt><dd>${formatNumber(person.albums + person.photos + person.videos, 0)}</dd></div>
        </dl>
        <a class="text-link" href="${escapeHtml(person.profileUrl)}" target="_blank" rel="noopener noreferrer">Open source profile</a>
      </article>
    `).join("") || `<p class="empty-note">No catalogue rows match those filters.</p>`;
    $("#assabile-count").textContent = `${formatNumber(filtered.length, 0)} matching profiles; showing ${formatNumber(visible.length, 0)}.`;
    $("#assabile-more").disabled = filtered.length <= pageSize;
  };

  try {
    data = await loadJson("assabile-catalog.json");
    $("#assabile-metrics").innerHTML = `
      <div><strong>${formatNumber(data.peopleCount, 0)}</strong><span>Profiles</span></div>
      <div><strong>${formatNumber(data.totals.recitations, 0)}</strong><span>Recitations</span></div>
      <div><strong>${formatNumber(data.totals.audioLessons + data.totals.videoLessons, 0)}</strong><span>Lessons</span></div>
      <div><strong>${formatNumber(data.totals.photos + data.totals.videos, 0)}</strong><span>Visual media</span></div>
    `;
    $("#country-bars").innerHTML = data.topCountries.slice(0, 10).map(([country, count]) => `
      <div class="bar-row"><span>${escapeHtml(country)}</span><strong style="width:${Math.max(8, (count / data.topCountries[0][1]) * 100)}%">${formatNumber(count, 0)}</strong></div>
    `).join("");
    const countries = ["all", ...data.topCountries.map(([country]) => country)].sort((a, b) => a.localeCompare(b));
    $("#assabile-country").innerHTML = countries.map((country) => `<option value="${escapeHtml(country)}">${country === "all" ? "All countries" : escapeHtml(country)}</option>`).join("");
    $("#assabile-search").value = "";
    $("#assabile-kind").value = "all";
    $("#assabile-country").value = "all";
    $("#assabile-sort").value = "media";
    $("#assabile-generated").textContent = `Source sync: ${data.generatedAt || "unknown"} from ${data.source || "catalogue source"}`;
    ["#assabile-search", "#assabile-kind", "#assabile-country", "#assabile-sort"].forEach((selector) => $(selector).addEventListener("input", render));
    $("#assabile-more").addEventListener("click", () => {
      pageSize += 60;
      render();
    });
    render();
  } catch (error) {
    setStatus("#assabile-count", error.message, "error");
  }
}

function initStaticRepoPage() {
  const copy = $("#copy-action-yaml");
  if (!copy) return;
  copy.addEventListener("click", async () => {
    await navigator.clipboard.writeText($("#action-yaml").textContent.trim());
    copy.textContent = "Copied";
    setTimeout(() => { copy.textContent = "Copy workflow"; }, 1200);
  });
}

const initializers = {
  quantbot: initQuantBot,
  transcript: initTranscript,
  crescent: initCrescent,
  assabile: initAssabile,
  staticRepo: initStaticRepoPage,
};

const appName = document.body.dataset.projectApp;
if (appName && initializers[appName]) {
  initializers[appName]();
}
