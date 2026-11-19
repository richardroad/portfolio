# Promo video sources (Remotion 4.0.545)

Rendered videos live in `promo/` (git-ignored). This folder keeps what's needed to rebuild them.

- `src/Story.tsx`: the ~30 s story/Reel (RU + EN compositions). Five site scenes, then an end card.
- `src/Tik.tsx`: the ~17 s TikTok/Reel (TIK = with sound, TIKSILENT = no sound, for adding a trending sound in the app).
  - Hook: "Сделал себе сайт с помощью AI".
  - Shots: shatter → art → photo → ai → intro.
  - The intro shot plays the shard assembly at 0.7× with blended frames, then holds the home page for about 2.5 s. The caption fades out before the page appears.
- `rec.js`: Playwright capture of the site at full 1080×1920.
  - Setup: 360×640 viewport, DPR 3, page time slowed to 0.2× with screenshots per frame.
  - Frames go to `public/clips/<scene>/NNNN.jpg`. They are not committed; re-capture them.
- `tik_sound.py`: generated soundtrack (numpy). Keep CUTS in sync with the shot lengths in Tik.tsx. The user dislikes bells on the logo shot.
- `amb.py`: ambient bed for Story.tsx.

Render:
`npx remotion render src/index.ts TIK out/rr-tiktok.mp4 --codec=h264 --crf=14 --x264-preset=slow --jpeg-quality=95 --audio-codec=aac --audio-bitrate=256k`
(in this cloud container add `--browser-executable=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome`).

Other promo made: Instagram warm-up stories `promo/stories/01-05.png` (teaser, poll, three worlds, link, offer).
Strategy docs (Claude Docs):
- TikTok: https://claude.ai/artifact/VE8Na7rzJ2WS9buVqKjkS2
- Instagram: https://claude.ai/artifact/HjiJbXGQQbkE6URa5dmqua

## HyperFrames trial (`hyperframes/index.html`)
- Same story as `Cut.tsx` (v3). Built as HTML + GSAP for `npx hyperframes@0.9.69 render`.
- Cards slide in and out like curtains, the text rises word by word, and film grain sits over everything.
- Needs `assets/` (footage clips cut from the capture frames, fonts, `cut.wav`, `gsap.min.js`, `grain.png`). These are not committed; rebuild them as in `Cut.tsx`.
- Telemetry disabled with `npx hyperframes telemetry disable`.
- v6 asset notes:
  - `assets/home.mp4` is built from 1-intro frames 85–185 at real speed, no blending: the astrolabes turn and the wing sheen passes (user wants both). Capture frame 152 (menu text drops out) is replaced by the average of 151 and 153.
  - `assets/rr-chrome.mp4` is the 20 fps logo motion-interpolated to 30 fps (`ffmpeg minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,fps=30`).
  - `assets/shatter.mp4` is rebuilt from `img/shatter/l` source frames (13→150), so it has no capture jitter. A gentle GSAP shake is added in gen.py.
- v11 (final): the original single grain layer (`screen` at .07, uniform noise 540px) is back. The v10 second layer left an uncovered flickering stripe at the right edge (it was 1300px wide and shifted too far). Home shot runs at real speed (astrolabes turn, wing sheen passes) with `#v-home` saturate(1.12) and contrast(1.04).
- v12: the AI and Photography montage clips were re-captured after site changes (AI hero now has the "Selected cases" cue; Photography now opens with @p1nskii).
  - Capture: `node rec.js <dir> 34`, then `python3 resample.py <dir>/raw/<clip> <dir>/clips/<clip>` gives even 30 fps.
  - Ranges: m-ai is 4-ai frames 6–46; m-photo is 5-photo frames 70–110.
