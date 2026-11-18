import React from 'react';
import { AbsoluteFill, Audio, Img, Loop, OffthreadVideo, Sequence, staticFile, useCurrentFrame, interpolate, Easing } from 'remotion';

const FONTS = `@font-face { font-family: Corm; src: url(${staticFile('fonts/cormorant-italic.ttf')}); font-style: italic; }
@font-face { font-family: Noto; src: url(${staticFile('fonts/noto.ttf')}); }`;
// [clip, first frame, length, label]
const S: [string, number, number, string][] = [
  ['2-shatter', 30, 75, 'стекло бьётся, пока листаешь'],
  ['2-art', 50, 60, 'свет за пальцем в тёмной комнате'],
  ['5-photo', 28, 66, 'кадр наводится на резкость'],
  ['4-ai', 0, 54, 'неон, кейсы, видео'],
  ['1-intro', 6, 173, 'лого собирается из осколков'],
];
const END = 75;
const starts: number[] = []; let acc = 0; S.forEach(([, , l]) => { starts.push(acc); acc += l; });
export const TIK_TOTAL = acc + END;
const ease = Easing.bezier(.2, .7, .2, 1);

const Shot: React.FC<{ clip: string; from: number; len: number; label: string }> = ({ clip, from, len, label }) => {
  const f = useCurrentFrame();
  const flash = interpolate(f, [0, 4], [.55, 0], { extrapolateRight: 'clamp' });
  const zoom = interpolate(f, [0, len], [1.06, 1.0]);
  const labIn = interpolate(f, [4, 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  // 1-intro: the caption leaves before the home page appears (clip frame 75)
  // 1-intro: the shard assembly plays at 0.7x (blended frames), the home page (clip frame 75) at normal speed
  const isIntro = clip === '1-intro';
  const A = 99;
  const src = isIntro ? (f < A ? from + f * 0.7 : 75 + (f - A)) : from + f;
  const labOut = isIntro ? interpolate(f, [A - 14, A - 4], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;
  const lab = labIn * labOut;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <Img src={staticFile(`clips/${clip}/${String(Math.min(Math.floor(src), 185)).padStart(4, '0')}.jpg`)} style={{ position: 'absolute', width: '100%', height: '100%' }} />
        {src % 1 > 0.01 && <Img src={staticFile(`clips/${clip}/${String(Math.min(Math.floor(src) + 1, 185)).padStart(4, '0')}.jpg`)} style={{ position: 'absolute', width: '100%', height: '100%', opacity: src % 1 }} />}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(transparent 58%, #000000cc 78%, transparent 92%)' }} />
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 560 }}>
        <div style={{ opacity: lab, transform: `translateY(${(1 - lab) * 20}px)`, fontFamily: 'Corm', fontStyle: 'italic', fontSize: 66, color: '#f2ece2', textShadow: '0 3px 24px #000', textAlign: 'center', padding: '0 80px' }}>{label}</div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: '#fff', opacity: flash }} />
    </AbsoluteFill>
  );
};

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 6], [0, 1], { extrapolateRight: 'clamp', easing: ease });
  return (
    <AbsoluteFill style={{ alignItems: 'center', paddingTop: 230 }}>
      <div style={{ opacity: a, transform: `scale(${.94 + .06 * a})`, textAlign: 'center', padding: '22px 46px', background: '#000000b8', borderRadius: 18 }}>
        <div style={{ fontFamily: 'Noto', fontWeight: 600, fontSize: 64, lineHeight: 1.12, color: '#fff' }}>Сделал себе сайт<br />с помощью AI</div>
      </div>
    </AbsoluteFill>
  );
};

const End: React.FC = () => {
  const f = useCurrentFrame();
  const a = (s: number) => interpolate(f, [s, s + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  return (
    <AbsoluteFill style={{ background: '#000', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ width: 1000, height: 562, opacity: a(0), transform: `scale(${.92 + .08 * a(0)})` }}>
        <Loop durationInFrames={113}><OffthreadVideo src={staticFile('rr-chrome.mp4')} muted style={{ width: '100%', height: '100%', mixBlendMode: 'screen' }} /></Loop>
      </div>
      <div style={{ marginTop: 10, fontFamily: 'Noto', fontWeight: 600, fontSize: 70, color: '#fff', opacity: a(8) }}>Хочешь такой же?</div>
      <div style={{ marginTop: 26, fontFamily: 'Corm', fontStyle: 'italic', fontSize: 58, color: '#c9a45c', opacity: a(18) }}>пиши в директ · ссылка в профиле</div>
    </AbsoluteFill>
  );
};

export const Tik: React.FC<{ sound: boolean }> = ({ sound }) => (
  <AbsoluteFill style={{ background: '#000' }}>
    <style>{FONTS}</style>
    {sound && <Audio src={staticFile('tik.wav')} />}
    {S.map(([c, from, len, label], i) => <Sequence key={c} from={starts[i]} durationInFrames={len}><Shot clip={c} from={from} len={len} label={label} /></Sequence>)}
    <Sequence from={0} durationInFrames={acc}><Hook /></Sequence>
    <Sequence from={acc} durationInFrames={END}><End /></Sequence>
  </AbsoluteFill>
);
