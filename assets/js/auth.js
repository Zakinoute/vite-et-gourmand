/* =========================================================
   auth.js – Gestion de l'authentification (session côté client)
   Connexion, inscription, déconnexion, redirection
   ========================================================= */

const Auth = (() => {

  /* ---- Clés sessionStorage ---- */
  const KEY_USER = 'vg_user';

  function getUser() {
    try {
      return JSON.parse(sessionStorage.getItem(KEY_USER));
    } catch {
      return null;
    }
  }

  function setUser(user) {
    sessionStorage.setItem(KEY_USER, JSON.stringify(user));
  }

  function clearUser() {
    sessionStorage.removeItem(KEY_USER);
  }

  function isLoggedIn() {
    return !!getUser();
  }

  function hasRole(...roles) {
    const user = getUser();
    return user && roles.includes(user.role);
  }

  /* ---- Mise à jour de la navbar ---- */
  function updateNavbar() {
    const user = getUser();
    const authBtns = document.getElementById('nav-auth-buttons');
    const userBtns = document.getElementById('nav-user-buttons');
    const usernameEl = document.getElementById('nav-username');
    const espaceLink = document.getElementById('nav-espace-link');

    if (user) {
      authBtns && authBtns.classList.add('d-none');
      userBtns && userBtns.classList.remove('d-none');
      if (usernameEl) usernameEl.textContent = `${user.prenom} ${user.nom}`;
      if (espaceLink) {
        if (user.role === 'administrateur') {
          espaceLink.href = 'espace-admin.html';
          espaceLink.textContent = 'Espace Admin';
        } else if (user.role === 'employe') {
          espaceLink.href = 'espace-employe.html';
          espaceLink.textContent = 'Espace Employé';
        } else {
          espaceLink.href = 'espace-utilisateur.html';
          espaceLink.textContent = 'Mon espace';
        }
      }
    } else {
      authBtns && authBtns.classList.remove('d-none');
      userBtns && userBtns.classList.add('d-none');
    }
  }

  /* ---- Bouton déconnexion ---- */
  function initLogoutButton() {
    const btn = document.getElementById('nav-logout-btn');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      try {
        await fetch(VG.apiUrl('auth/logout.php'), { method: 'POST' });
      } catch { /* Silencieux */ }
      clearUser();
      window.location.href = 'index.html';
    });
  }

  /* ---- Redirection si non connecté ---- */
  function requireAuth(allowedRoles) {
    const user = getUser();
    if (!user) {
      sessionStorage.setItem('vg_redirect', window.location.pathname);
      window.location.href = 'connexion.html?redirect=1';
      return false;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  }

  /* ---- Formulaire de CONNEXION ---- */
  function initLoginForm() {
    const form = document.getElementById('form-connexion');
    if (!form) return;

    /* Afficher alerte redirect si paramètre URL */
    const params = new URLSearchParams(window.location.search);
    if (params.get('redirect')) {
      document.getElementById('alert-redirect')?.classList.remove('d-none');
    }
    if (params.get('registered')) {
      document.getElementById('alert-inscription-ok')?.classList.remove('d-none');
    }

    form.addEventListener('submit', async e => {
      e.preventDefault();
      form.classList.add('was-validated');

      const email    = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const errEl    = document.getElementById('alert-error');
      const errMsg   = document.getElementById('alert-error-msg');
      const txtBtn   = document.getElementById('btn-login-text');
      const spinner  = document.getElementById('btn-login-spinner');

      if (!form.checkValidity()) return;

      txtBtn.classList.add('d-none');
      spinner.classList.remove('d-none');
      errEl.classList.add('d-none');

      try {
        const res = await fetch(VG.apiUrl('auth/login.php'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (res.ok && data.user) {
          setUser(data.user);
          const redirect = sessionStorage.getItem('vg_redirect');
          sessionStorage.removeItem('vg_redirect');
          if (redirect) {
            window.location.href = redirect;
          } else {
            const role = data.user.role;
            if (role === 'administrateur') window.location.href = 'espace-admin.html';
            else if (role === 'employe')   window.location.href = 'espace-employe.html';
            else                           window.location.href = 'espace-utilisateur.html';
          }
        } else {
          errMsg.textContent = data.message || 'Email ou mot de passe incorrect.';
          errEl.classList.remove('d-none');
        }
      } catch {
        errMsg.textContent = 'Erreur de connexion au serveur. Réessayez plus tard.';
        errEl.classList.remove('d-none');
      } finally {
        txtBtn.classList.remove('d-none');
        spinner.classList.add('d-none');
      }
    });
  }

  /* ---- Formulaire d'INSCRIPTION ---- */
  function initRegisterForm() {
    const form = document.getElementById('form-inscription');
    if (!form) return;

    form.addEventListener('submit', async e => {
      e.preventDefault();
      form.classList.add('was-validated');

      const nom      = document.getElementById('reg-nom').value.trim();
      const prenom   = document.getElementById('reg-prenom').value.trim();
      const email    = document.getElementById('reg-email').value.trim();
      const gsm      = document.getElementById('reg-gsm').value.trim();
      const adresse  = document.getElementById('reg-adresse').value.trim();
      const password = document.getElementById('reg-password').value;
      const confirm  = document.getElementById('reg-password-confirm').value;
      const rgpd     = document.getElementById('reg-rgpd').checked;

      const errEl  = document.getElementById('alert-error');
      const errMsg = document.getElementById('alert-error-msg');
      const txtBtn = document.getElementById('btn-register-text');
      const spinner = document.getElementById('btn-register-spinner');

      errEl.classList.add('d-none');

      if (!form.checkValidity()) return;

      if (!VG.isPasswordValid(password)) {
        errMsg.textContent = 'Le mot de passe ne respecte pas les critères de sécurité.';
        errEl.classList.remove('d-none');
        return;
      }
      if (password !== confirm) {
        document.getElementById('confirm-feedback').textContent = 'Les mots de passe ne correspondent pas.';
        document.getElementById('reg-password-confirm').classList.add('is-invalid');
        return;
      }
      if (!rgpd) return;

      txtBtn.classList.add('d-none');
      spinner.classList.remove('d-none');

      try {
        const res = await fetch(VG.apiUrl('auth/register.php'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nom, prenom, email, gsm, adresse, password }),
        });
        const data = await res.json();

        if (res.ok) {
          window.location.href = 'connexion.html?registered=1';
        } else {
          errMsg.textContent = data.message || 'Erreur lors de la création du compte.';
          errEl.classList.remove('d-none');
        }
      } catch {
        errMsg.textContent = 'Erreur de connexion au serveur.';
        errEl.classList.remove('d-none');
      } finally {
        txtBtn.classList.remove('d-none');
        spinner.classList.add('d-none');
      }
    });
  }

  /* ---- Formulaire RESET MOT DE PASSE ---- */
  function initResetForm() {
    const formSend = document.getElementById('form-send-reset');
    if (!formSend) return;

    /* Vérifier si token dans l'URL */
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');
    if (token) {
      document.getElementById('step-email')?.classList.add('d-none');
      document.getElementById('step-reset')?.classList.remove('d-none');
      document.getElementById('reset-token').value = token;
    }

    /* Étape 1 – Envoi de l'email */
    formSend.addEventListener('submit', async e => {
      e.preventDefault();
      formSend.classList.add('was-validated');
      if (!formSend.checkValidity()) return;

      const email   = document.getElementById('reset-email').value.trim();
      const errEl   = document.getElementById('alert-send-error');
      const sucEl   = document.getElementById('alert-send-success');
      const txtBtn  = document.getElementById('btn-send-text');
      const spinner = document.getElementById('btn-send-spinner');

      txtBtn.classList.add('d-none');
      spinner.classList.remove('d-none');
      errEl.classList.add('d-none');

      try {
        const res  = await fetch(VG.apiUrl('auth/send-reset.php'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (res.ok) {
          sucEl.classList.remove('d-none');
          formSend.reset();
        } else {
          document.getElementById('alert-send-error-msg').textContent = data.message || 'Email introuvable.';
          errEl.classList.remove('d-none');
        }
      } catch {
        document.getElementById('alert-send-error-msg').textContent = 'Erreur serveur.';
        errEl.classList.remove('d-none');
      } finally {
        txtBtn.classList.remove('d-none');
        spinner.classList.add('d-none');
      }
    });

    /* Étape 2 – Nouveau mot de passe */
    const formReset = document.getElementById('form-new-password');
    if (!formReset) return;
    formReset.addEventListener('submit', async e => {
      e.preventDefault();
      formReset.classList.add('was-validated');

      const password = document.getElementById('new-password').value;
      const confirm  = document.getElementById('new-password-confirm').value;
      const resetToken = document.getElementById('reset-token').value;

      if (!VG.isPasswordValid(password)) return;
      if (password !== confirm) {
        document.getElementById('new-password-confirm').classList.add('is-invalid');
        return;
      }

      try {
        const res  = await fetch(VG.apiUrl('auth/reset-password.php'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: resetToken, password }),
        });
        const data = await res.json();
        if (res.ok) {
          document.getElementById('alert-reset-success').classList.remove('d-none');
          formReset.classList.add('d-none');
        } else {
          document.getElementById('alert-token-error').classList.remove('d-none');
        }
      } catch {
        document.getElementById('alert-token-error').classList.remove('d-none');
      }
    });
  }

  /* ---- Init ---- */
  function init() {
    updateNavbar();
    initLogoutButton();
    initLoginForm();
    initRegisterForm();
    initResetForm();
  }

  return { init, getUser, isLoggedIn, hasRole, requireAuth, updateNavbar };
})();

document.addEventListener('DOMContentLoaded', () => Auth.init());
window.Auth = Auth;