/* ==================== CONFIG ==================== */
function renderConfig(){
  document.getElementById("namesInput").value = state.allNames.join("\n");
  document.getElementById("topicsInput").value = state.allTopics.join("\n");
  document.getElementById("sessionSecondsInput").value = state.sessionSeconds;
  document.getElementById("baseWpmInput").value = state.baseWPM;
  document.getElementById("beepEnabledInput").checked = !!state.beepEnabled;
  document.getElementById("langSelect").value = state.lang || "en-US";
  document.getElementById("fillerThresholdInput").value = fillerThreshold();
  document.getElementById("repeatThresholdInput").value = repeatThreshold();
  document.getElementById("pauseThresholdInput").value = pauseThresholdSec();
  document.getElementById("transcriptionApiUrlInput").value = state.transcriptionApiUrl || "";
  renderBeepStatus();
}
document.getElementById("applyViolationBtn").addEventListener("click", ()=>{
  state.fillerThreshold = clamp(parseInt(document.getElementById("fillerThresholdInput").value,10) || 0, 0, 20);
  state.repeatThreshold = clamp(parseInt(document.getElementById("repeatThresholdInput").value,10) || 2, 2, 10);
  state.pauseThresholdSec = clamp(parseInt(document.getElementById("pauseThresholdInput").value,10) || 3, 1, 30);
  saveState();
  alert("Violation detection settings updated.");
});
document.getElementById("applyNamesBtn").addEventListener("click", ()=>{
  const list = document.getElementById("namesInput").value.split("\n").map(s=>s.trim()).filter(Boolean);
  state.allNames = list; state.remainingNames = shuffleArray(list.slice());
  saveState(); renderPicker();
  alert("Names list updated.");
});
document.getElementById("applyTopicsBtn").addEventListener("click", ()=>{
  const list = document.getElementById("topicsInput").value.split("\n").map(s=>s.trim()).filter(Boolean);
  state.allTopics = list; state.remainingTopics = shuffleArray(list.slice());
  saveState(); renderPicker();
  alert("Topics list updated.");
});
document.getElementById("applyTimingBtn").addEventListener("click", ()=>{
  state.sessionSeconds = clamp(parseInt(document.getElementById("sessionSecondsInput").value,10) || 60, 10, 600);
  state.baseWPM = clamp(parseInt(document.getElementById("baseWpmInput").value,10) || 130, 60, 220);
  saveState();
  document.getElementById("timerTotalLabel").textContent = "of " + fmtTime(sessionSeconds());
  alert("Timing & speed settings updated.");
});
document.getElementById("beepEnabledInput").addEventListener("change", (e)=>{
  state.beepEnabled = e.target.checked;
  saveState();
});
document.getElementById("transcriptionApiUrlInput").addEventListener("change", (e)=>{
  state.transcriptionApiUrl = (e.target.value || "").trim();
  saveState();
});
document.getElementById("resetAllBtn").addEventListener("click", ()=>{
  if(!confirm("This erases names, topics, and ALL session history. Continue?")) return;
  state = Object.assign({
    allNames: DEFAULT_NAMES.slice(), allTopics: DEFAULT_TOPICS.slice(),
    remainingNames: shuffleArray(DEFAULT_NAMES.slice()), remainingTopics: shuffleArray(DEFAULT_TOPICS.slice()),
    sessions: [], customBeepAudio: null
  }, SETTINGS_DEFAULTS);
  saveState(); renderPicker(); renderConfig(); renderHistory();
  alert("All data reset.");
});
