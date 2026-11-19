# Regenerates the body/timeline of hyperframes/index.html (keeps <head> styles). Run from the HyperFrames project dir.
import re
s=open('index.html').read()
W=0.28; X=0.35  # card curtain, page crossfade
cards=[(0.0,1.5,['Сделал себе сайт','с помощью AI'],'AI'),
       (3.5,1.0,['Каждая страница','отвечает на касание'],'касание'),
       (6.0,1.0,['Полная свобода','творчества'],'свобода')]
# (name, start, duration, entry): entry 'card' = revealed by curtain, 'fade' = crossfades over previous page
clips=[('shatter',1.5,2.0,'card'),('art',4.5,1.5,'card'),
       ('m-ai',7.0,1.0,'card'),('m-photo',8.0,1.0,'fade'),('home',9.0,3.0,'fade')]
END=12.0; TOTAL=15.5
h=[]
for name,st,du,e in clips:
    pre = W if e=='card' else X
    h.append(f'<video id="v-{name}" class="clip foot" src="assets/{name}.mp4" muted playsinline data-start="{round(st-pre,3)}" data-duration="{round(du+pre,3)}" data-track-index="0"></video>')
h.append(f'<video id="v-logo" class="clip" src="assets/rr-chrome.mp4" muted playsinline data-start="{END}" data-media-start="2.1667" data-duration="{TOTAL-END}" data-track-index="0" style="position:absolute;left:40px;top:560px;width:1000px;height:562px;mix-blend-mode:screen;opacity:0"></video>')
h.append(f'<audio id="music" src="assets/cut.wav" data-start="0" data-duration="{TOTAL}" data-volume="1"></audio>')
ch=[]
for i,(st,du,lines,acc) in enumerate(cards):
    ws=['<div class="ln">'+''.join(f'<span class="w{" acc" if w.strip(",—.").lower()==acc.lower() else ""}"><span class="wi">{w}</span></span> ' for w in ln.split(' '))+'</div>' for ln in lines]
    ch.append(f'<div id="c{i}" class="card clip" data-start="{max(0,st-W)}" data-duration="{du+2*W}"><div class="frame"></div><div class="glow"></div>\n<img class="orn" src="assets/ornament.webp"><div class="txt">{"".join(ws)}</div><div class="rule"><i></i><b></b></div></div>')
a=s.index('<div id="root"'); a=s.index('>',a)+1; b=s.index('<div id="endtxt"')
s=s[:a]+'\n'+'\n'.join(h)+'\n'+'\n'.join(ch)+'\n'+s[b:]
s=re.sub(r'(<div id="endtxt" class="clip" )data-start="[\d.]+" data-duration="[\d.]+"',rf'\1data-start="{END}" data-duration="{TOTAL-END}"',s)
s=re.sub(r'data-composition-id="main" data-start="0" data-duration="[\d.]+"',f'data-composition-id="main" data-start="0" data-duration="{TOTAL}"',s)
js=[]
for i,(st,du,lines,acc) in enumerate(cards):
    c=f'#c{i}'
    js.append(f'tl.fromTo("{c}",{{y:1920}},{{y:0,duration:{W},ease:"power3.out"}},{st-W});' if st>0 else f'tl.set("{c}",{{y:0}},0);')
    js+= [f'tl.fromTo("{c} .wi",{{y:130}},{{y:0,duration:.38,stagger:.05,ease:"power3.out"}},{st+0.02});',
          f'tl.fromTo("{c} .orn",{{opacity:0,rotation:-60,scale:.6}},{{opacity:1,rotation:0,scale:1,duration:.5,ease:"power2.out"}},{st});',
          f'tl.fromTo("{c} .rule i",{{scaleX:0}},{{scaleX:1,duration:.6,ease:"power2.out"}},{st+0.12});',
          f'tl.fromTo("{c} .rule b",{{scale:0}},{{scale:1,duration:.3}},{st+0.2});',
          f'tl.to("{c}",{{y:-1920,duration:{W},ease:"power3.in"}},{st+du});']
for name,st,du,e in clips:
    if e=='card': js.append(f'tl.fromTo("#v-{name}",{{scale:1.12}},{{scale:1,duration:{du+W},ease:"power2.out"}},{st-W});')
    else:
        js.append(f'tl.fromTo("#v-{name}",{{opacity:0,scale:1.08}},{{opacity:1,scale:1,duration:{X},ease:"power2.inOut"}},{st-X});')
        js.append(f'tl.to("#v-{name}",{{scale:.97,duration:{du},ease:"none"}},{st});' if name=='home' else '')
js.append(f'tl.fromTo("#v-logo",{{opacity:0,scale:.9}},{{opacity:1,scale:1,duration:.4,ease:"power2.out"}},{END});')
js.append(f'tl.fromTo("#endtxt .e1",{{opacity:0,y:30}},{{opacity:1,y:0,duration:.5,ease:"power3.out"}},{END+0.2});')
js.append(f'tl.fromTo("#endtxt .e2",{{opacity:0,y:20}},{{opacity:1,y:0,duration:.5,ease:"power3.out"}},{END+0.45});')
js.append(f'for (let k=0;k<{int(TOTAL*3)+2};k++) tl.set("#grain",{{x:-((k*137)%220),y:-((k*89)%220)}},k/3);')
a=s.index('const tl = gsap.timeline({ paused: true });')+len('const tl = gsap.timeline({ paused: true });'); b=s.index('window.__timelines["main"] = tl;')
s=s[:a]+'\n'+'\n'.join(j for j in js if j)+'\n'+s[b:]
open('index.html','w').write(s)
