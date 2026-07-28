/* ==================== PICKER ==================== */
const stage = document.getElementById("stage");
const stageName = document.getElementById("stageName");
const stageTopic = document.getElementById("stageTopic");
const stageLabel = stage.querySelector(".label");
let currentPick = null;

function renderPicker(){
  document.getElementById("nameCount").textContent = state.remainingNames.length;
  document.getElementById("topicCount").textContent = state.remainingTopics.length;
  updatePickLock();
}

// Only the empty-pool state blocks Pick Random now — picking a new speaker is allowed
// even while someone else is recording (finalizePick() below stops that recording first).
function updatePickLock(){
  const poolEmpty = state.remainingNames.length===0 || state.remainingTopics.length===0;
  document.getElementById("pickBtn").disabled = poolEmpty;
  document.getElementById("shuffleBtn").disabled = false;
  document.getElementById("resetCycleBtn").disabled = false;
  const rerollBtn = document.getElementById("rerollTopicBtn");
  if(rerollBtn) rerollBtn.disabled = !currentPick || phase!=="ready" || state.remainingTopics.length===0;
  // Make it obvious *why* Pick Random is greyed out when it's simply because the
  // pool ran out, instead of it just silently looking broken.
  const poolHint = document.getElementById("poolEmptyHint");
  if(poolHint) poolHint.style.display = poolEmpty ? "block" : "none";
}

document.getElementById("pickBtn").addEventListener("click", ()=>{
  if(state.remainingNames.length===0 || state.remainingTopics.length===0) return;
  stageLabel.textContent = "Selecting...";
  let ticks=0; const maxTicks=14;
  const iv = setInterval(()=>{
    stageName.textContent = state.remainingNames[Math.floor(Math.random()*state.remainingNames.length)];
    stageTopic.textContent = state.remainingTopics[Math.floor(Math.random()*state.remainingTopics.length)];
    ticks++;
    if(ticks>=maxTicks){ clearInterval(iv); finalizePick(); }
  }, 70);
});

function finalizePick(){
  // Always fully stop any in-progress recording (timer, mic, speech recognition,
  // waveform) before wiping the UI for a new pick — otherwise the old timer keeps
  // ticking in the background and either restarts or double-counts the time.
  stopAll();
  // Re-shuffle the pools right before drawing so the topic order is always freshly shuffled.
  shuffleArray(state.remainingNames);
  shuffleArray(state.remainingTopics);
  const name = state.remainingNames.pop();
  const topic = state.remainingTopics.pop();
  currentPick = { name, topic };
  stageLabel.textContent = "Selected";
  stageName.textContent = name;
  stageTopic.textContent = topic;
  saveState(); renderPicker();
  document.getElementById("recordCard").style.display = "block";
  resetRecordingUI();
  document.getElementById("recordCard").scrollIntoView({behavior:"smooth", block:"start"});
}

// Rerolls just the topic for the currently picked speaker — the old topic goes back
// into the pool and a fresh one is drawn. Only available before recording starts.
document.getElementById("rerollTopicBtn").addEventListener("click", ()=>{
  if(!currentPick || phase!=="ready" || state.remainingTopics.length===0) return;
  const oldTopic = currentPick.topic;
  state.remainingTopics.push(oldTopic);
  shuffleArray(state.remainingTopics);
  const newTopic = state.remainingTopics.pop();
  currentPick.topic = newTopic;
  stageTopic.textContent = newTopic;
  saveState(); renderPicker();
  stageLabel.textContent = "Topic shuffled";
});

document.getElementById("shuffleBtn").addEventListener("click", ()=>{
  shuffleArray(state.remainingNames); shuffleArray(state.remainingTopics);
  saveState(); renderPicker(); stageLabel.textContent = "Pool shuffled";
});
document.getElementById("resetCycleBtn").addEventListener("click", ()=>{
  if(!confirm("Refill the pool from the Names/Topics lists?")) return;
  state.remainingNames = shuffleArray(state.allNames.slice());
  state.remainingTopics = shuffleArray(state.allTopics.slice());
  saveState(); renderPicker();
  stageLabel.textContent = "Cycle reset"; stageName.textContent = 'Press "Pick Random"';
  stageTopic.textContent = "Name + topic are removed from the pool once picked";
  currentPick = null;
  stopAll();
  phase = "ready";
  updatePickLock();
  document.getElementById("recordCard").style.display = "none";
  document.getElementById("resultsCard").style.display = "none";
});
