# RR Portfolio — project notes

Living memory of decisions, so nothing gets lost between sessions.
Site: https://richardroad.github.io/portfolio/ (GitHub Pages, branch `main`, root).
Owner: Richard Road — AI creative & director (not "photographer": shoots on phone / others' cameras, mostly generates now).

## Stack & conventions
- Static HTML/CSS/vanilla JS. `css/style.css` (shared), `css/photo.css` (Photography), `js/main.js`.
- Cache-busting: every page links `css/*.css?v=…` and `js/main.js?v=…`; bump the number on every change.
- Images: WebP, full + `-sm` variants. Videos: H.264 MP4 + webp poster; logo videos also have an animated WebP fallback (`data-fallback`) for when Safari can't play video.
- Respect `prefers-reduced-motion` for every animation.
- Commits authored as Richard Road.

## Home (index.html)
- Preloader: shards assemble the RR mark (once per session).
- Hero: wings + silver sheen; RR logo video `img/rr-chrome.mp4` is the ORIGINAL 800x450 Readymag clip (it loops perfectly). The HQ half-turn clip from the user did not loop well (crossfade looked odd) — rejected; only replace with a full 360° HQ render.
- Phones only: wings "breathe"; gold astrolabes turn at both edges of the menu (65% opacity); stone bars and road-marking dashes hidden.
- Tagline in two lines: "AI creative & director" / "building visual worlds for brands and people".
- Scroll-scrubbed shatter video (153 frames, ends on the cracked face, then Name / Age 32 / Based in Netherlands).
- Offer block: "I turn ideas into images, films and places on the web." + 4 services (AI production, Creative direction, Personal websites, Personal brand) + gold "Work with me" (mailto) and "DM on Instagram".
- Thorns (`img/thorns.webp`, user's HQ version) rise behind the CTA buttons, silver glint via `img/thorns-mask.webp`. On phones the thorns are kept near native scale (no blur).
- Old Contact/Instagram/Email icon links were removed on purpose. Next button: serif caps, gold arrow, not too close to the edge.

## AI Production (ai-production.html)
- Case years: Sain't 2025, Avito 2026.
- Red neon theme; footer buttons solid black inside with red neon frame; red cursor.
- Typing swap "it's not ai → it's us."
- Sain't: phones with haze that spreads in after the photo and breathes; short lead + Read more; Selected works carousel (15).
- Avito: dark intro (white wordmark, pulsing dots), facts strip, Film 01 (img/avito-film-1.mp4, 720p, tap to play with sound; second film pending), Frames carousel (edge strips cropped), Process carousel (6 steps).

## Photography (photography.html)
- Darkroom: pulsing red safelight bulb, animated RR (draw + develop), focus pull with viewfinder corners (no AF square), dust in the beam (no re-scatter on mobile scroll), live exposure readout (one line, red tick).
- Tagline "portraits · soft light · quiet moments".
- Series order (user's choice, not strictly chronological), photos surface out of the dark (not red):
  1. @pukhalska_ — 2025, 9 frames, summer by the water
  2. @sachiko_________ — "2025 · shot on iPhone" (3 frames)
  3. @suzys.arts — 2024 monochrome (2) + sub-series "Violet Hour" (2, candlelight, colour)

## Art & Design (art-design.html, css/art.css)
- Custom gold cursor is OFF site-wide (felt laggy). Torch is a transform-moved layer (no per-frame repaint) that sleeps when settled.
- Page mark: an R and its mirrored ember-red shadow R (hero SVG + topbar).
- Phones: triptych is a swipe strip that opens on the rose, with dots.
- "Après moi" triptych (2024, DALL·E 2) — title references Regina Spektor; personal. Hall mock tried and rejected.
- Top bar: logo only, no name text, on all pages.
- Concept "Where light learns its shape" (shadow / self-acceptance). Hero: rose image in a dark room lit by a torch (pointer, finger, idle drift).
- "Embers" triptych 2025 (confetti canal · rose centre · red canopy), iPhone + AI, tilts as one altarpiece on desktop, stacked on phones.
- "First light": first AI image (DALL·E 2), gold veins glint (img/art/first-light-mask.webp).
- Manifesto (English), stanzas warm up at mid-screen. Accent verdigris #5fae93 only on the signature.
- Sain't result line added: Instagram from zero, near-daily merch sales, paid back + profit in a few months, paused by the war.

## Pending / ideas
- Case results for Sain't/Avito (numbers, quotes), Avito video link.
- Shimmer-free consistency across pages (shared type/gesture), reduce reliance on generic gothic/chrome/neon tropes.
- Custom domain (later). Mom's Telegram decoupage shop as a case.
- Promo reel (Remotion) lives outside git in `promo/`; v3 has new copy + sound synced to animation; voice-over pending (ElevenLabs connector timed out; network secret for api.elevenlabs.io was saved with a wrong value — fix in environment settings).
- Business: offering portfolios / CV / personal brand; agent product idea "Atelier" (brief → art direction → build → human polish).
