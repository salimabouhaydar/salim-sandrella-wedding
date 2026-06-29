# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page bilingual (English / Arabic) wedding invitation for Salim & Sandrella (22 August 2026, Saydet Al Najat Church, Mina Byblos, Jbeil). Static site — three hand-written files, no build step, no package manager, no backend.

## Running & deploying

- **Preview:** open `index.html` directly in a browser. No server needed (third-party libs load from unpkg over HTTPS, fonts from Google Fonts).
- **Deploy:** GitHub Pages, "Deploy from a branch" → `main` / root. `CNAME` pins the custom domain `www.salimsandrellawedding.com`, so don't delete it.
- There are no tests, linters, or build tooling. Changes are validated by eye in the browser.

## Architecture

Three files do everything:

- **`index.html`** — all content/markup. Sections in order: hero → story → the day → gallery → RSVP → footer, plus floating music button and lightbox.
- **`script.js`** — behavior, organized as independent IIFEs (one per feature: `lang`, `countdown`, `rsvp`, `heroScene`, `gsapScroll`, `lightbox`, `music`, `addCalendar`). Each guards its own DOM lookups and returns early if elements are absent, so features are decoupled and safe to add/remove.
- **`style.css`** — all styling. Design tokens (colors, fonts, layout) live in `:root` at the top.

External libs via CDN `<script>`/`<link>` at the bottom of `index.html`: Three.js (hero petals), GSAP + ScrollTrigger (reveals + gallery). All are feature-detected — `script.js` degrades gracefully if a lib fails to load (e.g. `gsapScroll` falls back to making `.reveal` elements simply visible).

## Two conventions that cross all files

### Bilingual text (EN ⇄ AR)
This is the most important pattern. Text is dual-language via `data-en` / `data-ar` attributes:

```html
<p data-en="Save the date" data-ar="احفظوا التاريخ">Save the date</p>
```

The `lang` IIFE in `script.js` swaps `textContent` based on `<html lang>` and toggles `dir` between `ltr`/`rtl`. The chosen language persists in `localStorage` (`ss-lang`) and otherwise defaults from `navigator.language`. **Any new visible text must carry both `data-en` and `data-ar`** (or live inside `.lang-en` / `.lang-ar` blocks for multi-element content like the story paragraphs). The CSS picks Arabic font stacks (`--serif-ar`, etc.) automatically under `html[lang="ar"]`.

### CONFIG block
The two WhatsApp numbers and the wedding datetime live in the `CONFIG` object at the top of `script.js`. The countdown target and the RSVP `wa.me` links derive from it. The `.ics` calendar export in the `addCalendar` IIFE hardcodes its own dates — update both places if the date changes.

`CONFIG.rsvpSheetUrl` is an optional Google Apps Script web-app URL — the RSVP destination. The `rsvp` IIFE is a self-contained in-page form (name, Yes/No attendance toggle, guest count, wishes message): on submit it `fetch`-POSTs the reply (`no-cors`, fire-and-forget) to that URL, then swaps the form for a `#rsvpThanks` confirmation panel. **Fallback:** if `rsvpSheetUrl` is empty (not yet configured), submit instead opens a pre-filled WhatsApp message to `whatsappSalim` so no reply is lost — `whatsappFallbackMessage` builds the bilingual text. Setup steps + the Apps Script source (sheet columns: Timestamp · Name · Attending · Guests · Wishes · Language) live in `RSVP-SHEET-SETUP.md`. This Sheet endpoint is the only external dependency — the site is otherwise fully backendless.

## Editing notes

- `prefers-reduced-motion` is respected throughout — the Three.js scene renders zero petals and GSAP reveals become static. Preserve this when adding animation.
- Gallery photos are `images/gallery-01.jpg`…`gallery-10.jpg`; hero is `images/hero.jpg`, story photo is `images/feature.jpg`. Replace by keeping filenames.
- The "Our Story" paragraphs are placeholder copy marked with `<!-- EDIT ME -->` in `index.html`.
- The RSVP `rsvp` IIFE references some inputs (`rsvpStatus`, `rsvpWish`, `wishCount`) and a `startGate` that are not in the current HTML — guarded, so harmless, but the message builder still branches on status/wish if those fields are re-added.
