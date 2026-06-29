# Salim & Sandrella — Wedding Invitation Site

A free, single-page wedding website for **Salim & Sandrella** — 22 August 2026, Eglise Saydet Al Najat, Jbeil.

Open `index.html` in any browser to preview. No build step, no install, no Node.

---

## Before launch — only one thing left to edit

Open `index.html` and (optionally) rewrite the two paragraphs inside the **Our Story** section — search for `<!-- EDIT ME` to find them.

Everything else is already wired up:

- Names, date (22 Aug 2026 19:00), Mina-Jbeil location ✓
- Map pin pointing to Eglise Saydet Al Najat ✓
- WhatsApp RSVP for both Salim (+961 76 004 496) and Sandrella (+961 3 109 575) ✓
- All 10 photos in the gallery ✓

The `CONFIG` block at the top of `script.js` holds the numbers and coordinates if you ever need to change them.

---

## Hosting it free on GitHub Pages

1. Create a new repo on GitHub (e.g. `salim-sandrella-wedding`). Keep it public for free Pages hosting.
2. Upload this whole folder to the repo (drag-and-drop on github.com works fine).
3. Repo → **Settings** → **Pages** → Source: **Deploy from a branch** → Branch: **main** / **/(root)** → Save.
4. Wait ~1 minute. The site is live at `https://<username>.github.io/salim-sandrella-wedding/`.

### Adding a custom domain later

1. Buy a domain (Namecheap, Porkbun, etc.).
2. In the repo root, create a file named `CNAME` containing just the domain (e.g. `salimandsandrella.com`).
3. At your domain registrar, add these DNS records:
   - `A` records pointing to: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - or a single `CNAME` record pointing to `<username>.github.io`
4. Back in repo Settings → Pages → enter the custom domain. GitHub provisions a free HTTPS cert automatically.

---

## Replacing photos

Drop new images into the `images/` folder, keeping the same filenames:

- `hero.jpg` — fullscreen hero (recommended: ~1920px wide, landscape or vertical both fine)
- `gallery-01.jpg` … `gallery-10.jpg` — the 10 gallery photos

For best loading speed, keep each file under ~500 KB.

---

## What's in this site

- Live countdown to 22-Aug-2026 19:00 Beirut time
- 3D drifting gold-petal hero animation (Three.js)
- Scroll-driven photo gallery with subtle 3D tilt (GSAP)
- Animated map pin centered on Saydet Al Najat (Leaflet + OpenStreetMap, no API key)
- Whish Money gift card with one-tap copy + QR code (qrcode.js)
- RSVP-by-WhatsApp button (no backend needed)
- "Add to calendar" .ics download
- Fully responsive, accessible, respects `prefers-reduced-motion`

No analytics, no trackers, no third-party data collection.
