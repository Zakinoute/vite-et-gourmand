/* =========================================================
   commande.js – Formulaire de commande en 3 étapes
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('step-1')) return;

  /* Vérification connexion obligatoire */
  if (!Auth.requireAuth(['utilisateur', 'employe', 'administrateur'])) return;

  const user = Auth.getUser();

  /* ---- Mode édition ---- */
  const urlParams = new URLSearchParams(window.location.search);
  const editId    = urlParams.get('edit') ? parseInt(urlParams.get('edit')) : null;
  let   editCommande = null; // données de la commande en cours de modification

  /* ---- Données temporaires entre étapes ---- */
  let dataStep1 = {};
  let dataStep2 = {};
  let tousMenus = [];

  /* ---- Pré-remplissage depuis le compte ---- */
  function preremplir() {
    if (!user) return;
    setVal('cmd-nom',    user.nom);
    setVal('cmd-prenom', user.prenom);
    setVal('cmd-email',  user.email);
    setVal('cmd-gsm',    user.gsm);
  }

  function setVal(id, val) {
    const el = document.getElementById(id);
    if (el && val) el.value = val;
  }

  /* ---- Charger les menus dans le select étape 2 (retourne une Promise) ---- */
  async function chargerMenus() {
    try {
      const res = await fetch(VG.apiUrl('menus/get-menus.php'));
      tousMenus = res.ok ? await res.json() : donneesDemoMenus();
    } catch {
      tousMenus = donneesDemoMenus();
    }

    const select = document.getElementById('cmd-menu');
    if (!select) return;
    select.innerHTML = '<option value="">-- Sélectionnez un menu --</option>' +
      tousMenus.filter(m => m.stock > 0).map(m =>
        `<option value="${m.id}" data-prix="${m.prix}" data-min="${m.nb_personnes_min}"
                data-theme="${VG.escapeHtml(m.theme)}" data-stock="${m.stock}"
                data-conditions="${VG.escapeHtml(m.conditions || '')}">
           ${VG.escapeHtml(m.titre)} – ${VG.formatEuro(m.prix)} / ${m.nb_personnes_min} pers. min
         </option>`
      ).join('');

    /* Si menu pré-sélectionné depuis l'URL */
    const params = new URLSearchParams(window.location.search);
    const menuId = params.get('menu_id');
    if (menuId) {
      select.value = menuId;
      select.dispatchEvent(new Event('change'));
    }
  }

  /* ---- Etape 1 ---- */
  document.getElementById('form-step1')?.addEventListener('submit', e => {
    e.preventDefault();
    const form = e.target;
    form.classList.add('was-validated');
    if (!form.checkValidity()) return;

    dataStep1 = {
      nom:             document.getElementById('cmd-nom').value.trim(),
      prenom:          document.getElementById('cmd-prenom').value.trim(),
      email:           document.getElementById('cmd-email').value.trim(),
      gsm:             document.getElementById('cmd-gsm').value.trim(),
      adresse:         document.getElementById('cmd-adresse').value.trim(),
      date_prestation: document.getElementById('cmd-date').value,
      heure_prestation:document.getElementById('cmd-heure').value,
    };

    afficherStep(2);
  });

  /* ---- Retour vers étape 1 ---- */
  document.getElementById('btn-retour-step1')?.addEventListener('click', () => afficherStep(1));

  /* ---- Changement de menu → mise à jour des infos ---- */
  document.getElementById('cmd-menu')?.addEventListener('change', function () {
    const opt     = this.options[this.selectedIndex];
    const infoBox = document.getElementById('menu-info-box');
    const personnesInput = document.getElementById('cmd-personnes');

    if (!this.value) {
      infoBox.classList.add('d-none');
      return;
    }

    const prix  = parseFloat(opt.dataset.prix);
    const min   = parseInt(opt.dataset.min);
    const stock = parseInt(opt.dataset.stock);
    const conditions = opt.dataset.conditions;

    document.getElementById('info-prix-base').textContent = VG.formatEuro(prix);
    document.getElementById('info-nb-min').textContent    = `${min} personnes`;
    document.getElementById('info-theme').textContent     = opt.dataset.theme;
    document.getElementById('info-stock').textContent     = `${stock} commande(s)`;
    document.getElementById('info-conditions').textContent = conditions || 'Aucune';
    infoBox.classList.remove('d-none');

    personnesInput.min   = min;
    personnesInput.value = min;
    document.getElementById('personnes-help').textContent =
      `Minimum ${min} personne(s). Réduction –10% à partir de ${min + 5} personnes.`;

    calculerPrix();
  });

  /* ---- Mise à jour prix en temps réel ---- */
  document.getElementById('cmd-personnes')?.addEventListener('input', calculerPrix);

  function calculerPrix() {
    const select   = document.getElementById('cmd-menu');
    const opt      = select?.options[select.selectedIndex];
    const nbInput  = document.getElementById('cmd-personnes');
    if (!opt || !opt.value || !nbInput.value) return;

    const prix    = parseFloat(opt.dataset.prix);
    const min     = parseInt(opt.dataset.min);
    const nb      = parseInt(nbInput.value);
    const redEl   = document.getElementById('reduction-info');

    let prixTotal = (nb / min) * prix;
    let reduction = false;

    if (nb >= min + 5) {
      prixTotal *= 0.9;
      reduction = true;
    }

    redEl && (reduction ? redEl.classList.remove('d-none') : redEl.classList.add('d-none'));
  }

  /* ---- Étape 2 ---- */
  document.getElementById('form-step2')?.addEventListener('submit', e => {
    e.preventDefault();
    const form = e.target;
    form.classList.add('was-validated');

    const select  = document.getElementById('cmd-menu');
    const opt     = select?.options[select.selectedIndex];
    const nb      = parseInt(document.getElementById('cmd-personnes').value);
    const feedEl  = document.getElementById('personnes-feedback');

    if (!select.value) return;

    const min = parseInt(opt.dataset.min);
    if (nb < min) {
      feedEl.textContent = `Le nombre minimum est de ${min} personnes.`;
      document.getElementById('cmd-personnes').classList.add('is-invalid');
      return;
    }

    document.getElementById('cmd-personnes').classList.remove('is-invalid');
    dataStep2 = {
      menu_id:     parseInt(select.value),
      menu_titre:  opt.text.split('–')[0].trim(),
      menu_prix:   parseFloat(opt.dataset.prix),
      menu_min:    min,
      nb_personnes: nb,
    };

    remplirRecap();
    afficherStep(3);
  });

  /* ---- Retour vers étape 2 ---- */
  document.getElementById('btn-retour-step2')?.addEventListener('click', () => afficherStep(2));

  /* ---- Remplir le récapitulatif ---- */
  function remplirRecap() {
    const { nom, prenom, email, gsm, adresse, date_prestation, heure_prestation } = dataStep1;
    const { menu_titre, menu_prix, menu_min, nb_personnes } = dataStep2;

    const recapClient = document.getElementById('recap-client');
    recapClient && (recapClient.innerHTML = `
      <li class="list-group-item d-flex justify-content-between">
        <span>Nom</span><strong>${VG.escapeHtml(prenom)} ${VG.escapeHtml(nom)}</strong>
      </li>
      <li class="list-group-item d-flex justify-content-between">
        <span>Email</span><strong>${VG.escapeHtml(email)}</strong>
      </li>
      <li class="list-group-item d-flex justify-content-between">
        <span>Téléphone</span><strong>${VG.escapeHtml(gsm)}</strong>
      </li>`);

    const recapPrestation = document.getElementById('recap-prestation');
    recapPrestation && (recapPrestation.innerHTML = `
      <li class="list-group-item d-flex justify-content-between">
        <span>Menu</span><strong>${VG.escapeHtml(menu_titre)}</strong>
      </li>
      <li class="list-group-item d-flex justify-content-between">
        <span>Personnes</span><strong>${nb_personnes}</strong>
      </li>
      <li class="list-group-item d-flex justify-content-between">
        <span>Adresse de livraison</span><strong>${VG.escapeHtml(adresse)}</strong>
      </li>
      <li class="list-group-item d-flex justify-content-between">
        <span>Date & heure</span><strong>${VG.formatDate(date_prestation)} à ${heure_prestation}</strong>
      </li>`);

    /* Calcul du prix */
    let prixMenu  = (nb_personnes / menu_min) * menu_prix;
    let reduction = 0;
    if (nb_personnes >= menu_min + 5) {
      reduction = prixMenu * 0.1;
      prixMenu  = prixMenu * 0.9;
    }

    /* Livraison */
    const dansBordeaux = adresse.toLowerCase().includes('bordeaux');
    const prixLivraison = dansBordeaux ? 5 : 5 + (Math.random() * 20 + 5); // Estimation côté client
    const total = prixMenu + prixLivraison;

    setEl2('recap-prix-menu',  VG.formatEuro(prixMenu + reduction));
    setEl2('recap-livraison',  VG.formatEuro(prixLivraison));
    setEl2('recap-total',      VG.formatEuro(total));

    if (reduction > 0) {
      document.getElementById('recap-reduction-row')?.classList.remove('d-none');
      setEl2('recap-reduction', `– ${VG.formatEuro(reduction)}`);
    }

    dataStep2.prix_total = total;
  }

  function setEl2(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  /* ---- Validation commande (étape 3) ---- */
  document.getElementById('btn-valider-commande')?.addEventListener('click', async () => {
    const cgv     = document.getElementById('cmd-cgv');
    const sucEl   = document.getElementById('commande-success');
    const errEl   = document.getElementById('commande-error');
    const errMsg  = document.getElementById('commande-error-msg');
    const btn     = document.getElementById('btn-valider-commande');

    if (!cgv.checked) {
      cgv.classList.add('is-invalid');
      return;
    }
    cgv.classList.remove('is-invalid');

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Envoi...';

    let endpoint, payload, btnLabel;

    if (editId) {
      endpoint = 'commandes/modifier-commande.php';
      payload  = {
        commande_id:      editId,
        adresse:          dataStep1.adresse,
        date_prestation:  dataStep1.date_prestation,
        heure_prestation: dataStep1.heure_prestation,
        nb_personnes:     dataStep2.nb_personnes,
      };
      btnLabel = '<i class="bi bi-check-circle me-2"></i>Enregistrer les modifications';
    } else {
      endpoint = 'commandes/create-commande.php';
      payload  = { ...dataStep1, ...dataStep2 };
      btnLabel = '<i class="bi bi-check-circle me-2"></i>Confirmer la commande';
    }

    try {
      const res  = await fetch(VG.apiUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        sucEl.classList.remove('d-none');
        sucEl.querySelector('p, span, div') && (sucEl.textContent =
          editId ? 'Commande modifiée avec succès ! Redirection...' : sucEl.textContent);
        errEl.classList.add('d-none');
        btn.classList.add('d-none');
        setTimeout(() => window.location.href = 'espace-utilisateur.html', 3000);
      } else {
        errMsg.textContent = data.message || 'Erreur lors de l\'opération.';
        errEl.classList.remove('d-none');
        btn.disabled = false;
        btn.innerHTML = btnLabel;
      }
    } catch {
      errMsg.textContent = 'Erreur de connexion au serveur.';
      errEl.classList.remove('d-none');
      btn.disabled = false;
      btn.innerHTML = btnLabel;
    }
  });

  /* ---- Navigation entre étapes ---- */
  function afficherStep(num) {
    [1, 2, 3].forEach(n => {
      const el = document.getElementById(`step-${n}`);
      if (el) el.classList.toggle('d-none', n !== num);

      const stepEl = document.querySelector(`.step[data-step="${n}"]`);
      if (stepEl) {
        stepEl.classList.toggle('active', n === num);
        stepEl.classList.toggle('completed', n < num);
      }
    });
  }

  function donneesDemoMenus() {
    return [
      { id: 1, titre: 'Menu Noël Prestige', prix: 350, nb_personnes_min: 8, stock: 5, theme: 'noel', conditions: 'À commander 72h à l\'avance.' },
      { id: 2, titre: 'Menu Printemps',     prix: 220, nb_personnes_min: 6, stock: 3, theme: 'paques', conditions: '' },
    ];
  }

  /* ================================================================
     MODE ÉDITION  (?edit=ID)
  ================================================================= */
  async function chargerCommandePourEdit() {
    if (!editId) return;

    // Bannière de modification
    const banner = document.createElement('div');
    banner.className = 'alert alert-warning d-flex align-items-center gap-2 mb-4';
    banner.setAttribute('role', 'status');
    banner.innerHTML = `<i class="bi bi-pencil-square fs-5"></i>
      <div>Vous modifiez la <strong>commande #${editId}</strong>.
      Le menu ne peut pas être changé.</div>`;
    document.getElementById('step-1')?.parentElement?.insertBefore(
      banner, document.getElementById('step-1')
    );

    // Changer le titre de la page et le bouton final
    const h1 = document.querySelector('h1, .commande-titre');
    if (h1) h1.textContent = 'Modifier ma commande';
    const btnValider = document.getElementById('btn-valider-commande');
    if (btnValider) btnValider.innerHTML = '<i class="bi bi-check-circle me-2"></i>Enregistrer les modifications';

    try {
      const res = await fetch(VG.apiUrl(`commandes/get-commandes.php?id=${editId}`));
      if (!res.ok) { alert('Commande introuvable.'); return; }
      editCommande = await res.json();

      // Pré-remplir étape 1
      setVal('cmd-adresse', editCommande.adresse);
      setVal('cmd-date',    editCommande.date_prestation?.split('T')[0] ?? editCommande.date_prestation);
      setVal('cmd-heure',   editCommande.heure_prestation?.slice(0, 5) ?? '');

    } catch { alert('Impossible de charger la commande.'); }
  }

  function preselectMenuEdit() {
    if (!editCommande) return;
    const select = document.getElementById('cmd-menu');
    if (!select) return;
    select.value = editCommande.menu_id;
    select.disabled = true;
    select.dispatchEvent(new Event('change'));
    setVal('cmd-personnes', editCommande.nb_personnes);
    calculerPrix();

    // Légende sous le select
    const hint = document.createElement('div');
    hint.className = 'form-text text-warning';
    hint.innerHTML = '<i class="bi bi-lock me-1"></i>Le menu ne peut pas être modifié.';
    select.parentElement?.appendChild(hint);
  }

  /* ---- Init ---- */
  preremplir();
  chargerMenus().then(() => {
    if (editId) preselectMenuEdit();
  });
  if (editId) chargerCommandePourEdit();
});