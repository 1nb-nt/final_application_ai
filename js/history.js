/* ==================== HISTORY ==================== */
function generateReportText(s){
  const lines = [];
  lines.push("SPEECHSENSE AI — EVALUATION REPORT");
  lines.push("=".repeat(40));
  lines.push(`Speaker : ${s.name}`);
  lines.push(`Topic   : ${s.topic}`);
  lines.push(`Date    : ${new Date(s.date).toLocaleString()}`);
  lines.push(`Duration: ${fmtTime(s.elapsed)}  ·  WPM: ${s.wpm}`);
  lines.push(`Violations: Fillers ${s.violations.fillerCount} · Repeats ${s.violations.repeatCount} · Pauses ${s.violations.pauseCount}`);
  if(s.violationCapReached){
    lines.push(`Violation limit (5) reached at: ${fmtTime(s.violationCapTime)}`);
  }
  const overused = overusedWordsList(s.violations.overusedWords);
  if(overused.length){
    lines.push(`Overused words (excl. topic words): ${overused.map(([w,c])=>`${w}×${c}`).join(", ")}`);
  }
  lines.push("");
  lines.push("SCORES");
  lines.push("-".repeat(40));
  Object.entries(s.scores).forEach(([k,v])=>lines.push(`${k.padEnd(16)}: ${v}`));
  lines.push("");
  lines.push("STRENGTHS");
  lines.push("-".repeat(40));
  s.feedback.strengths.forEach(x=>lines.push(`- ${x}`));
  lines.push("");
  lines.push("WEAKNESSES");
  lines.push("-".repeat(40));
  (s.feedback.weaknesses.length ? s.feedback.weaknesses : ["None flagged."]).forEach(x=>lines.push(`- ${x}`));
  lines.push("");
  lines.push("SUGGESTIONS");
  lines.push("-".repeat(40));
  s.feedback.suggestions.forEach(x=>lines.push(`- ${x}`));
  lines.push("");
  lines.push(`Practice Plan: ${s.feedback.practicePlan}`);
  lines.push(`Motivation   : ${s.feedback.motivational}`);
  lines.push("");
  lines.push("TRANSCRIPT");
  lines.push("-".repeat(40));
  lines.push(s.transcript || "(no transcript captured)");
  lines.push("");
  return lines.join("\n");
}
function downloadTextFile(filename, text){
  const blob = new Blob([text], { type:"text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
function renderHistory(){
  const el = document.getElementById("historyList");
  const controls = document.getElementById("historyControls");
  if(controls) controls.style.display = state.sessions.length ? "flex" : "none";
  if(state.sessions.length===0){ el.innerHTML = '<div class="empty">No sessions recorded yet.</div>'; return; }
  el.innerHTML = "";
  state.sessions.slice().reverse().forEach(s=>{
    const div = document.createElement("div");
    div.className = "history-item";
    div.innerHTML = `
      <div>
        <div style="font-weight:600;">${escapeHtml(s.name)}</div>
        <div style="font-size:12px; color:var(--ink-soft);">${escapeHtml(s.topic)}</div>
        <div style="font-size:11px; color:var(--ink-soft); font-family:monospace;">${new Date(s.date).toLocaleString()} · WPM ${s.wpm} · Fillers ${s.violations.fillerCount} · Repeats ${s.violations.repeatCount} · Pauses ${s.violations.pauseCount}</div>
      </div>
      <div class="hi-score">${s.scores.overall}</div>
    `;
    div.addEventListener("click", ()=>openHistoryDetail(s));
    el.appendChild(div);
  });
}

function openHistoryDetail(s){
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:16px;z-index:50;";
  overlay.addEventListener("click", (e)=>{ if(e.target===overlay) overlay.remove(); });

  const box = document.createElement("div");
  box.className = "card";
  box.style.cssText = "max-width:600px;width:100%;max-height:85vh;overflow-y:auto;";
  box.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
      <div>
        <h2 style="margin:0; font-size:18px; text-transform:none; letter-spacing:normal; color:var(--ink);">${escapeHtml(s.name)}</h2>
        <div style="font-size:13px; color:var(--ink-soft); margin-top:4px;">${escapeHtml(s.topic)} · ${new Date(s.date).toLocaleString()}</div>
      </div>
      <button class="btn-ghost" id="closeDetailBtn">✕</button>
    </div>
    <div class="scores" style="margin-top:16px;">
      ${Object.entries(s.scores).map(([k,v])=>`<div class="score-box"><div class="v">${v}</div><div class="l">${k}</div></div>`).join("")}
    </div>
    <div style="margin-top:14px;">
      <div class="badge">Transcript</div>
      <div style="background:var(--card-2); border:1px solid var(--line); border-radius:10px; padding:12px; font-family:monospace; font-size:13px; color:var(--ink-soft); margin-top:8px; max-height:160px; overflow-y:auto;">
        ${escapeHtml(s.transcript || "(no transcript captured)")}
      </div>
    </div>
    <div style="margin-top:14px;">
      <div class="badge" style="color:var(--good); border-color:rgba(21,122,79,.3); background:rgba(21,122,79,.08);">Strengths</div>
      <ul class="fb">${s.feedback.strengths.map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ul>
      <div class="badge" style="color:var(--danger); border-color:rgba(217,45,76,.3); background:rgba(217,45,76,.08);">Weaknesses</div>
      <ul class="fb">${(s.feedback.weaknesses.length? s.feedback.weaknesses : ["None flagged."]).map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ul>
    </div>
    <div class="row" style="margin-top:14px;">
      <button class="btn-primary" id="downloadReportBtn">⬇ Download full report (.txt)</button>
      <button class="btn-ghost" id="downloadTranscriptBtn">⬇ Download transcript (.txt)</button>
      <button class="btn-danger" id="deleteSessionBtn">Delete session</button>
    </div>
  `;
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  box.querySelector("#closeDetailBtn").addEventListener("click", ()=>overlay.remove());
  box.querySelector("#downloadReportBtn").addEventListener("click", ()=>{
    downloadTextFile(`${s.name}-${s.date.slice(0,10)}-report.txt`, generateReportText(s));
  });
  box.querySelector("#downloadTranscriptBtn").addEventListener("click", ()=>{
    downloadTextFile(`${s.name}-${s.date.slice(0,10)}-transcript.txt`, `Speaker: ${s.name}\nTopic: ${s.topic}\nDate: ${new Date(s.date).toLocaleString()}\n\n${s.transcript}`);
  });
  box.querySelector("#deleteSessionBtn").addEventListener("click", ()=>{
    if(!confirm("Delete this session?")) return;
    state.sessions = state.sessions.filter(x=>x.id!==s.id);
    saveState(); overlay.remove(); renderHistory();
  });
}

document.getElementById("downloadAllReportsBtn").addEventListener("click", ()=>{
  if(state.sessions.length===0) return;
  const ordered = state.sessions.slice().reverse();
  const combined = ordered.map(generateReportText).join("\n" + "#".repeat(50) + "\n\n");
  downloadTextFile(`speechsense-all-users-report-${new Date().toISOString().slice(0,10)}.txt`, combined);
});

// Wipes just the saved session history (names/topics/settings are untouched) — for
// erasing everything including names/topics/settings, see resetAllBtn in config-ui.js.
document.getElementById("clearHistoryBtn").addEventListener("click", ()=>{
  if(state.sessions.length===0) return;
  if(!confirm(`Clear all ${state.sessions.length} saved session(s) from history? This can't be undone.`)) return;
  state.sessions = [];
  saveState();
  renderHistory();
});
