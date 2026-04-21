/* =========================================================
   employe.js – Espace employé :
   commandes, menus, plats, horaires, avis
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const isEmpPage   = !!document.getElementById('tab-commandes-emp');
  const isAdminPage = !!document.getElementById('tab-commandes-admin');
  if (!isEmpPage && !isAdminPage) return;

  if (!Auth.requireAuth(['employe', 'administrateur'])) return;

  const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  /* ================================================================
     COMMANDES
  ================================================================= */
  async function chargerCommandes(filtres = {}) {
    const loading   = document.getElementById('cmd-loading');
    const wrapper   = document.getElementById('cmd-table-wrapper');
    const empty     = document.getElementById('cmd-empty');
    const tbody     = document.getElementById('cmd-tbody');
    if (!tbody) return;

    loading?.classList.remove('d-none');
    wrapper?.classList.add('d-none');
    empty?.classList.add('d-none');

    const params = new URLSearchParams(filtres).toString();
    try {
      const res  = await fetch(VG.apiUrl('commandes/get-commandes.php?all=1&' + params));
      const data = res.ok ? await res.json() : [];

      loading?.classList.add('d-none');

      if (!data.length) { empty?.classList.remove('d-none'); return; }
      wrapper?.classList.remove('d-none');

      tbody.innerHTML = data.map(cmd => `
        <tr>
          <td>#${cmd.id}</td>
          <td>
            <strong>${VG.escapeHtml(cmd.user_nom)} ${VG.escapeHtml(cmd.user_prenom)}</strong><br>
            <small class="text-muted">${VG.escapeHtml(cmd.user_email)}</small>
          </td>
          <td>${VG.escapeHtml(cmd.menu_titre)}</td>
          <td>
            ${VG.formatDate(cmd.date_prestation)}<br>
            <small class="text-muted">${cmd.heure_prestation}</small>
          </td>
          <td>${cmd.nb_personnes}</td>
          <td>${VG.formatEuro(cmd.prix_total)}</td>
          <td>${VG.statutBadge(cmd.statut)}</td>
          <td>
            <button class="btn btn-primary btn-sm btn-update-statut"
                    data-id="${cmd.id}" data-statut="${cmd.statut}"
                    aria-label="Mettre à jour la commande #${cmd.id}">
              <i class="bi bi-pencil"></i>
            </button>
          </td>
        </tr>`).join('');

      initBoutonsStatut();
    } catch {
      loading?.classList.add('d-none');
      empty?.classList.remove('d-none');
    }
  }

  document.getElementById('form-filtre-cmd')?.addEventListener('submit', e => {
    e.preventDefault();
    chargerCommandes({
      statut: document.getElementById('filtre-statut')?.value || '',
      client: document.getElementById('filtre-client')?.value || '',
      date:   document.getElementById('filtre-date-cmd')?.value || '',
    });
  });

  function initBoutonsStatut() {
    document.querySelectorAll('.btn-update-statut').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('modal-cmd-id').value = btn.dataset.id;
        document.getElementById('modal-statut').value = btn.dataset.statut;
        new bootstrap.Modal(document.getElementById('modalStatutCmd')).show();
      });
    });
  }

  /* Mise à jour statut commande */
  document.getElementById('btn-update-statut')?.addEventListener('click', async () => {
    const id     = document.getElementById('modal-cmd-id').value;
    const statut = document.getElementById('modal-statut').value;
    const motif  = document.getElementById('modal-motif')?.value.trim();
    const mode   = document.getElementById('modal-mode-contact')?.value;

    try {
      const res = await fetch(VG.apiUrl('commandes/update-commande.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commande_id: id, statut, motif_annulation: motif, mode_contact: mode }),
      });
      if (res.ok) {
        bootstrap.Modal.getInstance(document.getElementById('modalStatutCmd'))?.hide();
        chargerCommandes();
      } else {
        alert('Erreur lors de la mise à jour.');
      }
    } catch { alert('Erreur réseau.'); }
  });

  /* Afficher/masquer champs annulation selon statut */
  document.getElementById('modal-statut')?.addEventListener('change', function () {
    const annulFields = document.getElementById('annulation-fields');
    if (annulFields) {
      annulFields.classList.toggle('d-none', this.value !== 'annulee');
    }
  });

  /* ================================================================
     MENUS
  ================================================================= */
  async function chargerMenusEmp() {
    const tbody = document.getElementById('menus-emp-tbody');
    if (!tbody) return;

    try {
      const res  = await fetch(VG.apiUrl('menus/get-menus.php'));
      const data = res.ok ? await res.json() : [];
      tbody.innerHTML = data.map(m => `
        <tr>
          <td><strong>${VG.escapeHtml(m.titre)}</strong></td>
          <td>${VG.escapeHtml(m.theme)}</td>
          <td>${VG.escapeHtml(m.regime)}</td>
          <td>${m.nb_personnes_min}</td>
          <td>${VG.formatEuro(m.prix)}</td>
          <td>
            <span class="badge ${m.stock === 0 ? 'bg-danger' : m.stock <= 3 ? 'bg-warning text-dark' : 'bg-success'}">
              ${m.stock}
            </span>
          </td>
          <td>
            <button class="btn btn-sm btn-outline-primary btn-edit-menu me-1" data-id="${m.id}"
                    aria-label="Modifier le menu ${VG.escapeHtml(m.titre)}">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger btn-del-menu" data-id="${m.id}"
                    aria-label="Supprimer le menu ${VG.escapeHtml(m.titre)}">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>`).join('');

      initBoutonsMenus(data);
    } catch { tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Erreur de chargement.</td></tr>'; }
  }

  function initBoutonsMenus(data) {
    document.querySelectorAll('.btn-edit-menu').forEach(btn => {
      btn.addEventListener('click', () => {
        const menu = data.find(m => m.id == btn.dataset.id);
        if (!menu) return;
        remplirFormMenu(menu);
        document.getElementById('modalMenuLabel').textContent = 'Modifier le menu';
        new bootstrap.Modal(document.getElementById('modalMenu')).show();
      });
    });
    document.querySelectorAll('.btn-del-menu').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Supprimer ce menu ?')) return;
        const res = await fetch(VG.apiUrl('menus/delete-menu.php'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: btn.dataset.id }),
        });
        if (res.ok) chargerMenusEmp();
        else alert('Erreur lors de la suppression.');
      });
    });
  }

  document.getElementById('btn-nouveau-menu')?.addEventListener('click', () => {
    remplirFormMenu(null);
    document.getElementById('modalMenuLabel').textContent = 'Nouveau menu';
  });

  function remplirFormMenu(menu) {
    const setv = (id, val) => { const el = document.getElementById(id); if (el) el.value = val ?? ''; };
    setv('menu-id',          menu?.id || '');
    setv('menu-titre',       menu?.titre || '');
    setv('menu-description', menu?.description || '');
    setv('menu-theme',       menu?.theme || '');
    setv('menu-regime',      menu?.regime || 'classique');
    setv('menu-nb-min',      menu?.nb_personnes_min || '');
    setv('menu-prix',        menu?.prix || '');
    setv('menu-stock',       menu?.stock ?? 0);
    setv('menu-conditions',  menu?.conditions || '');
  }

  document.getElementById('btn-save-menu')?.addEventListener('click', async () => {
    const form = document.getElementById('form-menu');
    form.classList.add('was-validated');
    if (!form.checkValidity()) return;

    const payload = {
      id:               document.getElementById('menu-id').value || null,
      titre:            document.getElementById('menu-titre').value.trim(),
      description:      document.getElementById('menu-description').value.trim(),
      theme:            document.getElementById('menu-theme').value,
      regime:           document.getElementById('menu-regime').value,
      nb_personnes_min: parseInt(document.getElementById('menu-nb-min').value),
      prix:             parseFloat(document.getElementById('menu-prix').value),
      stock:            parseInt(document.getElementById('menu-stock').value),
      conditions:       document.getElementById('menu-conditions').value.trim(),
    };

    const endpoint = payload.id ? 'menus/update-menu.php' : 'menus/create-menu.php';
    const res = await fetch(VG.apiUrl(endpoint), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      bootstrap.Modal.getInstance(document.getElementById('modalMenu'))?.hide();
      chargerMenusEmp();
    } else {
      alert('Erreur lors de la sauvegarde.');
    }
  });

  /* ================================================================
     PLATS
  ================================================================= */
  let cachedAllergenes = [];

  async function chargerAllergenesCheckboxes(selectedIds = []) {
    const container = document.getElementById('allergenes-checkboxes');
    if (!container) return;

    if (!cachedAllergenes.length) {
      try {
        const res = await fetch(VG.apiUrl('menus/get-allergenes.php'));
        if (res.ok) cachedAllergenes = await res.json();
      } catch { }
    }

    if (!cachedAllergenes.length) {
      container.innerHTML = '<p class="text-muted small mb-0">Aucun allergène disponible.</p>';
      return;
    }

    container.innerHTML = cachedAllergenes.map(a => `
      <div class="col-6 col-sm-4">
        <div class="form-check">
          <input class="form-check-input" type="checkbox"
                 id="allerg-${a.id}" name="allergenes" value="${a.id}"
                 ${selectedIds.includes(a.id) ? 'checked' : ''}>
          <label class="form-check-label small" for="allerg-${a.id}">${VG.escapeHtml(a.nom)}</label>
        </div>
      </div>`).join('');
  }

  function remplirFormPlat(plat) {
    document.getElementById('plat-id').value          = plat?.id || '';
    document.getElementById('plat-nom').value         = plat?.nom || '';
    document.getElementById('plat-type').value        = plat?.type || 'entree';
    document.getElementById('plat-description').value = plat?.description || '';
    document.getElementById('modalPlatLabel').textContent = plat ? 'Modifier le plat' : 'Nouveau plat';

    const selectedIds = plat?.allergenes_ids || [];
    chargerAllergenesCheckboxes(selectedIds);
  }

  function getSelectedAllergeneIds() {
    return [...document.querySelectorAll('#allergenes-checkboxes input[name="allergenes"]:checked')]
      .map(cb => parseInt(cb.value));
  }

  async function chargerPlatsEmp() {
    const tbody = document.getElementById('plats-emp-tbody');
    if (!tbody) return;
    try {
      const res  = await fetch(VG.apiUrl('menus/get-plats.php'));
      const data = res.ok ? await res.json() : [];
      tbody.innerHTML = data.map(p => `
        <tr>
          <td>${VG.escapeHtml(p.nom)}</td>
          <td><span class="badge bg-secondary">${p.type}</span></td>
          <td class="small text-muted">${VG.escapeHtml(p.description || '–')}</td>
          <td class="small">
            ${(p.allergenes || []).map(a => `<span class="badge bg-warning text-dark me-1">${VG.escapeHtml(a)}</span>`).join('') || '–'}
          </td>
          <td>
            <button class="btn btn-sm btn-outline-primary btn-edit-plat me-1" data-id="${p.id}"
                    aria-label="Modifier ${VG.escapeHtml(p.nom)}">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger btn-del-plat" data-id="${p.id}"
                    aria-label="Supprimer ${VG.escapeHtml(p.nom)}">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>`).join('');

      initBoutonsPlats(data);
    } catch { tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Erreur de chargement.</td></tr>'; }
  }

  function initBoutonsPlats(data) {
    document.querySelectorAll('.btn-edit-plat').forEach(btn => {
      btn.addEventListener('click', () => {
        const plat = data.find(p => p.id == btn.dataset.id);
        if (!plat) return;
        remplirFormPlat(plat);
        new bootstrap.Modal(document.getElementById('modalPlat')).show();
      });
    });

    document.querySelectorAll('.btn-del-plat').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Supprimer ce plat ?')) return;
        const res = await fetch(VG.apiUrl('menus/delete-plat.php'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: parseInt(btn.dataset.id) }),
        });
        if (res.ok) {
          chargerPlatsEmp();
        } else {
          const body = await res.json().catch(() => ({}));
          alert(body.message || 'Erreur lors de la suppression.');
        }
      });
    });
  }

  document.getElementById('btn-nouveau-plat')?.addEventListener('click', () => {
    remplirFormPlat(null);
    new bootstrap.Modal(document.getElementById('modalPlat')).show();
  });

  document.getElementById('btn-save-plat')?.addEventListener('click', async () => {
    const nom  = document.getElementById('plat-nom').value.trim();
    const type = document.getElementById('plat-type').value;
    if (!nom || !type) { alert('Nom et type obligatoires.'); return; }

    const id = document.getElementById('plat-id').value;
    const payload = {
      nom,
      type,
      description:    document.getElementById('plat-description').value.trim(),
      allergenes_ids: getSelectedAllergeneIds(),
    };
    if (id) payload.id = parseInt(id);

    const endpoint = id ? 'menus/update-plat.php' : 'menus/create-plat.php';
    const res = await fetch(VG.apiUrl(endpoint), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      bootstrap.Modal.getInstance(document.getElementById('modalPlat'))?.hide();
      chargerPlatsEmp();
    } else {
      const body = await res.json().catch(() => ({}));
      alert(body.message || 'Erreur lors de la sauvegarde.');
    }
  });

  /* ================================================================
     HORAIRES
  ================================================================= */
  async function chargerHoraires() {
    const tbody = document.getElementById('horaires-tbody');
    if (!tbody) return;

    let horaires = [];
    try {
      const res = await fetch(VG.apiUrl('horaires/get-horaires.php'));
      horaires  = res.ok ? await res.json() : [];
    } catch { }

    tbody.innerHTML = JOURS.map((jour, i) => {
      const h     = horaires.find(h => h.jour === jour) || {};
      const ferme = h.ferme || false;
      return `
        <tr>
          <td class="fw-semibold">${jour}</td>
          <td>
            <input type="time" name="ouverture_${i}" class="form-control form-control-sm"
                   value="${h.ouverture || '09:00'}" ${ferme ? 'disabled' : ''} />
          </td>
          <td>
            <input type="time" name="fermeture_${i}" class="form-control form-control-sm"
                   value="${h.fermeture || '19:00'}" ${ferme ? 'disabled' : ''} />
          </td>
          <td>
            <div class="form-check">
              <input class="form-check-input toggle-ferme" type="checkbox"
                     id="ferme_${i}" name="ferme_${i}" data-index="${i}" ${ferme ? 'checked' : ''} />
              <label class="form-check-label" for="ferme_${i}">Fermé</label>
            </div>
          </td>
        </tr>`;
    }).join('');

    /* Activer/désactiver selon checkbox Fermé */
    tbody.querySelectorAll('.toggle-ferme').forEach(cb => {
      cb.addEventListener('change', function () {
        const i = this.dataset.index;
        tbody.querySelectorAll(`[name="ouverture_${i}"], [name="fermeture_${i}"]`)
             .forEach(inp => inp.disabled = this.checked);
      });
    });
  }

  document.getElementById('form-horaires')?.addEventListener('submit', async e => {
    e.preventDefault();
    const payload = JOURS.map((jour, i) => ({
      jour,
      ouverture:  document.querySelector(`[name="ouverture_${i}"]`)?.value || '09:00',
      fermeture:  document.querySelector(`[name="fermeture_${i}"]`)?.value || '19:00',
      ferme:      document.querySelector(`[name="ferme_${i}"]`)?.checked || false,
    }));
    const res = await fetch(VG.apiUrl('horaires/update-horaires.php'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    document.getElementById('horaires-success')?.classList.toggle('d-none', !res.ok);
  });

  /* ================================================================
     AVIS
  ================================================================= */
  async function chargerAvisEmp() {
    const tbody = document.getElementById('avis-emp-tbody');
    if (!tbody) return;
    try {
      const res  = await fetch(VG.apiUrl('avis/get-avis.php?valide=0'));
      const data = res.ok ? await res.json() : [];
      tbody.innerHTML = data.map(a => `
        <tr>
          <td>${VG.escapeHtml(a.user_nom)} ${VG.escapeHtml(a.user_prenom)}</td>
          <td>${VG.escapeHtml(a.menu_titre)}</td>
          <td>${'★'.repeat(a.note)}${'☆'.repeat(5 - a.note)}</td>
          <td class="small">${VG.escapeHtml(a.commentaire || '–')}</td>
          <td class="small text-muted">${VG.formatDate(a.created_at)}</td>
          <td>
            <button class="btn btn-sm btn-success me-1 btn-valider-avis" data-id="${a.id}">
              <i class="bi bi-check"></i> Valider
            </button>
            <button class="btn btn-sm btn-outline-danger btn-refuser-avis" data-id="${a.id}">
              <i class="bi bi-x"></i> Refuser
            </button>
          </td>
        </tr>`).join('');

      tbody.querySelectorAll('.btn-valider-avis').forEach(btn => {
        btn.addEventListener('click', () => gererAvis(btn.dataset.id, 1));
      });
      tbody.querySelectorAll('.btn-refuser-avis').forEach(btn => {
        btn.addEventListener('click', () => gererAvis(btn.dataset.id, -1));
      });
    } catch { }
  }

  async function gererAvis(id, statut) {
    const res = await fetch(VG.apiUrl('avis/valider-avis.php'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avis_id: id, statut }),
    });
    if (res.ok) chargerAvisEmp();
  }

  /* ================================================================
     INIT selon onglet actif
  ================================================================= */
  function initOnglets() {
    document.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (tab === 'commandes-emp' || tab === 'commandes-admin') chargerCommandes();
        if (tab === 'menus-emp' || tab === 'menus-admin') chargerMenusEmp();
        if (tab === 'plats-emp') chargerPlatsEmp();
        if (tab === 'horaires-emp') chargerHoraires();
        if (tab === 'avis-emp' || tab === 'avis-admin') chargerAvisEmp();
      });
    });
  }

  initOnglets();
  chargerCommandes(); /* Onglet par défaut */
});