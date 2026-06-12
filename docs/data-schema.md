# Press Grid — data schema

All sample data lives in [`data/media-lanes.json`](../data/media-lanes.json).
Everything in it is synthetic: reporter names, outlet names, and pitch copy are
fictional and exist only to demonstrate the product concept.

## Top-level shape

```json
{
  "industries": [ { "id": "...", "label": "..." } ],
  "goals":      [ { "id": "...", "label": "..." } ],
  "lanes":      [ { ...lane } ]
}
```

- **`industries`** — the industry catalog. `id` is a stable kebab-case key
  referenced by `lane.industryWeights` and by the demo scenario's
  `industryId` in `script.js`; `label` is display text.
- **`goals`** — the goal catalog. `id` is referenced by `lane.goalWeights`,
  `lane.angles`, `lane.back.subjectLines`, and the demo scenario's `goalId`.
- **`lanes`** — exactly eight media lanes, rendered in array order into the
  eight grid slots that follow the demo scenario card.

## Lane object

| Field | Type | Notes |
|---|---|---|
| `id` | string | Stable kebab-case identifier; also seeds the avatar color. |
| `lane` | string | Display name of the media lane (e.g. "Podcast host"). |
| `beat` | template string | Shown on the card front. |
| `names` | string[] | Pool of fictional reporter names; one is picked deterministically per generation. |
| `outlets` | template string[] | Pool of fictional outlet names; one is picked deterministically. |
| `baseScore` | number | Starting match score before boosts. |
| `goalWeights` | object | One number per goal `id`. Added to the score. |
| `industryWeights` | object | Numbers keyed by industry `id`, plus a required `default` key used when the chosen industry has no entry. |
| `angles` | keyed templates | "Best angle" copy. Required `default` key; optional per-goal overrides keyed by goal `id`. |
| `reason` | template string | One-line "why they might care" on the card front. |
| `back` | object | Card-back content; see below. |

## `lane.back` object

| Field | Type | Notes |
|---|---|---|
| `whyFits` | template string | Why this lane fits the story. |
| `leadWith` | template string | What to lead with. |
| `avoidLeading` | template string | What not to lead with. |
| `proofNeeded` | template string | Evidence the lane expects before covering. |
| `coveragePattern` | template string | How and when this lane typically publishes. |
| `subjectLines` | keyed templates | Required `default` key; optional per-goal overrides. |
| `pitch` | template string | Short sample pitch. |
| `followUp` | template string | Follow-up timing guidance. |

## Template tokens

Template strings may contain any of these tokens, replaced at render time by
`fillTemplate()` in [`script.js`](../script.js). All values come from the
fixed `DEMO_SCENARIO` constant (this prototype has no input form):

| Token | Source |
|---|---|
| `{businessName}` | `DEMO_SCENARIO.businessName`. |
| `{city}` | `DEMO_SCENARIO.city`. |
| `{state}` | `DEMO_SCENARIO.state` (two-letter code). |
| `{industryLabel}` | Display label of the scenario's industry, looked up in `industries`. |
| `{goalLabel}` | Display label of the scenario's goal, looked up in `goals`. |
| `{firstName}` | First name of the picked fictional reporter. |
| `{storyHook}` | The story summary, whitespace-collapsed, capped at ~140 chars, capitalized, end-punctuated. |

Unknown tokens are left as-is rather than throwing, so a typo in data degrades
gracefully instead of breaking a card.

## Match score

```
score = clamp(baseScore + goalWeights[goal] + industryWeights[industry or default] + jitter, 58, 97)
```

`jitter` is a small deterministic value in [-3, +3] derived from a hash of
`businessName|city|laneId`, so the same inputs always produce the same cards —
useful for demos — while different businesses get slightly different numbers.
