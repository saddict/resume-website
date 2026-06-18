const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinksContainer = document.getElementById('navLinks');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id]');

// Nav scroll border + active link highlight
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);

    const nearBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 60;

    let current = '';
    if (nearBottom) {
        current = sections[sections.length - 1].getAttribute('id');
    } else {
        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 80) {
                current = section.getAttribute('id');
            }
        });
    }

    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
}, { passive: true });

// Mobile hamburger
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinksContainer.classList.toggle('open');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinksContainer.classList.remove('open');
    });
});

// Scroll reveal
const revealTargets = [
    '.section-title',
    '.about-content',
    '.skills-grid',
    '.timeline-item',
    '.project-card',
    '.education-card',
    '.contact-wrapper',
];

document.querySelectorAll(revealTargets.join(',')).forEach(el => {
    el.classList.add('reveal');
});

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Contact form (Formspree)
const form = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled = true;
    formStatus.textContent = '';

    try {
        const res = await fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: { Accept: 'application/json' },
        });

        if (res.ok) {
            formStatus.textContent = 'Message sent — thanks!';
            form.reset();
        } else {
            formStatus.textContent = 'Something went wrong. Try emailing directly.';
        }
    } catch {
        formStatus.textContent = 'Network error. Try emailing directly.';
    }

    btn.textContent = 'Send Message';
    btn.disabled = false;
});
