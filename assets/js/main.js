/* =========================================================
   main.js – Comportements globaux (navigation, footer)
   ========================================================= */

const API_BASE = 'php/';

/* ---- Utilitaires ---- */
function apiUrl(path) {
  return API_BASE + path;
}

function formatEuro(val) {
  return Number(val).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

function formatDate(dateStr) {
  if (!dateStr) return '–';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '–';
  return new Date(dateStr).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(str || ''));
  return d.innerHTML;
}

function statutBadge(statut) {
  const map = {
    en_attente:         ['secondary', 'En attente'],
    acceptee:           ['primary',   'Acceptée'],
    en_preparation:     ['warning',   'En préparation'],
    en_cours_livraison: ['info',      'En cours de livraison'],
    livree:             ['success',   'Livrée'],
    attente_materiel:   ['danger',    'Attente retour matériel'],
    terminee:           ['dark',      'Terminée'],
    annulee:            ['danger',    'Annulée'],
  };
  const [color, label] = map[statut] || ['secondary', statut];
  return `<span class="badge bg-${color}">${label}</span>`;
}

/* ---- Chargement des horaires dans le footer ---- */
async function chargerHorairesFooter() {
  const el = document.getElementById('footer-horaires');
  if (!el) return;
  try {
    const res = await fetch(apiUrl('horaires/get-horaires.php'));
    if (!res.ok) return;
    const horaires = await res.json();
    if (!horaires.length) return;
    el.innerHTML = horaires.map(h =>
      `<li class="d-flex justify-content-between">
         <span>${escapeHtml(h.jour)}</span>
         <span class="fw-semibold">${h.ferme ? 'Fermé' : `${h.ouverture} – ${h.fermeture}`}</span>
       </li>`
    ).join('');
  } catch {
    /* Silencieux — horaires par défaut déjà dans le HTML */
  }
}

/* ---- Onglets génériques (data-tab) ---- */
function initTabs(btnSelector, sectionClass) {
  const buttons = document.querySelectorAll(`[data-tab]`);
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll(`.${sectionClass}`).forEach(s => s.classList.add('d-none'));
      const target = document.getElementById(`tab-${btn.dataset.tab}`);
      if (target) target.classList.remove('d-none');
    });
  });
}

/* ---- Afficher/masquer mot de passe ---- */
function initTogglePassword(inputId, btnId, iconId) {
  const btn = document.getElementById(btnId);
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (!btn || !input) return;
  btn.addEventListener('click', () => {
    const hidden = input.type === 'password';
    input.type = hidden ? 'text' : 'password';
    if (icon) {
      icon.className = hidden ? 'bi bi-eye-slash' : 'bi bi-eye';
    }
    btn.setAttribute('aria-label', hidden ? 'Masquer le mot de passe' : 'Afficher le mot de passe');
  });
}

/* ---- Validation mot de passe (critères visuels) ---- */
function initPasswordCriteria(inputId, prefix) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const rules = {
    length:  { el: document.getElementById(`${prefix}-length`),  test: v => v.length >= 10 },
    upper:   { el: document.getElementById(`${prefix}-upper`),   test: v => /[A-Z]/.test(v) },
    lower:   { el: document.getElementById(`${prefix}-lower`),   test: v => /[a-z]/.test(v) },
    digit:   { el: document.getElementById(`${prefix}-digit`),   test: v => /\d/.test(v) },
    special: { el: document.getElementById(`${prefix}-special`), test: v => /[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?`~]/.test(v) },
  };
  input.addEventListener('input', () => {
    const val = input.value;
    Object.values(rules).forEach(({ el, test }) => {
      if (!el) return;
      const ok = test(val);
      el.classList.toggle('text-success', ok);
      el.classList.toggle('text-danger', !ok);
      el.querySelector('i').className = ok ? 'bi bi-check-circle me-1' : 'bi bi-x-circle me-1';
    });
  });
}

function isPasswordValid(password) {
  return password.length >= 10 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?`~]/.test(password);
}

/* ---- Chargement des avis validés (page d'accueil) ---- */
async function chargerAvisAccueil() {
  const container = document.getElementById('avis-container');
  const loading   = document.getElementById('avis-loading');
  if (!container) return;

  try {
    const res  = await fetch(apiUrl('avis/get-avis.php?valide=1'));
    const avis = res.ok ? await res.json() : [];

    loading && loading.remove();

    if (!avis.length) {
      container.innerHTML = `
        <div class="col-12 text-center text-muted">
          <i class="bi bi-chat-square display-4 mb-3 d-block"></i>
          Aucun avis disponible pour le moment.
        </div>`;
      return;
    }

    container.innerHTML = avis.map(a => `
      <div class="col-md-4">
        <article class="card-avis p-4 rounded-4 h-100">
          <div class="stars mb-2" aria-label="${a.note} étoiles sur 5">
            ${'★'.repeat(a.note)}${'☆'.repeat(5 - a.note)}
          </div>
          ${a.commentaire
            ? `<p class="text-muted fst-italic mb-3">"${escapeHtml(a.commentaire)}"</p>`
            : ''}
          <div class="d-flex align-items-center gap-2 mt-auto">
            <div class="avatar-initiales rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                 style="width:36px;height:36px;font-size:.85rem;font-weight:700;"
                 aria-hidden="true">
              ${escapeHtml(a.user_prenom.charAt(0))}${escapeHtml(a.user_nom.charAt(0))}
            </div>
            <div>
              <strong class="d-block small">${escapeHtml(a.user_prenom)} ${escapeHtml(a.user_nom.charAt(0))}.</strong>
              <span class="text-muted" style="font-size:.75rem;">${escapeHtml(a.menu_titre)}</span>
            </div>
          </div>
        </article>
      </div>`).join('');

  } catch {
    loading && loading.remove();
    container.innerHTML = `
      <div class="col-12 text-center text-muted small">
        Impossible de charger les avis.
      </div>`;
  }
}

/* ---- Bannière consentement cookies (RGPD) ---- */
function initCookieBanner() {
  if (localStorage.getItem('vg_cookie_consent')) return;

  const banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-live', 'polite');
  banner.setAttribute('aria-label', 'Consentement aux cookies');
  banner.innerHTML = `
    <div class="d-flex flex-column flex-sm-row align-items-sm-center gap-3">
      <p class="mb-0 small flex-grow-1">
        <i class="bi bi-shield-lock me-2" aria-hidden="true"></i>
        Ce site utilise uniquement des cookies strictement nécessaires à son fonctionnement (session, authentification).
        Aucun cookie publicitaire ou tiers n'est utilisé.
        <a href="mentions-legales.html#donnees" class="text-warning">En savoir plus</a>
      </p>
      <div class="d-flex gap-2 flex-shrink-0">
        <button id="cookie-accept" class="btn btn-warning btn-sm fw-semibold">Accepter</button>
        <button id="cookie-refuse" class="btn btn-outline-light btn-sm">Refuser</button>
      </div>
    </div>`;
  banner.style.cssText = [
    'position:fixed', 'bottom:0', 'left:0', 'right:0', 'z-index:1060',
    'background:#2B2D42', 'color:#fff', 'padding:1rem 1.25rem',
    'box-shadow:0 -2px 12px rgba(0,0,0,.25)',
  ].join(';');

  document.body.appendChild(banner);

  function dismissBanner(accepted) {
    localStorage.setItem('vg_cookie_consent', accepted ? 'accepted' : 'refused');
    banner.remove();
  }

  document.getElementById('cookie-accept').addEventListener('click', () => dismissBanner(true));
  document.getElementById('cookie-refuse').addEventListener('click', () => dismissBanner(false));
}

/* ---- Init générale ---- */
document.addEventListener('DOMContentLoaded', () => {
  initCookieBanner();
  chargerHorairesFooter();
  chargerAvisAccueil();

  /* Onglets : détecter le sectionClass selon la page */
  if (document.querySelector('.user-tab'))  initTabs('[data-tab]', 'user-tab');
  if (document.querySelector('.emp-tab'))   initTabs('[data-tab]', 'emp-tab');
  if (document.querySelector('.admin-tab')) initTabs('[data-tab]', 'admin-tab');

  /* Toggle password global */
  initTogglePassword('login-password',    'toggle-password',     'toggle-password-icon');
  initTogglePassword('reg-password',      'toggle-password',     'toggle-password-icon');
  initTogglePassword('new-password',      'toggle-new-password', null);

  /* Critères visuels mot de passe */
  initPasswordCriteria('reg-password', 'crit');
  initPasswordCriteria('new-password', 'new-crit');
});

/* Export des utilitaires pour les autres scripts */
window.VG = {
  apiUrl,
  formatEuro,
  formatDate,
  formatDateTime,
  escapeHtml,
  statutBadge,
  isPasswordValid,
};