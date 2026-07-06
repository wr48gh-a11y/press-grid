# Press Grid

A local media matching **prototype** for small businesses. A cinematic landing
screen leads into the board: the top-left card holds a demo scenario, and
generating fills the grid with eight "scout cards" — one per local media
lane — showing who might plausibly care, why, and what a competent pitch to
that lane looks like.

**Live demo:** https://wr48gh-a11y.github.io/press-grid/

## How to run locally

The app fetches its sample data file, so it needs to be served over HTTP
(opening `index.html` directly via `file://` will block the fetch in most
browsers):

```sh
cd press-grid
python3 -m http.server 8000
# then open http://localhost:8000
```

Any static file server works. No install step, no build step, no dependencies.

## What is synthetic

Everything. Every reporter name, outlet name, match score, and pitch detail is
fictional, generated locally in your browser from templates in
[`data/media-lanes.json`](data/media-lanes.json). Names were invented for this
prototype; any resemblance to real journalists or outlets is coincidental.

## What this prototype does not do

- ❌ It is **not** a real journalist database — no real names, beats, or contacts.
- ❌ It does **not** scrape anything, anywhere.
- ❌ It does **not** send email or generate contact lists.
- ❌ It does **not** call external APIs or send your inputs off-device.
- ❌ It does **not** store anything — refresh the page and it's gone.

What it *does* do: demonstrate how one small-business story maps onto eight
distinct local media lanes, each with its own angle, proof bar, and outreach
rhythm. See [docs/product-rationale.md](docs/product-rationale.md) for why.

## File structure

```
press-grid/
├── index.html               # Landing hero + tool board (demo card and 8 scout slots)
├── styles.css               # Dark editorial theme over the background photo
├── script.js                # Landing transition, card generation, rendering
├── assets/
│   └── typewriter-background.jpg  # Local design asset (background photo)
├── data/
│   └── media-lanes.json     # Synthetic lane data + templates (see schema doc)
├── docs/
│   ├── data-schema.md       # Field-by-field schema for media-lanes.json
│   └── product-rationale.md # Why the product works this way
├── README.md
└── .gitignore
```

## Design notes

- **Cinematic dark editorial system** — a typewriter photograph under a dark
  scrim, with translucent dark glass cards and white/near-white type. The
  primary button is blue (`#1877F2`); accents are a muted editorial gold.
- **Landing screen first** — a full-screen hero over the photograph with the
  masthead, inert nav labels, a three-step explainer, and a single
  "Enter Press Grid" button. Nothing else on the landing screen navigates
  anywhere.
- **Two app views, no router** — the landing and the tool are separate views
  toggled with the `hidden` attribute. Entering the tool pushes a History
  entry (URL unchanged, so static hosts like GitHub Pages work), and the
  browser Back button returns to the landing.
- **Local image asset** — `assets/typewriter-background.jpg` is the only
  image, stored locally and referenced from CSS. Nothing is hotlinked.
- **System font stack only** — no external fonts.
- **Demo scenario, no form** — the top-left card presents a fixed sample
  scenario (Recraft AI, AI design tools, awareness goal) with San Francisco,
  CA used as a *sample market*, not a headquarters claim. One button
  generates the eight scout cards, which animate into the empty board.
- **Card flip** — click anywhere on a card, or use the explicit
  "See pitch plan" / "Back to overview" buttons, which are also the keyboard
  path. The flip respects `prefers-reduced-motion`.
- **Scroll cue** — card faces that overflow show a subtle bottom fade with a
  chevron; it hides once you reach the bottom and never intercepts clicks.
- **Deterministic output** — the same inputs always generate the same cards
  (a hash of business + city + lane seeds name/outlet picks and score
  jitter), so demos are repeatable.
- **Accessibility** — semantic HTML, a polite live region announcing results,
  real `<button>` elements for entering, generating, and flipping, and the
  hidden card face is removed from the tab order while flipped.

## Responsible use

Press Grid exists to teach a mental model — *story → media lane → pitch shape* —
not to enable mass outreach. If you adapt this prototype, please keep it that
way: don't wire it to real journalist contact data, don't bolt on email
sending, and don't turn educational scout cards into a spam cannon. Local
newsrooms are small; pitch them the way this prototype suggests — specifically,
honestly, and one at a time.
