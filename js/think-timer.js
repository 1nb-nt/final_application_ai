/* ==================== THINK TIMER ====================
   A separate 60-second countdown for the speaker to prepare before recording. It is
   entirely independent of the speaking timer, WPM, and violation detection — starting,
   running, or resetting it has no effect on any of those. */
const THINK_SECONDS = 60;
let thinkRemaining = THINK_SECONDS;
let thinkInterval = null;

function renderThinkTimer(){
  document.getElementById("thinkTimerBadge").textContent = "🧠 Think Time " + fmtTime(thinkRemaining);
}
function resetThinkTimer(){
  clearInterval(thinkInterval); thinkInterval = null;
  thinkRemaining = THINK_SECONDS;
  renderThinkTimer();
  document.getElementById("thinkTimerBadge").classList.remove("on");
  document.getElementById("startThinkBtn").style.display = "inline-block";
  document.getElementById("startThinkBtn").disabled = false;
  document.getElementById("resetThinkBtn").style.display = "none";
}
document.getElementById("startThinkBtn").addEventListener("click", ()=>{
  if(thinkInterval) return; // already running
  document.getElementById("startThinkBtn").disabled = true;
  document.getElementById("resetThinkBtn").style.display = "inline-block";
  thinkInterval = setInterval(()=>{
    thinkRemaining--;
    renderThinkTimer();
    if(thinkRemaining<=0){
      clearInterval(thinkInterval); thinkInterval = null;
      document.getElementById("thinkTimerBadge").textContent = "🧠 Think Time — time's up!";
      document.getElementById("thinkTimerBadge").classList.add("on");
      document.getElementById("startThinkBtn").disabled = false;
    }
  }, 1000);
});
document.getElementById("resetThinkBtn").addEventListener("click", ()=>resetThinkTimer());
