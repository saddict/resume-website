import { functions } from "./firebase-config.js";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js";

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

// Contact form — calls Cloud Function which validates, rate-limits, and sends email
const form = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const submitContact = httpsCallable(functions, 'submitContact');

const SUBMIT_COOLDOWN_MS = 60_000;
let lastSubmitTime = 0;

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Honeypot: bots fill the hidden website field, humans leave it blank
    if (form.website.value) return;

    // Client-side cooldown (server enforces the real limit)
    const elapsed = Date.now() - lastSubmitTime;
    if (elapsed < SUBMIT_COOLDOWN_MS) {
        const wait = Math.ceil((SUBMIT_COOLDOWN_MS - elapsed) / 1000);
        formStatus.textContent = `Please wait ${wait}s before sending another message.`;
        return;
    }

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    if (name.length > 100 || email.length > 200 || message.length > 2000) {
        formStatus.textContent = 'Input too long — name ≤ 100, message ≤ 2000 characters.';
        return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled = true;
    formStatus.textContent = '';

    try {
        await submitContact({ name, email, message });
        lastSubmitTime = Date.now();
        formStatus.textContent = 'Message sent — thanks!';
        form.reset();
    } catch (err) {
        console.error(err);
        if (err.code === 'functions/resource-exhausted') {
            formStatus.textContent = 'Too many messages from your location. Please try again tomorrow.';
        } else {
            formStatus.textContent = 'Something went wrong. Try emailing directly.';
        }
    }

    btn.textContent = 'Send Message';
    btn.disabled = false;
});
