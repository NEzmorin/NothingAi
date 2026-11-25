// Nothing AI — small interactions that make the universe feel alive.
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }));
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const topbar = document.querySelector('.topbar');
const updateScroll = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
  document.documentElement.style.setProperty('--scroll-progress', progress + '%');
  topbar?.classList.toggle('scrolled', window.scrollY > 12);
};
window.addEventListener('scroll', updateScroll, { passive: true });
updateScroll();

// Reveal sections gently as they enter the viewport.
if (!reduceMotion && 'IntersectionObserver' in window) {
  const revealTargets = document.querySelectorAll('.section-kicker, .intro-grid, .specimen, .plans-head, .plan-card, .manifesto-layout, .final-cta h2');
  revealTargets.forEach((el, index) => {
    el.classList.add('reveal');
    if (el.classList.contains('plan-card')) el.style.transitionDelay = (index % 4) * 90 + 'ms';
  });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach(el => observer.observe(el));
}

// Letter orbit: pointer-reactive letters, with each word kept together for clean wrapping.
const orbitSelector = '.hero h1, .intro h2, .plans h2, .manifesto-big, .final-cta h2, .nav-links a, .nav-cta, .button, .plan-link, .arrow-link, .text-link';
const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (!reduceMotion && hasFinePointer) {
  document.querySelectorAll(orbitSelector).forEach(el => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) if (walker.currentNode.nodeValue.trim()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const fragment = document.createDocumentFragment();
      node.nodeValue.split(/(\\s+)/).forEach(part => {
        if (/^\\s+$/.test(part)) { fragment.appendChild(document.createTextNode(part)); return; }
        const word = document.createElement('span'); word.className = 'orbit-word';
        for (const char of part) {
          const letter = document.createElement('span');
          letter.className = 'char-orbit'; letter.textContent = char; word.appendChild(letter);
        }
        fragment.appendChild(word);
      });
      node.parentNode.replaceChild(fragment, node);
    });
    const letters = [...el.querySelectorAll('.char-orbit')];
    const isDisplay = el.matches('h1,h2,.manifesto-big');
    el.addEventListener('pointermove', event => {
      const radius = isDisplay ? 92 : 58;
      letters.forEach(letter => {
        const rect = letter.getBoundingClientRect();
        const dx = rect.left + rect.width / 2 - event.clientX;
        const dy = rect.top + rect.height / 2 - event.clientY;
        const distance = Math.hypot(dx, dy);
        if (distance >= radius) { letter.style.transform = ''; letter.classList.remove('is-near'); return; }
        const strength = 1 - distance / radius, angle = Math.atan2(dy, dx), tangent = angle + Math.PI / 2;
        const push = strength * (isDisplay ? 15 : 9), radial = strength * 5;
        const x = Math.cos(tangent) * push + Math.cos(angle) * radial;
        const y = Math.sin(tangent) * push + Math.sin(angle) * radial;
        letter.style.transform = `translate3d(${x}px,${y}px,0) rotate(${strength * 17 * (dx >= 0 ? 1 : -1)}deg) scale(${1 - strength * .16})`;
        letter.classList.add('is-near');
      });
    });
    el.addEventListener('pointerleave', () => letters.forEach(letter => { letter.style.transform = ''; letter.classList.remove('is-near'); }));
  });
}
// Soft cursor aura, deliberately disabled on touch devices.
if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const aura = document.createElement('div');
  aura.className = 'cursor-aura';
  document.body.appendChild(aura);
  window.addEventListener('pointermove', event => {
    aura.style.left = event.clientX + 'px';
    aura.style.top = event.clientY + 'px';
    aura.classList.add('active');
  }, { passive: true });
  document.addEventListener('pointerleave', () => aura.classList.remove('active'));
}

// Subtle 3D tilt on desktop pricing cards.
if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('.plan-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      const r = card.getBoundingClientRect();
      const x = (event.clientX - r.left) / r.width;
      const y = (event.clientY - r.top) / r.height;
      card.style.setProperty('--mx', (x * 100) + '%');
      card.style.setProperty('--my', (y * 100) + '%');
      card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 5}deg) rotateY(${(x - 0.5) * 6}deg) translateY(-5px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

document.body.classList.add('js-ready');

/* Open the cinematic Non's conversation panel */
const demoModal = document.querySelector('#non-demo');
const demoOpen = document.querySelector('[data-open-demo]');
const demoCloseButtons = document.querySelectorAll('[data-close-demo]');
let previousFocus = null;
function openDemo() {
  if (!demoModal) return;
  previousFocus = document.activeElement;
  demoModal.classList.add('is-open');
  demoModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('demo-locked');
  demoModal.querySelector('.demo-close')?.focus();
}
function closeDemo() {
  if (!demoModal) return;
  demoModal.classList.remove('is-open');
  demoModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('demo-locked');
  previousFocus?.focus();
}
demoOpen?.addEventListener('click', openDemo);
demoCloseButtons.forEach(button => button.addEventListener('click', closeDemo));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && demoModal?.classList.contains('is-open')) closeDemo();
});
