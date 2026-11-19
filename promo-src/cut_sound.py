# Soundtrack for Cut.tsx (card/clip edit). 120 BPM; cut times in seconds must match ITEMS in Cut.tsx.
import numpy as np, wave
SR=44100; DUR=18.5; N=int(SR*DUR); t=np.arange(N)/SR; rng=np.random.default_rng(7)
CARDS=[0,3.5,6.0,8.5,11.0]; CLIPS=[1.5,4.5,7.0,9.5,12.0]; END=15.0; PAGE=13.77
L=np.zeros(N); R=np.zeros(N)
def add(s,pan=0,g=1,at=0):
    i=int(at*SR); s=s[:max(0,N-i)]; L[i:i+len(s)]+=s*g*np.sqrt((1-pan)/2); R[i:i+len(s)]+=s*g*np.sqrt((1+pan)/2)
def lp(x,fc): X=np.fft.rfft(x); f=np.fft.rfftfreq(len(x),1/SR); X*=1/(1+(f/fc)**4); return np.fft.irfft(X,len(x))
def hp(x,fc): X=np.fft.rfft(x); f=np.fft.rfftfreq(len(x),1/SR)+1e-9; X*=(f/fc)**4/(1+(f/fc)**4); return np.fft.irfft(X,len(x))
pad=sum(np.sin(2*np.pi*f*(1+d)*t) for f in [36.71,73.42,110,146.83,185.0,220,277.18] for d in (-.003,.003))  # warm D major 9 colour; pad=lp(pad,700); pad/=np.abs(pad).max()
add(pad*(.75+.25*np.sin(2*np.pi*t/4)),0,.26)
def kick(at,g=.38): tt=np.arange(int(.35*SR))/SR; add(np.sin(2*np.pi*(52*tt-10*(1-np.exp(-tt*14))))*np.exp(-tt*9),0,g,at)
def hat(at,g=.05): n=hp(rng.standard_normal(int(.05*SR)),7000)*np.exp(-np.linspace(0,8,int(.05*SR))); add(n/np.abs(n).max(),.2,g,at)
for k in np.arange(1.5,END,.5): kick(k,.3)
def boom(at,g=.55,dec=3):
    tt=np.arange(int(1.4*SR))/SR; add(np.sin(2*np.pi*(46*tt-14*(1-np.exp(-tt*8))))*np.exp(-tt*dec),0,g,at)
def whoosh(at,g=.12):
    n=hp(rng.standard_normal(int(.45*SR)),900); n/=np.abs(n).max(); e=np.linspace(0,1,len(n))**3; add(n*e,-.2,g,max(0,at-.45))
def tock(at,g=.22):  # dry wooden tick for text cards
    tt=np.arange(int(.12*SR))/SR; s=np.sin(2*np.pi*820*tt)*np.exp(-tt*55)+.5*np.sin(2*np.pi*1640*tt)*np.exp(-tt*70); add(s,0,g,at)
# text cards: a soft warm chord that blooms in (no clicks or beeps)
def bloom(at,notes,g=.10,d=1.6):
    tt=np.arange(int(d*SR))/SR; s=sum(np.sin(2*np.pi*f*tt)+.3*np.sin(2*np.pi*2*f*tt) for f in notes)
    env=np.minimum(tt/.18,1)*np.exp(-tt*1.4); s=lp(s*env,1800); add(s/np.abs(s).max(),0,g,at)
CH=[(293.66,369.99,440,554.37),(246.94,293.66,369.99,440),(220,277.18,329.63,440),(196,246.94,293.66,369.99),(220,293.66,369.99,493.88)]
for c,ch in zip(CARDS,CH): bloom(c,ch)
for c in CLIPS: boom(c); whoosh(c)
# glass burst on the shatter clip
n=hp(rng.standard_normal(int(.7*SR)),2500)*np.exp(-np.linspace(0,7,int(.7*SR))); add(n/np.abs(n).max(),0,.16,1.52)
# swell into the home page, no bells
d=PAGE-12.4; r=lp(hp(rng.standard_normal(int(d*SR)),600),5000); r*=np.linspace(0,1,len(r))**2.2; r/=np.abs(r).max(); add(r,0,.09,12.4)
boom(PAGE,.5,2.4)
boom(END,.6,2.2); tt=np.arange(int(3.4*SR))/SR; ch=lp(sum(np.sin(2*np.pi*f*tt) for f in (73.42,110,146.83,220)),600)*np.exp(-tt*.8); add(ch/np.abs(ch).max(),0,.16,END)
fade=np.ones(N); fade[-int(2.0*SR):]=np.linspace(1,0,int(2.0*SR)); L*=fade; R*=fade
pk=max(np.abs(L).max(),np.abs(R).max()); out=np.stack([np.tanh(L/pk*1.2)*.85,np.tanh(R/pk*1.2)*.85],1)
w=wave.open('public/cut_raw.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out*32767).astype('<i2').tobytes()); w.close()
