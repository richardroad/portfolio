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
