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

// Individual letters react to the pointer: nearby characters orbit and contract.
const interactiveText = document.querySelectorAll('.nav-links a, .nav-cta, .button, .plan-link, .arrow-link, .text-link');
if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  interactiveText.forEach(el => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const fragment = document.createDocumentFragment();
      [...node.textContent].forEach(char => {
        const span = document.createElement('span');
        span.className = 'char-orbit';
        span.textContent = char;
        fragment.appendChild(span);
      });
      node.parentNode.replaceChild(fragment, node);
    });
    const chars = el.querySelectorAll('.char-orbit');
    el.addEventListener('pointermove', event => {
      chars.forEach((char, i) => {
        const r = char.getBoundingClientRect();
        const dx = event.clientX - (r.left + r.width / 2);
        const dy = event.clientY - (r.top + r.height / 2);
        const distance = Math.hypot(dx, dy);
        if (distance < 58) {
          const force = (58 - distance) / 58;
          const angle = Math.atan2(dy, dx) + Math.PI / 2;
          char.style.transform = `translate(${Math.cos(angle) * force * 8}px,${Math.sin(angle) * force * 8}px) scale(${1 - force * .2}) rotate(${force * 13}deg)`;
          char.classList.add('is-near');
        } else {
          char.style.transform = '';
          char.classList.remove('is-near');
        }
      });
    });
    el.addEventListener('pointerleave', () => chars.forEach(char => {
      char.style.transform = '';
      char.classList.remove('is-near');
    }));
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
