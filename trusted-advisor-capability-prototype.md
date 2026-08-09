 111# Trusted Advisor Capability Prototype
### A Simulation-Based Learning & Coaching System for High-Stakes Client Engagement

---

## 1. Executive Summary

Technical professionals earn a seat at the table through expertise. They earn a *permanent* seat — trusted-advisor status — through how they listen, think, decide, adapt, and speak under pressure. Most training addresses only the surface: presentation skills, grammar, "executive presence" workshops. None of these change how someone processes an ambiguous client statement in real time or decides whether to speak, ask, or wait.

This document specifies **TrustBuilder** (working name — see Section 2), a scenario-driven simulation and coaching prototype that trains and assesses six interlocking capabilities — Active Listening, Adaptive Thinking, Judgement & Restraint, Constructive Hypothesis Building, Professional Speech Excellence, and Language Accuracy — through a repeatable cycle: **Scenario → Response → Observation → Feedback → Retry → Reflection**.

The design is deliberately built to run first as a low-tech, facilitator-led pilot with 10–12 participants, then to grow into an AI-assisted, semi-automated coaching platform. Every section below is written so it can be handed directly to a learning-design team, an engineering team, or a facilitator cohort and acted upon.

---

## 2. Prototype Name and Positioning

**Name:** TrustBuilder — *"Technical credibility gets you in the room. These six capabilities keep you at the table."*

**Positioning statement:** TrustBuilder is not a communication-skills course and not a grammar tool. It is a rehearsal environment for the moments that determine whether a technically excellent professional is experienced by a client as a trusted advisor or merely a capable resource — the moment a client says something ambiguous, the moment new information invalidates a plan mid-conversation, the moment silence is the right answer.

**Category:** Behavioural simulation + AI-assisted coaching, positioned adjacent to (not a replacement for) technical training, communication-skills training, and mentorship programmes.

---

## 3. Problem Statement

Client-facing technical professionals are promoted and hired on technical merit but are evaluated by clients on trust. Trust breaks down in observable, repeatable ways:

- Professionals answer the *stated* request and miss the *underlying concern*.
- Professionals over-explain or speculate when a client challenges them, instead of pausing or deferring.
- Professionals cannot adapt cleanly when a client changes the conversation mid-stream — they either freeze or restart from scratch.
- Professionals present assumptions as facts, damaging credibility when the assumption turns out wrong.
- Professionals' spoken language — fillers, false starts, run-on sentences, grammar slips — undercuts otherwise sound thinking.

These are learnable, observable behaviours, not fixed traits. But they are almost never practised deliberately, because most organisations only create these high-stakes moments live, in front of the client, where the cost of a mistake is real and feedback is absent or too late to act on.

---

## 4. Target Users

**Primary:** data engineers, analysts, consultants, solution architects, project managers, subject-matter experts, and emerging client-facing professionals — typically technically strong, client-facing exposure still growing.

**Secondary:** engagement leads and delivery managers who need a structured way to develop their teams beyond "shadow me on calls," and L&D / capability teams who need a defensible, evidence-based development framework rather than a subjective one.

**Common starting difficulties:** speaking under pressure, interpreting unstated concerns, responding without a script, adapting mid-conversation, framing assumptions responsibly, deciding when to speak versus pause, stating a clear point of view, and maintaining grammatical control while speaking spontaneously.

---

## 5. Learning Philosophy

Eight design principles govern every exercise in the prototype:

| Principle | What it means in practice |
|---|---|
| **Practical, not theoretical** | Every module opens with a realistic client situation, not a definition slide. |
| **Behaviour-based** | Scoring cites specific words, pauses, or decisions — never "seemed confident." |
| **Integrated** | Capability-specific drills exist, but the centre of gravity is multi-capability integrated scenarios, because real conversations never test one skill in isolation. |
| **Progressive** | Difficulty moves from single-variable, low-ambiguity situations to multi-stakeholder, high-pressure, twist-laden ones. |
| **Developmental, not just evaluative** | Every score comes with a "what to do differently" — the system coaches, it doesn't just grade. |
| **Retry-based** | No scenario ends at first attempt; the unit of learning is attempt-one → feedback → attempt-two. |
| **Context-sensitive** | Speaking more, faster, or more confidently is not automatically rewarded — the right move (including staying silent) is scored as right. |
| **Evidence-based** | Feedback always anchors to what the participant actually said, asked, assumed, or omitted. |

---

## 6. Six-Capability Model

The six capabilities sit in three functional groups:

- **Perception layer** — Active Listening: what did the participant actually take in?
- **Cognition layer** — Adaptive Thinking, Judgement & Restraint, Constructive Hypothesis Building: what did they do with it?
- **Expression layer** — Professional Speech Excellence, Language Accuracy: how did it come out?

A weak perception layer makes the cognition layer irrelevant (you can't reason well about a concern you never heard). A weak expression layer makes strong cognition invisible to the client. The model treats all three layers as necessary and insufficient on their own — which is why integrated scenarios (Section 8), not isolated drills, are the centre of the design.

---

## 7. Capability-Specific Exercises

### 7.1 Active Listening

**Definition:** The ability to accurately register the client's stated request, the underlying business concern behind it, relevant emotional/stakeholder cues, and what has been left unsaid — without responding prematurely.

**Why it matters:** Every downstream capability depends on this. A perfectly reasoned, beautifully delivered answer to the wrong concern destroys trust faster than a rough answer to the right one.

**Target behaviours:** identifies stated request; identifies underlying concern; separates signal from distracting detail; notices emotional/stakeholder cues; names what wasn't said; withholds response until understanding is confirmed; summarises accurately; asks relevant clarifying questions.

**Common failure patterns:** answering the literal words only; jumping to a solution before the concern is understood; missing a stakeholder or political cue embedded in the message; treating a side comment as the main issue.

**Exercise format:** Audio or video client message (60–90 seconds) containing one explicit request, one unstated concern, one business-priority cue, one emotional cue, and 1–2 distracting details. Participant has 20 seconds of silence to think, then must respond.

**Sample scenario:** *"The dashboard is technically fine, but our leadership team is still not using it."*

**Participant task:** In under 90 seconds, state (a) what the client explicitly said, (b) what you believe is the underlying concern, and (c) one clarifying question you would ask before proposing anything.

**Expected strong response:** Names the literal statement (dashboard works technically), then surfaces 2–3 plausible underlying issues (adoption, relevance to current decisions, usability, stakeholder confidence) without picking one prematurely, and asks a targeted clarifying question, e.g. "When leadership does look at reporting today, where are they getting it from instead?"

**Possible weak response:** "I'll look into the technical performance and get back to you," or immediately proposes a UI redesign — both skip past the actual concern (adoption/relevance) entirely.

**Scoring criteria:** stated-request accuracy (0–2), underlying-concern identification (0–3), cue recognition (0–2), quality of clarifying question (0–2), premature-response penalty (–2 if participant proposes a solution before clarifying).

**Feedback format:** "You correctly identified [X]. You moved to a solution before confirming [underlying concern]. A stronger opening would have been: [model clarifying question]."

**Retry mechanism:** Same client message replayed with a slightly different distracting detail; participant re-attempts within the same session.

**Progression:** Beginner — single, obvious underlying concern. Intermediate — two plausible concerns, participant must hold both open. Advanced — conflicting stakeholder cues (e.g., sponsor and end-user want different things), participant must surface the tension itself.

---

### 7.2 Adaptive Thinking

**Definition:** The ability to recognise that a situation has changed mid-conversation and revise a response coherently — without restarting from a script or freezing.

**Why it matters:** Client conversations are rarely static. The professional who can only execute a rehearsed answer loses credibility the moment the premise shifts.

**Target behaviours:** notices the change explicitly; retains relevant parts of the prior reasoning rather than discarding everything; revises the recommendation with visible logic; stays composed when challenged; avoids visibly restarting or contradicting itself without acknowledgment.

**Common failure patterns:** ignoring the new information and continuing the original answer; over-correcting and abandoning sound prior reasoning entirely; visibly flustered restart ("Um, so, actually...").

**Exercise format:** Live scenario with a scripted mid-conversation twist delivered by facilitator or system at a fixed timestamp (e.g., "Actually, the CFO just joined and cost is no longer the concern — compliance risk is").

**Sample twists:** priority changes; senior stakeholder joins; deadline shortens; cost stops being the driver; regulatory risk becomes primary; client rejects the first recommendation; new evidence contradicts the participant's assumption.

**Participant task:** Continue the conversation, explicitly acknowledging the shift, and revise the recommendation in under 60 seconds without restarting from zero.

**Expected strong response:** "Given that compliance risk is now the priority, the timeline analysis I gave still holds, but I'd reorder our approach — starting with the audit trail requirement before the dashboard rebuild." (Names the shift, keeps what's still valid, revises what isn't.)

**Possible weak response:** Ignoring the new information and continuing to discuss cost; or discarding the entire prior answer and starting over as if nothing had been said before.

**Scoring criteria:** shift acknowledged explicitly (0–2), relevant prior reasoning retained (0–2), revision logically connected to new information (0–3), composure under the twist (0–2), time-to-adapt (0–1).

**Feedback format:** "You caught the shift to compliance risk. You didn't carry forward your original point about the timeline, which was still valid — next time, keep what still applies and state explicitly what changes."

**Retry mechanism:** Same base scenario, different twist type, to test transfer rather than memorisation.

**Progression:** Beginner — one twist, clearly signalled. Intermediate — two sequential twists. Advanced — twist is implicit (participant must infer the shift from a stakeholder's tone or a passing comment, not an explicit statement).

---

### 7.3 Judgement and Restraint

**Definition:** The ability to choose the right action among several — respond now, ask first, pause, defer, or stay silent — rather than defaulting to speaking.

**Why it matters:** In high-stakes settings, the fastest answer is often the most damaging one. Restraint is a skill, not an absence of confidence, and it is chronically under-trained because most training implicitly rewards talking.

**Target behaviours:** recognises when more information is needed before answering; avoids unsupported speculation; states uncertainty honestly; defers to a better-placed colleague when appropriate; does not interrupt; avoids over-explaining; recognises when silence serves the client; escalates appropriately; protects trust in sensitive moments.

**Common failure patterns:** answering confidently on insufficient information; filling silence out of discomfort; failing to escalate a genuinely serious issue; deferring so often it reads as lack of ownership.

**Exercise format:** Decision-point scenario. Conversation pauses at a critical moment; participant selects from a labelled action menu (respond immediately / ask a clarifying question / acknowledge and pause / defer to a colleague / validate before responding / give a limited answer / stay silent temporarily) and then must justify the choice in one or two sentences.

**Sample scenario:** A client asks, in a leadership review, whether a known data-quality issue affected a report already sent to the board — and the participant does not yet know the answer.

**Participant task:** Choose an action and justify it in under 30 seconds.

**Expected strong response:** "I don't have that confirmed yet, and given this affects a board-level report, I'd rather verify precisely which figures were impacted before I answer, than give you an approximate answer now. I can have that back to you by end of day." (Selects "acknowledge and pause / limited answer," names the reason, gives a concrete next step.)

**Possible weak response:** Guessing an extent of impact without verification, to appear responsive.

**Scoring criteria:** action-appropriateness for the stakes (0–3), reasoning quality (0–2), avoidance of unsupported claims (0–2, penalty-weighted), professionalism of the "no" or "not yet" (0–2), follow-through commitment stated (0–1).

**Feedback format:** "You chose to give a limited answer rather than guess — right call given board exposure. Make the follow-up commitment more specific (a time, not just 'soon')."

**Retry mechanism:** Same decision point, escalating stakes (informal check-in → leadership call → written record requested), to test whether judgement holds under increasing pressure.

**Progression:** Beginner — obvious high-stakes moment, clear "don't guess" cue. Intermediate — ambiguous stakes, participant must judge whether the moment is actually high-stakes. Advanced — pressure to speak from a peer or senior colleague in the room, testing whether restraint holds under social pressure, not just client pressure.

---

### 7.4 Constructive Hypothesis Building

**Definition:** The ability to propose a plausible explanation for an incompletely-understood situation, clearly flagged as a hypothesis rather than fact, together with what evidence would confirm or disconfirm it.

**Why it matters:** Technical professionals often default to either false certainty ("it's definitely X") or unhelpful vagueness ("could be a lot of things"). Neither builds trust. The middle path — reasoned, falsifiable hypotheses — is what senior advisors do instinctively and what this module makes explicit and practisable.

**Target behaviours:** separates observation from assumption; states a hypothesis as a hypothesis, not a conclusion; generates at least one credible alternative explanation; names the evidence needed to validate; proposes a concrete next action; revises the hypothesis cleanly when new information arrives.

**Common failure patterns:** presenting a guess as a fact; generating only one explanation and anchoring on it; no validation plan attached; hypothesis restated instead of revised when challenged.

**Exercise format:** Structured written or spoken response using the frame **Observation → Hypothesis → Evidence Required → Next Action**.

**Sample scenario:** "Adoption has declined over the past two months."

**Participant task:** Produce one primary hypothesis, one or two alternative hypotheses, the evidence required to validate each, and a validation plan — in under three minutes.

**Expected strong response:** "Adoption dropped over two months [observation]. One possibility is that the dashboard no longer reflects the metrics leadership currently prioritises [hypothesis 1]; another is that a recent org change moved the primary users elsewhere [hypothesis 2]. I'd validate the first by comparing dashboard metrics against recent reporting requests, and the second by checking usage by team over that period [evidence required]. I'd start with the usage-by-team breakdown since it's fastest to pull [next action]."

**Possible weak response:** "Adoption probably dropped because the dashboard is outdated" — stated as fact, single explanation, no validation plan.

**Scoring criteria:** observation stated cleanly and separately (0–1), hypothesis explicitly flagged as such (0–2), at least one credible alternative offered (0–2), evidence requirement specific and testable (0–2), next action concrete and prioritised (0–2), revision quality when new data is introduced (0–2, tested on retry).

**Feedback format:** "Good separation of observation and hypothesis. Your alternative hypothesis was vague — 'other factors' isn't falsifiable. Name a specific alternative next time."

**Retry mechanism:** New information is introduced (e.g., "usage by team shows no change") and the participant must revise or discard the leading hypothesis in real time.

**Progression:** Beginner — one clean hypothesis with obvious evidence. Intermediate — two competing, similarly plausible hypotheses. Advanced — a hypothesis must be revised live after new, partially contradictory evidence.

---

### 7.5 Professional Speech Excellence

**Definition:** The ability to deliver spoken responses that are fluent, structured, concise, and carry a clear point of view connected to business outcomes.

**Why it matters:** Sound thinking that arrives through fillers, false starts, and drift is heard by clients as a lack of confidence or preparation, regardless of the underlying quality of the reasoning.

**Target behaviours and errors tracked:** fillers, repeated words, prolonged pauses, false starts, sentence completion, topic deviation, pace, fluency, conciseness, clarity, professional tone, response structure, executive presence, and delivery of a clear point of view.

**Staged build:**

- **Stage 1 — Continuity:** Participant sustains one complete thought, 45–60 seconds, without excessive fillers, repetition, or long dead pauses. Pass threshold: fillers under an agreed rate, no unresolved sentence fragments.
- **Stage 2 — Control:** Participant structures a 90-second response with a clear opening, body, and close; no false starts; no unrelated drift; limited to the two or three most relevant points.
- **Stage 3 — Influence:** Participant delivers a 2-minute response that states a clear recommendation, ties it explicitly to a business outcome, and proposes a next step that moves the conversation toward a decision.

**Sample scenario (Stage 3):** Defend a recommendation to delay a feature launch by two weeks, to a client who is visibly frustrated about the timeline.

**Expected strong response:** Opens with the recommendation, states the business reason in one sentence, acknowledges the client's frustration directly, and closes with a specific next step and date.

**Possible weak response:** Meandering explanation of technical reasons with no clear opening statement, ending without a next step.

**Scoring criteria:** filler rate, pause analysis, sentence completion rate, structural clarity (opening/body/close present), conciseness (time-to-point), tone, and presence of an explicit point of view and next step.

**Feedback format:** Transcript-anchored — e.g., "At 0:14 you restarted the sentence three times before completing the thought. Your close lacked a specific next step — add one."

**Retry mechanism:** Same prompt, participant self-reviews their own transcript/recording before the second attempt.

**Progression:** the three stages above function as the beginner→advanced ladder for this capability specifically.

---

### 7.6 Language Accuracy

**Definition:** Grammatical and structural precision in spontaneous, real-time spoken or written client communication — assessed within realistic scenarios, not as isolated grammar drills.

**Recurring patterns tracked:** subject–verb disagreement, tense inconsistency, modal redundancy ("can able to"), incorrect auxiliary usage, sentence fragments, double comparatives, unclear pronoun references, preposition errors, article omission, excessive/run-on sentence length, informal or unsuitable register.

**Exercise format:** Errors are tagged automatically (or by facilitator) from the same recordings/transcripts used in Sections 7.1–7.5 — language accuracy is never assessed in isolation from a real client scenario.

**Personal language profile example:**
- frequently restarts sentences
- uses "can able to"
- omits articles
- produces long, loosely connected sentences
- shifts tense mid-explanation
- relies on repetitive vocabulary

**Scoring criteria:** error frequency per 100 words, error-type distribution, register appropriateness, self-correction rate (did the participant catch and fix their own error?).

**Feedback format:** Pattern-based, not error-by-error: "Your most frequent pattern is tense-shifting mid-explanation, roughly twice per response. Try anchoring your explanation in the present tense unless you're explicitly describing something that already happened."

**Retry mechanism:** Targeted micro-drills generated from the individual's top 2–3 recurring patterns, embedded in the next scenario rather than delivered as standalone grammar exercises.

**Progression:** Beginner — isolated, obvious errors flagged. Intermediate — pattern-level feedback across several sessions. Advanced — self-monitoring; participant is asked to flag their own errors in a played-back recording before the system does.

---

## 8. Integrated Scenario Architecture

### 8.1 Scenario Library (representative set)

| # | Scenario | Primary Capabilities Tested |
|---|---|---|
| 1 | Unhappy client, missed expectations | Listening, Restraint, Speech |
| 2 | Delayed delivery, client escalation | Restraint, Speech, Language Accuracy |
| 3 | Ambiguous requirements at kickoff | Listening, Hypothesis Building |
| 4 | Changing scope mid-project | Adaptive Thinking, Restraint |
| 5 | Production failure, live incident call | Restraint, Speech, Hypothesis Building |
| 6 | Regulatory risk surfaces mid-engagement | Adaptive Thinking, Restraint |
| 7 | Disagreement over priorities between stakeholders | Listening, Adaptive Thinking |
| 8 | Senior leadership review | All six |
| 9 | Proposal defence | Speech, Hypothesis Building, Restraint |
| 10 | Client escalation to your manager | Restraint, Speech |
| 11 | Request outside agreed scope | Judgement, Speech |
| 12 | Technical feasibility vs. business urgency conflict | Adaptive Thinking, Hypothesis Building |
| 13 | Low adoption of a delivered solution | Listening, Hypothesis Building |
| 14 | Data-quality concern surfaces live | Restraint, Hypothesis Building |
| 15 | Pressure for an immediate answer, insufficient evidence | Judgement and Restraint |

### 8.2 Scenario Specification Template

Every scenario in the library is authored against this fixed structure so that content can scale without redesigning the assessment engine each time:

```
Title:
Business context:
Stakeholder role (played by facilitator/AI):
Participant role:
Stated client concern:
Underlying concern (not visible to participant):
Available information:
Missing information:
Emotional tone:
Capability(ies) tested:
Expected response time:
Response format (spoken / written / decision-menu):
Scoring dimensions:
Possible conversation twists:
```

### 8.3 Integrated High-Stakes Scenarios (minimum three, fully specified)

**Integrated Scenario A — "The Leadership Challenge"**
A senior client challenges the validity of a recommendation live, on a leadership call.
The participant must: listen without becoming defensive → identify the real concern behind the challenge → ask a clarifying question if needed → adapt the explanation for a more senior, less technical audience → clearly separate fact from hypothesis in the original recommendation → avoid unsupported claims under pressure → respond concisely → maintain grammatical control while under stress → close with one specific next step.
*Scoring:* each of the nine behaviours above is scored independently and rolled up into capability-level scores (Listening, Adaptive Thinking, Judgement, Hypothesis Building, Speech, Language Accuracy all fire simultaneously here).

**Integrated Scenario B — "The Silent Escalation"**
A client raises a concern indirectly (via a passing comment, not a direct complaint) during a routine status call, and a second, more senior stakeholder is on the call but has said nothing.
The participant must: notice the indirect cue → decide whether and how to address it live versus offline → judge whether the silent senior stakeholder needs to be addressed directly → avoid over-explaining to fill the silence → propose a next step scaled appropriately to who is in the room.

**Integrated Scenario C — "The Contradicted Assumption"**
Mid-proposal-defence, the client presents data that contradicts a core assumption behind the participant's recommendation.
The participant must: register the contradiction without being defensive → distinguish which parts of the recommendation still hold and which don't → revise the hypothesis live, using the Observation → Hypothesis → Evidence Required → Next Action frame → communicate the revision concisely and with a clear point of view → maintain composure and language accuracy throughout.

A fully worked run-through of Scenario A appears in Section 22.

---

## 9. Assessment and Scoring Framework

### 9.1 Five-Level Proficiency Scale

1. **Emerging** — inconsistent or largely absent target behaviours.
2. **Inconsistent** — target behaviour appears sometimes, not reliably, and not under pressure.
3. **Functional** — target behaviour reliably present in standard situations.
4. **Strong** — target behaviour present even under ambiguity or pressure.
5. **Trusted-Advisor Level** — target behaviour is integrated, proactive, and shapes how the client experiences the interaction.

### 9.2 Behaviour-Specific Indicators (worked example: Active Listening)

| Level | Indicator |
|---|---|
| Emerging | Misses the core concern; responds mainly to surface-level information. |
| Inconsistent | Sometimes identifies the underlying concern, but inconsistently and often only when it's explicit. |
| Functional | Understands the stated requirement and asks at least one relevant clarification question. |
| Strong | Identifies both stated and unstated concerns and confirms understanding before responding. |
| Trusted-Advisor Level | Identifies stated and unstated concerns, acknowledges stakeholder context, clarifies intelligently, and reframes the issue in business terms. |

The same five-level, behaviour-specific structure is authored for each of the other five capabilities before pilot launch (Section 19 MVP scope includes this as a required deliverable, not optional).

### 9.3 Scoring Model Components

- Capability score (1–5, per capability)
- Behavioural evidence (verbatim or paraphrased anchor for the score)
- Communication evidence (from Speech / Language Accuracy tracking)
- Critical errors (flagged separately — e.g., unsupported claim in a board-level context — because a single critical error can outweigh an otherwise strong response)
- Strengths (2–3 per session)
- Development priority (the single highest-leverage focus area, not a list)
- Quality of retry (did the second attempt actually address the feedback?)
- Improvement between attempts (delta, not just absolute score)

The system deliberately avoids a single overall composite score as the primary output — six capability scores plus a named development priority is more actionable than one number.

---

## 10. Feedback and Retry Model

### 10.1 Three Feedback Layers

**Thinking:** Did the participant understand the business problem? Identify the real concern? Separate fact from assumption? Reason logically? Connect the response to business outcomes?

**Behaviour:** Did they listen? Adapt? Show judgement? Demonstrate restraint? Take ownership? Close the loop?

**Communication:** Was the response clear, concise, well structured, grammatically accurate, and professional in tone? Did the participant sound credible?

Every feedback report states: what worked, what reduced effectiveness, the exact behaviour to change, a stronger alternative response (modelled, not just described), and one specific focus for the retry.

### 10.2 Retry and Reflection Cycle

1. Review feedback.
2. Identify one or two specific changes to make.
3. Repeat the scenario or attempt a close variation.
4. Compare the two responses side by side.
5. Record what changed.
6. Define the next development goal.

The system displays first-attempt behaviour, second-attempt behaviour, the capability-level improvement, any unresolved issues, and a recommended next scenario.

**Reflection prompts:** What did I initially miss? What assumption did I make? Where should I have paused? How did I adapt? What changed in my second response? What will I apply in a real client interaction?

---

## 11. Participant Journey

1. Orientation
2. Baseline assessment
3. Individual capability profile generated
4. Capability-specific practice (Section 7 modules)
5. Integrated simulations (Section 8)
6. Feedback
7. Retry
8. Reflection
9. Coaching discussion (facilitator or manager)
10. Progress review
11. Final assessment
12. Development plan

## 12. Facilitator Journey

1. Assign scenarios (individually or cohort-wide).
2. Observe responses (live or recorded).
3. Review system-generated evidence (transcripts, flagged behaviours, auto-scores).
4. Adjust scores where human judgement overrides system output — critical for Judgement & Restraint, which the system should never auto-score alone (see Section 16).
5. Provide coaching comments.
6. Assign targeted practice based on the individual's development priority.
7. Compare attempt one vs. attempt two.
8. Monitor progress across the cohort.
9. Generate reports (Section 18).

---

## 13. Prototype Screens

| Screen | Purpose | Key info displayed | User actions | Data captured |
|---|---|---|---|---|
| Participant dashboard | Home view of progress | Capability radar, next scenario, streaks | Start scenario, view profile | Session history |
| Facilitator dashboard | Cohort oversight | Cohort heatmap, flagged sessions, pending reviews | Assign, review, comment | Cohort-level scores |
| Scenario selection | Choose/receive next scenario | Scenario title, capability tags, difficulty | Select, start | Selection choice |
| Scenario briefing | Set context before response | Business context, stakeholder role, participant role | Confirm ready | Time-to-start |
| Audio/video prompt | Deliver the client stimulus | Playable client message | Play, replay (limited), proceed | Replays used |
| Live response recording | Capture participant response | Timer, recording indicator | Record, stop, submit | Audio/video/transcript |
| Conversation-twist | Deliver mid-scenario change | Twist message, resume timer | Acknowledge, continue response | Time-to-adapt |
| Judgement decision | Force an explicit choice | Action menu (respond/ask/pause/defer/etc.) | Select action, justify | Chosen action + rationale |
| Hypothesis workspace | Structured hypothesis entry | O→H→E→A frame fields | Fill fields, submit | Structured text entry |
| Feedback screen | Deliver three-layer feedback | Thinking/Behaviour/Communication panels, evidence quotes | Review, acknowledge, mark focus area | Feedback viewed/actioned |
| Retry screen | Second attempt | Same/variant scenario, focus-area reminder | Record retry | Retry recording |
| Reflection screen | Capture participant reflection | Reflection prompts | Write short responses | Reflection text |
| Individual capability profile | Six-capability view over time | Radar chart, trend lines | Filter by date/scenario | — |
| Personal language profile | Recurring language patterns | Error-type frequency, examples | View, request drills | — |
| Progress tracker | Longitudinal view | Baseline vs. current, attempt deltas | Filter, export | — |
| Facilitator report | Cohort + individual summary | Trends, gaps, high performers, at-risk | Export, share | — |

---

## 14. MVP Scope

**MVP includes:**
- 10–12 participants
- Six capability-specific scenarios (one per capability, Beginner level)
- Three integrated scenarios (Section 8.3)
- One baseline assessment, two practice cycles, one end-line assessment
- Individual capability profiles (manually compiled is acceptable)
- Facilitator-led role plays with structured observation sheets
- Audio recording of all sessions
- Manual scoring against the five-level rubric, supported by AI-generated transcripts and basic flagging (fillers, obvious grammar patterns) — not full automated scoring
- Pre- and post-programme comparison report

**Explicitly NOT required for MVP:** adaptive scenario branching, automated hypothesis-quality scoring, real-time speech analytics dashboards, a mobile app, or a fully automated facilitator report.

## 15. Phase 2 Enhancements

- Automated filler/pause/repetition detection at scale
- Automated grammar-pattern detection feeding the personal language profile
- Basic scenario branching driven by participant response type
- Facilitator score-adjustment workflow with audit trail
- Cohort-level dashboards with trend analysis
- Expanded scenario library (25–30 scenarios covering the full list in Section 8.1)

## 16. Human Facilitator Role (retained at every phase, including full automation)

Some elements must never be fully automated, regardless of how far the AI layer develops:

- Judging client sensitivity and appropriateness of tone in context
- Final call on Judgement & Restraint scores in ambiguous cases — the system can flag a likely-weak decision, but whether restraint was *appropriate* is a human judgement
- Assessing the appropriateness of silence, which is highly context-dependent
- Reading stakeholder-awareness cues that depend on organisational knowledge the system doesn't have
- Evaluating the quality of business reasoning, not just its structure
- Any assessment with reputational or ethical stakes (e.g., a scenario touching on a real client relationship)

---

## 17. AI and Technology Architecture

**AI/technology can reliably support:**
- Speech-to-text transcription
- Filler, repeated-word, and pause detection
- Grammar-pattern analysis (feeding the personal language profile)
- Response-structure analysis (opening/body/close detection)
- Labelling of hypothesis-frame components (is there an observation, a flagged hypothesis, stated evidence, a next action?)
- Detection of clarification questions
- Basic scenario branching logic
- Generation of first-draft feedback text (facilitator-reviewed before release)
- Attempt-to-attempt performance comparison
- Dashboard and report generation

**Suggested architecture (high level):** stimulus library (audio/video prompts + scenario metadata) → response capture (audio/video/text) → transcription layer → pattern-detection layer (fillers, grammar, structure) → draft-scoring layer (proposes scores against the five-level rubric with evidence citations) → facilitator review/override layer → participant-facing feedback and profile layer → reporting layer.

The draft-scoring layer should never auto-publish scores for Judgement & Restraint or Constructive Hypothesis Building without facilitator sign-off, given the judgement-dependence described in Section 16.

---

## 18. Reports and Dashboards

**Individual Participant Report:** name, baseline profile, six capability scores, behavioural evidence, language profile, strengths, development areas, first-attempt vs. retry comparison, progress summary, recommended development plan.

**Facilitator Report:** participant-level observations, cohort trends, common capability gaps, common language patterns, high performers, participants requiring support, scenario difficulty calibration, recommended interventions.

**Leadership Summary:** programme objective, cohort capability baseline, improvement achieved, business relevance, key risks, emerging strengths, recommendations for scale-up.

---

## 19. Pilot Plan

**Design:** 10–12 participants across 2–3 client-facing role types (e.g., analysts, solution architects, PMs) to test whether scenarios generalise across roles.

**Facilitator calibration:** before the pilot, facilitators independently score 3–5 recorded sample responses against the rubric and reconcile discrepancies, to establish inter-rater consistency before live scoring begins.

**Sequence:** orientation → baseline assessment → practice cycle 1 (capability-specific) → coaching checkpoint → practice cycle 2 (integrated scenarios) → end-line assessment → individual and facilitator reports → participant and stakeholder feedback collection.

**Validation activities:** scenario-validity review (do scenarios feel realistic to actual client-facing staff?), usability testing of the screens in Section 13, participant feedback on the retry/reflection cycle, manager feedback on any observed change in real client interactions post-pilot.

---

## 20. Success Metrics

- Measurable improvement in capability scores, baseline to end-line
- Reduction in filler/false-start rate
- Improvement in quality of clarifying questions asked (rubric-scored)
- Stronger hypothesis framing (explicit hypothesis-flagging rate, alternative-hypothesis generation rate)
- Improved judgement decisions (appropriate-action selection rate in decision-point scenarios)
- Greater conciseness (time-to-point in Speech Excellence scenarios)
- Improved language accuracy (error rate per 100 words)
- Positive facilitator and/or manager observation of transfer to real client interactions

---

## 21. Risks and Mitigation

| Risk | Mitigation |
|---|---|
| Scoring feels subjective, undermining trust in the system | Facilitator calibration exercise before pilot; behaviour-specific rubrics (Section 9.2) instead of generic descriptors |
| Participants game the rubric ("perform" restraint or listening without internalising it) | Vary scenarios across attempts; weight integrated scenarios, which are harder to game, more heavily than isolated drills |
| Over-automation removes the human judgement that matters most | Section 16 explicitly reserves Judgement & Restraint and ethical/sensitivity calls for facilitators at every phase |
| Participants find repeated recording/scrutiny stressful, reducing psychological safety | Frame retries as expected and normal, not remedial; keep early scenarios low-stakes; facilitator debriefs are coaching conversations, not performance reviews |
| Scenario library becomes stale or unrealistic | Refresh scenarios from real (anonymised) engagement situations each pilot cycle |
| Language-accuracy feedback feels like "grammar policing" rather than professional development | Always deliver language feedback embedded in a real scenario and framed pattern-level, never as isolated grammar correction (Section 7.6) |

---

## 22. Sample End-to-End Scenario (Fully Worked)

**Scenario:** Integrated Scenario A — "The Leadership Challenge" (Section 8.3)

**Business context:** A mid-sized retail client has been receiving weekly demand-forecasting reports from the participant's team for two months. On a leadership review call, the client's VP of Operations — new to the account — challenges the forecasting model's validity in front of their CFO.

**Stakeholder line (delivered by facilitator/AI):**
*"I've looked at the last three forecasts and they've all overshot actual demand by 15–20%. Before we go further, I need to understand why we should trust this model at all."*

**Participant role:** Solution architect who built the forecasting approach but did not personally run the last three forecasts.

**Underlying concern (not stated directly):** The VP is new, has not been briefed on a known seasonal adjustment issue the team is already aware of, and is testing whether this team is credible before a larger renewal decision.

**Attempt 1 (typical weak-to-mid response):**
*"So the model uses a standard time-series approach with seasonal adjustments, and there was actually a known issue with the holiday calendar mapping that we identified — it's not really a fundamental problem with the model, it's more of a data input issue that we're already fixing, so I wouldn't say the model isn't trustworthy, it's more that this specific input needs correcting."*

**Observation (system + facilitator, three-layer feedback):**

- *Thinking:* Correctly identifies a real, specific cause (the calendar mapping issue) — good technical grounding. But the response defends the model before confirming what the VP actually needs to hear, and doesn't address the underlying concern (should this VP trust the team going forward).
- *Behaviour:* No acknowledgment of the VP's frustration or the fact that this is their first exposure to the account. Reads as defensive rather than confident. No explicit next step or commitment offered.
- *Communication:* Run-on sentence (one 50+ word sentence with three clauses joined by "and"/"so"); no clear opening statement of the answer; buries the key fact (known, fixable issue) in the middle of the sentence.

**Judgement & Restraint note:** This was an appropriate moment to *respond*, not defer or stay silent — the participant had the relevant fact. The gap isn't judgement about whether to speak; it's structure and framing.

**Feedback delivered to participant:**
- *What worked:* You have the right fact — this is a known, fixable data issue, not a fundamental model flaw. That's exactly the kind of hypothesis-with-evidence answer this situation needs.
- *What reduced effectiveness:* You led with mechanism instead of the headline. You didn't acknowledge the VP's (reasonable) concern before explaining. One long run-on sentence made the strong fact harder to hear.
- *Exact behaviour to change:* Open with a one-sentence direct answer to "should we trust this model," *then* explain why.
- *Stronger alternative modelled:* *"That gap is real, and you're right to raise it. It comes from a specific, known issue — a holiday-calendar mapping error — not a flaw in the underlying model. We identified it two weeks ago and the fix is already in progress. I can show you the corrected forecast by Friday so you can judge for yourself."*
- *Retry focus:* Lead with the headline answer before the explanation; acknowledge the stakeholder's concern explicitly; close with a specific, dated next step.

**Attempt 2 (after retry, expected improvement):**
Participant opens with the direct answer, names the fix, acknowledges the VP's concern in one sentence, and closes with a dated commitment — matching the modelled response above closely, in the participant's own words.

**Scoring comparison:**

| Capability | Attempt 1 | Attempt 2 |
|---|---|---|
| Active Listening | 3 (Functional) | 4 (Strong) — now explicitly acknowledges VP's concern |
| Adaptive Thinking | 3 | 3 (twist not tested in this scenario) |
| Judgement & Restraint | 4 (right call to answer) | 4 |
| Hypothesis Building | 4 (good fact, weak framing) | 4 |
| Speech Excellence | 2 (buried headline, run-on) | 4 (clear open/body/close) |
| Language Accuracy | 3 (one run-on sentence) | 4 |

**Participant reflection prompts and (sample) answers:**
- *What did I initially miss?* Leading with the answer instead of the mechanism.
- *What will I apply in a real client interaction?* State the bottom line first, especially with a stakeholder I haven't built trust with yet.

---

## 23. Recommended Next Steps

1. Convene a small working group (learning design + 1–2 senior client-facing professionals + facilitator lead) to review and validate the scenario library in Section 8.1 against real, anonymised engagement situations.
2. Author the full five-level behaviour-specific rubric (Section 9.2 pattern) for all six capabilities — this is the single highest-leverage MVP deliverable and should be completed before any pilot recording begins.
3. Recruit and calibrate 2–3 facilitators using the inter-rater exercise described in Section 19.
4. Recruit the 10–12 pilot participants, ideally spanning at least two client-facing role types.
5. Run the pilot per Section 19's sequence; collect baseline, mid-point, and end-line data.
6. Review pilot results against the Section 20 success metrics and the Section 21 risk list before committing to Phase 2 automation investment.
7. Use pilot participant and facilitator feedback to prioritise which Phase 2 enhancements (Section 15) to build first — likely automated filler/grammar detection first, since it has the clearest, lowest-risk automation path.
