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
- AI hero ends with a quiet cue "SELECTED CASES" + a hairline with a red light dropping down, so the black gap reads as intentional.
- Case headers (premium): a huge outlined red-neon numeral (01/02) draws itself and flickers on, then hums; kicker "CASE 01 — 2025", big Anta title, pill tags (Sain't: Brand from zero · AI visuals · Merch · Instagram; Avito: AI promo films · Real Estate · Auto · Vertical cuts), and a light running along the rule. Reduced motion → static. Numerals: SVG viewBox has room around the glyphs, dash 4000 (WebKit dashes the whole text as one path, a short dash left parts invisible), glow filter on the <svg>, not on <text> (Safari clips it).
- Red neon theme; footer buttons solid black inside with red neon frame; red cursor.
- Typing swap "it's not ai → it's us."
- Sain't intro quote (short, user asked for direct): "The shadow isn't your dark side. / It's the part of you that you were taught to hide." Italic serif, left, thin red line. "AI Photography" is a sub-header (kicker Sain't — Visuals, Anta title, running light). On this page copy is left-aligned in sentence case, except one statement ("From visual language to daily communication…"), which is centred in caps (user's choice).
- Sain't: phones with haze that spreads in after the photo and breathes; short lead + Read more; Selected works carousel (15).
- Avito result line: "Avito came back and booked us for the next project." Page ends with a CTA styled as an empty "Case 03 — Yours" (dashed numeral, "Your brand next?", red neon buttons: Start a project = mailto, DM on Instagram).
- Avito format: horizontal and vertical cuts (facts strip + tag).
- Avito: dark intro (white wordmark, pulsing dots), facts strip, Film 01 (img/avito-film-1.mp4, 720p, tap to play with sound; second film pending), Frames carousel (edge strips cropped), Process carousel (6 steps).

## Photography (photography.html)
- Darkroom: pulsing red safelight bulb, animated RR (draw + develop), focus pull with viewfinder corners (no AF square), dust in the beam (no re-scatter on mobile scroll), live exposure readout (one line, red tick).
- Tagline "portraits · soft light · quiet moments".
- Series order (user's choice, not strictly chronological), photos surface out of the dark (not red):
  0. @p1nskii — "2023 · shot on 35mm · red" (3 frames: lying in red light full width, then bow + lighter pair). Added first at the user's request.
  1. @pukhalska_ — "2025 · summer by the water, barefoot" (frame counts removed from all metas, atmospheric lines instead)
  2. @sachiko_________ — "2025 · shot on iPhone" (3 frames)
  Notes block: text only (Based in / Instagram / Email list removed); Back/Next sit closer.
  3. @suzys.arts — "2024 · monochrome · hands, breath, stillness" (2) + sub-series "Violet Hour" (2, candlelight, colour). Restored as the LAST series (user request).

## Art & Design (art-design.html, css/art.css)
- Hero rose: no long-press image menu (touch-callout off, contextmenu blocked); page still scrolls.
- Custom gold cursor is OFF site-wide (felt laggy). Torch is a transform-moved layer (no per-frame repaint) that sleeps when settled.
- Page mark: an R and its mirrored ember-red shadow R (hero SVG + topbar).
- Phones: triptych is a swipe strip that opens on the rose, with dots.
- "Après moi" triptych (2024, DALL·E 2) — title references Regina Spektor; personal. Hall mock tried and rejected.
- Top bar: logo only, no name text, on all pages.
- Concept "Where light learns its shape" (shadow / self-acceptance). Hero: rose image in a dark room lit by a torch (pointer, finger, idle drift).
- "Embers" triptych 2025 (confetti canal · rose centre · red canopy), iPhone + AI, tilts as one altarpiece on desktop, stacked on phones.
- "First light": first AI image (DALL·E 2), gold veins glint (img/art/first-light-mask.webp). Living print: red/cyan copies drift apart slightly (RGB split) under moving film grain (img/art/grain.png).
- Manifesto replaced (user's pick "3a"): epigraph = last stanza of Richard Brautigan's "All Watched Over by Machines of Loving Grace" (1967), then: "He wrote that before any of this existed. / The machines are here now. Loving grace is still our part of the job." Stanzas warm up at mid-screen. No signature under the manifesto (user removed "Richard Road"). Manifesto line breaks keep a space so text never runs together on phones.
- Sain't result line added: Instagram from zero, near-daily merch sales, paid back + profit in a few months, paused by the war.

## Site-wide
- Back/Next at the bottom of pages are quiet text links (no frames), with an underline that draws on hover.
- Page transitions: cross-document View Transitions. The old page fades to black, the new one surfaces; no effect in browsers without support.
- Link preview (og:image) = img/og-rr.jpg: the HQ chrome RR on black, nothing else (renamed from og.jpg so messengers refetch).

- Body paragraphs are justified on every page (user's choice), with hyphenation; the last line stays left. Not applied to headings, labels, centred lines, the Brautigan poem or the manifesto.

## Pending / ideas
- Desktop polish postponed on purpose (traffic comes from Instagram on phones); the user has a list of desktop tweaks for later.
- Touch reactions for every page (to make the reel's "every page responds to touch" true): Photography dust scatters from the finger; AI Production neon flickers or glitches where touched.
- Case results for Sain't/Avito (numbers, quotes), Avito video link.
- Shimmer-free consistency across pages (shared type/gesture), reduce reliance on generic gothic/chrome/neon tropes.
- Custom domain (later). Mom's Telegram decoupage shop as a case.
- Promo: renders in `promo/` (git-ignored); sources + how-to in `promo-src/README.md`.
  - Current pick: the TikTok/Reel cut `rr-tiktok.mp4` (~17 s) and the 30 s story template `rr-story2-RU/EN.mp4`.
  - The experimental OPN/Arca-style reel was rejected as too experimental.
  - Posting plan: Instagram warm-up stories for 3 days, then the Reel. TikTok is a personal account (a business account needs company documents); post the short cut there.
  - Voice-over pending: ElevenLabs needs a valid `sk_` key in the environment's network secrets.
  - Strategy docs: TikTok https://claude.ai/artifact/VE8Na7rzJ2WS9buVqKjkS2 · Instagram https://claude.ai/artifact/HjiJbXGQQbkE6URa5dmqua
- Business: offering portfolios / CV / personal brand; agent product idea "Atelier" (brief → art direction → build → human polish).
