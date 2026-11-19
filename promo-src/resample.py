# Resample a slowed-time capture (raw/<clip>/NNNN.jpg + times.json, from rec.js) to even 30 fps frames.
# Each output frame blends the two raw frames around its time.
# Usage: python3 resample.py <raw clip dir> <out dir>
import json, os, sys
import numpy as np
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
meta = json.load(open(os.path.join(src, 'times.json')))
t = np.array(meta['t'])
os.makedirs(out, exist_ok=True)
for f in os.listdir(out):
    if f.endswith('.jpg'):
        os.remove(os.path.join(out, f))
cache = {}
def frame(i):
    if i not in cache:
        if len(cache) > 4:  # keep memory small: only the frames around the current time
            cache.pop(min(cache))
        cache[i] = np.asarray(Image.open(os.path.join(src, '%04d.jpg' % i)).convert('RGB'), np.float32)
    return cache[i]
n = int(meta['ms'] / 1000 * 30)
for k in range(n):
    tk = k * 1000 / 30
    j = int(np.searchsorted(t, tk))
    if j <= 0:
        im = frame(0)
    elif j >= len(t):
        im = frame(len(t) - 1)
    else:
        a, b = t[j - 1], t[j]
        w = 0 if b == a else (tk - a) / (b - a)
        im = frame(j - 1) * (1 - w) + frame(j) * w
    Image.fromarray(im.clip(0, 255).astype('uint8')).save(os.path.join(out, '%04d.jpg' % k), quality=93)
print(out, n, 'frames')
