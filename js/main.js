/* ==================== INIT ====================
   This file must be the LAST <script> tag in index.html. Every other file only
   *defines* functions/constants or *attaches* event listeners (both safe to do in
   any order) — this is the one file that actually runs startup code, so it needs
   everything else (config.js's loadState/saveState, utils.js's shuffleArray,
   picker.js's renderPicker) to already exist by the time it runs. ==================== */
let state = loadState();
renderPicker();

// Mic access (getUserMedia) requires a "secure context" in Chrome/Edge — https://
// or http://localhost — and is silently refused on file:// pages. That silent
// refusal is indistinguishable, from the user's side, from every mic-based feature
// (transcription, filler detection, pause detection) just being broken, since the
// existing mic-denied warning only shows up AFTER clicking Start. Surfacing it here,
// immediately on load, means it can't be missed or mistaken for a code bug.
if(location.protocol === "file:"){
  const el = document.getElementById("fileProtocolWarning");
  if(el) el.style.display = "block";
}
