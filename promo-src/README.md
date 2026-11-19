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
  - `assets/home.mp4` is built from 1-intro frames 113–185 at 0.8× with blended frames. It skips the wing sheen, and the astrolabes are frozen from frame 150 to stop shimmer.
  - `assets/rr-chrome.mp4` is the 20 fps logo motion-interpolated to 30 fps (`ffmpeg minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,fps=30`).
  - `assets/shatter.mp4` is rebuilt from `img/shatter/l` source frames (13→150), so it has no capture jitter. A gentle GSAP shake is added in gen.py.
