/* =========================================================
   menus.js – Vue globale des menus + filtres dynamiques
              + Vue détaillée d'un menu
   ========================================================= */

/* ---- Vue globale (menus.html) ---- */
const MenusPage = (() => {
  let tousLesMenus = [];
  const ITEMS_PAR_PAGE = 9;
  let pageCourante = 1;

  /* ---- Chargement initial ---- */
  async function chargerMenus() {
    const loading = document.getElementById('menus-loading');
    const grid    = document.getElementById('menus-grid');
    const empty   = document.getElementById('menus-empty');
    if (!loading) return;

    try {
      const res = await fetch(VG.apiUrl('menus/get-menus.php'));
      if (!res.ok) throw new Error();
      tousLesMenus = await res.json();
    } catch {
      tousLesMenus = donneesDemoMenus();
    }

    loading.classList.add('d-none');
    afficherMenus(tousLesMenus);
    initFiltres();
    initTri();

    /* Slider prix max */
    const slider = document.getElementById('filtre-prix-max');
    const valEl  = document.getElementById('prix-max-val');
    if (slider) {
      const max = Math.ceil(Math.max(...tousLesMenus.map(m => m.prix), 100));
      slider.max = max;
      slider.value = max;
      valEl && (valEl.textContent = `${max} €`);
      slider.addEventListener('input', () => {
        valEl && (valEl.textContent = `${slider.value} €`);
      });
    }
  }

  /* ---- Affichage de la grille ---- */
  function afficherMenus(menus) {
    const grid       = document.getElementById('menus-grid');
    const empty      = document.getElementById('menus-empty');
    const countEl    = document.getElementById('menus-count');
    const pagination = document.getElementById('menus-pagination');

    countEl && (countEl.textContent = menus.length);

    if (!menus.length) {
      grid.classList.add('d-none');
      empty.classList.remove('d-none');
      pagination && pagination.classList.add('d-none');
      return;
    }
    empty.classList.add('d-none');

    const debut = (pageCourante - 1) * ITEMS_PAR_PAGE;
    const page  = menus.slice(debut, debut + ITEMS_PAR_PAGE);

    grid.innerHTML = page.map(m => carteMenu(m)).join('');
    grid.classList.remove('d-none');

    renderPagination(menus.length, pagination);
  }

  /* ---- Carte menu ---- */
  function carteMenu(m) {
    const image = m.images && m.images[0]
      ? VG.escapeHtml(m.images[0])
      : `https://placehold.co/400x250/D4370C/white?text=${encodeURIComponent(m.titre)}`;

    const regimeBadge = {
      vegetarien: '<span class="badge bg-success">Végétarien</span>',
      vegan:      '<span class="badge bg-success">Végan</span>',
      classique:  '<span class="badge bg-secondary">Classique</span>',
    }[m.regime] || '';

    const themeBadge = {
      noel:      '<span class="badge bg-danger">Noël</span>',
      paques:    '<span class="badge bg-warning text-dark">Pâques</span>',
      classique: '<span class="badge bg-secondary">Classique</span>',
      evenement: '<span class="badge bg-primary">Événement</span>',
    }[m.theme] || '';

    const stockBadge = m.stock === 0
      ? '<span class="badge bg-danger ms-1">Épuisé</span>'
      : m.stock <= 3
      ? `<span class="badge bg-warning text-dark ms-1">Plus que ${m.stock}!</span>`
      : '';

    return `
      <div class="col-md-6 col-xl-4" role="listitem">
        <article class="card-menu card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
          <div class="card-menu-img-wrapper">
            <img src="${image}" alt="${VG.escapeHtml(m.titre)}"
                 class="card-img-top card-menu-img" loading="lazy"
                 onerror="this.src='https://placehold.co/400x250/D4370C/white?text=Menu'" />
            <div class="card-menu-badges position-absolute top-0 start-0 p-2 d-flex flex-wrap gap-1">
              ${themeBadge}${regimeBadge}${stockBadge}
            </div>
          </div>
          <div class="card-body d-flex flex-column p-4">
            <h3 class="h5 fw-bold mb-2">${VG.escapeHtml(m.titre)}</h3>
            <p class="text-muted small flex-grow-1 mb-3">
              ${VG.escapeHtml((m.description || '').substring(0, 120))}${(m.description || '').length > 120 ? '…' : ''}
            </p>
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <span class="h5 fw-bold text-primary mb-0">${VG.formatEuro(m.prix)}</span>
                <span class="text-muted small"> / ${m.nb_personnes_min} pers. min</span>
              </div>
            </div>
            <a href="menu-detail.html?id=${m.id}"
               class="btn btn-primary w-100 ${m.stock === 0 ? 'disabled' : ''}"
               aria-label="Voir le détail du menu ${VG.escapeHtml(m.titre)}"
               ${m.stock === 0 ? 'aria-disabled="true"' : ''}>
              <i class="bi bi-eye me-2" aria-hidden="true"></i>Voir le menu
            </a>
          </div>
        </article>
      </div>`;
  }

  /* ---- Pagination ---- */
  function renderPagination(total, container) {
    if (!container) return;
    const nbPages = Math.ceil(total / ITEMS_PAR_PAGE);
    if (nbPages <= 1) { container.classList.add('d-none'); return; }
    container.classList.remove('d-none');
    const ul = document.getElementById('pagination-list');
    if (!ul) return;
    ul.innerHTML = '';
    for (let i = 1; i <= nbPages; i++) {
      ul.innerHTML += `
        <li class="page-item ${i === pageCourante ? 'active' : ''}">
          <button class="page-link" data-page="${i}" aria-label="Page ${i}"
                  ${i === pageCourante ? 'aria-current="page"' : ''}>${i}</button>
        </li>`;
    }
    ul.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        pageCourante = parseInt(btn.dataset.page);
        filtrerEtAfficher();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  /* ---- Filtres ---- */
  function initFiltres() {
    const form  = document.getElementById('form-filtres');
    const reset = document.getElementById('btn-reset-filtres');
    const reset2 = document.getElementById('btn-reset-filtres2');
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      pageCourante = 1;
      filtrerEtAfficher();
    });

    /* Filtrage en temps réel sur les selects */
    ['filtre-theme', 'filtre-regime'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => {
        pageCourante = 1;
        filtrerEtAfficher();
      });
    });

    const resetFn = () => {
      form.reset();
      const slider = document.getElementById('filtre-prix-max');
      if (slider) {
        slider.value = slider.max;
        document.getElementById('prix-max-val').textContent = `${slider.max} €`;
      }
      pageCourante = 1;
      filtrerEtAfficher();
    };
    reset?.addEventListener('click', resetFn);
    reset2?.addEventListener('click', resetFn);
  }

  function filtrerEtAfficher() {
    const theme    = document.getElementById('filtre-theme')?.value || '';
    const regime   = document.getElementById('filtre-regime')?.value || '';
    const personnes = parseInt(document.getElementById('filtre-personnes')?.value) || 0;
    const prixMax  = parseFloat(document.getElementById('filtre-prix-max')?.value) || Infinity;
    const prixMin  = parseFloat(document.getElementById('filtre-prix-min')?.value) || 0;
    const prixMax2 = parseFloat(document.getElementById('filtre-prix-max2')?.value) || Infinity;

    let res = tousLesMenus.filter(m => {
      if (theme    && m.theme   !== theme)   return false;
      if (regime   && m.regime  !== regime)  return false;
      if (personnes && m.nb_personnes_min > personnes) return false;
      if (m.prix > prixMax)  return false;
      if (m.prix < prixMin)  return false;
      if (m.prix > prixMax2) return false;
      return true;
    });

    /* Tri */
    const tri = document.getElementById('tri-menus')?.value || 'titre';
    res = trierMenus(res, tri);

    afficherMenus(res);
  }

  /* ---- Tri ---- */
  function initTri() {
    document.getElementById('tri-menus')?.addEventListener('change', () => {
      pageCourante = 1;
      filtrerEtAfficher();
    });
  }

  function trierMenus(menus, tri) {
    return [...menus].sort((a, b) => {
      if (tri === 'prix_asc')  return a.prix - b.prix;
      if (tri === 'prix_desc') return b.prix - a.prix;
      if (tri === 'personnes') return a.nb_personnes_min - b.nb_personnes_min;
      return a.titre.localeCompare(b.titre, 'fr');
    });
  }

  /* ---- Données de démo (si API indisponible) ---- */
  function donneesDemoMenus() {
    return [
      { id: 1, titre: 'Menu Noël Prestige', description: 'Un repas de fête complet pour les grandes tablées.', theme: 'noel', regime: 'classique', nb_personnes_min: 8, prix: 350, stock: 5, images: [] },
      { id: 2, titre: 'Menu Printemps Végétarien', description: 'Fraîcheur et légèreté pour votre événement de printemps.', theme: 'paques', regime: 'vegetarien', nb_personnes_min: 6, prix: 220, stock: 3, images: [] },
      { id: 3, titre: 'Menu Classique Maison', description: 'La formule traditionnelle appréciée de tous.', theme: 'classique', regime: 'classique', nb_personnes_min: 10, prix: 180, stock: 10, images: [] },
      { id: 4, titre: 'Menu Événement Corporate', description: 'Prestige et élégance pour vos séminaires et réunions.', theme: 'evenement', regime: 'classique', nb_personnes_min: 15, prix: 480, stock: 2, images: [] },
      { id: 5, titre: 'Menu Végan Festif', description: '100% végétal, savoureux et créatif pour toutes occasions.', theme: 'evenement', regime: 'vegan', nb_personnes_min: 6, prix: 240, stock: 8, images: [] },
      { id: 6, titre: 'Menu Pâques Gourmand', description: 'Tradition pascale revisitée avec des produits locaux.', theme: 'paques', regime: 'classique', nb_personnes_min: 8, prix: 290, stock: 0, images: [] },
    ];
  }

  return { init: chargerMenus };
})();

/* ---- Vue détaillée (menu-detail.html) ---- */
const MenuDetail = (() => {

  async function charger() {
    const params = new URLSearchParams(window.location.search);
    const id     = params.get('id');
    if (!id) { afficherErreur(); return; }

    document.getElementById('detail-loading')?.classList.remove('d-none');

    try {
      const res = await fetch(VG.apiUrl(`menus/get-menu.php?id=${id}`));
      if (!res.ok) throw new Error();
      const menu = await res.json();
      afficherDetail(menu);
    } catch {
      afficherErreur();
    }
  }

  function afficherErreur() {
    document.getElementById('detail-loading')?.classList.add('d-none');
    document.getElementById('detail-error')?.classList.remove('d-none');
  }

  function afficherDetail(menu) {
    document.getElementById('detail-loading')?.classList.add('d-none');
    document.getElementById('detail-content')?.classList.remove('d-none');

    /* Titre page et breadcrumb */
    document.title = `${menu.titre} – Vite & Gourmand`;
    const bc = document.getElementById('breadcrumb-titre');
    if (bc) bc.textContent = menu.titre;

    /* Galerie */
    const inner = document.getElementById('carousel-inner');
    if (inner) {
      if (menu.images && menu.images.length) {
        inner.innerHTML = menu.images.map((img, i) =>
          `<div class="carousel-item ${i === 0 ? 'active' : ''}">
             <img src="${VG.escapeHtml(img)}" class="d-block w-100 carousel-img"
                  alt="${VG.escapeHtml(menu.titre)} – image ${i + 1}"
                  onerror="this.src='https://placehold.co/800x450/D4370C/white?text=Menu'" />
           </div>`
        ).join('');
      } else {
        inner.innerHTML = `<div class="carousel-item active">
          <img src="https://placehold.co/800x450/D4370C/white?text=${encodeURIComponent(menu.titre)}"
               class="d-block w-100 carousel-img" alt="${VG.escapeHtml(menu.titre)}" /></div>`;
      }
    }

    /* Badges */
    const badgesEl = document.getElementById('menu-badges');
    if (badgesEl) {
      const regimeBadge = { vegetarien: 'success', vegan: 'success', classique: 'secondary' }[menu.regime] || 'secondary';
      const themeBadge  = { noel: 'danger', paques: 'warning', evenement: 'primary', classique: 'secondary' }[menu.theme] || 'secondary';
      badgesEl.innerHTML = `
        <span class="badge bg-${themeBadge}">${VG.escapeHtml(menu.theme)}</span>
        <span class="badge bg-${regimeBadge}">${VG.escapeHtml(menu.regime)}</span>`;
    }

    /* Textes */
    setEl('menu-titre',       menu.titre);
    setEl('menu-description', menu.description);
    setEl('menu-prix',        VG.formatEuro(menu.prix));
    setEl('menu-nb-min',      menu.nb_personnes_min);
    setEl('detail-nb-min',    menu.nb_personnes_min);
    setEl('detail-stock',     menu.stock);
    setEl('detail-theme',     menu.theme);
    setEl('detail-regime',    menu.regime);
    setEl('detail-conditions', menu.conditions || 'Aucune condition particulière.');

    /* Alerte conditions */
    if (menu.conditions) {
      setEl('alerte-conditions-texte', menu.conditions);
    } else {
      document.getElementById('alerte-conditions-bar')?.classList.add('d-none');
    }

    /* Stock */
    if (menu.stock === 0) {
      document.getElementById('stock-epuise')?.classList.remove('d-none');
      document.getElementById('btn-commander')?.classList.add('d-none');
    }

    /* Bouton commander – vérifie connexion */
    const btnCmd = document.getElementById('btn-commander');
    if (btnCmd) {
      const user = Auth.getUser();
      if (!user) {
        btnCmd.classList.add('d-none');
        document.getElementById('msg-non-connecte')?.classList.remove('d-none');
      } else {
        btnCmd.href = `commande.html?menu_id=${menu.id}`;
      }
    }

    /* Plats */
    afficherPlats(menu.plats || [], 'entree',  'liste-entrees',  'section-entrees');
    afficherPlats(menu.plats || [], 'plat',    'liste-plats',    'section-plats');
    afficherPlats(menu.plats || [], 'dessert', 'liste-desserts', 'section-desserts');

    /* Allergènes */
    const allergEl = document.getElementById('menu-allergenes');
    if (allergEl && menu.allergenes && menu.allergenes.length) {
      allergEl.innerHTML = menu.allergenes.map(a =>
        `<span class="badge bg-warning text-dark">${VG.escapeHtml(a)}</span>`
      ).join(' ');
    }
  }

  function afficherPlats(plats, type, listId, sectionId) {
    const filtrés = plats.filter(p => p.type === type);
    if (!filtrés.length) {
      document.getElementById(sectionId)?.classList.add('d-none');
      return;
    }
    const el = document.getElementById(listId);
    if (!el) return;
    el.innerHTML = filtrés.map(p => `
      <li class="list-group-item px-0">
        <div class="fw-semibold">${VG.escapeHtml(p.nom)}</div>
        ${p.description ? `<div class="small text-muted">${VG.escapeHtml(p.description)}</div>` : ''}
        ${p.allergenes && p.allergenes.length
          ? `<div class="mt-1">${p.allergenes.map(a => `<span class="badge bg-warning text-dark me-1 small">${VG.escapeHtml(a)}</span>`).join('')}</div>`
          : ''}
      </li>`).join('');
  }

  function setEl(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val ?? '–';
  }

  return { init: charger };
})();

/* ---- Démarrage selon la page ---- */
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('menus-grid') !== null) MenusPage.init();
  if (document.getElementById('detail-loading') !== null) MenuDetail.init();
});