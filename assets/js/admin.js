/* =========================================================
   admin.js – Espace administrateur :
   statistiques (NoSQL MongoDB via PHP), gestion employés,
   graphiques Chart.js
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('tab-stats-admin')) return;

  if (!Auth.requireAuth(['administrateur'])) return;

  let chartCommandes = null;
  let chartCA        = null;

  /* ================================================================
     STATISTIQUES (données NoSQL)
  ================================================================= */
  async function chargerStats(filtres = {}) {
    const params = new URLSearchParams(filtres).toString();
    try {
      const res  = await fetch(VG.apiUrl('admin/stats.php?' + params));
      const data = res.ok ? await res.json() : donneesDemoStats();
      afficherStats(data);
    } catch {
      afficherStats(donneesDemoStats());
    }
  }

  function afficherStats(data) {
    const { menus, totaux } = data;

    /* KPI */
    setEl('kpi-total-commandes', totaux.nb_commandes || 0);
    setEl('kpi-ca-total',        VG.formatEuro(totaux.ca_total || 0));
    setEl('kpi-menu-top',        totaux.menu_top || '–');
    setEl('kpi-note-moy',        totaux.note_moyenne ? `${parseFloat(totaux.note_moyenne).toFixed(1)} / 5` : '–');

    /* Tableau */
    const tbody = document.getElementById('stats-tbody');
    if (tbody) {
      tbody.innerHTML = menus.map(m => `
        <tr>
          <td>${VG.escapeHtml(m.menu_titre)}</td>
          <td class="text-center fw-semibold">${m.nb_commandes}</td>
          <td class="text-end">${VG.formatEuro(m.ca)}</td>
          <td class="text-center">${m.note_moyenne ? parseFloat(m.note_moyenne).toFixed(1) : '–'}</td>
        </tr>`).join('');
    }

    /* Graphiques */
    const labels   = menus.map(m => m.menu_titre);
    const nbCmds   = menus.map(m => m.nb_commandes);
    const caValues = menus.map(m => parseFloat(m.ca));

    renderChartCommandes(labels, nbCmds);
    renderChartCA(labels, caValues);

    /* Options du filtre menu */
    const selMenu = document.getElementById('stats-menu');
    if (selMenu) {
      selMenu.innerHTML = '<option value="">Tous les menus</option>' +
        menus.map(m => `<option value="${m.menu_id}">${VG.escapeHtml(m.menu_titre)}</option>`).join('');
    }
  }

  /* ---- Chart : commandes par menu (barres) ---- */
  function renderChartCommandes(labels, data) {
    const canvas = document.getElementById('chart-commandes-menu');
    if (!canvas) return;
    if (chartCommandes) chartCommandes.destroy();
    chartCommandes = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Nb commandes',
          data,
          backgroundColor: 'rgba(212, 55, 12, 0.7)',
          borderColor:     '#D4370C',
          borderWidth: 1,
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.parsed.y} commande(s)`,
            },
          },
        },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } },
          x: { ticks: { maxRotation: 30 } },
        },
      },
    });
  }

  /* ---- Chart : CA par menu (donut) ---- */
  function renderChartCA(labels, data) {
    const canvas = document.getElementById('chart-ca-menu');
    if (!canvas) return;
    if (chartCA) chartCA.destroy();

    const colors = [
      '#D4370C', '#F4A261', '#2D6A4F', '#2B2D42',
      '#E76F51', '#264653', '#A8DADC', '#457B9D',
    ];

    chartCA = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors.slice(0, data.length),
          hoverOffset: 10,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12 } },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.label} : ${VG.formatEuro(ctx.parsed)}`,
            },
          },
        },
      },
    });
  }

  document.getElementById('form-filtres-stats')?.addEventListener('submit', e => {
    e.preventDefault();
    chargerStats({
      menu_id:    document.getElementById('stats-menu')?.value || '',
      date_debut: document.getElementById('stats-date-debut')?.value || '',
      date_fin:   document.getElementById('stats-date-fin')?.value || '',
    });
  });

  /* ================================================================
     GESTION EMPLOYÉS
  ================================================================= */
  async function chargerEmployes() {
    const tbody = document.getElementById('employes-tbody');
    if (!tbody) return;
    try {
      const res  = await fetch(VG.apiUrl('admin/get-employes.php'));
      const data = res.ok ? await res.json() : [];
      tbody.innerHTML = data.map(emp => `
        <tr>
          <td><strong>${VG.escapeHtml(emp.nom)} ${VG.escapeHtml(emp.prenom)}</strong></td>
          <td>${VG.escapeHtml(emp.email)}</td>
          <td class="text-muted small">${VG.formatDate(emp.created_at)}</td>
          <td>
            ${emp.actif
              ? '<span class="badge bg-success">Actif</span>'
              : '<span class="badge bg-secondary">Désactivé</span>'}
          </td>
          <td>
            <button class="btn btn-sm ${emp.actif ? 'btn-outline-danger' : 'btn-outline-success'} btn-toggle-emp"
                    data-id="${emp.id}" data-actif="${emp.actif}"
                    aria-label="${emp.actif ? 'Désactiver' : 'Réactiver'} le compte">
              <i class="bi bi-${emp.actif ? 'slash-circle' : 'check-circle'}"></i>
              ${emp.actif ? 'Désactiver' : 'Réactiver'}
            </button>
          </td>
        </tr>`).join('');

      tbody.querySelectorAll('.btn-toggle-emp').forEach(btn => {
        btn.addEventListener('click', () => toggleEmploye(btn.dataset.id, btn.dataset.actif == '1'));
      });
    } catch {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Erreur de chargement.</td></tr>';
    }
  }

  async function toggleEmploye(id, actif) {
    const action = actif ? 'désactiver' : 'réactiver';
    if (!confirm(`Êtes-vous sûr de vouloir ${action} ce compte ?`)) return;
    const res = await fetch(VG.apiUrl('admin/toggle-employe.php'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employe_id: id, actif: !actif }),
    });
    if (res.ok) chargerEmployes();
    else alert('Erreur lors de la modification.');
  }

  /* ---- Création d'un employé ---- */
  document.getElementById('btn-creer-employe')?.addEventListener('click', async () => {
    const form = document.getElementById('form-creer-employe');
    form.classList.add('was-validated');
    if (!form.checkValidity()) return;

    const payload = {
      nom:      document.getElementById('emp-nom').value.trim(),
      prenom:   document.getElementById('emp-prenom').value.trim(),
      email:    document.getElementById('emp-email').value.trim(),
      password: document.getElementById('emp-password').value,
    };

    const errEl  = document.getElementById('employe-error');
    const errMsg = document.getElementById('employe-error-msg');
    const sucEl  = document.getElementById('employe-success');

    errEl.classList.add('d-none');
    sucEl.classList.add('d-none');

    try {
      const res  = await fetch(VG.apiUrl('admin/create-employe.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        sucEl.classList.remove('d-none');
        form.reset();
        form.classList.remove('was-validated');
        chargerEmployes();
      } else {
        errMsg.textContent = data.message || 'Erreur lors de la création.';
        errEl.classList.remove('d-none');
      }
    } catch {
      errMsg.textContent = 'Erreur réseau.';
      errEl.classList.remove('d-none');
    }
  });

  /* Toggle affichage mdp employé */
  document.getElementById('btn-toggle-emp-pwd')?.addEventListener('click', () => {
    const inp = document.getElementById('emp-password');
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });

  /* ================================================================
     ONGLETS ADMIN
  ================================================================= */
  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      if (tab === 'stats-admin')    chargerStats();
      if (tab === 'employes-admin') chargerEmployes();
    });
  });

  /* ================================================================
     DONNÉES DE DÉMONSTRATION (si API indisponible)
  ================================================================= */
  function donneesDemoStats() {
    return {
      menus: [
        { menu_id: 1, menu_titre: 'Menu Noël Prestige',   nb_commandes: 12, ca: 4200, note_moyenne: 4.7 },
        { menu_id: 2, menu_titre: 'Menu Printemps',        nb_commandes:  7, ca: 1540, note_moyenne: 4.2 },
        { menu_id: 3, menu_titre: 'Menu Classique Maison', nb_commandes: 20, ca: 3600, note_moyenne: 4.5 },
        { menu_id: 4, menu_titre: 'Menu Corporate',        nb_commandes:  5, ca: 2400, note_moyenne: 4.8 },
      ],
      totaux: {
        nb_commandes: 44,
        ca_total:     11740,
        menu_top:     'Menu Classique Maison',
        note_moyenne: 4.55,
      },
    };
  }

  function setEl(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  /* ---- Init ---- */
  chargerStats();
  chargerEmployes();
});