/* ---------------------------------------------------------------------------
   Press Grid — application logic
   All data is synthetic and processed locally. No network calls beyond
   fetching the bundled JSON data file. No analytics, no storage, no email.
--------------------------------------------------------------------------- */

"use strict";

const DATA_URL = "data/media-lanes.json";

/*
 * The demo scenario used for card generation. San Francisco is a sample
 * U.S. market chosen for the demo — not a headquarters claim. The static
 * start card in index.html displays the same scenario — keep them in sync.
 */
const DEMO_SCENARIO = {
  businessName: "Recraft AI",
  industryId: "ai-design-tools",
  city: "San Francisco",
  state: "CA",
  goalId: "awareness",
  storySummary:
    "Expanding awareness for an AI design platform among creative teams, " +
    "designers, and marketing leaders."
};

const AVATAR_COLORS = [
  "#b3873d", "#a85f3a", "#8f5a86", "#4a72c4",
  "#3a7d65", "#9c4a45", "#6a5aa8", "#34788a"
];

const SCORE_MIN = 58;
const SCORE_MAX = 97;

let mediaData = null;

/* ---- Bootstrapping -------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", init);

async function init() {
  renderEmptyBoard();
  document.getElementById("enter-btn").addEventListener("click", enterTool);
  document.getElementById("generate-btn").addEventListener("click", handleGenerate);
  window.addEventListener("popstate", handlePopState);
  // Restore the tool view if the page is reloaded while in it.
  if (window.history.state && window.history.state.view === "tool") {
    setView("tool");
  }
  try {
    mediaData = await loadMediaData();
  } catch (error) {
    showStatus(
      "Couldn't load the sample data. If you opened index.html directly, " +
      "serve the folder instead (see README): python3 -m http.server"
    );
  }
}

async function loadMediaData() {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Data file responded with ${response.status}`);
  }
  return response.json();
}

/* ---- View switching (landing ⇄ tool) ---------------------------------------
   App-state transition, not a scroll transition: exactly one view is in the
   DOM-visible state at a time, and the scroll position resets on switch.
   pushState keeps the URL unchanged (no hash, no router), so Browser Back
   returns to the landing and nothing breaks on static hosts like GitHub
   Pages. */

function setView(view) {
  const showTool = view === "tool";
  document.getElementById("landing-screen").hidden = showTool;
  document.getElementById("tool-screen").hidden = !showTool;
  document.body.classList.toggle("landing-active", !showTool);
  window.scrollTo(0, 0);
}

function enterTool() {
  window.history.pushState({ view: "tool" }, "");
  setView("tool");
  // Keyboard users land on the next action; preventScroll keeps the view
  // anchored at the top instead of jumping down to the grid center.
  document.getElementById("generate-btn").focus({ preventScroll: true });
}

function handlePopState(event) {
  setView(event.state && event.state.view === "tool" ? "tool" : "landing");
}

/* ---- Generation ------------------------------------------------------------- */

function handleGenerate() {
  if (!mediaData) {
    return; // data failed to load; the status line already explains why
  }
  const input = buildDemoInput();
  const cards = mediaData.lanes.map((lane) => buildScoutCard(lane, input));
  renderScoutCards(cards);
  showStatus(
    `Eight synthetic scout cards generated for ${input.businessName} in the ` +
    `${input.city}, ${input.state} sample market. Select a card to see its pitch plan.`
  );
}

function buildDemoInput() {
  return {
    ...DEMO_SCENARIO,
    industryLabel: labelFor(mediaData.industries, DEMO_SCENARIO.industryId),
    goalLabel: labelFor(mediaData.goals, DEMO_SCENARIO.goalId)
  };
}

function labelFor(options, id) {
  const match = options.find((option) => option.id === id);
  return match ? match.label : id;
}

/* ---- Card generation -------------------------------------------------------- */

function buildScoutCard(lane, input) {
  const seed = hashString(`${input.businessName}|${input.city}|${lane.id}`);
  const reporterName = pickFrom(lane.names, seed);
  const context = buildTemplateContext(lane, input, reporterName);

  return {
    laneId: lane.id,
    lane: lane.lane,
    reporterName,
    initials: initialsOf(reporterName),
    avatarColor: AVATAR_COLORS[hashString(lane.id) % AVATAR_COLORS.length],
    outlet: fillTemplate(pickFrom(lane.outlets, seed >>> 3), context),
    beat: fillTemplate(lane.beat, context),
    score: computeMatchScore(lane, input, seed),
    angle: fillTemplate(pickKeyed(lane.angles, input.goalId), context),
    reason: fillTemplate(lane.reason, context),
    back: {
      whyFits: fillTemplate(lane.back.whyFits, context),
      leadWith: fillTemplate(lane.back.leadWith, context),
      avoidLeading: fillTemplate(lane.back.avoidLeading, context),
      proofNeeded: fillTemplate(lane.back.proofNeeded, context),
      coveragePattern: fillTemplate(lane.back.coveragePattern, context),
      subjectLine: fillTemplate(pickKeyed(lane.back.subjectLines, input.goalId), context),
      pitch: fillTemplate(lane.back.pitch, context),
      followUp: fillTemplate(lane.back.followUp, context)
    }
  };
}

function buildTemplateContext(lane, input, reporterName) {
  return {
    businessName: input.businessName,
    city: input.city,
    state: input.state,
    industryLabel: input.industryLabel,
    goalLabel: input.goalLabel,
    firstName: reporterName.split(" ")[0],
    storyHook: makeStoryHook(input.storySummary)
  };
}

function makeStoryHook(summary) {
  let hook = summary.replace(/\s+/g, " ").trim();
  if (hook.length > 140) {
    hook = hook.slice(0, 140).replace(/\s+\S*$/, "") + "…";
  }
  if (!/[.!?…]$/.test(hook)) {
    hook += ".";
  }
  return hook.charAt(0).toUpperCase() + hook.slice(1);
}

function computeMatchScore(lane, input, seed) {
  const goalBoost = lane.goalWeights[input.goalId] ?? 0;
  const industryBoost =
    lane.industryWeights[input.industryId] ?? lane.industryWeights.default;
  const jitter = (seed % 7) - 3;
  const raw = lane.baseScore + goalBoost + industryBoost + jitter;
  return Math.min(SCORE_MAX, Math.max(SCORE_MIN, raw));
}

/* ---- Small utilities ---------------------------------------------------------- */

function hashString(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pickFrom(list, seed) {
  // Callers pass unsigned values (hashString uses >>> 0), so a plain
  // modulo is always a valid index.
  return list[seed % list.length];
}

function pickKeyed(templates, key) {
  return templates[key] ?? templates.default;
}

function fillTemplate(template, context) {
  return template.replace(/\{(\w+)\}/g, (match, token) =>
    token in context ? context[token] : match
  );
}

function initialsOf(name) {
  return name
    .split(/[\s-]+/)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

function showStatus(message) {
  document.getElementById("results-status").textContent = message;
}

/* ---- Rendering ------------------------------------------------------------------ */

/* Before generation the board is just the start card plus a quiet
   invitation — no placeholder boxes. Empty slot cells are hidden by CSS,
   so the pre-generation board fits on one screen. */
function renderEmptyBoard() {
  const cells = getSlotCells();
  for (const cell of cells) {
    cell.replaceChildren();
  }
  const hint = document.createElement("p");
  hint.className = "board-hint";
  hint.textContent =
    "Click 'Generate scout cards' to load a sample Press Grid board for the company Recraft AI.";
  cells[0].replaceChildren(hint);
}

function getSlotCells() {
  return [...document.querySelectorAll(".grid-cell[data-slot]")];
}

function renderScoutCards(cards) {
  const cells = getSlotCells();
  const topScore = Math.max(...cards.map((card) => card.score));
  cards.forEach((card, index) => {
    const isTopMatch = card.score === topScore;
    const el = createScoutCardElement(card, isTopMatch);
    el.style.animationDelay = `${index * 50}ms`;
    cells[index].replaceChildren(el);
  });
}

function createScoutCardElement(card, isTopMatch) {
  const root = document.createElement("article");
  root.className = "scout-card";
  root.dataset.laneId = card.laneId;

  const inner = document.createElement("div");
  inner.className = "scout-card-inner";
  inner.append(createCardFront(card, isTopMatch), createCardBack(card));
  root.appendChild(inner);

  // Whole-card click flips; the explicit buttons inside each face provide
  // the keyboard-accessible path and avoid a giant role="button" surface.
  root.addEventListener("click", () => toggleFlip(root));
  return root;
}

function toggleFlip(cardEl) {
  cardEl.classList.toggle("is-flipped");
  requestAnimationFrame(() => recheckScrollFades(cardEl));
}

function recheckScrollFades(cardEl) {
  // Each face's fade listens for scroll on itself; dispatching a synthetic
  // scroll event re-runs that check without holding a reference to it.
  for (const face of cardEl.querySelectorAll(".scout-card-face")) {
    face.dispatchEvent(new Event("scroll"));
  }
}

function createCardFront(card, isTopMatch) {
  const face = document.createElement("div");
  face.className = "scout-card-face scout-card-front";

  const header = document.createElement("header");
  header.className = "scout-header";

  const avatar = document.createElement("span");
  avatar.className = "scout-avatar";
  avatar.style.background = card.avatarColor;
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = card.initials;

  const headerText = document.createElement("div");
  const name = document.createElement("h3");
  name.className = "scout-name";
  name.textContent = card.reporterName;
  const outlet = document.createElement("p");
  outlet.className = "scout-outlet";
  outlet.textContent = card.outlet;
  headerText.append(name, outlet);

  header.append(avatar, headerText);

  const laneTag = document.createElement("span");
  laneTag.className = "scout-lane-tag";
  laneTag.textContent = card.lane;

  const beat = document.createElement("p");
  beat.className = "scout-beat";
  beat.textContent = `Beat: ${card.beat}`;

  face.append(
    header,
    laneTag,
    beat,
    createScoreRow(card.score, isTopMatch),
    createLabeledText("Best angle", card.angle, "scout-angle", "scout-angle-label"),
    createReason(card.reason),
    createFlipButton(`See pitch plan for ${card.reporterName}`, "See pitch plan →")
  );
  addScrollFade(face);
  return face;
}

function createScoreRow(score, isTopMatch) {
  const row = document.createElement("div");
  row.className = "scout-score-row";

  const bar = document.createElement("div");
  bar.className = "scout-score-bar";
  bar.setAttribute("role", "img");
  bar.setAttribute("aria-label", `Match score ${score} out of 100`);
  const fill = document.createElement("div");
  fill.className = "scout-score-fill";
  fill.style.width = `${score}%`;
  bar.appendChild(fill);

  const value = document.createElement("span");
  value.className = "scout-score-value";
  value.setAttribute("aria-hidden", "true");
  value.textContent = `${score}`;

  row.append(bar, value);

  if (isTopMatch) {
    const badge = document.createElement("span");
    badge.className = "scout-top-match";
    badge.textContent = "Top match";
    row.appendChild(badge);
  }
  return row;
}

function createLabeledText(label, text, blockClass, labelClass) {
  const p = document.createElement("p");
  p.className = blockClass;
  const labelEl = document.createElement("span");
  labelEl.className = labelClass;
  labelEl.textContent = label;
  p.append(labelEl, document.createTextNode(text));
  return p;
}

function createReason(reason) {
  const p = document.createElement("p");
  p.className = "scout-reason";
  p.textContent = `“${reason}”`;
  return p;
}

function createFlipButton(ariaLabel, visibleText) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "card-flip-btn";
  button.setAttribute("aria-label", ariaLabel);
  button.textContent = visibleText;
  // The card-level click handler also flips; stop propagation so a button
  // click flips exactly once.
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleFlip(button.closest(".scout-card"));
  });
  return button;
}

function createCardBack(card) {
  const face = document.createElement("div");
  face.className = "scout-card-face scout-card-back";

  const title = document.createElement("h3");
  title.className = "scout-back-title";
  title.textContent = `Pitch plan · ${card.lane}`;

  const details = document.createElement("dl");
  details.className = "scout-detail-list";
  appendDetail(details, "Why this lane fits", card.back.whyFits);
  appendDetail(details, "Lead with", card.back.leadWith);
  appendDetail(details, "Don't lead with", card.back.avoidLeading);
  appendDetail(details, "Proof needed", card.back.proofNeeded);
  appendDetail(details, "Coverage pattern", card.back.coveragePattern);
  appendDetail(details, "Suggested subject line", card.back.subjectLine, "scout-subject-line");
  appendDetail(details, "Short pitch", card.back.pitch);
  appendDetail(details, "Follow-up timing", card.back.followUp);

  face.append(
    title,
    details,
    createFlipButton(`Back to overview for ${card.reporterName}`, "← Back to overview")
  );
  addScrollFade(face);
  return face;
}

/* ---- Scroll affordance ---------------------------------------------------- */

function addScrollFade(faceEl) {
  const fade = document.createElement("div");
  fade.className = "scroll-fade";
  const chevron = document.createElement("span");
  chevron.className = "scroll-fade-chevron";
  chevron.setAttribute("aria-hidden", "true");
  fade.appendChild(chevron);
  faceEl.appendChild(fade);

  function checkScroll() {
    const atBottom = faceEl.scrollHeight - faceEl.scrollTop - faceEl.clientHeight < 12;
    const noOverflow = faceEl.scrollHeight <= faceEl.clientHeight + 4;
    fade.classList.toggle("is-hidden", atBottom || noOverflow);
  }

  faceEl.addEventListener("scroll", checkScroll, { passive: true });
  requestAnimationFrame(checkScroll);
  // Re-check once layout has fully settled: grid rows can stretch after the
  // first frame (e.g. row 1 grows to match the start card), which changes
  // whether a face overflows.
  setTimeout(checkScroll, 600);
}

function appendDetail(listEl, term, description, extraClass) {
  const dt = document.createElement("dt");
  dt.textContent = term;
  const dd = document.createElement("dd");
  dd.textContent = description;
  if (extraClass) {
    dd.classList.add(extraClass);
  }
  listEl.append(dt, dd);
}
