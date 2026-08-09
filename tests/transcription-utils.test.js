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
    repeatThreshold: 2,
    pauseThresholdSec: 3,
    baseWPM: 130,
    sessionSeconds: 60
  },
  currentFillerWords: () => ['so', 'like', 'you know']
});

vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'utils.js'), 'utf8'), context);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'config.js'), 'utf8'), context);
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

test('detectImmediateRepeats ignores singular/plural topic words', () => {
  assert.equal(context.detectImmediateRepeats('color color color', 'colors and shape').length, 0);
});

test('detectImmediateRepeats ignores common filler words like so and like', () => {
  const repeats = context.detectImmediateRepeats('so so so like like like you know you know', 'public speaking');
  assert.equal(repeats.length, 0);
});

test('detectImmediateRepeats flags the third immediate non-exempt repetition', () => {
  const repeats = context.detectImmediateRepeats('important important important', 'public speaking');
  assert.equal(repeats.length, 1);
  assert.equal(repeats[0].len, 3);
});

test('detectOveruseWords counts three non-topic repetitions as an overuse violation candidate', () => {
  const result = context.detectOveruseWords('important important important', 'public speaking');
  assert.equal(result['important'], 3);
});

test('mergeTranscriptSegment avoids duplicate transcript material when interim commits', () => {
  const merged = context.mergeTranscriptSegment('Today I want', 'today I want to talk');
  assert.equal(merged, 'Today I want to talk');
});

test('detectOveruseWords ignores filler words and only flags true content overuse', () => {
  const result = context.detectOveruseWords('so so so like like like hello hello hello', 'public speaking');
  assert.equal(result['so'], undefined);
  assert.equal(result['like'], undefined);
  assert.equal(result['hello'], 3);
});

test('topicOverlapScore normalizes singular/plural when matching topic relevance', () => {
  const score = context.topicOverlapScore('The colors are bright and the color is nice', 'color');
  assert.equal(Math.round(score * 100), 100);
});

test('heuristicEvaluation flags grammar weakness when filler and repeat violations are high', () => {
  const result = context.heuristicEvaluation({
    transcript: 'um um um so so so this is a test of bad grammar',
    topic: 'public speaking',
    elapsedSec: 30,
    violations: { fillerCount: 4, repeatCount: 3, pauseCount: 0, overusedWords: {} }
  });
  assert.equal(result.feedback.weaknesses.some(w => w.includes('Grammar')), true);
  assert.equal(result.scores.grammar < 55, true);
});
