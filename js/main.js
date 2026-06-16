/* =============================================
   SOL & PISCINAS — main.js
   ============================================= */

/* ---- Year in footer ---- */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---- Navbar: scroll state ---- */
const navbar = document.getElementById('navbar');
let lastScroll = 0;

function updateNavbar() {
  const scrollY = window.scrollY;
  navbar.classList.toggle('scrolled', scrollY > 40);
  lastScroll = scrollY;
}

window.addEventListener('scroll', updateNavbar, { passive: true });
updateNavbar();

/* ---- Mobile menu ---- */
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('navbar-nav');

function openMenu() {
  navMenu.classList.add('is-open');
  hamburger.setAttribute('aria-expanded', 'true');
  hamburger.setAttribute('aria-label', 'Fechar menu');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  navMenu.classList.remove('is-open');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-label', 'Abrir menu');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
  if (isOpen) closeMenu(); else openMenu();
});

/* Close menu when a link is clicked */
navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

/* Close on Escape */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && hamburger.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    hamburger.focus();
  }
});

/* Close on outside click */
document.addEventListener('click', e => {
  if (
    hamburger.getAttribute('aria-expanded') === 'true' &&
    !navbar.contains(e.target)
  ) closeMenu();
});

/* ---- Scroll reveal (Intersection Observer) ---- */
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { rootMargin: '-60px 0px', threshold: 0.1 }
);

revealEls.forEach(el => revealObserver.observe(el));

/* ---- FAQ Accordion ---- */
const faqItems = document.querySelectorAll('.faq__question');

faqItems.forEach(btn => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    const answerId = btn.getAttribute('aria-controls');
    const answer   = document.getElementById(answerId);

    /* Close all others */
    faqItems.forEach(other => {
      if (other !== btn) {
        other.setAttribute('aria-expanded', 'false');
        const otherId  = other.getAttribute('aria-controls');
        const otherAns = document.getElementById(otherId);
        if (otherAns) otherAns.hidden = true;
      }
    });

    /* Toggle current */
    btn.setAttribute('aria-expanded', String(!expanded));
    if (answer) answer.hidden = expanded;
  });
});

/* ---- Back to top ---- */
const backBtn = document.getElementById('back-to-top');

function updateBackBtn() {
  if (window.scrollY > 400) {
    backBtn.hidden = false;
    /* Trigger reflow so the opacity transition fires */
    requestAnimationFrame(() => backBtn.classList.add('visible'));
  } else {
    backBtn.hidden = true;
  }
}

window.addEventListener('scroll', updateBackBtn, { passive: true });

backBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ---- Active nav link highlighting on scroll ---- */
const sections = document.querySelectorAll('main section[id]');
const navLinks  = document.querySelectorAll('.navbar__link:not(.navbar__link--cta)');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          link.classList.toggle('is-active', href === `#${id}`);
        });
      }
    });
  },
  { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
);

sections.forEach(s => sectionObserver.observe(s));
