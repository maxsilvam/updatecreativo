const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Menú móvil: abre/cierra los links y los cierra al elegir uno o con Escape.
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.getElementById('nav-links');

function setMenu(open) {
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.textContent = open ? 'Cerrar' : 'Menú';
  navLinks.classList.toggle('is-open', open);
}

navToggle?.addEventListener('click', () => {
  setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
});
navLinks?.addEventListener('click', (e) => {
  if (e.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navToggle?.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    navToggle.focus();
  }
});

// Cápsula activa según la sección visible ("Cotizar taller" se marca en el formulario).
const navPills = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const sections = navPills.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navPills.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach((s) => sectionObserver.observe(s));

// Titular: la palabra destacada se "instala" letra por letra, como una actualización.
// Corre al cargar y al pasar el mouse sobre ella (no en bucle, para no distraer al leer).
const morph = document.querySelector('.morph');
const GLYPHS = '01<>/_#=+*';

let morphRunning = false;

function runMorph() {
  if (morphRunning) return;
  morphRunning = true;
  const chars = [...morph.querySelectorAll('.ch')];
  const start = performance.now();
  const perChar = 45;
  const scramble = 380;

  function frame(now) {
    let done = true;
    chars.forEach((span, i) => {
      const settleAt = i * perChar + scramble;
      const elapsed = now - start;
      if (elapsed < settleAt) {
        done = false;
        span.dataset.glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        span.classList.add('is-scrambling');
      } else {
        span.classList.remove('is-scrambling');
      }
    });
    if (done) morphRunning = false;
    else requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

if (morph && !reduceMotion) {
  document.fonts.ready.then(() => {
    const text = morph.textContent;
    morph.textContent = '';
    // Las letras de cada palabra van juntas; los espacios quedan como texto para que el titular pueda partirse en móvil.
    text.split(' ').forEach((word, w) => {
      if (w > 0) morph.appendChild(document.createTextNode(' '));
      const wordSpan = document.createElement('span');
      wordSpan.style.whiteSpace = 'nowrap';
      [...word].forEach((ch) => {
        const span = document.createElement('span');
        span.className = 'ch';
        span.textContent = ch;
        wordSpan.appendChild(span);
      });
      morph.appendChild(wordSpan);
    });
    runMorph();
    morph.parentElement.addEventListener('mouseenter', runMorph);
  });
}

// Nota a mano en "Sobre mí": se escribe una sola vez, cuando la foto entra en pantalla.
// Se observa la foto y no la nota, porque el clip-path inicial la hace invisible para el observer.
const handnote = document.querySelector('.handnote');
if (handnote) {
  new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    handnote.classList.add('is-written');
    obs.disconnect();
  }, { threshold: 0.6 }).observe(handnote.closest('.about-figure'));
}

// Formulario de contacto: por ahora solo valida y muestra un mensaje.
// TODO: conectar a un servicio real (Formspree, Netlify Forms, Resend, etc.).
const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!form.checkValidity()) {
    status.textContent = 'Completa nombre, empresa y un email válido para enviar la solicitud.';
    form.reportValidity();
    return;
  }
  // Aquí irá el envío real.
  status.textContent = 'Solicitud enviada. Te responderé con una propuesta a la brevedad.';
  form.reset();
});
