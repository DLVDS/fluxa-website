/* ── main.js — Fluxa website interactions ──────────────────────────────────── */

// ── Sticky nav shadow ────────────────────────────────────────────────────────
const nav = document.querySelector('.nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ── Mobile hamburger menu ────────────────────────────────────────────────────
const hamburger   = document.querySelector('.nav__hamburger');
const mobileMenu  = document.querySelector('.nav__mobile');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
  });
  // Close when a link is tapped
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
    });
  });
}

// ── Active nav link on scroll (home page only) ────────────────────────────────
const navLinks = document.querySelectorAll('.nav__link[data-section]');
if (navLinks.length) {
  const sections = Array.from(navLinks)
    .map(l => document.getElementById(l.dataset.section))
    .filter(Boolean);

  const onScrollActive = () => {
    const scrollY = window.scrollY + 100;
    let current = null;
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollY) current = sec.id;
    });
    navLinks.forEach(l => l.classList.toggle('active', l.dataset.section === current));
  };
  window.addEventListener('scroll', onScrollActive, { passive: true });
}

// ── Smooth scroll for anchor links ──────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH = nav ? nav.offsetHeight : 0;
    window.scrollTo({ top: target.offsetTop - navH - 16, behavior: 'smooth' });
  });
});

// ── Intersection Observer — fade-in animations ───────────────────────────────
const fadeEls = document.querySelectorAll('.fade-in');
if (fadeEls.length && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } }),
    { threshold: 0.12 }
  );
  fadeEls.forEach(el => io.observe(el));
} else {
  fadeEls.forEach(el => el.classList.add('visible'));
}

// ── FAQ accordion ────────────────────────────────────────────────────────────
document.querySelectorAll('.faq__question').forEach(btn => {
  btn.addEventListener('click', () => {
    const answer   = btn.nextElementSibling;
    const isOpen   = btn.classList.contains('open');

    // Close all
    document.querySelectorAll('.faq__question.open').forEach(b => {
      b.classList.remove('open');
      b.nextElementSibling.classList.remove('open');
    });

    // Toggle clicked
    if (!isOpen) {
      btn.classList.add('open');
      answer.classList.add('open');
    }
  });
});

// ── Contact form validation ──────────────────────────────────────────────────
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  const showError = (input, msg) => {
    const err = input.parentElement.querySelector('.form-error');
    if (err) { err.textContent = msg; err.classList.add('visible'); }
    input.style.borderColor = '#DC2626';
  };
  const clearError = input => {
    const err = input.parentElement.querySelector('.form-error');
    if (err) err.classList.remove('visible');
    input.style.borderColor = '';
  };

  // Clear errors on input
  contactForm.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => clearError(el));
  });

  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    const name    = document.getElementById('cf-name');
    const email   = document.getElementById('cf-email');
    const subject = document.getElementById('cf-subject');
    const message = document.getElementById('cf-message');

    if (!name.value.trim()) { showError(name, 'Please enter your name.'); valid = false; }
    if (!email.value.trim()) { showError(email, 'Please enter your email address.'); valid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { showError(email, 'Please enter a valid email address.'); valid = false; }
    if (!subject.value) { showError(subject, 'Please select a subject.'); valid = false; }
    if (!message.value.trim() || message.value.trim().length < 10) { showError(message, 'Please enter a message (at least 10 characters).'); valid = false; }

    if (valid) {
      const btn = contactForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Sending…';

      const data = {
        name:    name.value.trim(),
        email:   email.value.trim(),
        subject: subject.value,
        message: message.value.trim()
      };

      fetch('https://formspree.io/f/mwvyejaz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(res => {
        if (res.ok) {
          contactForm.style.display = 'none';
          document.getElementById('form-success').classList.add('visible');
        } else {
          btn.disabled = false;
          btn.textContent = 'Send Message';
          alert('Something went wrong. Please try again or email support@fluxa.com.au directly.');
        }
      })
      .catch(() => {
        btn.disabled = false;
        btn.textContent = 'Send Message';
        alert('Something went wrong. Please try again or email support@fluxa.com.au directly.');
      });
    }
  });
}
