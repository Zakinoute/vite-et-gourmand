/* =========================================================
   utilisateur.js – Espace utilisateur :
   commandes, profil, avis
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('tab-commandes')) return;

  if (!Auth.requireAuth(['utilisateur', 'employe', 'administrateur'])) return;

  const user = Auth.getUser();

  /* Bienvenue */
  const welcomeEl = document.getElementById('welcome-msg');
  if (welcomeEl) welcomeEl.textContent = `Bienvenue, ${user.prenom} ${user.nom} !`;

  /* ---- Chargement des commandes ---- */
  async function chargerCommandes() {
    const loading = document.getElementById('commandes-loading');
    const empty   = document.getElementById('commandes-empty');
    const list    = document.getElementById('commandes-list');

    try {
      const res  = await fetch(VG.apiUrl('commandes/get-commandes.php?user_id=' + user.id));
      const data = res.ok ? await res.json() : [];

      loading.classList.add('d-none');

      if (!data.length) {
        empty.classList.remove('d-none');
        return;
      }
      list.classList.remove('d-none');
      list.innerHTML = data.map(renderCarteCommande).join('');
      initActionsCommandes();
    } catch {
      loading.innerHTML = `<div class="alert alert-warning">Impossible de charger les commandes.</div>`;
    }
  }

  /* ---- Carte commande ---- */
  function renderCarteCommande(cmd) {
    const modifiable = ['en_attente'].includes(cmd.statut);
    const annulable  = ['en_attente'].includes(cmd.statut);
    const suivi      = ['acceptee', 'en_preparation', 'en_cours_livraison', 'livree', 'attente_materiel', 'terminee'].includes(cmd.statut);
    const peutAvis   = cmd.statut === 'terminee' && !cmd.a_donne_avis;

    return `
      <div class="card border-0 shadow-sm rounded-4 mb-3">
        <div class="card-body p-4">
          <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
            <div>
              <h3 class="h6 fw-bold mb-1">Commande #${cmd.id} – ${VG.escapeHtml(cmd.menu_titre)}</h3>
              <p class="text-muted small mb-0">
                <i class="bi bi-calendar me-1"></i>${VG.formatDate(cmd.date_prestation)}
                &bull; ${cmd.nb_personnes} personnes
                &bull; ${VG.formatEuro(cmd.prix_total)}
              </p>
            </div>
            <div>${VG.statutBadge(cmd.statut)}</div>
          </div>

          ${cmd.statut === 'annulee' && cmd.motif_annulation ? `
            <div class="alert alert-warning small py-2 mb-3">
              <i class="bi bi-info-circle me-1"></i>
              <strong>Motif d'annulation :</strong> ${VG.escapeHtml(cmd.motif_annulation)}
            </div>` : ''}

          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-outline-primary btn-sm btn-voir-cmd" data-id="${cmd.id}">
              <i class="bi bi-eye me-1"></i>Voir le détail
            </button>
            ${suivi ? `
              <button class="btn btn-info btn-sm btn-suivi-cmd" data-id="${cmd.id}">
                <i class="bi bi-geo-alt me-1"></i>Suivi
              </button>` : ''}
            ${modifiable ? `
              <a href="commande.html?edit=${cmd.id}" class="btn btn-outline-secondary btn-sm">
                <i class="bi bi-pencil me-1"></i>Modifier
              </a>` : ''}
            ${annulable ? `
              <button class="btn btn-outline-danger btn-sm btn-annuler-cmd" data-id="${cmd.id}">
                <i class="bi bi-x-circle me-1"></i>Annuler
              </button>` : ''}
            ${peutAvis ? `
              <button class="btn btn-warning btn-sm btn-avis-cmd" data-id="${cmd.id}">
                <i class="bi bi-star me-1"></i>Laisser un avis
              </button>` : ''}
          </div>
        </div>
      </div>`;
  }

  /* ---- Actions sur les commandes ---- */
  function initActionsCommandes() {
    /* Voir détail */
    document.querySelectorAll('.btn-voir-cmd').forEach(btn => {
      btn.addEventListener('click', () => ouvrirDetailCommande(btn.dataset.id));
    });
    /* Suivi */
    document.querySelectorAll('.btn-suivi-cmd').forEach(btn => {
      btn.addEventListener('click', () => ouvrirSuiviCommande(btn.dataset.id));
    });
    /* Annuler */
    document.querySelectorAll('.btn-annuler-cmd').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return;
        await annulerCommande(btn.dataset.id);
      });
    });
    /* Avis */
    document.querySelectorAll('.btn-avis-cmd').forEach(btn => {
      btn.addEventListener('click', () => ouvrirModalAvis(btn.dataset.id));
    });
  }

  async function ouvrirDetailCommande(id) {
    const modal = new bootstrap.Modal(document.getElementById('modalCommande'));
    const body  = document.getElementById('modal-commande-body');
    body.innerHTML = '<div class="text-center py-3"><div class="spinner-border text-primary"></div></div>';
    modal.show();
    try {
      const res  = await fetch(VG.apiUrl(`commandes/get-commandes.php?id=${id}`));
      const cmd  = res.ok ? await res.json() : null;
      if (!cmd) { body.innerHTML = '<p class="text-danger">Commande introuvable.</p>'; return; }
      body.innerHTML = `
        <dl class="row mb-0">
          <dt class="col-sm-4">Menu</dt><dd class="col-sm-8">${VG.escapeHtml(cmd.menu_titre)}</dd>
          <dt class="col-sm-4">Date prestation</dt><dd class="col-sm-8">${VG.formatDate(cmd.date_prestation)} à ${cmd.heure_prestation}</dd>
          <dt class="col-sm-4">Adresse</dt><dd class="col-sm-8">${VG.escapeHtml(cmd.adresse)}</dd>
          <dt class="col-sm-4">Personnes</dt><dd class="col-sm-8">${cmd.nb_personnes}</dd>
          <dt class="col-sm-4">Total payé</dt><dd class="col-sm-8 fw-bold text-primary">${VG.formatEuro(cmd.prix_total)}</dd>
          <dt class="col-sm-4">Statut</dt><dd class="col-sm-8">${VG.statutBadge(cmd.statut)}</dd>
        </dl>`;
    } catch {
      body.innerHTML = '<p class="text-danger">Erreur de chargement.</p>';
    }
  }

  async function ouvrirSuiviCommande(id) {
    const modal = new bootstrap.Modal(document.getElementById('modalCommande'));
    const body  = document.getElementById('modal-commande-body');
    document.getElementById('modalCommandeLabel').textContent = 'Suivi de commande';
    body.innerHTML = '<div class="text-center py-3"><div class="spinner-border text-primary"></div></div>';
    modal.show();
    try {
      const res   = await fetch(VG.apiUrl(`commandes/get-commandes.php?id=${id}&suivi=1`));
      const suivi = res.ok ? await res.json() : [];
      if (!suivi.length) { body.innerHTML = '<p class="text-muted">Aucun suivi disponible.</p>'; return; }
      body.innerHTML = `
        <ol class="timeline list-unstyled">
          ${suivi.map(s => `
            <li class="timeline-item mb-3 d-flex gap-3">
              <div class="timeline-badge flex-shrink-0">${VG.statutBadge(s.statut)}</div>
              <div class="text-muted small">${VG.formatDateTime(s.created_at)}</div>
            </li>`).join('')}
        </ol>`;
    } catch {
      body.innerHTML = '<p class="text-danger">Erreur de chargement.</p>';
    }
  }

  async function annulerCommande(id) {
    try {
      const res  = await fetch(VG.apiUrl('commandes/annuler-commande.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commande_id: id }),
      });
      if (res.ok) chargerCommandes();
      else alert('Impossible d\'annuler cette commande.');
    } catch {
      alert('Erreur réseau.');
    }
  }

  /* ---- Modal avis ---- */
  function ouvrirModalAvis(commandeId) {
    document.getElementById('avis-commande-id').value = commandeId;
    document.getElementById('avis-note').value = '';
    document.getElementById('avis-commentaire').value = '';
    document.getElementById('avis-success').classList.add('d-none');
    document.querySelectorAll('.star-btn i').forEach(i => {
      i.className = 'bi bi-star';
    });
    new bootstrap.Modal(document.getElementById('modalAvis')).show();
  }

  /* Étoiles */
  document.querySelectorAll('.star-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = parseInt(btn.dataset.value);
      document.getElementById('avis-note').value = val;
      document.querySelectorAll('.star-btn').forEach((b, i) => {
        b.querySelector('i').className = i < val ? 'bi bi-star-fill text-warning' : 'bi bi-star text-muted';
      });
    });
  });

  /* Envoi avis */
  document.getElementById('btn-submit-avis')?.addEventListener('click', async () => {
    const note      = document.getElementById('avis-note').value;
    const commentaire = document.getElementById('avis-commentaire').value.trim();
    const commandeId  = document.getElementById('avis-commande-id').value;
    const feedback  = document.getElementById('note-feedback');

    if (!note) {
      feedback.classList.remove('d-none');
      return;
    }
    feedback.classList.add('d-none');

    try {
      const res = await fetch(VG.apiUrl('avis/create-avis.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commande_id: commandeId, note, commentaire }),
      });
      if (res.ok) {
        document.getElementById('avis-success').classList.remove('d-none');
        setTimeout(() => {
          bootstrap.Modal.getInstance(document.getElementById('modalAvis'))?.hide();
          chargerCommandes();
        }, 2000);
      }
    } catch { /* Silencieux */ }
  });

  /* ---- Profil ---- */
  function chargerProfil() {
    if (!user) return;
    setVal2('profil-nom',     user.nom);
    setVal2('profil-prenom',  user.prenom);
    setVal2('profil-email',   user.email);
    setVal2('profil-gsm',     user.gsm);
    setVal2('profil-adresse', user.adresse);
  }

  function setVal2(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  }

  document.getElementById('form-profil')?.addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    form.classList.add('was-validated');

    const newPwd  = document.getElementById('profil-new-password').value;
    const confPwd = document.getElementById('profil-confirm-password').value;

    if (newPwd && newPwd !== confPwd) {
      document.getElementById('profil-confirm-password').classList.add('is-invalid');
      return;
    }
    if (newPwd && !VG.isPasswordValid(newPwd)) {
      document.getElementById('profil-error-msg').textContent = 'Le mot de passe ne respecte pas les critères.';
      document.getElementById('profil-error').classList.remove('d-none');
      return;
    }

    const payload = {
      nom:     document.getElementById('profil-nom').value.trim(),
      prenom:  document.getElementById('profil-prenom').value.trim(),
      email:   document.getElementById('profil-email').value.trim(),
      gsm:     document.getElementById('profil-gsm').value.trim(),
      adresse: document.getElementById('profil-adresse').value.trim(),
    };
    if (newPwd) payload.password = newPwd;

    try {
      const res = await fetch(VG.apiUrl('utilisateur/update-profil.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        document.getElementById('profil-success').classList.remove('d-none');
        document.getElementById('profil-error').classList.add('d-none');
        /* Mettre à jour session */
        const updatedUser = { ...Auth.getUser(), ...payload };
        sessionStorage.setItem('vg_user', JSON.stringify(updatedUser));
        Auth.updateNavbar();
      } else {
        document.getElementById('profil-error-msg').textContent = data.message || 'Erreur.';
        document.getElementById('profil-error').classList.remove('d-none');
      }
    } catch {
      document.getElementById('profil-error-msg').textContent = 'Erreur serveur.';
      document.getElementById('profil-error').classList.remove('d-none');
    }
  });

  /* ---- Init ---- */
  chargerCommandes();
  chargerProfil();
});