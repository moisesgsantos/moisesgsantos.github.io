const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');
const faqItems = document.querySelectorAll('.faq-item');
const yearEl = document.getElementById('year');

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

if (navToggle && nav) {
  function closeMenu() {
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menu');
  }

  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  });

  nav.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      closeMenu();
      navToggle.focus();
    }
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
}

faqItems.forEach((item) => {
  const button = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');

  if (!button || !answer) return;

  button.addEventListener('click', () => {
    const isActive = item.classList.contains('active');

    faqItems.forEach((faqItem) => {
      faqItem.classList.remove('active');
      const btn = faqItem.querySelector('.faq-question');
      const ans = faqItem.querySelector('.faq-answer');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      if (ans) ans.hidden = true;
    });

    if (!isActive) {
      item.classList.add('active');
      button.setAttribute('aria-expanded', 'true');
      answer.hidden = false;
    }
  });
});

const contactForm = document.querySelector('.contact-form');

if (contactForm) {
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const statusEl = contactForm.querySelector('.form-status');

  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mgaoooyw';

  function getErrorElement(field) {
    const describedBy = field.getAttribute('aria-describedby');
    return describedBy ? document.getElementById(describedBy) : null;
  }

  function showFieldError(field, message) {
    const errorEl = getErrorElement(field);
    if (errorEl) {
      errorEl.textContent = message;
      field.setAttribute('aria-invalid', 'true');
    }
  }

  function clearFieldError(field) {
    const errorEl = getErrorElement(field);
    if (errorEl) {
      errorEl.textContent = '';
      field.removeAttribute('aria-invalid');
    }
  }

  function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = '';

    if (field.type === 'checkbox' && field.hasAttribute('required') && !field.checked) {
      isValid = false;
      message = 'Você precisa aceitar a Política de Privacidade';
    } else if (field.hasAttribute('required') && !value) {
      isValid = false;
      message = 'Este campo é obrigatório';
    } else if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      isValid = false;
      message = 'E-mail inválido';
    } else if (field.tagName === 'TEXTAREA' && value && field.hasAttribute('minlength') && value.length < parseInt(field.getAttribute('minlength'), 10)) {
      isValid = false;
      message = `Mínimo de ${field.getAttribute('minlength')} caracteres`;
    }

    if (isValid) {
      clearFieldError(field);
    } else {
      showFieldError(field, message);
    }
    return isValid;
  }

  // Validar em blur
  contactForm.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.hasAttribute('aria-invalid')) {
        validateField(field);
      }
    });
    field.addEventListener('change', () => {
      if (field.hasAttribute('aria-invalid')) {
        validateField(field);
      }
    });
  });

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const fields = contactForm.querySelectorAll('input[required], textarea[required]');
    let allValid = true;
    fields.forEach(field => {
      if (!validateField(field)) allValid = false;
    });

    if (!allValid) {
      const firstInvalid = contactForm.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());

    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';
    if (statusEl) {
      statusEl.hidden = true;
      statusEl.textContent = '';
      statusEl.className = 'form-status';
    }

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
      });

      if (response.ok) {
        submitButton.textContent = 'Mensagem enviada ✓';
        submitButton.classList.add('success');
        if (statusEl) {
          statusEl.textContent = 'Obrigado! Entraremos em contato em até 24h.';
          statusEl.classList.add('success');
          statusEl.hidden = false;
        }
        contactForm.reset();
      } else {
        throw new Error('Erro no envio');
      }
    } catch (err) {
      submitButton.textContent = 'Erro ao enviar';
      submitButton.classList.add('error');
      if (statusEl) {
        statusEl.textContent = 'Não foi possível enviar. Tente novamente ou chame no WhatsApp.';
        statusEl.classList.add('error');
        statusEl.hidden = false;
      }
    }

    setTimeout(() => {
      submitButton.disabled = false;
      submitButton.textContent = 'Enviar mensagem';
      submitButton.classList.remove('success', 'error');
    }, 4000);
  });
}

// Service Worker (PWA). Registro em arquivo externo para ser compatível com a CSP do site.
// Falha no registro é degradação graciosa (o site funciona sem SW), por isso o erro é ignorado.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
