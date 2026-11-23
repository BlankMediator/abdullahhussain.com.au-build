export async function sha256(bytes) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
}
export function matches(actual, expected) {
  return /^[a-f0-9]{64}$/i.test(expected) && actual.toLowerCase() === expected.toLowerCase();
}
if (typeof document !== "undefined") {
  const select = document.querySelector("#release-select");
  const fileInput = document.querySelector("#verify-file");
  const button = document.querySelector("#verify-button");
  const result = document.querySelector("#verify-result");
  let revision = 0;
  function reset() {
    revision++;
    button.disabled = false;
    result.dataset.state = "";
    result.textContent = "Choose a download and a file to compare.";
  }
  function show(message, state) { result.textContent = message; result.dataset.state = state; }
  const project = new URLSearchParams(location.search).get("project");
  if (project) {
    const option = Array.from(select.options).find(o => o.dataset.filename.toLowerCase().startsWith(project.toLowerCase() + "-"));
    if (option) select.value = option.value;
  }
  select.addEventListener("change", reset);
  fileInput.addEventListener("change", reset);
  button.addEventListener("click", async () => {
    const file = fileInput.files[0];
    const expected = select.selectedOptions[0].dataset.sha256;
    const filename = select.selectedOptions[0].dataset.filename;
    if (!file) { show("Select a downloaded file first.", "error"); return; }
    if (!globalThis.crypto?.subtle) { show("This browser cannot verify files here. Use the terminal command below.", "error"); return; }
    if (file.size > 128 * 1024 * 1024) { show("This file exceeds the 128 MB browser limit. Use the terminal command below.", "error"); return; }
    const current = ++revision;
    button.disabled = true;
    show("Calculating SHA-256 locally…", "working");
    try {
      const digest = await sha256(await file.arrayBuffer());
      if (current !== revision) return;
      show(matches(digest, expected)
        ? "Match — this file matches " + filename + ". SHA-256: " + digest
        : "Mismatch — this file does not match " + filename + ". Do not use this download. Calculated SHA-256: " + digest,
        matches(digest, expected) ? "match" : "mismatch");
    } catch {
      if (current === revision) show("Could not read this file. Try again or use the terminal command below.", "error");
    } finally { if (current === revision) button.disabled = false; }
  });
}
