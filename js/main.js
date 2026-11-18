// Shared behaviour: scroll reveal, lightbox, copy-email, hiding top bar, typing swap.
(function () {
  const root = document.documentElement;
  root.classList.add('js');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Autoplay guard. Safari only autoplays when the muted *property* is true, so set it and call play().
  // If a video still has not started after a few seconds (blocked, or the host cannot stream it),
  // swap it for an image: an animated WebP when data-fallback is given, otherwise its poster.
  // The page never shows an empty box.
  document.querySelectorAll('video[autoplay]').forEach((v) => {
    let ok = false, swapped = false;
    const start = () => {
      v.muted = true; v.defaultMuted = true; v.playsInline = true;
      if (v.paused) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
    };
    const swap = () => {
      if (ok || swapped || !v.isConnected) return;
      const src = v.getAttribute('data-fallback') || v.getAttribute('poster');
      if (!src) return;
      swapped = true;
      const img = new Image();
      img.className = v.className;
      img.alt = v.getAttribute('aria-label') || '';
      if (v.getAttribute('aria-hidden')) img.setAttribute('aria-hidden', 'true');
      img.onload = () => v.replaceWith(img);
      img.src = src;
    };
    v.addEventListener('timeupdate', () => { if (v.currentTime > 0.05) ok = true; });
    v.addEventListener('error', swap);
    start();
    ['pointerdown', 'touchstart', 'keydown'].forEach((ev) => addEventListener(ev, () => { if (!ok) start(); }, { once: true, passive: true }));
    setTimeout(swap, 3500);
  });

  // A fresh visit via a link always starts at the top (some browsers restore an old position).
  // Back/forward and reload keep the browser's usual restore.
  const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  if ((!nav || nav.type === 'navigate') && !location.hash) {
    const top = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    top();
    addEventListener('pagereveal', top);
    addEventListener('load', () => { if (scrollY && !window.__rrUserScrolled) top(); });
    addEventListener('wheel', () => { window.__rrUserScrolled = true; }, { once: true, passive: true });
    addEventListener('touchstart', () => { window.__rrUserScrolled = true; }, { once: true, passive: true });
    addEventListener('keydown', () => { window.__rrUserScrolled = true; }, { once: true });
  }

  // Preloader: shards of light fly in and assemble the RR mark, then the page is revealed.
  // Shown once per browser session; the inline script in <head> adds .pre when it should run.
  const pre = document.querySelector('.preloader');
  if (pre && root.classList.contains('pre')) {
    try { sessionStorage.setItem('rrSeen', '1'); } catch (e) {}
    const cv = pre.querySelector('canvas'), mark = pre.querySelector('img');
    const cx = cv.getContext('2d');
    let finished = false;
    const finish = () => {
      if (finished) return; finished = true;
      pre.classList.add('formed');
      setTimeout(() => {
        pre.classList.add('out');
        root.classList.remove('pre');
        setTimeout(() => pre.remove(), 900);
      }, 650);
    };
    pre.addEventListener('click', finish);
    setTimeout(finish, 4500);                       // never hold the page hostage

    const go = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const W = cv.width = innerWidth * dpr, H = cv.height = innerHeight * dpr;
      const r = mark.getBoundingClientRect();
      if (!mark.naturalWidth || !r.width) return finish();
      // sample bright pixels of the mark at its on-screen size
      const sw = Math.round(r.width), sh = Math.round(r.height);
      const off = document.createElement('canvas'); off.width = sw; off.height = sh;
      const oc = off.getContext('2d'); oc.drawImage(mark, 0, 0, sw, sh);
      let data;
      try { data = oc.getImageData(0, 0, sw, sh).data; } catch (e) { return finish(); }
      const step = innerWidth < 700 ? 3 : 3, pts = [];
      for (let y = 0; y < sh; y += step) for (let x = 0; x < sw; x += step) {
        const k = (y * sw + x) * 4, v = (data[k] + data[k + 1] + data[k + 2]) / 3;
        if (v > 42 && Math.random() < .85) {
          const a = Math.random() * Math.PI * 2, d = (.55 + Math.random() * .7) * Math.max(W, H);
          pts.push({
            tx: (r.left + x) * dpr, ty: (r.top + y) * dpr, v,
            sx: W / 2 + Math.cos(a) * d, sy: H / 2 + Math.sin(a) * d,
            rot: (Math.random() - .5) * 10, delay: Math.random() * .4, s: (1.2 + Math.random() * 2.4) * dpr, gold: Math.random() < .12
          });
        }
      }
      const T = 1900, t0 = performance.now();
      const ease = (t) => 1 - Math.pow(1 - t, 4);
      (function frame(now) {
        if (finished) return;
        const g = (now - t0) / T;
        cx.globalCompositeOperation = 'source-over';
        cx.fillStyle = 'rgba(0,0,0,.35)'; cx.fillRect(0, 0, W, H);   // short light trails
        cx.globalCompositeOperation = 'lighter';
        for (const p of pts) {
          const t = Math.min(1, Math.max(0, (g - p.delay) / (1 - .45)));
          const e = ease(t), x = p.sx + (p.tx - p.sx) * e, y = p.sy + (p.ty - p.sy) * e;
          const sz = p.s * (1 + (1 - e) * 4), l = Math.min(255, p.v * (1.2 + (1 - e) * 2));
          cx.globalAlpha = Math.min(1, t * 4) * (.55 + .45 * e);
          cx.fillStyle = p.gold ? `rgb(${l},${l * .78 | 0},${l * .42 | 0})` : `rgb(${l},${l * .97 | 0},${l * .92 | 0})`;
          cx.save(); cx.translate(x, y); cx.rotate(p.rot * (1 - e));
          cx.fillRect(-sz / 2, -sz / 6, sz, sz / 3 + 1);   // thin glass-like shards
          cx.restore();
        }
        if (g < 1.02) requestAnimationFrame(frame);
        else { finish(); cv.style.transition = 'opacity .6s'; cv.style.opacity = 0; }
      })(t0);
    };
    if (mark.complete && mark.naturalWidth) requestAnimationFrame(go);
    else { mark.addEventListener('load', go); mark.addEventListener('error', finish); }
  }

  // Page transitions. Modern browsers use the CSS view transition; others get a short blur-out here.
  if (!reduced && !('onpagereveal' in window)) {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
      e.preventDefault();
      try { sessionStorage.setItem('rrNav', '1'); } catch (err) {}
      root.classList.add('leaving');
      setTimeout(() => { location.href = url.href; }, 360);
    });
    addEventListener('pageshow', (e) => { if (e.persisted) root.classList.remove('leaving', 'enter'); });
  }

  // Custom cursor: gold dot + trailing ring, mouse/trackpad only
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const c = document.createElement('div');
    c.className = 'cursor';
    c.setAttribute('aria-hidden', 'true');
    c.innerHTML = '<i class="ring"><b data-label="view"></b></i><i class="dot"></i>';
    document.body.appendChild(c);
    root.classList.add('has-cursor');
    const dot = c.querySelector('.dot'), ring = c.querySelector('.ring');
    let mx = -100, my = -100, rx = -100, ry = -100, moving = false;
    const loop = () => {
      rx += (mx - rx) * (reduced ? 1 : .32); ry += (my - ry) * (reduced ? 1 : .32);
      dot.style.transform = `translate3d(${mx}px,${my}px,0)`;
      ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      if (Math.abs(mx - rx) + Math.abs(my - ry) > .2) requestAnimationFrame(loop); else moving = false;
    };
    addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY;
      if (!c.classList.contains('on')) c.classList.add('on');
      if (!moving) { moving = true; requestAnimationFrame(loop); }
    }, { passive: true });
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest && e.target.closest('[data-full], a, button, [role="button"], label');
      c.classList.toggle('view', !!(t && t.matches('[data-full]')));
      c.classList.toggle('link', !!(t && !t.matches('[data-full]')));
    });
    document.addEventListener('mouseleave', () => c.classList.remove('on'));
    addEventListener('pointerdown', () => c.classList.add('down'));
    addEventListener('pointerup', () => c.classList.remove('down'));
  }

  // Reveal on scroll
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -8% 0px' })
    : null;
  document.querySelectorAll('.reveal').forEach((el) => (io ? io.observe(el) : el.classList.add('in')));

  // Top bar hides when scrolling down, shows when scrolling up
  const bar = document.querySelector('.topbar');
  if (bar) {
    let last = 0;
    addEventListener('scroll', () => {
      const y = scrollY;
      bar.classList.toggle('hide', y > last && y > 200);
      last = y;
    }, { passive: true });
  }

  // Toast
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  document.body.appendChild(toast);
  let tt;
  function say(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(tt);
    tt = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  // Copy email
  document.querySelectorAll('[data-copy]').forEach((b) => {
    b.addEventListener('click', () => {
      const text = b.getAttribute('data-copy');
      const done = () => say('Email copied: ' + text);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, () => say(text));
      } else say(text);
    });
  });

  // Typing swap: "it's not ai" -> "it's me."
  document.querySelectorAll('[data-swap]').forEach((el) => {
    const words = el.getAttribute('data-swap').split('|');
    const out = el.querySelector('.txt');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { out.textContent = words[0]; return; }
    let w = 0, i = 0, del = false;
    (function tick() {
      const word = words[w];
      i += del ? -1 : 1;
      out.textContent = word.slice(0, i);
      let wait = del ? 45 : 95;
      if (!del && i === word.length) { del = true; wait = 1800; }
      else if (del && i === 0) { del = false; w = (w + 1) % words.length; wait = 400; }
      setTimeout(tick, wait);
    })();
  });

  // Scroll-driven frame sequence (home portrait shattering into glass)
  const sh = document.querySelector('.shatter');
  if (sh && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const N = 153;                                   // clip ends on the cracked face (no fade to black)
    const dir = Math.min(screen.width, innerWidth) < 760 ? 's' : 'l';
    const canvas = sh.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const frames = new Array(N);
    const loaded = new Uint8Array(N);
    let current = -1, want = 0, ticking = false;
    sh.classList.add('scrub');

    const src = (i) => `img/shatter/${dir}/${String(i + 1).padStart(3, '0')}.webp`;
    function load(i) {
      return new Promise((res) => {
        const im = new Image();
        im.decoding = 'async';
        im.onload = () => {
          // decode up front so drawing during scroll does not stall
          const done = () => { frames[i] = im; loaded[i] = 1; res(); };
          im.decode ? im.decode().then(done, done) : done();
        };
        im.onerror = res;
        im.src = src(i);
      });
    }
    function nearest(i) {
      for (let d = 0; d < N; d++) {
        if (i - d >= 0 && loaded[i - d]) return i - d;
        if (i + d < N && loaded[i + d]) return i + d;
      }
      return -1;
    }
    function size() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      current = -1; draw();
    }
    // pos = frame position that is drawn; it eases toward the scroll target so slow scrolling
    // glides, and neighbouring frames are cross-faded so motion stays smooth between frames.
    let pos = -1, target = 0, lastKey = '';
    function progress() {
      const r = sh.getBoundingClientRect();
      const track = sh.offsetHeight - innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / (track || 1)));
      sh.style.setProperty('--p', p.toFixed(4));
      sh.style.setProperty('--hint', Math.max(0, 1 - p * 8).toFixed(3));
      sh.style.setProperty('--reveal', Math.min(1, Math.max(0, (p - .74) / .16)).toFixed(3));
      // the clip plays over the first 80% of the scroll, then holds on the last frame
      target = Math.min(1, p / .8) * (N - 1);
      want = Math.round(target);
      return p;
    }
    function paint(a, b, t, zoom) {
      const cw = canvas.width, ch = canvas.height, im = frames[a];
      const tall = cw / ch < 0.8;
      // The clip is vertical (9:16). Portrait screens: fill the screen. Landscape screens:
      // fit by height, centred, and dissolve the left/right edges into black.
      const s = (tall ? Math.max(cw / im.width, ch / im.height) : ch / im.height) * zoom;
      const w = im.width * s, h = im.height * s, x = (cw - w) / 2, y = (ch - h) / 2;
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(im, x, y, w, h);
      if (b !== a && t > 0.02) { ctx.globalAlpha = t; ctx.drawImage(frames[b], x, y, w, h); ctx.globalAlpha = 1; }
      if (!tall) {
        const f = w * 0.22;
        for (const [x0, x1] of [[x, x + f], [x + w, x + w - f]]) {
          const g = ctx.createLinearGradient(x0, 0, x1, 0);
          g.addColorStop(0, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          ctx.fillRect(Math.min(x0, x1), 0, f, ch);
        }
      }
    }
    function draw() {
      ticking = false;
      const p = progress();
      if (pos < 0) pos = target;
      pos += (target - pos) * 0.22;
      if (Math.abs(target - pos) < 0.01) pos = target;
      const f0 = Math.floor(pos), t = pos - f0;
      const a = nearest(f0), bIdx = nearest(Math.min(N - 1, f0 + 1));
      if (a < 0) return;
      const b = (bIdx === f0 + 1) ? bIdx : a;          // only blend with a real neighbour
      const zoom = 1.08 - 0.08 * Math.min(1, p / .8);  // slow push-out while the clip plays
      const key = a + ':' + b + ':' + t.toFixed(2) + ':' + zoom.toFixed(3) + ':' + canvas.width;
      if (key !== lastKey || current < 0) { paint(a, b, b === a ? 0 : t, zoom); lastKey = key; current = a; }
      if (pos !== target) queue();
    }
    const queue = () => { if (!ticking) { ticking = true; requestAnimationFrame(draw); } };
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', size);

    // first and last frames first, then the rest in order (every 4th first for a quick rough pass)
    Promise.all([load(0), load(N - 1)]).then(() => {
      sh.classList.add('ready');
      size();
      const order = [];
      for (let i = 4; i < N - 1; i += 4) order.push(i);
      for (let i = 1; i < N - 1; i++) if (i % 4) order.push(i);
      let k = 0;
      const next = () => { if (k < order.length) load(order[k++]).then(() => { if (Math.abs(order[k - 1] - want) < 3) { current = -1; queue(); } next(); }); };
      for (let j = 0; j < 6; j++) next();   // 6 parallel loaders
    });
  }

  // Carousels (process steps): arrow buttons + progress bar that tracks the scroll position
  document.querySelectorAll('.process').forEach((box) => {
    const track = box.querySelector('.carousel'), bar = box.querySelector('.bar i');
    const prev = box.querySelector('.prev'), nxt = box.querySelector('.nxt');
    if (!track) return;
    const step = () => { const it = track.firstElementChild; return Math.min(it ? it.getBoundingClientRect().width + 14 : 1e9, track.clientWidth * .85); };
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      const vis = track.clientWidth / track.scrollWidth;
      bar.style.width = (vis * 100) + '%';
      bar.style.left = (max > 0 ? (track.scrollLeft / max) * (100 - vis * 100) : 0) + '%';
      prev.disabled = track.scrollLeft < 4; nxt.disabled = track.scrollLeft > max - 4;
    };
    prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    nxt.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
    track.addEventListener('scroll', update, { passive: true });
    track.querySelectorAll('img').forEach((im) => im.addEventListener('load', update));
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(track);
    addEventListener('resize', update);
    update();
  });

  // Photography hero: dust drifting in the red beam (follows the pointer / phone tilt a little)
  const dust = document.querySelector('.p-hero .dust');
  if (dust && !reduced) {
    const cx = dust.getContext('2d');
    let W = 0, H = 0, dpr = 1, px = 0, py = 0, tx = 0, ty = 0, on = true;
    const P = [];
    let cw = 0, ch = 0;
    // Phones fire "resize" while scrolling (the address bar shows/hides). Only react when the
    // canvas really changed size, and then rescale the existing dust instead of re-scattering it.
    const size = () => {
      const w = dust.clientWidth, h = dust.clientHeight;
      if (w === cw && h === ch) return;
      dpr = Math.min(devicePixelRatio || 1, 2);
      const sx = cw ? w / cw : 1, sy = ch ? h / ch : 1;
      cw = w; ch = h;
      W = dust.width = w * dpr; H = dust.height = h * dpr;
      if (P.length) { P.forEach((p) => { p.x *= sx; p.y *= sy; }); return; }
      const n = innerWidth < 700 ? 26 : 40;
      for (let i = 0; i < n; i++) P.push({ x: Math.random() * W, y: Math.random() * H, z: .3 + Math.random() * .7,
        r: (.5 + Math.random() * 1.3) * dpr, vy: (.04 + Math.random() * .12) * dpr, ph: Math.random() * 6.28, tw: .4 + Math.random() });
    };
    size(); addEventListener('resize', size);
    addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse') return; tx = (e.clientX / innerWidth - .5) * 2; ty = (e.clientY / innerHeight - .5) * 2; }, { passive: true });
    addEventListener('deviceorientation', (e) => { if (e.gamma != null) { tx = Math.max(-1, Math.min(1, e.gamma / 30)); ty = Math.max(-1, Math.min(1, (e.beta - 45) / 30)); } });
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { const was = on; on = e.isIntersecting; if (on && !was) requestAnimationFrame(loop); }).observe(dust);
    function loop(t) {
      if (!on) return;
      px += (tx - px) * .03; py += (ty - py) * .03;
      cx.clearRect(0, 0, W, H);
      for (const p of P) {
        p.y -= p.vy * p.z; p.x += Math.sin(t / 3000 + p.ph) * .08 * dpr;
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
        const x = p.x + px * 22 * p.z * dpr, y = p.y + py * 14 * p.z * dpr;
        // brighter near the beam's centre (top middle)
        const beam = Math.max(0, 1 - Math.hypot((x - W / 2) / (W * .42), y / (H * .9)));
        const a = (.15 + .55 * beam) * (.55 + .45 * Math.sin(t / 1400 * p.tw + p.ph));
        const g = cx.createRadialGradient(x, y, 0, x, y, p.r * 3);
        g.addColorStop(0, `rgba(255,${190 - 110 * beam | 0},${170 - 120 * beam | 0},${a})`); g.addColorStop(1, 'rgba(255,80,60,0)');
        cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, p.r * 3, 0, 6.28); cx.fill();
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  // Photography hero: exposure readout quietly re-metering, like a camera display
  const expo = document.querySelector('.expo');
  if (expo && !reduced) {
    const V = { f: ['f/1.4', 'f/1.8', 'f/2', 'f/2.8'], s: ['1/60', '1/80', '1/125', '1/160', '1/200'], iso: ['ISO 200', 'ISO 400', 'ISO 640', 'ISO 800'] };
    const keys = Object.keys(V);
    setInterval(() => {
      const k = keys[Math.random() * keys.length | 0], el = expo.querySelector(`[data-k="${k}"]`);
      let v; do { v = V[k][Math.random() * V[k].length | 0]; } while (v === el.textContent);
      el.classList.add('tick');
      setTimeout(() => { el.textContent = v; setTimeout(() => el.classList.remove('tick'), 60); }, 450);
    }, 2600);
  }

  // Case films: big play button, then native controls with sound
  document.querySelectorAll('[data-film]').forEach((f) => {
    const v = f.querySelector('video'), b = f.querySelector('.film-play');
    b.addEventListener('click', () => { f.classList.add('playing'); v.controls = true; v.muted = false; v.play().catch(() => {}); });
    v.addEventListener('ended', () => { f.classList.remove('playing'); v.controls = false; v.currentTime = 0; });
  });

  // Lightbox: any [data-full] inside a [data-gallery] group
  const groups = {};
  document.querySelectorAll('[data-gallery] [data-full]').forEach((el) => {
    const g = el.closest('[data-gallery]').getAttribute('data-gallery');
    (groups[g] = groups[g] || []).push(el);
  });
  if (!Object.keys(groups).length) return;

  const lb = document.createElement('div');
  lb.className = 'lb';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.innerHTML = '<img alt=""><button class="x" aria-label="Close">✕</button>' +
    '<button class="prev" aria-label="Previous">‹</button><button class="nxt" aria-label="Next">›</button><div class="count"></div>';
  document.body.appendChild(lb);
  const img = lb.querySelector('img'), count = lb.querySelector('.count');
  let list = [], idx = 0, opener = null;

  function show(n) {
    idx = (n + list.length) % list.length;
    const el = list[idx];
    img.src = el.getAttribute('data-full');
    img.alt = (el.querySelector('img') || {}).alt || '';
    count.textContent = (idx + 1) + ' / ' + list.length;
    lb.querySelector('.prev').hidden = lb.querySelector('.nxt').hidden = list.length < 2;
  }
  function open(g, el) {
    list = groups[g]; opener = el; show(list.indexOf(el));
    lb.classList.add('open'); document.body.style.overflow = 'hidden';
    lb.querySelector('.x').focus();
  }
  function close() {
    lb.classList.remove('open'); document.body.style.overflow = '';
    if (opener) opener.focus();
  }
  Object.entries(groups).forEach(([g, els]) => els.forEach((el) => el.addEventListener('click', () => open(g, el))));
  lb.querySelector('.x').onclick = close;
  lb.querySelector('.prev').onclick = () => show(idx - 1);
  lb.querySelector('.nxt').onclick = () => show(idx + 1);
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
  let sx = null;
  lb.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    sx = null;
  });
})();
