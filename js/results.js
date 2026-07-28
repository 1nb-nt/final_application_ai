/* ==================== RESULTS ====================
   Renders the scored results screen once a session finishes, and wires up the
   Save/Discard buttons. ==================== */
function showResults(result){
  phase = "done";
  updatePickLock();
  document.getElementById("resultsCard").style.display = "block";
  document.getElementById("overallScore").textContent = result.scores.overall;
  const ring = document.getElementById("overallRing");
  if(ring) ring.style.setProperty("--score", result.scores.overall);
  const boxes = document.getElementById("scoreBoxes");
  boxes.innerHTML = "";
  Object.entries(result.scores).filter(([k])=>k!=="overall").forEach(([k,v])=>{
    boxes.innerHTML += `<div class="score-box"><div class="v">${v}</div><div class="l">${k}</div></div>`;
  });
  document.getElementById("strengthsList").innerHTML = result.feedback.strengths.map(s=>`<li>${escapeHtml(s)}</li>`).join("");
  document.getElementById("weaknessesList").innerHTML = result.feedback.weaknesses.length
    ? result.feedback.weaknesses.map(s=>`<li>${escapeHtml(s)}</li>`).join("")
    : `<li style="color:var(--ink-soft)">None flagged — clean run.</li>`;
  document.getElementById("suggestionsList").innerHTML = result.feedback.suggestions.map(s=>`<li>${escapeHtml(s)}</li>`).join("");
  document.getElementById("resultsTranscript").textContent = transcript.trim() || "(no transcript captured)";
  document.getElementById("practicePlan").textContent = result.feedback.practicePlan;
  document.getElementById("motivational").textContent = result.feedback.motivational;

  document.getElementById("saveBtn").onclick = ()=>{
    state.sessions.push({
      id: Date.now().toString(36),
      name: currentPick.name, topic: currentPick.topic,
      date: new Date().toISOString(),
      elapsed, wpm: computeWPM(transcript, elapsed),
      transcript: transcript.trim(),
      violations: { ...violations },
      violationEvents, violationCapReached, violationCapTime,
      scores: result.scores, feedback: result.feedback
    });
    saveState();
    document.getElementById("recordCard").style.display = "none";
    document.getElementById("resultsCard").style.display = "none";
    stageLabel.textContent = "Saved ✓"; 
  };
  document.getElementById("discardBtn").onclick = ()=>{
    document.getElementById("recordCard").style.display = "none";
    document.getElementById("resultsCard").style.display = "none";
  };
}
