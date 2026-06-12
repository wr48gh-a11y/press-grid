# Press Grid — product rationale

## The problem

Small-business owners know their story is locally interesting, but "get press"
is an opaque task. The usual advice — "build a media list" — pushes people
toward two bad outcomes: paying for stale journalist databases, or
spray-and-pray cold email that burns goodwill with local newsrooms.

The actual skill gap isn't *finding email addresses*. It's understanding that
local media is made of **lanes** — a calendar editor, a newsletter writer, and
a TV producer want completely different things from the same business — and
shaping one story into the right-sized package for each lane.

## What Press Grid demonstrates

Press Grid teaches that mental model interactively. A fixed demo scenario
(one business, one market, one goal) anchors the top-left of the board;
generating fills the other eight cells with the *same story refracted through
eight media lanes*:

- The **front** of each card answers "would this lane plausibly care, and why?"
  (match score, best angle, one-line reason).
- The **back** answers "what would a competent pitch to this lane look like?"
  (lead, anti-lead, proof, coverage rhythm, subject line, pitch, follow-up).

The flip interaction is the pedagogy: the front is the *judgment*, the back is
the *playbook*. Seeing an events editor score 90 while a trade reporter scores
60 — for the same story — is the "aha" the prototype exists to produce.

## Why synthetic profiles, deliberately

This prototype uses fictional reporters and outlets on purpose, not as a
placeholder for "real data later":

1. **Ethics.** Shipping real journalists' names and beats into a tool whose
   output is cold outreach is how spam tools get built. The lane is the
   durable, teachable unit; the individual is not.
2. **Accuracy.** Journalist databases decay fast. Lane behavior (calendar
   editors need date/time/price; TV needs visuals) is stable for decades.
3. **Honesty of scope.** A static prototype that pretended to know real local
   reporters would be lying. Synthetic cards keep the demo's claims true.

A production version would more likely pair this lane model with the user's
*own* research — helping them classify outlets they already read into lanes —
rather than reselling a contact database.

## Design choices

- **One board, one button** — the demo scenario card anchors the grid and a
  single "Generate" action deals the eight scout cards into the empty board;
  the story is literally surrounded by its consequences.
- **Dark editorial system, system fonts** — a typewriter photograph under
  translucent glass cards, with a serif masthead. Editorial, not enterprise
  dashboard: the subject is the press, and the design says so.
- **Deterministic generation** — the same inputs always produce the same
  cards, so the demo is repeatable in front of an audience.
- **No chat UI** — the value is the structured comparison across lanes, which
  a conversation thread would flatten.

## Non-goals

- No real journalist data, scraping, or enrichment.
- No email sending, contact export, or CRM features.
- No backend, accounts, or persistence.
