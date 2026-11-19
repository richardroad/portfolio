# Turns the reel index.html into the Telegram-groups variant: longer end card with services + contacts.
import re, sys
TG = sys.argv[1] if len(sys.argv) > 1 else 'richardroad'
IG = 'richard.road'
s = open('index.html').read()
END, TOTAL = 13.0, 18.5
s = re.sub(r'data-composition-id="main" data-start="0" data-duration="[\d.]+"', f'data-composition-id="main" data-start="0" data-duration="{TOTAL}"', s)
s = s.replace('data-start="13.0" data-media-start="2.1667" data-duration="3.5"', f'data-start="{END}" data-media-start="0.17" data-duration="{TOTAL-END}"')
s = s.replace('style="position:absolute;left:40px;top:560px;width:1000px;height:562px;mix-blend-mode:screen;opacity:0"', 'style="position:absolute;left:220px;top:250px;width:640px;height:360px;mix-blend-mode:screen;opacity:0"')
s = re.sub(r'<audio id="music" src="assets/cut.wav" data-start="0" data-duration="[\d.]+"', f'<audio id="music" src="assets/cut_tg.wav" data-start="0" data-duration="{TOTAL}"', s)
items = ['Сайты-портфолио', 'CV и резюме', 'Личный бренд', 'AI-визуалы и видео', 'Консультации по AI']
end = (f'<div id="endtxt" class="clip" data-start="{END}" data-duration="{TOTAL-END}">'
       '<div class="k">Что я делаю</div>'
       + ''.join(f'<div class="it"><b></b>{t}</div>' for t in items) +
       '<div class="cta">Нужно что-то из этого —<br>пишите в <span class="acc">директ</span></div>'
       f'<div class="ct ct1"><span class="lb">Instagram</span> @{IG}</div>'
       f'<div class="ct"><span class="lb">Telegram</span> @{TG}</div></div>')
s = re.sub(r'<div id="endtxt".*?</div></div>', end, s, count=1, flags=re.S)
css = '''#endtxt{position:absolute;left:0;right:0;top:650px;text-align:center;z-index:6;font-family:Onest;font-weight:500}
.k{font-size:30px;letter-spacing:.32em;text-transform:uppercase;color:#c9a45c;margin-bottom:34px}
.it{font-size:58px;letter-spacing:-.02em;color:#f2ece2;line-height:1.5;display:flex;align-items:center;justify-content:center;gap:24px}
.it b{width:12px;height:12px;background:#c9a45c;transform:rotate(45deg);display:inline-block}
.cta{margin-top:70px;font-size:60px;line-height:1.2;letter-spacing:-.02em;color:#f2ece2}
.ct{margin-top:22px;font-size:46px;color:#f2ece2}
.ct1{margin-top:64px}
.lb{color:#ffffff80;margin-right:14px}'''
s = re.sub(r'#endtxt\{[^}]*\}', css, s, count=1)
js = [f'tl.fromTo("#v-logo",{{opacity:0,scale:.9}},{{opacity:1,scale:1,duration:.4,ease:"power2.out"}},{END});',
      f'tl.fromTo("#endtxt .k",{{opacity:0,y:20}},{{opacity:1,y:0,duration:.4,ease:"power3.out"}},{END+0.2});',
      f'tl.fromTo("#endtxt .it",{{opacity:0,y:30}},{{opacity:1,y:0,duration:.45,stagger:.18,ease:"power3.out"}},{END+0.35});',
      f'tl.fromTo("#endtxt .cta",{{opacity:0,y:30}},{{opacity:1,y:0,duration:.5,ease:"power3.out"}},{END+1.3});',
      f'tl.fromTo("#endtxt .ct",{{opacity:0,y:20}},{{opacity:1,y:0,duration:.45,stagger:.15,ease:"power3.out"}},{END+1.7});']
s = re.sub(r'tl\.fromTo\("#v-logo".*?\n', '', s)
s = re.sub(r'tl\.fromTo\("#endtxt \.e[12]".*?\n', '', s)
s = re.sub(r'for \(let k=0;k<\d+;', f'for (let k=0;k<{int(TOTAL*3)+2};', s)
s = s.replace('window.__timelines["main"] = tl;', '\n'.join(js) + '\nwindow.__timelines["main"] = tl;')
open('index.html', 'w').write(s)
