const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const context = vm.createContext({
  console,
  setTimeout,
  clearTimeout,
  Date,
  Math,
  Array,
  Object,
  String,
  Number,
  Boolean,
  RegExp,
  state: {
    lang: 'en-US',
    fillerThreshold: 2,
    repeatThreshold: 3,
    pauseThresholdSec: 3,
    baseWPM: 130,
    sessionSeconds: 60
  },
  currentFillerWords: () => [],
  repeatThreshold: () => 3
});

vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'utils.js'), 'utf8'), context);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'scoring.js'), 'utf8'), context);

test('selectBestTranscriptCandidate prefers the highest-confidence result', () => {
  const results = [
    { transcript: 'uh i think', confidence: 0.61 },
    { transcript: 'i think', confidence: 0.91 },
    { transcript: '', confidence: 0.2 }
  ];

  assert.equal(context.selectBestTranscriptCandidate(results), 'i think');
});

test('selectBestTranscriptCandidate falls back to normalized text when candidates are empty', () => {
  const results = [
    { transcript: '', confidence: 0.1 },
    { transcript: '   ', confidence: 0.0 }
  ];

  assert.equal(context.selectBestTranscriptCandidate(results, '   please try again   '), 'please try again');
});

test('selectBestTranscriptCandidate handles a single fallback transcript object', () => {
  assert.equal(context.selectBestTranscriptCandidate({ transcript: '   hello from fallback   ' }, 'ignored fallback'), 'hello from fallback');
});

test('detectImmediateRepeats ignores repeated words that are part of the topic title', () => {
  assert.equal(context.detectImmediateRepeats('leadership leadership leadership', 'leadership skills').length, 0);
});
