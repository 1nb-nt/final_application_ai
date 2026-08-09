/* ==================== CONFIG ==================== */
const FILLER_WORDS_BY_LANG = {
  // Per spec: only these count as fillers. "uh/uhh/um/umm/er/ah" are single vocal
  // sounds and are matched by FILLER_SOUND_REGEX below (so elongated real-speech
  // variants like "uhhh" or "ummm" are still caught); "like" and "you know" are
  // matched here as literal words/phrases. Grammatical words (the, a, an, is, are,
  // was, were, I, you, we, they, he, she, it, and, but, or, to, of, in, on, for,
  // with, etc.) are never in this list, so they're never flagged as fillers.
  "en-US": ["so","like","you know"],
  "hi-IN": ["matlab","vo","waise","bas"],
  "ta-IN": ["idhu","adhu","apparam"],
  "te-IN": ["ala","enti","ilanti"],
  "kn-IN": ["andre","enu","alva"],
  "ml-IN": ["athu","ith","aa pole"]
};
// Universal non-lexical filler *sounds* — catches the minimal pause/filler forms
// like "uh", "uhh", "um", "umm", "er", "ah" only. Longer vocalizations
// such as "ahhh", "uhhh", or "mmmm" are intentionally excluded from this
// transcription-based filler matcher.
const FILLER_SOUND_REGEX = /\b(?:um|umm|hm|hmm|er|erm|ah)\b/gi;
function currentFillerWords(){
  return FILLER_WORDS_BY_LANG[state.lang] || FILLER_WORDS_BY_LANG["en-US"];
}
function fillerThreshold(){ return state.fillerThreshold != null ? state.fillerThreshold : 2; }
function repeatThreshold(){ return state.repeatThreshold != null ? state.repeatThreshold : 3; }
function pauseThresholdSec(){ return state.pauseThresholdSec != null ? state.pauseThresholdSec : 3; }
// Acoustic filler-burst detection: works off raw mic volume, independent of speech-to-text,
// so a short "umm"/"ahh" sound is still caught even when the recognizer never turns it into
// transcript text (the main reason filler words were going uncounted before). This is far more
// reliable than trying to infer a filler from a timing gap, since interim recognition results
// keep refreshing lastSpeechAt while the person is still mid-utterance, so a silence-gap-based
// guess almost never gets the chance to fire.
const VOICE_LEVEL_THRESHOLD = 0.13; // avg frequency-bin level (0-1) counted as "vocal sound"
const VOICE_RELEASE_RATIO = 0.72;   // level must drop to threshold*this to end a burst (hysteresis —
                                     // stops a sound hovering right at the threshold from being read
                                     // as several short flickering bursts instead of one)
const BURST_MIN_MS = 90;            // shortened so quick fillers like "uh"/"um" are caught almost instantly.
const BURST_MAX_MS = 700;           // shorter upper bound keeps the detector focused on short vocal bursts.
const BURST_GRACE_MS = 220;         // shorter grace window means the detection is much more responsive.
                                     // since interim speech-to-text results normally lag the actual
                                     // sound by a few hundred ms — without this grace window, almost
                                     // every ordinary short word got misread as a filler sound because
                                     // the transcript hadn't caught up yet at the instant the burst ended.
const VOICED_RATIO_THRESHOLD = 0.33; // minimum share of a burst's energy that must sit in the low/vowel
                                     // band (see voiced-band calc below) for it to be treated as a
                                     // vowel-like "uh/um/ah" sound rather than generic noise. This was
                                     // 0.5, which — combined with the mic analyser's fairly coarse
                                     // frequency resolution — ended up rejecting plenty of genuine filler
                                     // sounds, not just noise. Lowered, and paired with a higher-resolution
                                     // analyser (see startMicWaveform in recording.js) so the ratio itself
                                     // is measured more accurately in the first place.
const ACOUSTIC_FILLER_COOLDOWN_MS = 400; // shortened so rapid filler sounds are not suppressed too much.
                                     // so one continuous noisy stretch (fan hum, traffic) can't be
                                     // chopped into several separate "filler" hits in quick succession
const NOISE_REJECT_VOICED_RATIO = 0.18; // minimum voiced-ness a loud moment needs before it's allowed to
                                     // reset the long-pause silence timer. Previously ANY sound over the
                                     // volume threshold — including clicks, taps, and broadband noise —
                                     // reset the "last speech" clock, which meant a real long pause during
                                     // a noisy room often never got flagged at all. Deliberately lower than
                                     // VOICED_RATIO_THRESHOLD (used to actually count a filler) so it only
                                     // screens out clearly non-vocal noise, not quiet speech.
function idealWpmRange(){
  const base = state.baseWPM || 130;
  return { min: base-20, max: base+20 };
}
function sessionSeconds(){ return state.sessionSeconds || 60; }

const DEFAULT_NAMES = [
  "Bhuvana","Lingesh TS","Jeya Krishnan","Jagan S","Sivakumar S N",
  "Karthick Saravanan","Karthik Thiyagarajan","Nithish Balaji","Jayashree Sankar",
  "Monaleesaa Karthikeyan","Kethireddy Sivane","Priyatharshini Aruna","Kiruthija Shandrakala",
  "Jeevanatham Balamurugan","Janarthanan K","Shiva Prashanth","A. Lakshmi","Kullayamma N.",
  "Akanksha Sree Mittapalli","Bhanu Vardhan Reddy Pentayala","Ajay Kumar",
  "Lakshan Vijaya Sekar","Yavvna Lakshmi","Ananyasree","Sandhiya Sri",
  "Srinithi","Santhoshkumar","Sanjay","Umesh"
];
const DEFAULT_TOPICS = [
  "A gadget you can't live without","How AI will change everyday work","The ethics of facial recognition",
  "A tradition you'd like to change","The impact of social media on friendships","Should voting be mandatory?",
  "A skill you want to learn this year","A failure that taught you something","How do you define success?",
  "A simple way to reduce waste","Should plastic packaging be banned?","Balancing economic growth and sustainability",
  "The best team you've worked with","Remote work vs office work","Is rapid growth always good for a company?",
  "If you could freeze time for a day","What makes a city feel like home","Is creativity teachable?",
  "The future of self-driving cars","How travel changes perspective"
];

const STORE_KEY = "speechsense_full_state_v2";
const SETTINGS_DEFAULTS = { sessionSeconds: 60, baseWPM: 130, beepEnabled: false, lang: "en-US", fillerThreshold: 3, repeatThreshold: 3, pauseThresholdSec: 3, transcriptionApiUrl: "" };
function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return Object.assign({}, SETTINGS_DEFAULTS, JSON.parse(raw));
  } catch(e){}
  return Object.assign({
    allNames: DEFAULT_NAMES.slice(), allTopics: DEFAULT_TOPICS.slice(),
    remainingNames: shuffleArray(DEFAULT_NAMES.slice()), remainingTopics: shuffleArray(DEFAULT_TOPICS.slice()),
    sessions: [], customBeepAudio: null
  }, SETTINGS_DEFAULTS);
}
function saveState(){ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
