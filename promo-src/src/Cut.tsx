import React from 'react';
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, interpolate, Easing } from 'remotion';

// Card → clip → card → clip … Cards are a solid colour with a short line; clips are clean site footage, no overlays.
// All lengths are multiples of 15 frames (120 BPM at 30 fps), so every cut lands on a beat.
const FONTS = `@font-face { font-family: Onest; font-weight: 500; src: url(${staticFile('fonts/onest-cyrillic-500-normal.woff2')}); unicode-range: U+0400-04FF; }
@font-face { font-family: Onest; font-weight: 500; src: url(${staticFile('fonts/onest-latin-500-normal.woff2')}); unicode-range: U+0000-00FF, U+2000-206F; }
@font-face { font-family: PfI; font-style: italic; src: url(${staticFile('fonts/playfair-display-cyrillic-400-italic.woff2')}); unicode-range: U+0400-04FF; }
@font-face { font-family: PfI; font-style: italic; src: url(${staticFile('fonts/playfair-display-latin-400-italic.woff2')}); unicode-range: U+0000-00FF, U+2000-206F; }`;
const ease = Easing.bezier(.2, .8, .2, 1);

type Item =
  | { kind: 'card'; len: number; lines: string[]; accent: string }
  | { kind: 'clip'; len: number; clip: string; from: number }
  | { kind: 'slides'; len: number; images: string[] };

export const ITEMS: Item[] = [
  { kind: 'card', len: 45, lines: ['Сделал себе сайт', 'с помощью AI'], accent: 'AI' },
  { kind: 'clip', len: 60, clip: '2-shatter', from: 30 },
  { kind: 'card', len: 30, lines: ['Каждая страница', 'отвечает на касание'], accent: 'касание' },
  { kind: 'clip', len: 45, clip: '2-art', from: 55 },
  { kind: 'card', len: 30, lines: ['Фото проявляются,', 'как на плёнке'], accent: 'плёнке' },
  { kind: 'clip', len: 45, clip: '5-photo', from: 116 },
  { kind: 'card', len: 30, lines: ['Полная свобода', 'творчества'], accent: 'свобода' },
  { kind: 'slides', len: 45, images: ['saint/saint-face.webp', 'saint/saint-logo-fire.webp', 'saint/saint-mirror.webp'] },
  { kind: 'card', len: 30, lines: ['И всё это —', 'один сайт'], accent: 'сайт' },
  { kind: 'clip', len: 150, clip: '1-intro', from: 22 },
];
const END = 105; // logo clip (5.65 s turn) starts 2.15 s in, so it ends facing front
const starts: number[] = []; let acc = 0; ITEMS.forEach((it) => { starts.push(acc); acc += it.len; });
export const CUT_TOTAL = acc + END;

export type Theme = 'bone' | 'black';
const T = {
  bone: { bg: '#efe8de', fg: '#0d0c0b', accent: '#9c1c1c' },
  black: { bg: '#0b0b0b', fg: '#f2ece2', accent: '#c9a45c' },
};

const Card: React.FC<{ lines: string[]; accent: string; theme: Theme }> = ({ lines, accent, theme }) => {
  const f = useCurrentFrame();
  const c = T[theme];
  const orn = interpolate(f, [0, 10], [0, 1], { extrapolateRight: 'clamp', easing: ease });
  const line = interpolate(f, [4, 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  let k = 0;
  return (
    <AbsoluteFill style={{ background: c.bg, justifyContent: 'center', alignItems: 'center' }}>
      {theme === 'black' && <>
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 38% at 50% 50%, #2a221766, transparent 70%)' }} />
        <AbsoluteFill style={{ boxShadow: 'inset 0 0 0 46px #0b0b0b, inset 0 0 0 47px #c9a45c40' }} />
        <Img src={staticFile('ornament.webp')} style={{ position: 'absolute', top: 760, width: 70, opacity: orn, transform: `translateY(${(1 - orn) * 14}px) rotate(${(1 - orn) * -40}deg)` }} />
        <div style={{ position: 'absolute', top: 1150, width: 620 * line, height: 2, background: 'linear-gradient(90deg, transparent, #c9a45c, transparent)' }} />
        <div style={{ position: 'absolute', top: 1144, width: 12, height: 12, background: '#c9a45c', transform: `rotate(45deg) scale(${line})` }} />
      </>}
      <div style={{ fontFamily: 'Onest', fontWeight: 500, fontSize: 86, lineHeight: 1.14, color: c.fg, textAlign: 'center', letterSpacing: '-.025em' }}>
        {lines.map((ln, li) => (
          <div key={li} style={{ overflow: 'hidden', paddingBottom: 8 }}>
            {ln.split(' ').map((w, wi) => {
              const d = (k++) * 3;
              const p = interpolate(f, [d, d + 9], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
              return (
                <span key={wi} style={{ display: 'inline-block', marginRight: '.26em', transform: `translateY(${(1 - p) * 110}%)`, ...(w.replace(/[^\p{L}-]/gu, '') === accent ? { color: c.accent, fontFamily: 'PfI', fontStyle: 'italic', fontSize: '1.12em', letterSpacing: 0 } : { color: c.fg }) }}>{w}</span>
              );
            })}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Clip: React.FC<{ clip: string; from: number; len: number }> = ({ clip, from, len }) => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, len], [1.07, 1.0], { easing: Easing.out(Easing.quad) });
  const n = Math.min(from + f, 185);
  return (
    <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
      <Img src={staticFile(`clips/${clip}/${String(n).padStart(4, '0')}.jpg`)} style={{ width: '100%', height: '100%' }} />
    </AbsoluteFill>
  );
};

const Slides: React.FC<{ images: string[]; len: number }> = ({ images, len }) => {
  const f = useCurrentFrame();
  const per = len / images.length;
  const i = Math.min(images.length - 1, Math.floor(f / per));
  const z = interpolate(f - i * per, [0, per], [1.1, 1.0]);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Img src={staticFile(images[i])} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})` }} />
    </AbsoluteFill>
  );
};

const End: React.FC = () => {
  const f = useCurrentFrame();
  const a = (s: number) => interpolate(f, [s, s + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  return (
    <AbsoluteFill style={{ background: '#000', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ width: 1000, height: 562, opacity: a(0), transform: `scale(${.92 + .08 * a(0)})` }}>
        <OffthreadVideo src={staticFile('rr-chrome.mp4')} startFrom={65} muted style={{ width: '100%', height: '100%', mixBlendMode: 'screen' }} />
      </div>
      <div style={{ marginTop: 20, fontFamily: 'Onest', fontWeight: 500, fontSize: 64, letterSpacing: '-.02em', color: '#f2ece2', opacity: a(6), transform: `translateY(${(1 - a(6)) * 16}px)` }}>
        Ссылка на <span style={{ fontFamily: 'PfI', fontStyle: 'italic', color: '#c9a45c', fontSize: '1.12em' }}>портфолио</span>
      </div>
      <div style={{ marginTop: 18, fontFamily: 'Onest', fontWeight: 500, fontSize: 46, color: '#ffffffb0', opacity: a(14) }}>в шапке профиля</div>
    </AbsoluteFill>
  );
};

export const Cut: React.FC<{ sound: boolean; theme: Theme }> = ({ sound, theme }) => (
  <AbsoluteFill style={{ background: '#000' }}>
    <style>{FONTS}</style>
    {sound && <Audio src={staticFile('cut.wav')} />}
    {ITEMS.map((it, i) => (
      <Sequence key={i} from={starts[i]} durationInFrames={it.len}>
        {it.kind === 'card' ? <Card lines={it.lines} accent={it.accent} theme={theme} /> : it.kind === 'slides' ? <Slides images={it.images} len={it.len} /> : <Clip clip={it.clip} from={it.from} len={it.len} />}
      </Sequence>
    ))}
    <Sequence from={acc} durationInFrames={END}><End /></Sequence>
  </AbsoluteFill>
);
