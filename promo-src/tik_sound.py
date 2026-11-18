# Soundtrack for the TikTok reel (Tik.tsx). Writes public/tik_raw.wav, then:
#   ffmpeg -i public/tik_raw.wav -af "loudnorm=I=-14:TP=-1.5:LRA=9" -ar 44100 public/tik.wav
# Cuts must match the shot starts in Tik.tsx. No bells on the logo-assembly shot / end card (user disliked them).
import numpy as np, wave
SR=44100; DUR=16.77; N=int(SR*DUR); t=np.arange(N)/SR; rng=np.random.default_rng(5)
CUTS=[0,2.5,4.5,6.7,8.5,14.27]; PAGE=11.8; BELL=[True,True,True,True,False,False]
L=np.zeros(N); R=np.zeros(N)
def add(s,pan=0,g=1,at=0):
    i=int(at*SR); s=s[:N-i]; L[i:i+len(s)]+=s*g*np.sqrt((1-pan)/2); R[i:i+len(s)]+=s*g*np.sqrt((1+pan)/2)
def lp(x,fc): X=np.fft.rfft(x); f=np.fft.rfftfreq(len(x),1/SR); X*=1/(1+(f/fc)**4); return np.fft.irfft(X,len(x))
def hp(x,fc): X=np.fft.rfft(x); f=np.fft.rfftfreq(len(x),1/SR)+1e-9; X*=(f/fc)**4/(1+(f/fc)**4); return np.fft.irfft(X,len(x))
pad=sum(np.sin(2*np.pi*f*(1+d)*t) for f in [36.71,73.42,110,146.83,174.61,220] for d in (-.003,.003)); pad=lp(pad,800); pad/=np.abs(pad).max()
add(pad*(.75+.25*np.sin(2*np.pi*t/4)),0,.3)
for k in np.arange(.5,14.25,.5):
    tt=np.arange(int(.35*SR))/SR; add(np.sin(2*np.pi*(52*tt-10*(1-np.exp(-tt*14))))*np.exp(-tt*9),0,.35,k)
def bell(f,d=1.4): tt=np.arange(int(d*SR))/SR; return np.sin(2*np.pi*f*tt+2*np.sin(2*np.pi*f*3.5*tt)*np.exp(-tt*6))*np.exp(-tt*3)
def boom(at,g=.55,dec=3):
    tt=np.arange(int(1.4*SR))/SR; add(np.sin(2*np.pi*(48*tt-14*(1-np.exp(-tt*8))))*np.exp(-tt*dec),0,g,at)
for i,c in enumerate(CUTS):
    boom(c)
    n=hp(rng.standard_normal(int(.5*SR)),800); n/=np.abs(n).max(); e=np.exp(-((np.arange(len(n))/SR-.2)/.12)**2); add(n*e,-.3,.12,max(0,c-.2))
    if BELL[i]: add(bell([587.33,659.25,698.46,880][i]),(-.4,.4)[i%2],.1,c+.02)
for k in range(12): add(bell(rng.choice([1760,2093,2637,3136]),.8),rng.uniform(-.8,.8),.03,.1+k*.09)
for off in (0,.06):
    m=int(.03*SR); cl=hp(np.pad(rng.standard_normal(m)*np.exp(-np.linspace(0,9,m)),(0,3000)),2000)[:m]; add(cl,0,.4,5.6+off)
d=PAGE-8.7; r=lp(hp(rng.standard_normal(int(d*SR)),600),5000); r*=np.linspace(0,1,len(r))**2.2; r/=np.abs(r).max(); add(r,.0,.10,8.7)
tt=np.arange(int(d*SR))/SR; sw=sum(np.sin(2*np.pi*f*tt) for f in (110,164.81,220)); sw*=np.linspace(0,1,len(sw))**2; add(sw/3,0,.12,8.7)
boom(PAGE,.6,2.2)
tt=np.arange(int(3*SR))/SR; ch=lp(sum(np.sin(2*np.pi*f*tt) for f in (73.42,110,146.83,220)),600)*np.exp(-tt*.9); add(ch/np.abs(ch).max(),0,.14,PAGE)
fade=np.ones(N); fade[-int(1.5*SR):]=np.linspace(1,0,int(1.5*SR)); L*=fade; R*=fade
pk=max(np.abs(L).max(),np.abs(R).max()); out=np.stack([np.tanh(L/pk*1.2)*.85,np.tanh(R/pk*1.2)*.85],1)
w=wave.open('public/tik_raw.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out*32767).astype('<i2').tobytes()); w.close()
