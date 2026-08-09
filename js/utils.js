/* ==================== UTILS ====================
   Small stateless helper functions used across the other files. ==================== */
const clamp = (n,lo,hi)=>Math.max(lo,Math.min(hi,n));
function fmtTime(s){ return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`; }
function escapeHtml(str){ const d=document.createElement("div"); d.textContent=str; return d.innerHTML; }
function shuffleArray(arr){ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr; }
function normalizeTranscriptText(text){
  return (text || "").replace(/\s+/g, " ").trim();
}
function selectBestTranscriptCandidate(results, fallbackText = ""){
  const normalizedFallback = normalizeTranscriptText(fallbackText);
  const items = Array.isArray(results)
    ? results
    : (results ? [results] : []);

  const candidates = items
    .map(item => {
      if(typeof item === "string"){
        return { text: normalizeTranscriptText(item), confidence: 0 };
      }
      const transcript = item && typeof item === "object" && "transcript" in item ? item.transcript : item;
      return {
        text: normalizeTranscriptText(typeof transcript === "string" ? transcript : ""),
        confidence: typeof item?.confidence === "number" ? item.confidence : 0
      };
    })
    .filter(item => item.text);

  if(!candidates.length){
    return normalizedFallback;
  }

  return candidates.reduce((best, candidate) => {
    const candidateConfidence = Number(candidate.confidence) || 0;
    const bestConfidence = Number(best.confidence) || 0;
    if(candidateConfidence > bestConfidence){
      return candidate;
    }
    if(candidateConfidence === bestConfidence && candidate.text.length > best.text.length){
      return candidate;
    }
    return best;
  }, { text: "", confidence: -1 }).text || normalizedFallback;
}
function mergeTranscriptSegment(existingText, incomingText){
  const existing = normalizeTranscriptText(existingText);
  const incoming = normalizeTranscriptText(incomingText);
  if(!incoming) return existing;
  if(!existing) return incoming;
  const lowerExisting = existing.toLowerCase();
  const lowerIncoming = incoming.toLowerCase();
  if(lowerIncoming.startsWith(lowerExisting)){
    const suffix = incoming.slice(existing.length).trim();
    return suffix ? `${existing} ${suffix}`.trim() : existing;
  }
  if(lowerExisting.startsWith(lowerIncoming)) return existing;
  if(lowerIncoming.includes(lowerExisting)) return incoming;
  if(lowerExisting.includes(lowerIncoming)) return existing;
  return `${existing} ${incoming}`.trim();
}
