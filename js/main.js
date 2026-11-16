// Shared behaviour: scroll reveal, lightbox, copy-email, hiding top bar, typing swap.
(function () {
  const root = document.documentElement;
  root.classList.add('js');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Autoplay guard: Safari only autoplays when the *property* muted is true (the attribute alone
  // is not always enough, e.g. when markup is injected). Kick every autoplay video explicitly,
  // and retry on the first touch/click if the browser still refused (Low Power Mode etc.).
  const vids = [...document.querySelectorAll('video[autoplay]')];
  const kick = () => vids.forEach((v) => {
    v.muted = true; v.defaultMuted = true; v.playsInline = true;
    if (v.paused) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
  });
  if (vids.length) {
    kick();
    addEventListener('load', kick, { once: true });
    ['pointerdown', 'touchstart', 'keydown', 'scroll'].forEach((ev) => addEventListener(ev, kick, { once: true, passive: true }));
    document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });
  }

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
    const N = 192;
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
        im.onload = () => { frames[i] = im; loaded[i] = 1; res(); };
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
    function draw() {
      ticking = false;
      const r = sh.getBoundingClientRect();
      const track = sh.offsetHeight - innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / (track || 1)));
      sh.style.setProperty('--p', p.toFixed(4));
      sh.style.setProperty('--hint', Math.max(0, 1 - p * 8).toFixed(3));
      sh.style.setProperty('--reveal', Math.min(1, Math.max(0, (p - .8) / .15)).toFixed(3));
      want = Math.round(p * (N - 1));
      const i = nearest(want);
      if (i < 0 || i === current) return;
      current = i;
      const im = frames[i], cw = canvas.width, ch = canvas.height;
      const zoom = 1.08 - 0.08 * p;                   // slow push-out while scrolling
      const s = Math.max(cw / im.width, ch / im.height) * zoom;
      const w = im.width * s, h = im.height * s;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(im, (cw - w) / 2, (ch - h) / 2, w, h);
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
