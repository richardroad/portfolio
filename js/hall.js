// Hall mock: map scroll progress through the section to the camera moving down the corridor.
(function () {
  const hall = document.querySelector('[data-hall]'); if (!hall) return;
  const world = hall.querySelector('.world');
  let ticking = false;
  const len = () => parseFloat(getComputedStyle(hall).getPropertyValue('--len')) || 4200;
  function draw() {
    ticking = false;
    const r = hall.getBoundingClientRect(), track = hall.offsetHeight - innerHeight;
    const p = Math.min(1, Math.max(0, -r.top / (track || 1)));
    const e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;   // ease in/out the walk
    world.style.setProperty('--z', (e * (len() - 900)).toFixed(1) + 'px');
    hall.classList.toggle('walking', p > .02);
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(draw); } }, { passive: true });
  addEventListener('resize', draw); draw();
})();
