// Shared behaviour: scroll reveal, lightbox, copy-email, hiding top bar, typing swap.
(function () {
  document.documentElement.classList.add('js');

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
