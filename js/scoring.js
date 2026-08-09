/* ==================== SCORING & TEXT ANALYSIS ====================
   Pure functions: given a transcript (+ topic/elapsed time), work out filler counts,
   repeats, overused words, WPM, topic relevance, and the final heuristic scores/
   feedback. Nothing here touches the DOM directly. ==================== */
function countFillers(transcript){
  const lower = ` ${transcript.toLowerCase()} `;
  // Match longer multi-word phrases first so a phrase like "kind of like" claims its
  // full span before its own shorter components ("kind of", "like") can also match
  // inside that same span. Without this, one filler utterance such as "kind of like"
  // or "okay so" was being counted 2-3 times over (once per overlapping list entry).
  const words = currentFillerWords().slice().sort((a,b)=>
    b.split(/\s+/).length - a.split(/\s+/).length || b.length - a.length);
  const consumed = new Array(lower.length).fill(false);
  let total = 0;

  const claim = (start,end)=>{
    for(let i=start;i<end;i++){ if(consumed[i]) return false; }
    for(let i=start;i<end;i++) consumed[i]=true;
    return true;
  };

  words.forEach(w=>{
    const re = new RegExp(`\\b${w.replace(/ /g,"\\s+")}\\b`,"g");
    let m;
    while((m = re.exec(lower)) !== null){
      if(claim(m.index, m.index + m[0].length)) total++;
    }
  });

  // Catch non-lexical filler sounds ("um","uh","umm","uhh","hmm","erm","ah"...) on top of the
  // language word list above, so short vocalizations are never missed — also respecting spans
  // already claimed above so a sound can't be double-counted against a word match.
  const soundRe = new RegExp(FILLER_SOUND_REGEX.source, "gi");
  let sm;
  while((sm = soundRe.exec(lower)) !== null){
    if(claim(sm.index, sm.index + sm[0].length)) total++;
  }
  return total;
}
function detectImmediateRepeats(transcript, topic = ""){
  // Strip punctuation before comparing words — otherwise "yeah," and "yeah" (or a
  // trailing period on only one occurrence) are treated as different words and a
  // genuine repeat goes undetected.
  const topicWords = topicWordSet(topic);
  const words = transcript.toLowerCase().replace(/[^a-z0-9'\s]/g,"").split(/\s+/).filter(Boolean);
  // Returns EVERY maximal immediate-repeat run found (each tagged with the word and
  // the index it starts at), not just whichever single run is longest in the whole
  // transcript — so multiple separate repeat incidents (e.g. "the the the" ... later
  // ... "so so so") are each caught, instead of only the first/longest one ever seen.
  const runs = [];
  let i=0;
  while(i<words.length){
    const word = words[i];
    if(word.length<=1 || isTopicWord(word, topicWords)){ i++; continue; }
    let j=i;
    while(j+1<words.length && words[j+1]===word) j++;
    const runLen = j-i+1;
    if(runLen>=2) runs.push({ word, len: runLen, startIndex: i });
    i=j+1;
  }
  return runs;
}

// ---- Shared word-extraction + stopword handling (used by both topic-relevance scoring
// and repeated-word detection, so the two stay consistent). ----
const GLOBAL_STOPWORDS = new Set([
  "the","a","an","is","are","was","were","you","your","yours","of","to","in","on","and","or","for",
  "it","its","this","that","these","those","be","been","being","can","could","how","what","who","whom",
  "which","would","should","if","i","im","i'm","me","my","mine","we","our","ours","us","he","she","him",
  "her","his","hers","they","them","their","theirs","do","does","did","doing","have","has","had","having",
  "will","shall","not","no","yes","so","but","as","at","by","from","with","about","into","than","then",
  "there","here","when","where","why","because","also","very","really","just","only","even","all","any",
  "some","such","own","same","too","most","more","other","over","under","again","further","up","down",
  "out","off","once","am","get","got","going","go","one","two"
]);
function extractContentWords(text){
  return (text||"").toLowerCase().replace(/[^a-z0-9'\s]/g," ").split(/\s+/).filter(Boolean);
}
function stripIntroGreeting(text){
  return (text||"").trim().replace(/^(?:good\s+morning|good\s+afternoon|good\s+evening|good\s+day|hello|hi|hey|greetings|dear)(?:[\s,!.:-]+|$)/i, "");
}
function topicWordSet(topic){
  return new Set(extractContentWords(topic).filter(w=>!GLOBAL_STOPWORDS.has(w)).map(w=>normalizeTopicWord(w)));
}
function normalizeTopicWord(word){
  if(word.endsWith("s") && word.length>3) return word.slice(0,-1);
  return word;
}
function isTopicWord(word, topicWords){
  const normalized = normalizeTopicWord(word);
  return topicWords.has(normalized);
}
// Flags content words the speaker keeps reusing across the WHOLE speech (not just back-to-back),
// e.g. saying "basically" or a pet word many separate times. Words that are part of the topic
// title are deliberately excluded, since naturally repeating on-topic words isn't a violation.
function detectOveruseWords(transcript, topic){
  const topicWords = topicWordSet(topic);
  const fillerFlat = new Set(currentFillerWords().map(w=>w.replace(/\s+/g,"").replace(/[^a-z0-9]/gi,"").toLowerCase()));
  const words = extractContentWords(transcript);
  const freq = {};
  words.forEach(w=>{
    if(w.length<=2) return;
    if(GLOBAL_STOPWORDS.has(w)) return;
    if(isTopicWord(w, topicWords)) return;       // on-topic word — expected to repeat, not a violation
    if(fillerFlat.has(w.replace(/[^a-z0-9]/gi,"").toLowerCase())) return;       // already tracked separately as a filler word
    freq[w] = (freq[w]||0)+1;
  });
  return freq;
}
function computeWPM(transcript, elapsedSec){
  if(elapsedSec<=0) return 0;
  const words = transcript.trim().split(/\s+/).filter(Boolean).length;
  return Math.round((words/elapsedSec)*60);
}
function topicOverlapScore(transcript, topicText){
  const stop = new Set(["the","a","an","is","are","you","your","of","to","in","on","and","or","for","it","this","that","be","can","how","what","do","does","would","should","if","i"]);
  const normalize = w => {
    const cleaned = w.toLowerCase().replace(/[^a-z0-9]/g,"");
    return cleaned.endsWith("s") && cleaned.length>3 ? cleaned.slice(0,-1) : cleaned;
  };
  const norm = s => s.toLowerCase().replace(/[^a-z0-9\s]/g," ").split(/\s+/).filter(w=>w && !stop.has(w)).map(normalize);
  const cleanedTranscript = stripIntroGreeting(transcript);
  const topicWords = new Set(norm(topicText));
  const speechWords = norm(cleanedTranscript);
  if(topicWords.size===0 || speechWords.length===0) return 0.0;
  let hits=0; speechWords.forEach(w=>{ if(topicWords.has(w)) hits++; });
  const divisor = topicWords.size <= 3 ? topicWords.size : Math.max(6, topicWords.size);
  const ratio = clamp(hits / divisor, 0, 1);
  const minScore = topicWords.size <= 3 ? 0.5 : 0.35;
  const maxScore = 1;
  return clamp(minScore + ratio * (maxScore - minScore), 0, 1);
}


// Returns [[word,count], ...] sorted by count desc, only words that actually crossed the
// repeat threshold (so single/incidental uses of a word never show up as a "violation").
function overusedWordsList(overusedWords){
  if(!overusedWords) return [];
  return Object.entries(overusedWords)
    .filter(([,count])=>count>=repeatThreshold())
    .sort((a,b)=>b[1]-a[1]);
}

function heuristicEvaluation({ transcript, topic, elapsedSec, violations }){
  const words = transcript.trim().split(/\s+/).filter(Boolean);
  const unique = new Set(words.map(w=>w.toLowerCase().replace(/[^a-z0-9']/g,""))).size;
  const vocabScore = clamp(Math.round((unique/Math.max(1,words.length))*130), 20, 100);
  const wpm = computeWPM(transcript, elapsedSec);
  const { min: idealMin, max: idealMax } = idealWpmRange();
  const wpmScore = (wpm>=idealMin && wpm<=idealMax) ? 95 : clamp(100-Math.abs(wpm-(state.baseWPM||130))*0.8, 20, 90);
  const fluencyScore = clamp(wpmScore - violations.pauseCount*8 - violations.repeatCount*4, 15, 100);
  const grammarScore = clamp(90 - violations.fillerCount*5 - violations.repeatCount*6, 20, 98);
  const topicRel = topicOverlapScore(transcript, topic);
  const topicScore = Math.round(topicRel*100);
  const confidenceScore = clamp(88 - violations.pauseCount*10 - violations.fillerCount*3, 15, 97);
  const coherenceScore = clamp(Math.round((grammarScore+topicScore)/2), 15, 98);
  const overall = Math.round(grammarScore*0.2 + vocabScore*0.15 + fluencyScore*0.2 + coherenceScore*0.15 + confidenceScore*0.15 + topicScore*0.15);
  return {
    scores: { grammar:grammarScore, vocabulary:vocabScore, fluency:fluencyScore, coherence:coherenceScore, confidence:confidenceScore, topicRelevance:topicScore, overall },
    feedback: {
      strengths: [
        vocabScore>70 ? "Good vocabulary variety across the speech." : "Attempted the topic within the time limit.",
        (wpm>=idealMin && wpm<=idealMax) ? "Speaking pace was in the ideal range." : "Maintained a consistent pace."
      ],
      weaknesses: [
        violations.fillerCount>fillerThreshold() ? `Frequent filler words reduced clarity (${violations.fillerCount} counted).` : null,
        violations.pauseCount>0 ? `${violations.pauseCount} long pause(s) interrupted the flow.` : null,
        grammarScore<55 ? "Grammar and phrasing reduced the evaluation score." : null,
        overusedWordsList(violations.overusedWords).length
          ? `Repeated these words often (not part of the topic): ${overusedWordsList(violations.overusedWords).map(([w,c])=>`"${w}" (${c}x)`).join(", ")}.`
          : null,
        (topicScore<55 && words.length>=8) ? "Some parts drifted from the core topic." : null
      ].filter(Boolean),
      suggestions: [
        "Practice pausing silently instead of using filler words.",
        "Record yourself and review words-per-minute pacing weekly.",
        "Outline 3 key points before speaking to stay on-topic."
      ],
      practicePlan: "Do a 60-second impromptu speech daily this week, focusing on eliminating filler words and staying within 110-150 WPM.",
      motivational: "Solid effort — small, consistent practice reps will move your score fastest."
    }
  };
}
