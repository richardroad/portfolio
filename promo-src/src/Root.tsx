import React from 'react';
import { Composition } from 'remotion';
import { Story, TOTAL } from './Story';
import { Tik, TIK_TOTAL } from './Tik';
import { Cut, CUT_TOTAL } from './Cut';
export const Root: React.FC = () => (<>
  <Composition id="RU" component={Story} durationInFrames={TOTAL} fps={30} width={1080} height={1920} defaultProps={{ lang: 'ru' as const }} />
  <Composition id="EN" component={Story} durationInFrames={TOTAL} fps={30} width={1080} height={1920} defaultProps={{ lang: 'en' as const }} />
  <Composition id="TIK" component={Tik} durationInFrames={TIK_TOTAL} fps={30} width={1080} height={1920} defaultProps={{ sound: true }} />
  <Composition id="TIKSILENT" component={Tik} durationInFrames={TIK_TOTAL} fps={30} width={1080} height={1920} defaultProps={{ sound: false }} />
  <Composition id="CUT" component={Cut} durationInFrames={CUT_TOTAL} fps={30} width={1080} height={1920} defaultProps={{ sound: true, theme: 'black' as const }} />
  <Composition id="CUTSIL" component={Cut} durationInFrames={CUT_TOTAL} fps={30} width={1080} height={1920} defaultProps={{ sound: false, theme: 'black' as const }} />
  <Composition id="CUTBLACK" component={Cut} durationInFrames={CUT_TOTAL} fps={30} width={1080} height={1920} defaultProps={{ sound: true, theme: 'black' as const }} />
</>);
