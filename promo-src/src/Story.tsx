import React from 'react';
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame, interpolate, Easing } from 'remotion';

const FONTS = `
@font-face { font-family: Corm; src: url(${staticFile('fonts/cormorant-italic.ttf')}); font-style: italic; }
@font-face { font-family: Pix; src: url(${staticFile('fonts/silkscreen.ttf')}); }
@font-face { font-family: Noto; src: url(${staticFile('fonts/noto.ttf')}); }`;

type Lang = 'en' | 'ru';
const TX = {
  ru: { c: ['Покажи себя так,\nчтобы запомнили', 'Живой сайт,\nа не страница', 'Твои работы —\nв лучшем свете', 'Под тебя,\nс твоим характером', null],
        k: ['personal websites', 'motion · scroll · video', 'case studies', 'portfolio · photo · cv', ''],
        items: ['Портфолио', 'CV / резюме', 'Личный бренд', 'AI-визуалы'], cta: 'Пиши в директ' },
  en: { c: ['Be seen the way\nyou mean it', 'A site that moves,\nnot a page', 'Your work,\nin its best light', 'Built around you,\nnot a template', null],
        k: ['personal websites', 'motion · scroll · video', 'case studies', 'portfolio · photo · cv', ''],
        items: ['Portfolio', 'CV / resume', 'Personal brand', 'AI visuals'], cta: 'DM me' },
};
const SC = [
  { clip: '1-intro', from: 15, len: 165, textAt: 105, pos: 'bottom', shift: 70 },
  { clip: '2-shatter', from: 0, len: 140, textAt: 12, pos: 'top', shift: 0 },
  { clip: '4-ai', from: 0, len: 138, textAt: 12, pos: 'bottom', shift: 0 },
  { clip: '5-photo', from: 15, len: 147, textAt: 60, pos: 'bottom', shift: 0 },
  { clip: '2-art', from: 0, len: 150, textAt: 12, pos: 'bottom', shift: 0 },
];
const X = 12;            // crossfade frames
const END = 195;         // end card length
let acc = 0;
const starts = SC.map((s) => { const st = acc; acc += s.len - X; return st; });
export const TOTAL = acc + X + END - X;

const ease = Easing.bezier(.2, .7, .2, 1);

const Caption: React.FC<{ kicker: string; title: string; at: number; len: number; pos: string }> = ({ kicker, title, at, len, pos }) => {
  const f = useCurrentFrame();
  const inn = interpolate(f, [at, at + 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  const out = interpolate(f, [len - X - 10, len - X], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const o = Math.min(inn, out);
  return (
    <AbsoluteFill style={{ justifyContent: pos === 'top' ? 'flex-start' : 'flex-end', padding: pos === 'top' ? '300px 90px 0' : '0 90px 260px' }}>
      <div style={{ opacity: o, transform: `translateY(${(1 - inn) * 40}px)` }}>
        <div style={{ fontFamily: 'Pix', fontSize: 30, letterSpacing: '.3em', color: '#c9a45c', textTransform: 'uppercase', marginBottom: 26, display: 'flex', alignItems: 'center', gap: 22 }}>
          <span style={{ width: 70 * inn, height: 2, background: '#c9a45c' }} />{kicker}
        </div>
        <div style={{ fontFamily: 'Corm', fontStyle: 'italic', fontSize: 104, lineHeight: 1.02, color: '#f2efe8', whiteSpace: 'pre-line', textShadow: '0 4px 40px #000' }}>{title}</div>
      </div>
    </AbsoluteFill>
  );
};

const Scene: React.FC<typeof SC[number] & { kicker: string; title: string | null }> = ({ clip, from, len, kicker, title, textAt, pos, shift }) => {
  const f = useCurrentFrame();
  const idx = Math.min(from + f, from + len - 1);
  const fade = interpolate(f, [0, X, len - X, len], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const zoom = interpolate(f, [0, len], [1.0, 1.05]);
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <AbsoluteFill style={{ transform: `translateY(${shift}px) scale(${zoom})` }}>
        <Img src={staticFile(`clips/${clip}/${String(idx).padStart(4, '0')}.jpg`)} style={{ width: '100%', height: '100%' }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: !title ? 'transparent' : pos === 'top' ? 'linear-gradient(#000 0%, #000000e6 18%, transparent 42%)' : 'linear-gradient(transparent 50%, #000000ee 74%, #000)' }} />
      {title && <Caption kicker={kicker} title={title} at={textAt} len={len} pos={pos} />}
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{ lang: Lang }> = ({ lang }) => {
  const f = useCurrentFrame();
  const a = (s: number) => interpolate(f, [s, s + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  const items = TX[lang].items;
  return (
    <AbsoluteFill style={{ background: '#000', alignItems: 'center', justifyContent: 'center', opacity: interpolate(f, [0, X], [0, 1], { extrapolateRight: 'clamp' }) }}>
      <AbsoluteFill style={{ background: 'radial-gradient(50% 32% at 50% 30%, #c9a45c22, transparent 70%)' }} />
      <Img src={staticFile('rr.webp')} style={{ width: 300, opacity: a(4), transform: `scale(${.92 + .08 * a(4)})`, marginBottom: 70 }} />
      <div style={{ display: 'grid', gap: 26, justifyItems: 'center' }}>
        {items.map((t, i) => (
          <div key={t} style={{ fontFamily: 'Noto', fontSize: 50, letterSpacing: '.08em', textTransform: 'uppercase', color: '#e9e6df', opacity: a(16 + i * 7), transform: `translateY(${(1 - a(16 + i * 7)) * 24}px)`, display: 'flex', alignItems: 'center', gap: 24 }}>
            <Img src={staticFile('ornament.webp')} style={{ width: 34, transform: `rotate(${f * 2}deg)` }} />{t}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 100, textAlign: 'center', opacity: a(118) }}>
        <div style={{ fontFamily: 'Corm', fontStyle: 'italic', fontSize: 72, color: '#f2efe8' }}>{TX[lang].cta}</div>
        <div style={{ fontFamily: 'Pix', fontSize: 40, letterSpacing: '.18em', color: '#c9a45c', marginTop: 18 }}>@RICHARD.ROAD</div>
      </div>
    </AbsoluteFill>
  );
};

export const Story: React.FC<{ lang: Lang }> = ({ lang }) => (
  <AbsoluteFill style={{ background: '#000' }}>
    <style>{FONTS}</style>
    <Audio src={staticFile('ambient.wav')} />
    {SC.map((s, i) => (
      <Sequence key={s.clip} from={starts[i]} durationInFrames={s.len}><Scene {...s} kicker={TX[lang].k[i]} title={TX[lang].c[i]} /></Sequence>
    ))}
    <Sequence from={acc} durationInFrames={END}><EndCard lang={lang} /></Sequence>
  </AbsoluteFill>
);
