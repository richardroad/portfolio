import numpy as np, wave, sys
SR=44100; DUR=float(sys.argv[1]); END_AT=float(sys.argv[2]); N=int(SR*DUR); t=np.arange(N)/SR
rng=np.random.default_rng(7)
def env(a,d,s,r,total,start=0):
    e=np.zeros(N); i0=int(start*SR)
    seg=np.concatenate([np.linspace(0,1,int(a*SR)),np.linspace(1,s,int(d*SR)),np.full(max(0,int((total-a-d-r)*SR)),s),np.linspace(s,0,int(r*SR))])
    seg=seg[:N-i0]; e[i0:i0+len(seg)]=seg; return e
def lp_fast(x,fc,p=2):
    X=np.fft.rfft(x); f=np.fft.rfftfreq(len(x),1/SR); X*=1/(1+(f/fc)**(2*p)); return np.fft.irfft(X,len(x))
def hp_fast(x,fc):
    X=np.fft.rfft(x); f=np.fft.rfftfreq(len(x),1/SR); X*=(f/fc)**4/(1+(f/fc)**4); return np.fft.irfft(X,len(x))
L=np.zeros(N); R=np.zeros(N)
def add(sig,pan=0.,gain=1.):
    global L,R
    L+=sig*gain*np.sqrt((1-pan)/2); R+=sig*gain*np.sqrt((1+pan)/2)
pad=np.zeros(N)
for f in [73.42,110.0,146.83,174.61,220.0,329.63]:
    for det in (-0.12,0.11):
        pad+=(2*((f*(1+det/100)*t+rng.uniform())%1)-1)*(0.8 if f<150 else 0.5)
pad=lp_fast(pad,700)*(0.75+0.25*np.sin(2*np.pi*t/7.5))*env(3.5,0.1,1,4.5,DUR); pad/=np.abs(pad).max()
add(pad,-.2,.22); add(np.roll(pad,int(.013*SR)),.2,.22)
add(np.sin(2*np.pi*36.71*t)*env(4,0.1,1,4,DUR),0,.16)
air=lp_fast(hp_fast(rng.standard_normal(N),3500),9000); air/=np.abs(air).max()
add(air*env(5,0.1,1,5,DUR)*(0.6+0.4*np.sin(2*np.pi*t/5.3)),0,.035)
def riser(start,length,gain):
    n=hp_fast(rng.standard_normal(N),1500); n/=np.abs(n).max(); e=np.zeros(N); i0=int(start*SR); i1=int((start+length)*SR)
    e[i0:i1]=np.linspace(0,1,i1-i0)**2.5; e[i1:i1+int(.08*SR)]=np.linspace(1,0,int(.08*SR)); add(n*e,-.3,gain); add(np.roll(n,333)*e,.3,gain)
def boom(at,gain,freq=48):
    tt=np.clip(t-at,0,None); e=np.exp(-tt*2.2)*(t>=at); add(np.sin(2*np.pi*(freq*tt+12*(1-np.exp(-tt*8))))*e,0,gain)
def chime(at,f,gain,pan=0):
    tt=np.clip(t-at,0,None); e=np.exp(-tt*1.6)*(t>=at); add(sum(np.sin(2*np.pi*f*m*tt)*a for m,a in [(1,1),(2.76,.45),(5.4,.22),(8.93,.1)])*e,pan,gain)
def whoosh(at,gain):
    n=lp_fast(hp_fast(rng.standard_normal(N),400),4000); n/=np.abs(n).max(); e=np.exp(-((t-at)/0.22)**2); add(n*e,-.4,gain); add(np.roll(n,500)*e,.4,gain)
def click(at,gain):
    i=int(at*SR); m=int(.035*SR); n=rng.standard_normal(m)*np.exp(-np.linspace(0,9,m)); n=hp_fast(np.pad(n,(0,N-m)),2000)[:m]
    for off,g in ((0,1),(int(.06*SR),.55)): L[i+off:i+off+m]+=n*gain*g; R[i+off:i+off+m]+=n*gain*g
def shimmer(at,length,gain,fs=(2093,2637,3136,3520,4186)):
    # glittery bells scattered over a window
    k=0; tt=at
    while tt<at+length:
        chime(tt, rng.choice(fs), gain*(1-0.5*(tt-at)/length), rng.uniform(-.8,.8)); tt+=rng.uniform(.045,.09)
# 1) shards fly in 0.3-1.1 -> rising glitter, lands as RR assembles
riser(0.25,0.85,.06); shimmer(0.3,0.75,.012)
chime(1.08,880,.07,-.15); chime(1.10,1318.5,.05,.2); chime(1.13,1760,.03,0); boom(1.08,.32,52)
# preloader fades, wings and menu open
whoosh(2.5,.11); boom(2.57,.42,46); chime(2.6,587.33,.04,-.2); chime(2.66,880,.03,.2)
# 2) shatter scene: cut, light flare builds, glass breaks, second burst
whoosh(5.05,.10); riser(5.4,0.75,.05)
boom(6.1,.22,58); chime(6.12,1174.7,.035,0)
boom(6.9,.55,40)
for k in range(18): chime(6.9+k*0.05+rng.uniform(0,.03), rng.choice([1760,2093,2349,2637,3136,3520,4186]), .03*(1-k/22), rng.uniform(-.9,.9))
for k in range(10): chime(7.33+k*0.06+rng.uniform(0,.03), rng.choice([2349,2637,3136,3520]), .02*(1-k/12), rng.uniform(-.9,.9))
# 3) AI production: cut + two scroll moves
whoosh(9.35,.10); whoosh(9.95,.07); whoosh(12.25,.07)
# 4) photography: cut, focus pull, shutter as it locks, scroll to the series
whoosh(13.55,.10); riser(13.7,1.2,.03); click(14.95,.28); whoosh(16.6,.05); whoosh(18.05,.10); boom(18.15,.2,50)
# end card: logo, then a bell for each ornament line, last line bell
whoosh(END_AT-.05,.12); boom(END_AT+.13,.45,44); chime(END_AT+.16,587.33,.045,-.1)
for i,f in enumerate([880,1046.5,1174.7,1318.5]): chime(END_AT+(16+i*7)/30+.05, f, .05, (-.4,.4,-.2,.2)[i])
chime(END_AT+118/30+.05,1760,.04,0); chime(END_AT+118/30+.09,880,.04,0)
ir_len=int(2.8*SR); ir=rng.standard_normal(ir_len)*np.exp(-np.linspace(0,7,ir_len))
def conv(x):
    n=len(x)+ir_len; return np.fft.irfft(np.fft.rfft(x,n)*np.fft.rfft(ir,n),n)[:len(x)]
wL=conv(L); wR=conv(R); wL/=np.abs(wL).max(); wR/=np.abs(wR).max()
mL=L+0.22*wL*np.abs(L).max(); mR=R+0.22*wR*np.abs(R).max(); fade=env(0.6,0.01,1,2.2,DUR); mL*=fade; mR*=fade
pk=max(np.abs(mL).max(),np.abs(mR).max()); mL=np.tanh(mL/pk*1.1)*.84; mR=np.tanh(mR/pk*1.1)*.84
w=wave.open(sys.argv[3],'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.stack([mL,mR],1)*32767).astype('<i2').tobytes()); w.close()
