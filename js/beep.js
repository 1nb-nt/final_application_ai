/* ==================== BEEP SOUND ====================
   The short alert sound played on a violation (see flashAlert in recording.js),
   plus the Config-tab UI for uploading/testing/clearing a custom beep sound. ==================== */
function beep(freq=880, duration=0.15, type="square"){
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.type=type; osc.frequency.value=freq;
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime+duration);
    osc.onended = ()=>ctx.close();
  } catch(e){}
}
function playBeepSound(freq=880, duration=0.15, type="square"){
  if(state.customBeepAudio){
    try{
      const audio = new Audio(state.customBeepAudio);
      audio.currentTime = 0;
      audio.play().catch(()=>{ beep(freq, duration, type); });
      return;
    } catch(e){ /* fall through to synthesized beep */ }
  }
  beep(freq, duration, type);
}

/* ==================== CUSTOM BEEP SOUND ==================== */
function renderBeepStatus(){
  document.getElementById("beepStatus").textContent = state.customBeepAudio
    ? "Using your uploaded custom beep sound."
    : "Using default synthesized beep.";
}
document.getElementById("beepFileInput").addEventListener("change", (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    state.customBeepAudio = reader.result; // data URL
    saveState();
    renderBeepStatus();
    playBeepSound();
  };
  reader.readAsDataURL(file);
});
document.getElementById("testBeepBtn").addEventListener("click", ()=>playBeepSound(880, 0.2));
document.getElementById("clearBeepBtn").addEventListener("click", ()=>{
  state.customBeepAudio = null;
  saveState();
  document.getElementById("beepFileInput").value = "";
  renderBeepStatus();
});
