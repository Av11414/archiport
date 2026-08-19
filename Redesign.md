# arav-jivani.com — Redesign Brief

You are rebuilding my architecture portfolio. Read this whole file before writing any code.

---

## 0. How to work on this

**Do not start coding.** First:

1. Audit the existing repo. Tell me what's reusable (motion helpers, the Three.js viewer, asset pipeline) and what should be deleted outright.
2. Produce a written plan: design tokens, motion primitives, file structure, and a scroll score for **one** project only.
3. Show me the plan. Wait for approval.
4. Build **The House of Meditation** page end to end as the reference implementation.
5. Only after I sign off on that page do you touch the other two projects.

Rebuilding all five pages in one pass will produce slop. One page, done properly, then replicate the vocabulary.

At the end of each phase, run the page in a browser, screenshot it at 1440px and 390px, and critique your own work before telling me it's done.

---

## 1. What exists now and what's wrong with it

Current stack: static HTML/CSS/JS on GitHub Pages, custom domain, Three.js model viewer, project data surfaced as cards.

Pages: `index.html` (splash gate with a quote and an "Enter" button), `portfolio.html` (card grid, projects open in a **modal/lightbox** with a 1/4 image slideshow), `about.html`, `resume.html`.

Problems, in priority order:

1. **Projects live inside modals.** This is the blocker. A scroll narrative cannot exist inside a lightbox — no URL, no back button, no scroll depth, no share link, no SEO. Every project must become its own page at its own route.
2. **The splash gate costs a click for nothing.** No visitor should have to press "Enter" to see work.
3. **The slideshow is a container, not a story.** `1 / 4` with arrows is a filing cabinet. It presents images in sequence without arguing anything.
4. **No progressive disclosure.** Right now every project reads identically: images, arrows, done. Nothing about the page is shaped by the project.

---

## 2. New site architecture

```
/                            → home (no gate; first scroll frame IS the hero)
/work/house-of-meditation    → full scroll page
/work/getaway-monolith       → full scroll page
/work/garden-intellectual    → full scroll page
/about
/resume
```

Rules:

- Clean URLs. Use directories with `index.html` inside so GitHub Pages serves `/work/house-of-meditation/` without the `.html`.
- Keep the old `.html` paths as redirect stubs so existing links don't 404.
- Kill `portfolio.html` as a modal host. It becomes an index page: three full-bleed entries, each linking out to its own page.
- **Do not build a single template that all three projects share.** Apple doesn't use one page layout for iPhone and Watch. Share the *motion vocabulary* and the *design tokens*; author each project's scroll score by hand. Three bespoke pages, one shared engine.

Shared files:

```
/assets/css/tokens.css      → colors, type scale, spacing, easing curves
/assets/css/base.css        → reset, layout primitives, typography
/assets/js/motion.js        → the motion primitives library (section 3)
/assets/js/viewer.js        → the Three.js model viewer, isolated
```

---

## 3. The motion system — read this section twice

When I say "like the Apple website," I am **not** asking for elements that fade up when they enter the viewport. That's AOS, it's everywhere, and it reads as a template. Do not build that.

The actual Apple technique is:

> A section is **pinned** (`position: sticky` / GSAP `pin`). Scrolling that section produces a **progress value from 0 to 1**. Everything inside the section — image frame, transform, opacity, mask, text state — is a pure function of that progress value.

The consequence: scroll up and everything runs backwards, perfectly. Stop halfway and it holds. That reversibility is the whole feeling. Anything triggered by an `IntersectionObserver` "once" flag is wrong.

### Stack

- **GSAP + ScrollTrigger** — free for commercial use since April 2025 under Webflow, all plugins included. Load from CDN, pin version.
- **Lenis** (or GSAP ScrollSmoother) for scroll smoothing. Subtle. If it feels like the page has weight on it, dial it back.
- **SplitText** (also free now) for line-level text masking.
- No React, no build step. Vanilla ES modules on GitHub Pages.

### Primitives to build in `motion.js`

Each takes a target element and returns a `progress → state` binding. Everything else composes from these five:

| Primitive | What it does |
|---|---|
| `pinnedScrub(el, opts)` | Pins a section, exposes `progress` 0→1, base for everything below |
| `frameSequence(canvas, frames)` | Draws a pre-rendered image sequence to canvas, indexed by progress. **This is the Apple move.** |
| `drawSVG(pathEl)` | Scrubs `stroke-dashoffset` so linework draws itself as you scroll |
| `maskReveal(textEl)` | Reveals type line-by-line via `clip-path`, not opacity |
| `horizontalPin(track)` | Pins a section and translates a track on X — for walking sequences |

### Hard rules

- Animate **`transform` and `opacity` only**. Never `top`, `left`, `width`, `height`, `margin`.
- Every scrubbed animation uses `scrub: 1` (a one-second catch-up), not `scrub: true`. `true` feels twitchy and cheap.
- One easing family across the whole site. Pick it, put it in `tokens.css`, never deviate.
- No effect gets used on more than two pages unless it's a primitive. Repetition kills the trick.

---

## 4. The scroll score

This is what makes an architecture page different from a product page: **I have drawings.** Plans, sections, axos, material studies. Apple has to fake cutaways in 3D — I have real ones. The linework is the signature. Lean on it.

Below is the vocabulary of beats. Not every project uses every beat, and the order changes per project. Pick and sequence per project, and tell me your sequencing rationale before you build.

**Beat A — Title card.** Project name, location, year, one line of premise. Hero image scales slowly from 105% → 100% while the type holds still. Nothing else. No scroll indicator arrow, no bouncing chevron.

**Beat B — The thesis.** One sentence, large, alone on the page, revealed by `maskReveal` line by line. This is the only place on the page where the type is the loudest object. Everything else in the project has to earn its way against this sentence.

**Beat C — Site.** Site plan as inline SVG. `drawSVG` scrubs the contours and the building footprint into existence as you scroll. Context labels fade in after their line completes.

**Beat D — Massing.** `frameSequence`. I export a 60-frame turntable or an assembly sequence from Revit/Veras; scrolling rotates or assembles the mass. Sixty frames, 1280px wide, WebP.

**Beat E — Plan → section.** Sticky drawing, annotations pinned alongside. As progress advances, the annotation swaps and the drawing crossfades plan → section → axo. The drawing stays put; the *reading* of it changes.

**Beat F — The promenade.** `horizontalPin`. Approach → threshold → compression → release. Architecture is a sequence you walk; the horizontal scroll encodes that literally. This is the beat I care most about — do not make it a generic image carousel.

**Beat G — Material.** Full-bleed macro crops. Material named in small type. If I supply a light study (same view, sun angle across the day), run it as a `frameSequence` — that's the Zumthor/Ando argument made in motion rather than described in a caption.

**Beat H — Interior payoff.** One image, full-bleed, held. Almost no type. Let it sit.

**Beat I — Drawings.** Process work, sketches, iterations. A grid that assembles on scroll.

**Beat J — Next.** Pull-to-next-project. No footer nav dead end.

The 3D viewer stays, but as one bounded, opt-in section — a click to activate, WebGL context disposed when it scrolls out. It must never run concurrently with a scrubbed sequence.

---

## 5. Design direction

Propose **three** distinct directions before building. Compact token systems: 4–6 named hex values, two or three typefaces with defined roles, a layout concept, and one signature element per direction. I'll pick one.

Anti-brief — do not hand me any of these:

- Cream/off-white background (~`#F4F1EA`) + high-contrast serif display + terracotta accent (~`#D97757`). This is the current AI-design default and I will recognise it instantly.
- Near-black background with a single acid-green or vermilion accent.
- Broadsheet layout: hairline rules, zero border-radius, dense newspaper columns.
- Inter, Space Grotesk, or Playfair Display as the display face.

Derive the palette from the actual buildings — the concrete, the shadow, the vegetation, the weather in the renders. Not from a trend.

My work is monolithic massing, phenomenological light, material honesty, refuge. Zumthor and Ando are the reference points. The site should feel like the buildings: heavy, quiet, slow, high-contrast. Restraint is the register — spend boldness on the signature element and keep everything else disciplined.

---

## 6. Performance budget

The people who matter will open this on a mediocre laptop over hotel wifi. If it stutters, the animation actively works against me. Non-negotiable:

- First contentful paint under 1.5s on a throttled Fast 3G profile.
- Hero image under 400KB. Whole page under 3MB on first load.
- Frame sequences: **60 frames max**, 1280px wide, WebP with AVIF where supported. Preload the whole sequence behind a loader before the pinned section is reachable. `img.decode()` before first paint — never draw an undecoded frame.
- Lazy-load everything below the second beat.
- Three.js: dynamic import, only when its section is near. `renderer.dispose()` on exit.
- No layout thrash. Read then write, batched in `requestAnimationFrame`.
- `will-change` only on currently-pinned sections; remove it on exit.
- Target Lighthouse Performance ≥ 85 on mobile with all motion running.

Mobile (< 768px):
- Replace frame sequences with a single still or a short muted autoplay video.
- Drop pinning wherever it fights the mobile URL bar.
- The page must still tell the story, just with less machinery.

---

## 7. Quality floor

- **`prefers-reduced-motion: reduce`** — every scrubbed animation collapses to its end state, immediately. All content still reachable. This is not optional and it is not a stub.
- Content in the DOM without JS. Someone with a blocked script or a crawler still gets the project text and images.
- Visible keyboard focus. Tab order follows visual order. Pinned sections must not trap focus.
- Real alt text on drawings — describe what the drawing shows, not "site plan image."
- Semantic headings. One `h1` per page.
- A downloadable PDF of each project, linked from the page. Some reviewers want a file.

---

## 8. Assets you need from me

Before Beat D, E, or G can be built, ask me for them explicitly. Don't build a placeholder and move on:

- Turntable / assembly frame sequences (I'll export from Revit + Veras)
- Site plan, floor plans, sections as **SVG with named layers** — not raster
- Material macro shots
- Light study sequence, if the project has one
- Final copy: thesis sentence, beat captions, material names

If an asset doesn't exist, say so and propose the beat that works with what I actually have. A page with six well-executed beats beats a page with ten where four are padded.

---

## 9. Order of work

| Phase | Deliverable |
|---|---|
| 0 | Repo audit + written plan + three design directions. **Stop for approval.** |
| 1 | `tokens.css`, `base.css`, `motion.js` primitives. Prove each primitive on a scratch page. |
| 2 | House of Meditation, complete. **Stop for review.** |
| 3 | Getaway Monolith + Garden Intellectual, each with its own score |
| 4 | Home, portfolio index, about, resume |
| 5 | Performance + accessibility pass. Lighthouse report. Redirect stubs for old URLs. |

Commit per phase with a clear message. Don't force-push over my history.
