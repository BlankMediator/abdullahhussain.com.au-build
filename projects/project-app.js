const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const formatNumber = (value, digits = 2) => {
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString(undefined, { maximumFractionDigits: digits }) : "n/a";
};

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

function initQuantBot() {
  const summary = {
    total_return: 0.1674867419,
    annualized_return: 0.3470080078,
    annualized_volatility: 0.0054759051,
    max_drawdown: 0,
    benchmark_total_return: 0.169749974,
    information_ratio: -1.4067159045,
    rebalance_count: 14,
    average_active_gross_exposure: 0.0092528989,
  };
  const factors = [
    ["momentum_252d_skip_21d", 0.22, -0.00847, 0.5076],
    ["momentum_126d", 0.14, -0.06331, 0.4621],
    ["vol_adjusted_momentum", 0.12, -0.03191, 0.4924],
    ["reversal", 0.08, -0.79912, 0],
    ["low_vol", 0.08, 0.00846, 0.5152],
    ["alt_sentiment", 0.02, 0.01525, 0.5455],
  ];
  const curve = [
    ["2021-03-02", 1001872, 1001872],
    ["2021-03-16", 1021355, 1021305],
    ["2021-03-31", 1037516, 1037376],
    ["2021-04-15", 1052597, 1052529],
    ["2021-04-30", 1067264, 1067280],
    ["2021-05-17", 1078425, 1078420],
    ["2021-06-01", 1093092, 1093044],
    ["2021-06-16", 1107699, 1107688],
    ["2021-06-30", 1118297, 1118319],
    ["2021-07-15", 1131509, 1131525],
    ["2021-08-03", 1150638, 1150734],
    ["2021-08-17", 1162135, 1162181],
    ["2021-08-31", 1169672, 1169750],
  ];

  $$("#quant-metrics [data-metric]").forEach((node) => {
    const key = node.dataset.metric;
    const value = summary[key];
    const pct = key.includes("return") || key.includes("drawdown") || key.includes("volatility") || key.includes("exposure");
    node.textContent = pct ? `${formatNumber(value * 100, 2)}%` : formatNumber(value, 2);
  });

  $("#factor-table").innerHTML = factors.map(([name, weight, spread, hit]) => `
    <tr>
      <td>${name.replaceAll("_", " ")}</td>
      <td>${formatNumber(weight * 100, 1)}%</td>
      <td>${formatNumber(spread * 100, 2)}%</td>
      <td>${formatNumber(hit * 100, 1)}%</td>
    </tr>
  `).join("");

  const canvas = $("#equity-canvas");
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const pad = 44;
  const values = curve.flatMap((row) => [row[1], row[2]]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const x = (i) => pad + (i / (curve.length - 1)) * (width - pad * 1.6);
  const y = (value) => height - pad - ((value - min) / (max - min)) * (height - pad * 1.8);
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
  const draw = (index, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    curve.forEach((row, i) => {
      if (i === 0) ctx.moveTo(x(i), y(row[index]));
      else ctx.lineTo(x(i), y(row[index]));
    });
    ctx.stroke();
  };
  draw(2, "#d14f3f");
  draw(1, "#0f766e");
  ctx.fillStyle = "#111418";
  ctx.font = "700 16px system-ui";
  ctx.fillText("Fixture equity curve: portfolio vs benchmark", pad, 28);
  ctx.fillStyle = "#0f766e";
  ctx.fillText("Portfolio", width - 190, 28);
  ctx.fillStyle = "#d14f3f";
  ctx.fillText("Benchmark", width - 100, 28);

  $("#quant-download").addEventListener("click", () => {
    downloadText("quantbot-browser-report.json", JSON.stringify({ summary, factors, curve }, null, 2), "application/json;charset=utf-8");
  });
}

function initTranscript() {
  const input = $("#transcript-input");
  const output = $("#transcript-output");
  const status = $("#transcript-status");
  const includeTime = $("#include-time");
  const sample = `0:00 Welcome to the demo\n0:04 This page formats transcript rows in the browser\n0:08 You can copy, download TXT, or download JSON`;
  const parse = () => {
    const rows = input.value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const match = line.match(/^((?:\d+:)?\d{1,2}:\d{2})\s+(.+)$/);
        return match ? { timestamp: match[1], text: match[2] } : { timestamp: "", text: line };
      });
    output.value = rows.map((row) => includeTime.checked && row.timestamp ? `${row.timestamp} ${row.text}` : row.text).join("\n");
    status.textContent = `${rows.length} rows parsed locally`;
    return rows;
  };
  const bookmarklet = `javascript:${encodeURIComponent(`(()=>{const rows=[...document.querySelectorAll("ytd-transcript-segment-renderer")].map(r=>({timestamp:r.querySelector(".segment-timestamp")?.textContent?.trim()||"",text:r.querySelector(".segment-text")?.textContent?.replace(/\\s+/g," ")?.trim()||""})).filter(r=>r.text);if(!rows.length){alert("Open the transcript panel first, then run this again.");return;}const txt=rows.map(r=>r.timestamp+" "+r.text).join("\\n");const blob=new Blob([txt],{type:"text/plain;charset=utf-8"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=(new URL(location.href).searchParams.get("v")||"youtube")+".txt";a.click();URL.revokeObjectURL(a.href);})();`)}`;
  $("#bookmarklet-link").href = bookmarklet;
  $("#load-sample").addEventListener("click", () => {
    input.value = sample;
    parse();
  });
  $("#parse-transcript").addEventListener("click", parse);
  includeTime.addEventListener("change", parse);
  $("#copy-transcript").addEventListener("click", async () => {
    await navigator.clipboard.writeText(output.value);
    status.textContent = "Copied to clipboard";
  });
  $("#download-transcript-txt").addEventListener("click", () => downloadText("transcript.txt", output.value));
  $("#download-transcript-json").addEventListener("click", () => {
    downloadText("transcript.json", JSON.stringify(parse(), null, 2), "application/json;charset=utf-8");
  });
  input.value = sample;
  parse();
}

function initCrescent() {
  const form = $("#crescent-form");
  const result = $("#crescent-result");
  const models = {
    ilyas: ({ moonAlt, elongation }) => moonAlt > 10 && elongation > 11 ? "Visible" : moonAlt > 5 && elongation > 8 ? "Marginal" : "Not visible",
    yallop: ({ arcV, diffAlt }) => arcV > 14.8 && diffAlt > 4.1 ? "A: easily visible" : arcV > 12.1 ? "B: visible under perfect conditions" : arcV > 10.5 ? "C: may need optical aid" : arcV > 9.5 ? "D: will need optical aid" : arcV > 8.4 ? "E: visible with telescope" : arcV > 7 ? "F: photographic only" : "G: not visible",
    odeh: ({ elongation, moonAge }) => elongation < 8 || moonAge < 15 ? "Not visible" : elongation > 10 && moonAge > 20 ? "Easily visible" : "Possibly visible",
    shaukat: ({ elongation, moonAlt, moonAge }) => moonAlt > 10 && elongation > 12 && moonAge > 20 ? "Visible" : moonAlt > 6 && elongation > 9 && moonAge > 16 ? "Marginal" : "Not visible",
    saao: ({ moonAge, lag }) => moonAge > 20 && lag > 40 ? "Visible" : moonAge > 15 && lag > 30 ? "Marginal" : "Not visible",
  };
  const moonAge = (date) => {
    const known = Date.UTC(2000, 0, 6, 18, 14);
    return ((date.getTime() - known) / 86400000) % 29.53058867;
  };
  const estimate = (date, lat, lon) => {
    const age = (moonAge(date) + 29.53058867) % 29.53058867;
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
  };
  const render = () => {
    const data = Object.fromEntries(new FormData(form).entries());
    const date = new Date(`${data.date}T${data.time || "08:00"}:00Z`);
    const values = estimate(date, Number(data.lat), Number(data.lon));
    result.innerHTML = `
      <div class="result-metrics">
        <div><strong>${formatNumber(values.moonAge, 1)} d</strong><span>Moon age</span></div>
        <div><strong>${formatNumber(values.moonAlt, 1)} deg</strong><span>Moon altitude</span></div>
        <div><strong>${formatNumber(values.elongation, 1)} deg</strong><span>Elongation</span></div>
        <div><strong>${formatNumber(values.illumination * 100, 2)}%</strong><span>Illumination</span></div>
      </div>
      <div class="model-results">
        ${Object.entries(models).map(([name, fn]) => `<div><strong>${name}</strong><span>${fn(values)}</span></div>`).join("")}
      </div>
    `;
  };
  form.addEventListener("input", render);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    render();
  });
  render();
}

function initAssabile() {
  const people = [
    { name: "Abdul Rahman Al Sudais", country: "Saudi Arabia", roles: ["reciter"], recitations: 114, lessons: 0, media: "recitation", url: "https://www.assabile.com/abdul-rahman-al-sudais-10/abdul-rahman-al-sudais.htm" },
    { name: "Mishary Rashid Alafasy", country: "Kuwait", roles: ["reciter", "munshid"], recitations: 114, lessons: 8, media: "recitation", url: "https://www.assabile.com/mishary-rashid-alafasy-5/mishary-rashid-alafasy.htm" },
    { name: "Ayman Swed", country: "Syria", roles: ["teacher"], recitations: 0, lessons: 78, media: "videoLesson", url: "https://www.assabile.com/ayman-swed-345/ayman-swed.htm" },
    { name: "Mahmoud Al Masri", country: "Egypt", roles: ["preacher"], recitations: 0, lessons: 215, media: "videoLesson", url: "https://www.assabile.com/mahmoud-al-masri-280/mahmoud-al-masri.htm" },
    { name: "Abdulbasit Abdulsamad", country: "Egypt", roles: ["reciter"], recitations: 114, lessons: 0, media: "recitation", url: "https://www.assabile.com/abdulbasit-abdulsamad-2/abdulbasit-abdulsamad.htm" },
    { name: "Abdessalam Al Hassani", country: "Morocco", roles: ["munshid"], recitations: 0, lessons: 8, media: "anasheed", url: "https://www.assabile.com/abdessalam-al-hassani-132/abdessalam-al-hassani.htm" },
  ];
  const render = () => {
    const query = $("#assabile-search").value.trim().toLowerCase();
    const kind = $("#assabile-kind").value;
    const filtered = people.filter((person) => {
      const text = `${person.name} ${person.country} ${person.roles.join(" ")} ${person.media}`.toLowerCase();
      return (!query || text.includes(query)) && (kind === "all" || person.media === kind || person.roles.includes(kind));
    });
    $("#assabile-results").innerHTML = filtered.map((person) => `
      <article class="mini-card">
        <p class="repo-meta">${person.country || "Catalogue"}</p>
        <h3>${person.name}</h3>
        <p>${person.roles.join(", ")}. ${person.recitations} recitations, ${person.lessons} lesson or album entries.</p>
        <a class="text-link" href="${person.url}" target="_blank" rel="noopener noreferrer">Open source profile</a>
      </article>
    `).join("") || `<p class="empty-note">No catalogue rows match those filters.</p>`;
    $("#assabile-count").textContent = `${filtered.length} shown from a static sample`;
  };
  $("#assabile-search").addEventListener("input", render);
  $("#assabile-kind").addEventListener("change", render);
  render();
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
