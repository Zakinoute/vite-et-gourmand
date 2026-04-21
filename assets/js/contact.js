/* =========================================================
   contact.js – Formulaire de contact
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-contact');
  if (!form) return;

  /* Compteur de caractères */
  const textarea = document.getElementById('contact-message');
  const counter  = document.getElementById('msg-counter');
  textarea?.addEventListener('input', () => {
    const len = textarea.value.length;
    if (counter) counter.textContent = len;
    if (len > 1000) textarea.value = textarea.value.slice(0, 1000);
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    form.classList.add('was-validated');
    if (!form.checkValidity()) return;

    /* Anti-spam honeypot */
    if (document.getElementById('website')?.value) return;

    const titre       = document.getElementById('contact-titre').value.trim();
    const email       = document.getElementById('contact-email').value.trim();
    const description = document.getElementById('contact-message').value.trim();
    const sucEl       = document.getElementById('contact-success');
    const errEl       = document.getElementById('contact-error');
    const errMsg      = document.getElementById('contact-error-msg');
    const txtBtn      = document.getElementById('btn-contact-text');
    const spinner     = document.getElementById('btn-contact-spinner');

    sucEl.classList.add('d-none');
    errEl.classList.add('d-none');
    txtBtn.classList.add('d-none');
    spinner.classList.remove('d-none');

    try {
      const res  = await fetch(VG.apiUrl('contact/send-contact.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titre, email, description }),
      });
      const data = await res.json();

      if (res.ok) {
        sucEl.classList.remove('d-none');
        form.reset();
        form.classList.remove('was-validated');
        if (counter) counter.textContent = '0';
      } else {
        errMsg.textContent = data.message || 'Erreur lors de l\'envoi.';
        errEl.classList.remove('d-none');
      }
    } catch {
      errMsg.textContent = 'Impossible de contacter le serveur. Réessayez plus tard.';
      errEl.classList.remove('d-none');
    } finally {
      txtBtn.classList.remove('d-none');
      spinner.classList.add('d-none');
    }
  });
});
