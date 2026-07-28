/* ==================== RECORDING + VIOLATION DETECTION ==================== */
let phase = "ready"; // ready | recording | evaluating | done
let elapsed = 0, transcript = "", manualMode = false;
let violations = { fillerCount:0, repeatCount:0, pauseCount:0, overusedWords:{} }; // raw counts, used for scoring + noted separately
let violationEvents = 0;       // total violations noted (does not stop the speaker)
const VIOLATION_CAP = 5;       // combined total (fillers+repeats+pauses) stops climbing once this is hit
let violationCapReached = false; // true once the cap has been hit for this session
let violationCapTime = null;     // elapsed seconds at the moment the cap was reached (noted separately)
let lastFillerBeepCount = 0;   // filler word count at last alert
let repeatRunsAlerted = new Set(); // start-index of each immediate-repeat run already alerted on —
                                    // tracks every distinct incident (not just the single longest-ever
                                    // run), so a second separate "so so so" after an earlier "the the the"
                                    // still gets flagged even though it isn't a new record length
let acousticFillerCount = 0;   // filler-like sounds ("umm"/"ahh") detected straight from mic volume via
                                // startMicWaveform's analyser — independent of speech-to-text entirely,
                                // so it still counts a disfluency even when the recognizer drops it
                                // before it ever becomes transcript text. See registerAcousticFiller().
let voiceActive = false, voiceStartedAt = 0, wordsAtVoiceStart = 0; // acoustic burst tracking
let voicedRatioSum = 0, voicedRatioSamples = 0; // running average of "voice-like-ness" across the current burst
let lastAcousticFillerAt = 0; // for the cooldown between acoustic-only filler hits
let pendingBurstCheck = null; // {wordsAtVoiceStart, checkAt} — a burst awaiting its grace-period verdict
let lastLiveInterim = "";      // most recent not-yet-finalized chunk of speech text. Chrome's recognizer
                                // periodically fires "onend" mid-utterance (network hiccups, internal
                                // ~60s resets) even while phase is still "recording"; without tracking
                                // this, whatever was said in that still-open, not-yet-finalized chunk was
                                // silently lost the moment recognition restarted. See commitPendingInterim().
let overuseAlerted = {};       // word -> highest count already alerted on, for whole-speech repeated words
let unconfirmedAcousticFillers = []; // timestamps of acoustic-only filler hits not yet matched against
                                // transcript text. If the recognizer later transcribes that same sound
                                // as text (just slowly), reconcileAcousticFillers() consumes one of these
                                // instead of letting countFillers() count it a second time.
const ACOUSTIC_RECONCILE_WINDOW_MS = 3000; // how far back a late text match can still cancel out an
                                // earlier acoustic-only hit for the same sound
let pauseMultiplier = 0;       // how many pauseThresholdSec-sized chunks of the CURRENT silence gap have been counted
let fired = { pause:false };
let timerInterval = null, pauseCheckInterval = null;
let recognition = null, audioStream = null, analyser = null, rafId = null;
let remoteRecorder = null, remoteAudioChunks = [];
let lastSpeechAt = Date.now();
let gotAnyRecognitionResult = false; // true once onresult has fired at least once this session
let consecutiveRecognitionErrors = 0; // non-fatal recognition errors in a row with zero results so far
// Adaptive ambient-noise calibration: the mic's "silence" level differs a lot machine
// to machine (room noise, mic gain), so a single fixed volume threshold either missed
// real filler bursts on quiet setups or falsely fired on noisy ones. Instead we sample
// the mic for a brief window right after recording starts (before assuming any sound
// is a filler) and set the working threshold relative to that measured noise floor.
const CALIBRATION_MS = 700;
let calibrationEndAt = 0;
let calibrationSamples = [];
let voiceLevelThreshold = VOICE_LEVEL_THRESHOLD;

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

function resetRecordingUI(){
  phase = "ready"; elapsed = 0; transcript = ""; manualMode = !SR;
  updatePickLock();
  violations = { fillerCount:0, repeatCount:0, pauseCount:0, overusedWords:{} };
  violationEvents = 0; lastFillerBeepCount = 0; repeatRunsAlerted = new Set();
  overuseAlerted = {}; pauseMultiplier = 0; acousticFillerCount = 0; unconfirmedAcousticFillers = [];
  gotAnyRecognitionResult = false; consecutiveRecognitionErrors = 0;
  voiceActive = false; voiceStartedAt = 0; wordsAtVoiceStart = 0; lastLiveInterim = ""; pendingBurstCheck = null;
  voicedRatioSum = 0; voicedRatioSamples = 0; lastAcousticFillerAt = 0;
  fired = { pause:false };
  violationCapReached = false; violationCapTime = null;
  calibrationEndAt = 0; calibrationSamples = []; voiceLevelThreshold = VOICE_LEVEL_THRESHOLD;
  document.getElementById("capBadge").style.display = "none";
  document.getElementById("capBadge").textContent = "Limit reached at --";
  const wfCanvas = document.getElementById("waveform");
  wfCanvas.getContext("2d").clearRect(0,0,wfCanvas.width,wfCanvas.height);
  document.getElementById("timerTotalLabel").textContent = "of " + fmtTime(sessionSeconds());
  document.getElementById("statusBadge").textContent = "READY";
  document.getElementById("statusBadge").classList.remove("on");
  document.getElementById("modeBadge").textContent = manualMode ? "manual typing mode" : "mic + speech recognition";
  const warnEl = document.getElementById("manualModeWarning");
  const warnTextEl = document.getElementById("manualModeWarningText");
  if(manualMode && !SR){
    warnTextEl.textContent = "This browser doesn't support live speech recognition, so filler-sound and long-pause detection (which rely on the mic) can't run. Use Chrome or Edge for mic-based detection, or type your speech below manually.";
    warnEl.style.display = "block";
  } else {
    warnEl.style.display = "none";
  }
  document.getElementById("timerVal").textContent = "0:00";
  const timerFillEl = document.getElementById("timerProgressFill");
  if(timerFillEl) timerFillEl.style.width = "0%";
  document.getElementById("wpmVal").textContent = "0";
  document.getElementById("violVal").textContent = "0";
  document.getElementById("fillerBadge").textContent = "Fillers 0";
  document.getElementById("repeatBadge").textContent = "Repeats 0";
  document.getElementById("pauseBadge").textContent = "Pauses 0";
  const diagEl0 = document.getElementById("diagLine");
  if(diagEl0) diagEl0.textContent = "";
  document.getElementById("alertBox").classList.remove("show");
  document.getElementById("liveTranscript").style.display = manualMode ? "none" : "block";
  document.getElementById("liveTranscript").textContent = "";
  document.getElementById("manualTranscript").style.display = manualMode ? "block" : "none";
  document.getElementById("manualTranscript").value = "";
  document.getElementById("startBtn").style.display = "inline-block";
  document.getElementById("startBtn").disabled = false;
  document.getElementById("stopBtn").style.display = "none";
  document.getElementById("stopBtn").disabled = false;
  document.getElementById("rerecordBtn").style.display = "none";
  document.getElementById("langSelect").value = state.lang || "en-US";
  document.getElementById("manualTranscript").disabled = false;
  document.getElementById("resultsCard").style.display = "none";
  resetThinkTimer();
}


function flashAlert(msg){
  document.getElementById("alertText").textContent = msg;
  document.getElementById("alertBox").classList.add("show");
  if(state.beepEnabled) playBeepSound();
  setTimeout(()=>document.getElementById("alertBox").classList.remove("show"),1500);
}

// Every violation type (filler, repeat, long pause) funnels through here so the
// COMBINED total is capped at VIOLATION_CAP (5). Individual badges (Fillers/Repeats/
// Pauses) keep counting normally for the breakdown. Once the combined total hits
// the cap, the session ends immediately: the timer stops and results are shown.
function registerViolation(){
  if(!violationCapReached){
    violationEvents++;
    if(violationEvents >= VIOLATION_CAP){
      violationCapReached = true;
      violationCapTime = elapsed;
      const capBadge = document.getElementById("capBadge");
      capBadge.textContent = "Limit reached at " + fmtTime(violationCapTime);
      capBadge.style.display = "inline-block";
      flashAlert(`Violation limit (${VIOLATION_CAP}) reached at ${fmtTime(violationCapTime)} — ending session now.`);
      finishRecording();
    }
  }
  // Once capped, further violations are still detected (per-category badges still
  // update) but no longer add to the combined total.
}

// Violations are noted here — every violation (filler, repeat, overused word, long
// pause) is logged and flashed on screen immediately, but recording and the timer
// keep running without interruption (the speaker is never cut off or frozen). Once
// the combined violation cap (5) is hit via registerViolation, the session ends and
// results are shown immediately.
// All three violation types (fillers, repeats, overused words) are checked on every
// call so simultaneous violations never get skipped just because another one fired.
function analyzeTranscript(full){
  const topic = currentPick ? currentPick.topic : "";
  let newAlert = null;

  // ---- Filler words / filler sounds ----
  // Text fillers are recomputed fresh from the live transcript every time (transcript
  // only grows, so this is cheap and always in sync with what's actually visible).
  // Acoustic fillers (see registerAcousticFiller, driven by the mic-volume analyser in
  // drawWaveform) are tracked separately and added in, since that's what catches a
  // disfluency the recognizer never transcribed as text at all.
  const fillerCount = countFillers(full) + acousticFillerCount;
  violations.fillerCount = fillerCount;
  if(fillerCount > lastFillerBeepCount){
    lastFillerBeepCount = fillerCount;
    // Register immediately on every new filler — no waiting for a threshold to
    // pass, so detection feels instant instead of delayed. fillerThreshold() still
    // controls the badge highlight and end-of-session feedback separately below.
    registerViolation();
    newAlert = `Filler word/sound noted (${fillerCount} so far).`;
  }

  // ---- Immediate back-to-back repeats ("the the the") ----
  const repeatRuns = detectImmediateRepeats(full);
  repeatRuns.forEach(run=>{
    if(run.len >= repeatThreshold() && !repeatRunsAlerted.has(run.startIndex)){
      repeatRunsAlerted.add(run.startIndex);
      violations.repeatCount++;
      registerViolation();
      newAlert = newAlert || `Repeated word noted: "${run.word}" said ${run.len}x in a row.`;
    }
  });

  // ---- Words reused many times across the WHOLE speech, excluding the topic's own words ----
  const overuse = detectOveruseWords(full, topic);
  violations.overusedWords = overuse;
  Object.keys(overuse).forEach(word=>{
    const count = overuse[word];
    if(count >= repeatThreshold() && count > (overuseAlerted[word]||0)){
      overuseAlerted[word] = count;
      violations.repeatCount++;
      registerViolation();
      newAlert = newAlert || `Repeated word noted: "${word}" used ${count} times.`;
    }
  });

  if(newAlert) flashAlert(newAlert);
  updateStatsUI(full);
  return !!newAlert; // true if this call already surfaced a filler/repeat violation
}


function updateStatsUI(full){
  document.getElementById("wpmVal").textContent = computeWPM(full, elapsed);
  document.getElementById("violVal").textContent = violationEvents;
  const violStat = document.getElementById("violVal").closest(".stat");
  if(violStat){
    violStat.classList.toggle("warn", violationEvents>0 && violationEvents<VIOLATION_CAP);
    violStat.classList.toggle("danger", violationEvents>=VIOLATION_CAP);
  }
  document.getElementById("fillerBadge").textContent = "Fillers " + violations.fillerCount;
  document.getElementById("repeatBadge").textContent = "Repeats " + violations.repeatCount;
  document.getElementById("pauseBadge").textContent = "Pauses " + violations.pauseCount;
  document.getElementById("fillerBadge").classList.toggle("on", violations.fillerCount>fillerThreshold());
  document.getElementById("repeatBadge").classList.toggle("on", violations.repeatCount>0);
  document.getElementById("pauseBadge").classList.toggle("on", violations.pauseCount>0);
}

function startRemoteCapture(){
  if(!audioStream || !state.transcriptionApiUrl) return;
  if(typeof MediaRecorder === "undefined") return;
  try{
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : (MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "");
    remoteRecorder = mimeType ? new MediaRecorder(audioStream, { mimeType }) : new MediaRecorder(audioStream);
    remoteAudioChunks = [];
    remoteRecorder.ondataavailable = (e)=>{ if(e.data && e.data.size) remoteAudioChunks.push(e.data); };
    remoteRecorder.start();
  } catch(e){
    remoteRecorder = null;
  }
}

async function stopRemoteCapture(){
  if(!remoteRecorder || remoteRecorder.state === "inactive") return null;
  return new Promise((resolve)=>{
    const recorder = remoteRecorder;
    recorder.onstop = ()=>{
      const blob = new Blob(remoteAudioChunks, { type: recorder.mimeType || "audio/webm" });
      remoteRecorder = null;
      remoteAudioChunks = [];
      resolve(blob);
    };
    try{ recorder.stop(); } catch(e){ resolve(null); }
  });
}

async function transcribeWithRemoteApi(blob){
  if(!blob || !state.transcriptionApiUrl) return "";
  try{
    const reader = new FileReader();
    const base64 = await new Promise((resolve,reject)=>{
      reader.onloadend = ()=>resolve(reader.result.split(",")[1] || "");
      reader.onerror = ()=>reject(new Error("failed to read audio blob"));
      reader.readAsDataURL(blob);
    });
    const response = await fetch(state.transcriptionApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioBase64: base64, mimeType: blob.type || "audio/webm" })
    });
    const data = await response.json();
    return (data && data.transcript ? data.transcript : "").trim();
  } catch(e){
    return "";
  }
}

async function startMicWaveform(){
  try{
    audioStream = await navigator.mediaDevices.getUserMedia({ audio:true });
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const source = ctx.createMediaStreamSource(audioStream);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 1024; // was 256 — finer frequency resolution makes the voiced-ratio
                              // check (see drawWaveform) actually able to tell a vowel-like
                              // "uh/um/ah" sound apart from other noise, instead of guessing
                              // off only 128 very coarse bins
    source.connect(analyser);
    drawWaveform();
  } catch(e){
    manualMode = true;
    document.getElementById("modeBadge").textContent = "manual typing mode (mic denied)";
    document.getElementById("liveTranscript").style.display = "none";
    document.getElementById("manualTranscript").style.display = "block";
    const warnEl = document.getElementById("manualModeWarning");
    document.getElementById("manualModeWarningText").textContent = "Mic access wasn't granted (permission denied, no mic found, or blocked), so filler-sound and long-pause detection can't run. Check this site's mic permission in your browser's address-bar settings, then use Rerecord to try again.";
    warnEl.style.display = "block";
  }
}
// Word count including the still-open interim chunk, not just finalized transcript —
// interim results normally show up well before a word is finalized, so checking against
// finalized-only text was the reason ordinary words kept getting flagged as fillers.
function currentWordCount(){
  return (transcript + " " + lastLiveInterim).trim().split(/\s+/).filter(Boolean).length;
}
function registerAcousticFiller(){
  if(phase!=="recording") return;
  const now = Date.now();
  if(now - lastAcousticFillerAt < ACOUSTIC_FILLER_COOLDOWN_MS) return;
  lastAcousticFillerAt = now;
  acousticFillerCount++;
  unconfirmedAcousticFillers.push(now);
  analyzeTranscript((transcript + " " + lastLiveInterim).trim());
}

// If the speech recognizer eventually transcribes the same "um"/"ahh" sound as text
// (just too slowly to be caught by the grace-period check in drawWaveform), countFillers()
// would otherwise count it again on top of the acoustic hit already registered for it.
// This looks at newly-finalized text for a filler-sound match and, if a still-recent
// unconfirmed acoustic hit exists, cancels one out instead of letting it double-count.
function reconcileAcousticFillers(finalChunk){
  const now = Date.now();
  unconfirmedAcousticFillers = unconfirmedAcousticFillers.filter(t => (now - t) <= ACOUSTIC_RECONCILE_WINDOW_MS);
  if(!unconfirmedAcousticFillers.length) return;
  const soundRe = new RegExp(FILLER_SOUND_REGEX.source, "gi");
  const matches = finalChunk.match(soundRe) || [];
  matches.forEach(()=>{
    if(unconfirmedAcousticFillers.length){
      unconfirmedAcousticFillers.shift();
      acousticFillerCount = Math.max(0, acousticFillerCount - 1);
    }
  });
}

function drawWaveform(){
  const canvas = document.getElementById("waveform");
  const ctx = canvas.getContext("2d");
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  function draw(){
    rafId = requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0,0,w,h);
    const bars = 40; const step = Math.floor(bufferLength/bars);
    for(let i=0;i<bars;i++){
      const v = dataArray[i*step]/255;
      const barH = Math.max(3, v*h);
      ctx.fillStyle = i%5===0 ? "#d92d4c" : "#3651d4";
      ctx.fillRect(i*(w/bars)+1, h-barH, (w/bars)-2, barH);
    }

    // Use RMS (root-mean-square) of the frequency bins rather than a plain average —
    // RMS tracks perceived loudness much more faithfully, so short "um"/"ahh" bursts
    // stand out clearly from steady background hiss instead of blending into it.
    // Restricted to the human-voice frequency range (roughly up to ~4kHz) instead of
    // the full spectrum up to Nyquist (~22kHz): most of that upper range carries almost
    // no energy for speech, so including it diluted the measured loudness of genuine
    // "um"/"uh"/"ah" bursts down toward the noise floor and they often never crossed
    // the attack threshold at all.
    const nyquist = (analyser.context && analyser.context.sampleRate ? analyser.context.sampleRate : 44100) / 2;
    const voiceBandBins = Math.max(4, Math.min(bufferLength, Math.round(bufferLength * (4000 / nyquist))));
    let sumSquares=0;
    for(let i=0;i<voiceBandBins;i++){ const v = dataArray[i]/255; sumSquares += v*v; }
    const level = Math.sqrt(sumSquares/voiceBandBins);

    // "Voiced-ness": what share of the sound's energy sits in the low/vowel band
    // (roughly up to ~1.6kHz, where "uh"/"um"/"ah" concentrate their energy) versus
    // the rest of the voice-range band above. Taps, key clicks, coughs, claps, and most
    // incidental room noise skew broadband or high-frequency and score low here, so
    // this is what keeps those from being mislabeled as a filler sound.
    const voicedBandBins = Math.max(4, Math.min(bufferLength, Math.round(bufferLength * (1600 / nyquist))));
    let lowSumSquares = 0;
    for(let i=0;i<voicedBandBins;i++){ const v = dataArray[i]/255; lowSumSquares += v*v; }
    const voicedRatio = sumSquares > 0 ? (lowSumSquares / sumSquares) : 0;

    const now = Date.now();

    if(phase==="recording"){
      // ---- Ambient noise calibration ----
      // For a brief window right after recording starts, just sample the mic instead
      // of judging anything — this measures the room's actual noise floor (fan hum,
      // AC, mic self-noise) so the burst threshold below adapts to THIS mic/room
      // instead of a single fixed number that was too sensitive on noisy setups and
      // too insensitive on quiet ones.
      if(calibrationEndAt===0) calibrationEndAt = now + CALIBRATION_MS;
      if(now < calibrationEndAt){
        calibrationSamples.push(level);
      } else {
        if(calibrationSamples.length){
          const avgNoise = calibrationSamples.reduce((a,b)=>a+b,0)/calibrationSamples.length;
          voiceLevelThreshold = clamp(avgNoise + 0.06, 0.08, 0.35);
          calibrationSamples = [];
        }

        // Acoustic filler-burst detection: works off raw mic volume, independent of
        // speech-to-text, so a short "ahh"/"umm" sound is caught even when it never
        // becomes transcript text (the usual reason it went uncounted before). Uses
        // hysteresis (a lower "release" threshold than "attack" threshold) so a sound
        // hovering right at the line reads as one continuous burst instead of several
        // short flickering ones.
        const attackLevel = voiceLevelThreshold;
        const releaseLevel = voiceLevelThreshold * VOICE_RELEASE_RATIO;
        if(!voiceActive && level > attackLevel){
          voiceActive = true; voiceStartedAt = now;
          wordsAtVoiceStart = currentWordCount();
          voicedRatioSum = 0; voicedRatioSamples = 0;
          if(voicedRatio >= VOICED_RATIO_THRESHOLD) lastSpeechAt = now;
          // NOTE: this used to also reset lastSpeechAt (the long-pause clock) on any
          // loud-enough, voice-shaped sound. That made the pause clock far too easy
          // to keep refreshing from background noise (hums, coughs, chair creaks,
          // room echo) that isn't the speaker actually talking — a genuine long pause
          // could then never accumulate enough silent time to ever get flagged. The
          // pause clock is now driven only by actual recognized speech content (see
          // onresult) or manual typing; this burst tracker is used purely to catch
          // filler sounds (registerAcousticFiller below), independent of pause timing.
        } else if(voiceActive && level > releaseLevel){
          // still inside the same burst — keep tallying the voiced-ness of this frame
          voicedRatioSum += voicedRatio; voicedRatioSamples++;
        } else if(voiceActive){
          voiceActive = false;
          const burstMs = now - voiceStartedAt;
          const avgVoicedRatio = voicedRatioSamples ? (voicedRatioSum / voicedRatioSamples) : 0;
          // Short, vowel-like burst that might not turn into a recognized word -> queue
          // it for a grace-period check instead of deciding right away. Speech-to-text
          // (even interim results) commonly lags the actual sound by a few hundred ms,
          // so judging at this exact instant misread almost every ordinary short word
          // as a filler sound — this was the main reason fillers over-counted while
          // real speech recognition looked like it had stalled. The voiced-ratio check
          // is what keeps non-speech noise (taps, coughs, clicks) out of this path.
          if(burstMs >= BURST_MIN_MS && burstMs <= BURST_MAX_MS && avgVoicedRatio >= VOICED_RATIO_THRESHOLD){
            pendingBurstCheck = { wordsAtVoiceStart, checkAt: now + BURST_GRACE_MS };
            lastSpeechAt = now;
          }
        }
        if(pendingBurstCheck && now >= pendingBurstCheck.checkAt){
          if(currentWordCount() <= pendingBurstCheck.wordsAtVoiceStart){
            registerAcousticFiller();
          }
          pendingBurstCheck = null;
        }
      }
    }
  }
  draw();
}

function startRecognition(){
  if(!SR) return;
  recognition = new SR();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 4;
  recognition.lang = state.lang || "en-US";
  recognition.onresult = (e)=>{
    if(!gotAnyRecognitionResult){
      gotAnyRecognitionResult = true;
      consecutiveRecognitionErrors = 0;
      // Recognition just proved it's actually working - clear any diagnostic banner
      // that was shown while it looked silently stuck (only if manual mode wasn't
      // separately triggered by a fatal error, which owns this banner in that case).
      if(!manualMode) document.getElementById("manualModeWarning").style.display = "none";
    }
    let finalStr="", interimStr="";
    for(let i=e.resultIndex;i<e.results.length;i++){
      const result = e.results[i];
      const candidate = selectBestTranscriptCandidate(Array.from({length: result.length}, (_, idx)=>({
        transcript: result[idx].transcript,
        confidence: result[idx].confidence
      })), "");
      if(result.isFinal){
        finalStr = normalizeTranscriptText(finalStr ? `${finalStr} ${candidate}` : candidate);
      } else {
        interimStr = normalizeTranscriptText(candidate);
      }
    }
    // Only treat this as "not silent" when new/changed speech content actually
    // arrived. Chrome/Edge's continuous recognizer can re-fire onresult with the
    // exact same still-open interim hypothesis repeatedly even during real silence
    // (periodic internal re-evaluation) — resetting the pause clock on every single
    // firing regardless of content meant a genuine long pause could never
    // accumulate enough silent time to ever be flagged.
    const hasNewSpeechContent = !!finalStr || (interimStr && interimStr !== lastLiveInterim);
    if(hasNewSpeechContent) lastSpeechAt = Date.now();
    lastLiveInterim = interimStr; // track the still-open chunk in case recognition ends mid-utterance

    if(finalStr){
      transcript = mergeTranscriptSegment(transcript, finalStr);
      reconcileAcousticFillers(finalStr);
      lastLiveInterim = "";
    }

    // Analyze finalized transcript + interim (in-progress) words together so filler
    // words are detected the moment they're spoken, not only once finalized. Any
    // filler sound the recognizer never transcribed as text at all (the common case)
    // is still caught separately by the acoustic burst detector in drawWaveform.
    analyzeTranscript((transcript + " " + interimStr).trim());
    const liveTranscriptEl = document.getElementById("liveTranscript");
    liveTranscriptEl.innerHTML = escapeHtml(transcript) + ' <span style="color:var(--ink-faint)">' + escapeHtml(interimStr) + '</span>';
    liveTranscriptEl.scrollTop = liveTranscriptEl.scrollHeight;
  };
  const FATAL_RECOGNITION_ERRORS = new Set(["not-allowed","service-not-allowed","audio-capture"]);
  recognition.onerror = (e)=>{
    if(FATAL_RECOGNITION_ERRORS.has(e.error)){
      manualMode = true;
      document.getElementById("modeBadge").textContent = "manual typing mode (mic error: " + e.error + ")";
      document.getElementById("liveTranscript").style.display = "none";
      document.getElementById("manualTranscript").style.display = "block";
      document.getElementById("manualTranscript").oninput = (ev)=>{
        transcript = ev.target.value; lastSpeechAt = Date.now();
        analyzeTranscript(transcript);
      };
      recognition.onend = null;
      const warnEl = document.getElementById("manualModeWarning");
      document.getElementById("manualModeWarningText").textContent = "Speech recognition stopped working (" + e.error + "), so live transcription and mic-based filler/pause detection can't continue this session. Switched to manual typing — type below, or Rerecord once the mic issue is fixed.";
      warnEl.style.display = "block";
    } else if(!gotAnyRecognitionResult){
      // Non-fatal errors (e.g. "network", "no-speech", "aborted") don't stop recognition -
      // it just silently keeps retrying via onend -> restartRecognition below. Previously
      // that retry loop gave zero feedback, so a persistently failing recognizer (most
      // commonly because it can't reach the browser's cloud speech service, or the mic is
      // already claimed by another app/tab) looked exactly like "nothing is happening" with
      // no way to tell why. Surface it after a few failures in a row with no result yet.
      consecutiveRecognitionErrors++;
      if(consecutiveRecognitionErrors >= 3){
        const warnEl = document.getElementById("manualModeWarning");
        document.getElementById("manualModeWarningText").textContent = "Speech recognition keeps failing before picking up any words (repeated \"" + e.error + "\" errors) — it's still retrying automatically. This is usually a lost/blocked connection to the browser's speech service (Chrome/Edge send audio to the cloud to transcribe it, so it needs working internet), or the mic already being used by another app or browser tab. You can keep waiting, close other apps/tabs using the mic, check your connection, or Rerecord after fixing it - or type your speech in manually below.";
        warnEl.style.display = "block";
      }
    }
  };
  // Starting can throw (e.g. the browser's recognition service hasn't fully released
  // a previous session yet). A single retry is NOT reliable here: if that retry also
  // throws, there is no future onend event to trigger another attempt (onend only
  // fires from a session that actually started), so recognition would die silently
  // for the rest of the recording. Keep retrying with backoff instead, until it
  // succeeds or recording stops - this is what actually guarantees recognition
  // starts/resumes rather than just hoping a single attempt happens to work.
  // Used for BOTH the very first start and every restart, since an uncaught throw
  // from an unguarded first call previously aborted the rest of the Start button
  // handler outright — silently skipping the timer/pause-check interval setup below
  // it, which is what made the transcript, filler count, and long-pause detection
  // all appear completely dead at once.
  function safeStartRecognition(){
    if(phase!=="recording") return;
    try{
      recognition.start();
    } catch(err){
      let retryDelay = 300;
      const retry = ()=>{
        if(phase!=="recording") return;
        try{
          recognition.start();
        } catch(err2){
          retryDelay = Math.min(retryDelay * 1.5, 3000);
          setTimeout(retry, retryDelay);
        }
      };
      setTimeout(retry, retryDelay);
    }
  }
  recognition.onend = ()=>{
    // Chrome's SpeechRecognition can fire "onend" mid-utterance on its own — periodic
    // internal resets, brief network hiccups — even though the person never stopped
    // talking and phase is still "recording". Previously this just restarted the
    // recognizer and silently threw away whatever was still interim (not yet
    // finalized). Committing that pending chunk first means nothing spoken gets lost
    // across a restart, so the transcript stays accurate through the whole session.
    commitPendingInterim();
    safeStartRecognition();
  };
  safeStartRecognition();

  // Watchdog: if several seconds go by with neither a result NOR an error, the
  // recognizer is stuck completely silent — previously this gave zero feedback and
  // just looked like transcription/filler/pause detection had all stopped working.
  setTimeout(()=>{
    if(phase==="recording" && !manualMode && !gotAnyRecognitionResult){
      const warnEl = document.getElementById("manualModeWarning");
      document.getElementById("manualModeWarningText").textContent = "No transcription has come through yet and no error was reported either — the speech recognizer may be stuck. It's still retrying automatically; you can keep waiting, check your internet connection and mic permissions, Rerecord to try again, or switch to typing your speech in manually.";
      warnEl.style.display = "block";
    }
  }, 6000);
}

// Folds whatever speech is still "interim" (recognized but not yet finalized by the
// engine) into the permanent transcript, so nothing is lost if recording stops or the
// recognizer restarts before it finalizes.
function commitPendingInterim(){
  if(lastLiveInterim && lastLiveInterim.trim()){
    transcript = (transcript + " " + lastLiveInterim).trim();
  }
  lastLiveInterim = "";
}

function stopAll(){
  clearInterval(timerInterval); clearInterval(pauseCheckInterval);
  if(rafId) cancelAnimationFrame(rafId);
  if(recognition){ recognition.onend=null; try{recognition.stop();}catch(e){} }
  if(remoteRecorder && remoteRecorder.state !== "inactive"){
    try{ remoteRecorder.stop(); } catch(e){}
  }
  if(audioStream) audioStream.getTracks().forEach(t=>t.stop());
}

document.getElementById("startBtn").addEventListener("click", async ()=>{
  phase = "recording";
  updatePickLock();
  fired = { pause:false };
  violationEvents = 0; lastFillerBeepCount = 0; repeatRunsAlerted = new Set();
  acousticFillerCount = 0; unconfirmedAcousticFillers = []; voiceActive = false; voiceStartedAt = 0; wordsAtVoiceStart = 0; lastLiveInterim = ""; pendingBurstCheck = null;
  voicedRatioSum = 0; voicedRatioSamples = 0; lastAcousticFillerAt = 0;
  violationCapReached = false; violationCapTime = null;
  gotAnyRecognitionResult = false; consecutiveRecognitionErrors = 0;
  document.getElementById("capBadge").style.display = "none";
  document.getElementById("capBadge").textContent = "Limit reached at --";
  state.lang = document.getElementById("langSelect").value;
  saveState();
  document.getElementById("startBtn").style.display = "none";
  document.getElementById("stopBtn").style.display = "inline-block";
  document.getElementById("rerecordBtn").style.display = "inline-block";
  document.getElementById("langSelect").disabled = true;

  if(!manualMode){
    // Show a distinct "connecting" state while the browser's mic-permission prompt is
    // pending — timer and detection only actually begin once the mic is live, so the
    // status badge should say so instead of claiming RECORDING a beat early.
    document.getElementById("statusBadge").textContent = "🎙 Connecting mic…";
    document.getElementById("statusBadge").classList.remove("on");
    await startMicWaveform();
    startRemoteCapture();
    startRecognition();
  }
  else {
    document.getElementById("manualTranscript").oninput = (e)=>{
      transcript = e.target.value; lastSpeechAt = Date.now();
      analyzeTranscript(transcript);
    };
  }

  // The timer, pause-detection, and lastSpeechAt baseline all start together, right as
  // recording actually begins — not before — so the displayed time always matches what
  // was actually captured.
  lastSpeechAt = Date.now();
  document.getElementById("statusBadge").textContent = "● RECORDING";
  document.getElementById("statusBadge").classList.add("on");

  timerInterval = setInterval(()=>{
    elapsed++;
    document.getElementById("timerVal").textContent = fmtTime(elapsed);
    const pct = clamp((elapsed/sessionSeconds())*100, 0, 100);
    const fill = document.getElementById("timerProgressFill");
    if(fill) fill.style.width = pct + "%";
    updateStatsUI(transcript);
    const diagEl = document.getElementById("diagLine");
    if(diagEl){
      const silentSec = Math.round((Date.now()-lastSpeechAt)/1000);
      diagEl.textContent = `mode:${manualMode?"manual":"mic"} | recognized:${gotAnyRecognitionResult?"yes":"no"} | chars:${transcript.length} | acousticFillers:${acousticFillerCount} | silentFor:${silentSec}s | pauseThreshold:${pauseThresholdSec()}s | fillerThreshold:${fillerThreshold()}`;
    }
    if(elapsed>=sessionSeconds()) finishRecording();
  }, 1000);

  pauseCheckInterval = setInterval(()=>{
    if(phase!=="recording") return;
    const silentFor = (Date.now()-lastSpeechAt)/1000;
    const threshold = pauseThresholdSec();
    // How many whole "threshold-sized" chunks of the CURRENT silence gap have elapsed.
    // A single very long pause now keeps counting as multiple violations (one per extra
    // chunk of silence), instead of only ever flagging once no matter how long it runs.
    const currentMultiple = Math.floor(silentFor / threshold);
    if(silentFor>=threshold && currentMultiple>pauseMultiplier){
      // Give a last chance to catch a filler/repeat word that only just finished
      // being recognized - otherwise it gets misread as a long pause instead.
      // Must include the still-interim (not yet finalized) chunk here too, same as
      // every other analyzeTranscript call site - otherwise a filler/repeat word that
      // is still mid-recognition at this exact instant is invisible to this check and
      // gets wrongly logged as a long pause instead.
      const caughtSomethingElse = analyzeTranscript((transcript + " " + lastLiveInterim).trim());
      if(phase!=="recording") return;
      pauseMultiplier = currentMultiple;
      // Only flag this as a long pause (and only add its own violation) if the
      // last-chance check above didn't just catch a filler/repeat for this same
      // gap — otherwise the pause alert was overwriting that message and this
      // single gap was being counted as two violations instead of one.
      if(!caughtSomethingElse){
        violations.pauseCount++;
        registerViolation();
        flashAlert(`Long pause noted — ${Math.round(silentFor)}s of silence (speech continues).`);
      }
      updateStatsUI(transcript);
      return;
    }
    if(silentFor<=threshold) pauseMultiplier = 0;
  }, 400);
});

document.getElementById("stopBtn").addEventListener("click", ()=>finishRecording());
document.getElementById("cancelBtn").addEventListener("click", ()=>{
  stopAll();
  phase = "ready";
  updatePickLock();
  document.getElementById("recordCard").style.display = "none";
});
document.getElementById("rerecordBtn").addEventListener("click", ()=>{
  stopAll();
  resetRecordingUI();
  document.getElementById("langSelect").disabled = false;
});
document.getElementById("rerecordFromResultsBtn").addEventListener("click", ()=>{
  stopAll();
  resetRecordingUI();
  document.getElementById("langSelect").disabled = false;
  document.getElementById("recordCard").style.display = "block";
  document.getElementById("recordCard").scrollIntoView({behavior:"smooth", block:"start"});
});

async function finishRecording(){
  if(phase==="evaluating" || phase==="done") return;
  // Fold in any speech that was still "interim" (not yet finalized by the recognizer)
  // at the moment recording stopped — otherwise the last few words spoken right before
  // Stop/timeout never made it into the saved transcript.
  if(!manualMode) commitPendingInterim();
  const remoteTranscript = state.transcriptionApiUrl && !manualMode ? await transcribeWithRemoteApi(await stopRemoteCapture()) : "";
  stopAll();
  if(remoteTranscript){
    transcript = remoteTranscript;
  }
  phase = "evaluating";
  updatePickLock();
  document.getElementById("statusBadge").textContent = "EVALUATING...";
  document.getElementById("statusBadge").classList.remove("on");
  document.getElementById("stopBtn").style.display = "none";

  const result = heuristicEvaluation({
    transcript: transcript.trim(), topic: currentPick.topic, elapsedSec: elapsed, violations
  });
  showResults(result);
}
