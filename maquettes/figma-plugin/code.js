// =========================================================
// Vite & Gourmand – Générateur de wireframes ECF
// 6 frames : 3 Desktop (1440×960) + 3 Mobile (390×844)
// =========================================================

// ── Palette ───────────────────────────────────────────────
const C = {
  dark:   { r: 0.169, g: 0.176, b: 0.259 }, // #2B2D42
  red:    { r: 0.831, g: 0.216, b: 0.047 }, // #D4370C
  orange: { r: 0.957, g: 0.635, b: 0.380 }, // #F4A261
  cream:  { r: 0.973, g: 0.953, b: 0.933 }, // #F8F3EE
  green:  { r: 0.176, g: 0.416, b: 0.310 }, // #2D6A4F
  white:  { r: 1,     g: 1,     b: 1     },
  light:  { r: 0.961, g: 0.961, b: 0.961 }, // #F5F5F5
  border: { r: 0.867, g: 0.867, b: 0.867 }, // #DDDDDD
  ph:     { r: 0.800, g: 0.800, b: 0.800 }, // placeholder
  g3:     { r: 0.200, g: 0.200, b: 0.200 }, // #333
  g5:     { r: 0.333, g: 0.333, b: 0.333 }, // #555
  g8:     { r: 0.533, g: 0.533, b: 0.533 }, // #888
  gC:     { r: 0.800, g: 0.800, b: 0.800 }, // #CCC
  info:   { r: 0.039, g: 0.471, b: 0.824 }, // Bootstrap info
  warn:   { r: 0.800, g: 0.600, b: 0.000 }, // warning text
};

function s(c) { return [{ type: 'SOLID', color: c }]; }

// ── Helpers ───────────────────────────────────────────────
function makeFrame(name, x, y, w, h) {
  const f = figma.createFrame();
  f.name = name; f.x = x; f.y = y;
  f.resize(w, h);
  f.fills = s(C.white);
  f.clipsContent = true;
  figma.currentPage.appendChild(f);
  return f;
}

function r(parent, x, y, w, h, fill, radius, strokeColor) {
  const node = figma.createRectangle();
  node.x = x; node.y = y;
  node.resize(Math.max(w, 1), Math.max(h, 1));
  node.fills = s(fill);
  if (radius) node.cornerRadius = radius;
  if (strokeColor) {
    node.strokes = s(strokeColor);
    node.strokeWeight = 1.5;
    node.strokeAlign = 'INSIDE';
  }
  parent.appendChild(node);
  return node;
}

function t(parent, x, y, content, size, fill, bold) {
  const node = figma.createText();
  node.fontName = { family: 'Inter', style: bold ? 'Bold' : 'Regular' };
  node.fontSize = size;
  node.characters = String(content);
  node.fills = s(fill);
  node.x = x; node.y = y;
  parent.appendChild(node);
  return node;
}

function btn(parent, x, y, w, h, label, filled) {
  const bg = filled !== false ? C.red : C.white;
  const fg = filled !== false ? C.white : C.red;
  const br = filled !== false ? null : C.red;
  r(parent, x, y, w, h, bg, 8, br);
  t(parent, x + 12, y + Math.floor(h / 2) - 9, label, 13, fg, true);
}

function navbar(f, w, connected) {
  r(f, 0, 0, w, 72, C.dark);
  r(f, 24, 22, 28, 28, C.red, 14);
  t(f, 62, 24, 'Vite & Gourmand', 17, C.white, true);
  if (w > 500) {
    t(f, Math.floor(w * 0.43), 26, 'Menus', 14, C.gC);
    t(f, Math.floor(w * 0.49), 26, 'Contact', 14, C.gC);
  }
  if (connected) {
    btn(f, w - 280, 18, 128, 36, 'Mon espace', true);
    btn(f, w - 144, 18, 110, 36, 'Déconnexion', false);
  } else {
    btn(f, w - 160, 18, 134, 36, 'Connexion', true);
  }
}

function footer(f, y, w) {
  r(f, 0, y, w, 44, C.dark);
  t(f, 24, y + 14, 'Lun–Ven 09h–19h  ·  Sam 09h–17h  ·  Dim 10h–13h   |   Mentions légales   ·   CGV', 11, C.gC);
}

function cardMenu(f, x, y, w, titre, prix, nbMin, theme, stock) {
  r(f, x, y, w, 330, C.white, 12, C.border);
  r(f, x, y, w, 160, C.ph, 12);
  r(f, x, y + 120, w, 40, C.ph);
  t(f, x + 12, y + 76, '[ Image menu ]', 13, C.g5);
  r(f, x + 12, y + 174, 64, 22, C.dark, 11);
  t(f, x + 14, y + 179, theme, 10, C.white);
  t(f, x + 12, y + 208, titre, 14, C.dark, true);
  t(f, x + 12, y + 232, 'min. ' + nbMin + ' personnes', 12, C.g5);
  t(f, x + 12, y + 256, prix, 17, C.red, true);
  r(f, x + 12, y + 282, 72, 22, C.green, 11);
  t(f, x + 14, y + 287, 'Stock : ' + stock, 10, C.white);
  btn(f, x + w - 130, y + 280, 118, 32, 'Voir le détail', true);
}

function selectField(f, x, y, w, label, placeholder) {
  t(f, x, y, label, 12, C.g3, true);
  r(f, x, y + 10, w, 34, C.white, 6, C.gC);
  t(f, x + 10, y + 21, placeholder, 12, C.g8);
  t(f, x + w - 18, y + 21, '▾', 11, C.g8);
}

// ── WIREFRAME 1 : Desktop – Accueil ──────────────────────
function buildDesktopAccueil() {
  const f = makeFrame('🖥 Desktop 1 – Accueil', 0, 0, 1440, 960);
  navbar(f, 1440, false);

  // Hero
  r(f, 0, 72, 1440, 390, C.ph);
  t(f, 500, 200, 'Vite & Gourmand', 46, C.white, true);
  t(f, 380, 262, 'Traiteur à Bordeaux depuis 25 ans – Pour tous vos événements', 18, C.gC);
  btn(f, 490, 310, 210, 48, 'Découvrir les menus', true);
  btn(f, 720, 310, 180, 48, 'Nous contacter', false);

  // Stats
  r(f, 0, 462, 1440, 80, C.cream);
  t(f, 192, 478, '25 ans', 28, C.red, true);
  t(f, 172, 516, "d'expérience à Bordeaux", 12, C.g8);
  t(f, 672, 478, '10+ menus', 28, C.red, true);
  t(f, 668, 516, 'disponibles toute l\'année', 12, C.g8);
  t(f, 1148, 478, '500+ clients', 28, C.red, true);
  t(f, 1148, 516, 'satisfaits depuis 25 ans', 12, C.g8);

  // Section professionnalisme
  t(f, 560, 570, 'Notre professionnalisme', 22, C.dark, true);
  const proCards = [
    ['Qualité garantie', 'Produits frais et locaux'],
    ['Livraison ponctuelle', 'Bordeaux et alentours'],
    ['Sur-mesure', 'Pour tout type d\'événement'],
  ];
  for (let i = 0; i < 3; i++) {
    const cx = 80 + i * 440;
    r(f, cx, 606, 400, 120, C.light, 12, C.border);
    r(f, cx + 16, 626, 40, 40, C.red, 20);
    t(f, cx + 70, 634, proCards[i][0], 15, C.dark, true);
    t(f, cx + 70, 658, proCards[i][1], 13, C.g8);
  }

  // Section avis
  t(f, 600, 758, 'Avis de nos clients', 22, C.dark, true);
  const avis = [
    ['★★★★★', '"Repas exceptionnel !"', 'Marie D.', 'Menu Classique Maison'],
    ['★★★★☆', '"Menu de Noël parfait."', 'Pierre B.', 'Menu Noël Prestige'],
    ['★★★★★', '"Bluffant sans viande !"', 'Lucas G.', 'Menu Noël Végétarien'],
  ];
  for (let i = 0; i < 3; i++) {
    const ax = 80 + i * 440;
    r(f, ax, 790, 400, 100, C.white, 12, C.red);
    t(f, ax + 14, 808, avis[i][0], 18, C.orange);
    t(f, ax + 14, 836, avis[i][1], 12, C.g5);
    t(f, ax + 14, 858, avis[i][2], 12, C.dark, true);
    t(f, ax + 14, 876, avis[i][3], 11, C.g8);
  }

  footer(f, 916, 1440);
  return f;
}

// ── WIREFRAME 2 : Desktop – Catalogue Menus ──────────────
function buildDesktopMenus() {
  const f = makeFrame('🖥 Desktop 2 – Catalogue Menus', 1500, 0, 1440, 960);
  navbar(f, 1440, false);

  // En-tête
  r(f, 0, 72, 1440, 52, C.cream);
  t(f, 24, 86, 'Nos menus', 22, C.dark, true);
  t(f, 220, 92, '10 menus disponibles', 13, C.g8);

  // Sidebar filtres
  r(f, 0, 124, 290, 800, C.light, 0, C.border);
  t(f, 20, 148, 'Filtres', 16, C.dark, true);
  const filters = [
    ['Thème', 'Tous les thèmes'],
    ['Régime', 'Tous les régimes'],
    ['Personnes minimum', 'Indifférent'],
    ['Trier par', 'Prix croissant'],
  ];
  let fy = 182;
  for (const [label, ph] of filters) {
    selectField(f, 20, fy, 252, label, ph);
    fy += 66;
  }
  // Prix max
  t(f, 20, fy, 'Prix maximum', 12, C.g3, true);
  r(f, 20, fy + 14, 252, 6, C.border, 3);
  r(f, 20, fy + 14, 252, 6, C.red, 3);
  r(f, 264, fy + 8, 16, 16, C.red, 8);
  fy += 52;
  // Fourchette
  t(f, 20, fy, 'Fourchette de prix', 12, C.g3, true);
  r(f, 20, fy + 12, 118, 32, C.white, 6, C.gC);
  t(f, 30, fy + 20, 'Min : 0 €', 11, C.g8);
  r(f, 152, fy + 12, 120, 32, C.white, 6, C.gC);
  t(f, 162, fy + 20, 'Max : 1 200 €', 11, C.g8);
  fy += 58;
  btn(f, 20, fy, 252, 40, 'Appliquer les filtres', true);
  btn(f, 20, fy + 50, 252, 34, 'Réinitialiser', false);

  // Grille 3×2
  const menus = [
    ['Menu Noël Prestige',      '420,00 €', '8',  'noel',      '10'],
    ['Menu Noël Végétarien',    '280,00 €', '6',  'noel',      '8'],
    ['Menu Pâques Gourmand',    '260,00 €', '6',  'paques',    '6'],
    ['Menu Classique Maison',   '380,00 €', '10', 'classique', '15'],
    ['Menu Corporate Prestige', '650,00 €', '15', 'événement', '4'],
    ['Menu Végan Festif',       '200,00 €', '6',  'événement', '12'],
  ];
  for (let i = 0; i < 6; i++) {
    const col = i % 3, row = Math.floor(i / 3);
    cardMenu(f, 308 + col * 372, 136 + row * 352, 352, ...menus[i]);
  }

  // Pagination
  ['‹', '1', '2', '›'].forEach((lbl, i) => {
    r(f, 616 + i * 52, 870, 44, 36, i === 1 ? C.red : C.light, 6, i === 1 ? null : C.border);
    t(f, 626 + i * 52, 882, lbl, 14, i === 1 ? C.white : C.g5);
  });

  footer(f, 916, 1440);
  return f;
}

// ── WIREFRAME 3 : Desktop – Espace Utilisateur ───────────
function buildDesktopEspaceUser() {
  const f = makeFrame('🖥 Desktop 3 – Espace Utilisateur', 3000, 0, 1440, 960);
  navbar(f, 1440, true);

  // Sidebar
  r(f, 0, 72, 260, 888, C.light, 0, C.border);
  r(f, 20, 96, 56, 56, C.dark, 28);
  t(f, 26, 112, 'MD', 18, C.white, true);
  t(f, 88, 106, 'Marie Dupont', 14, C.dark, true);
  t(f, 88, 128, 'Utilisatrice', 12, C.g8);

  // Onglets sidebar
  [['Mes commandes', true], ['Mon profil', false]].forEach(([label, active], i) => {
    r(f, 0, 170 + i * 50, 260, 46, active ? C.white : C.light, 0, active ? C.border : null);
    if (active) r(f, 0, 170 + i * 50, 4, 46, C.red);
    t(f, 20, 183 + i * 50, label, 14, active ? C.red : C.g5, active);
  });

  // Contenu principal
  t(f, 280, 88, 'Mes commandes', 20, C.dark, true);

  // 3 cartes commandes
  const cmds = [
    { id: 1, menu: 'Menu Classique Maison',   date: '25 déc. 2025', pers: 12, prix: '461,60 €', statut: 'Terminée',   sc: C.g5,  btns: ['Voir', 'Laisser un avis'] },
    { id: 2, menu: 'Menu Noël Prestige',       date: '10 jan. 2026', pers: 8,  prix: '425,00 €', statut: 'Acceptée',   sc: C.info, btns: ['Voir', 'Suivi'] },
    { id: 3, menu: 'Menu Végan Festif',         date: '15 jan. 2026', pers: 8,  prix: '272,53 €', statut: 'En attente', sc: C.g8,  btns: ['Voir', 'Modifier', 'Annuler'] },
  ];
  cmds.forEach((c, i) => {
    const cy = 126 + i * 130;
    r(f, 280, cy, 1120, 114, C.white, 12, C.border);
    t(f, 300, cy + 18, 'Commande #' + c.id + ' – ' + c.menu, 15, C.dark, true);
    t(f, 300, cy + 42, c.date + '  ·  ' + c.pers + ' personnes  ·  ' + c.prix, 12, C.g8);
    r(f, 300, cy + 66, 80, 22, c.sc, 11);
    t(f, 304, cy + 71, c.statut, 10, C.white);
    let bx = 900;
    c.btns.forEach(bl => {
      const bw = bl.length * 8 + 20;
      btn(f, bx, cy + 64, bw, 28, bl, bl === 'Voir' || bl === 'Suivi');
      bx += bw + 10;
    });
  });

  // Modale suivi (commande 2 ouverte)
  r(f, 380, 152, 600, 520, C.white, 16, C.border);
  t(f, 404, 178, 'Suivi de la commande #2 – Menu Noël Prestige', 16, C.dark, true);
  t(f, 404, 202, 'Pierre Bernard  ·  10 jan. 2026  ·  425,00 €', 12, C.g8);
  const steps = [
    ['En attente',          '20 déc. 2025 14:00', true],
    ['Acceptée',            '21 déc. 2025 10:00', true],
    ['En préparation',      '—',                  false],
    ['En cours livraison',  '—',                  false],
    ['Livrée',              '—',                  false],
    ['Terminée',            '—',                  false],
  ];
  steps.forEach(([label, date, done], i) => {
    const sy = 238 + i * 56;
    r(f, 420, sy, 20, 20, done ? C.green : C.gC, 10);
    if (i < steps.length - 1) r(f, 429, sy + 20, 2, 36, C.border);
    t(f, 454, sy + 2,  label, 14, done ? C.dark : C.g8, done);
    t(f, 454, sy + 20, date,  11, C.g8);
  });
  // Bouton fermer modale
  r(f, 938, 160, 30, 30, C.light, 15);
  t(f, 943, 168, '✕', 13, C.g5);

  footer(f, 916, 1440);
  return f;
}

// ── WIREFRAME 4 : Mobile – Accueil ───────────────────────
function buildMobileAccueil() {
  const f = makeFrame('📱 Mobile 1 – Accueil', 0, 1040, 390, 844);

  // Navbar mobile
  r(f, 0, 0, 390, 60, C.dark);
  r(f, 14, 16, 22, 22, C.red, 11);
  t(f, 46, 18, 'Vite & Gourmand', 14, C.white, true);
  [0, 1, 2].forEach(i => r(f, 348, 18 + i * 10, 28, 3, C.white, 2)); // hamburger

  // Hero
  r(f, 0, 60, 390, 260, C.ph);
  t(f, 60, 144, 'Vite & Gourmand', 26, C.white, true);
  t(f, 48, 180, 'Traiteur à Bordeaux depuis 25 ans', 14, C.gC);
  btn(f, 60, 218, 270, 44, 'Découvrir les menus', true);
  btn(f, 60, 272, 270, 40, 'Nous contacter', false);

  // Stats (1 ligne)
  r(f, 0, 320, 390, 68, C.cream);
  t(f, 24, 336, '25 ans', 18, C.red, true);
  t(f, 24, 360, "d'expérience", 11, C.g8);
  t(f, 152, 336, '10+ menus', 18, C.red, true);
  t(f, 152, 360, 'disponibles', 11, C.g8);
  t(f, 286, 336, '500+', 18, C.red, true);
  t(f, 286, 360, 'clients', 11, C.g8);

  // Cartes pro (colonne)
  t(f, 16, 406, 'Notre professionnalisme', 17, C.dark, true);
  [['Qualité garantie', 'Produits frais et locaux'], ['Livraison ponctuelle', 'Bordeaux & alentours']].forEach(([h, sub], i) => {
    r(f, 16, 430 + i * 82, 358, 70, C.light, 12, C.border);
    r(f, 28, 444 + i * 82, 34, 34, C.red, 17);
    t(f, 74, 450 + i * 82, h,   14, C.dark, true);
    t(f, 74, 470 + i * 82, sub, 12, C.g8);
  });

  // Avis (1 carte + flèche)
  t(f, 16, 608, 'Avis clients', 17, C.dark, true);
  r(f, 16, 632, 320, 86, C.white, 12, C.red);
  t(f, 28, 650, '★★★★★', 18, C.orange);
  t(f, 28, 674, '"Repas exceptionnel, livraison ponctuelle."', 11, C.g5);
  t(f, 28, 694, 'Marie D.  —  Menu Classique Maison', 11, C.g8);
  r(f, 344, 656, 30, 30, C.light, 15, C.border);
  t(f, 351, 664, '›', 15, C.red);

  footer(f, 800, 390);
  return f;
}

// ── WIREFRAME 5 : Mobile – Catalogue Menus ───────────────
function buildMobileMenus() {
  const f = makeFrame('📱 Mobile 2 – Catalogue Menus', 460, 1040, 390, 844);

  r(f, 0, 0, 390, 60, C.dark);
  r(f, 14, 16, 22, 22, C.red, 11);
  t(f, 46, 18, 'Vite & Gourmand', 14, C.white, true);
  [0, 1, 2].forEach(i => r(f, 348, 18 + i * 10, 28, 3, C.white, 2));

  // Barre en-tête + bouton filtres
  r(f, 0, 60, 390, 50, C.cream);
  t(f, 16, 75, 'Nos menus', 17, C.dark, true);
  r(f, 262, 68, 112, 34, C.light, 8, C.border);
  t(f, 280, 80, '⚙ Filtres', 13, C.g3, true);

  // Offcanvas fermé — juste indication
  t(f, 16, 120, '← Filtres disponibles en panneau latéral (Bootstrap Offcanvas)', 10, C.g8);

  // 3 cartes verticales
  const menus = [
    ['Menu Noël Prestige',   '420,00 €', '8',  'noel',   '10'],
    ['Menu Noël Végétarien', '280,00 €', '6',  'noel',   '8'],
    ['Menu Pâques Gourmand', '260,00 €', '6',  'paques', '6'],
  ];
  menus.forEach(([titre, prix, nbMin, theme, stock], i) => {
    const cy = 136 + i * 208;
    r(f, 16, cy, 358, 196, C.white, 12, C.border);
    r(f, 16, cy, 358, 96,  C.ph, 12);
    t(f, 26, cy + 40, '[ Image ]', 12, C.g5);
    r(f, 28, cy + 108, 62, 20, C.dark, 10);
    t(f, 30, cy + 112, theme, 10, C.white);
    t(f, 28, cy + 136, titre, 14, C.dark, true);
    t(f, 28, cy + 156, 'min. ' + nbMin + ' pers.   Stock : ' + stock, 11, C.g8);
    t(f, 28, cy + 174, prix, 16, C.red, true);
    btn(f, 240, cy + 158, 128, 30, 'Voir le détail', true);
  });

  // Pagination
  t(f, 144, 764, '‹   1   2   ›', 15, C.g5);

  footer(f, 800, 390);
  return f;
}

// ── WIREFRAME 6 : Mobile – Commande (Étape 2) ────────────
function buildMobileCommande() {
  const f = makeFrame('📱 Mobile 3 – Commande (Étape 2)', 920, 1040, 390, 844);

  r(f, 0, 0, 390, 60, C.dark);
  t(f, 16, 18, 'Ma commande', 15, C.white, true);

  // Stepper
  r(f, 0, 60, 390, 52, C.cream);
  ['1', '2', '3'].forEach((n, i) => {
    const sx = 52 + i * 143;
    r(f, sx, 68, 36, 36, i === 0 ? C.green : i === 1 ? C.red : C.gC, 18);
    t(f, sx + 11, 79, i === 0 ? '✓' : n, 13, C.white, true);
    if (i < 2) r(f, sx + 36, 85, 107, 2, i === 0 ? C.green : C.border);
  });
  t(f, 52,  108, 'Étape 1', 10, C.green);
  t(f, 195, 108, 'Étape 2', 10, C.red, true);
  t(f, 338, 108, 'Étape 3', 10, C.g8);

  // Select menu (verrouillé en mode édition)
  t(f, 16, 132, 'Menu sélectionné', 13, C.g3, true);
  r(f, 16, 150, 358, 40, C.light, 8, C.border);
  t(f, 28, 164, 'Menu Noël Prestige  🔒 (non modifiable)', 12, C.g8);

  // Info-box menu
  r(f, 16, 202, 358, 84, { r: 0.88, g: 0.96, b: 0.91 }, 8, C.green);
  t(f, 28, 216, 'Menu Noël Prestige', 14, C.dark, true);
  t(f, 28, 238, 'Prix de base : 420,00 €   ·   Min. : 8 personnes', 11, C.g5);
  t(f, 28, 256, 'Stock : 10 disponibles', 11, C.g5);
  t(f, 28, 274, '⚠ À commander 72h avant la prestation.', 11, C.warn);

  // Nombre de personnes
  t(f, 16, 302, 'Nombre de personnes', 13, C.g3, true);
  t(f, 16, 320, 'Min. 8 pers.  ·  Réduction –10% dès 13 pers.', 11, C.g8);
  r(f, 16, 338, 358, 44, C.white, 8, C.border);
  t(f, 28, 354, '10', 20, C.dark, true);
  r(f, 304, 342, 64, 34, C.light, 6, C.border);
  t(f, 318, 354, '+ / –', 12, C.g5);

  // Badge réduction
  r(f, 16, 394, 358, 38, { r: 1, g: 0.97, b: 0.86 }, 8, { r: 0.85, g: 0.73, b: 0.0 });
  t(f, 28, 408, '🎉  Réduction –10% appliquée !  525 € → 472,50 €', 11, C.warn, true);

  // Récap prix
  r(f, 16, 444, 358, 56, C.cream, 10, C.border);
  t(f, 28, 460, 'Prix menu', 12, C.g5);
  t(f, 28, 480, '472,50 €', 15, C.dark, true);
  t(f, 180, 460, 'Livraison', 12, C.g5);
  t(f, 180, 480, '5,00 €', 13, C.dark, true);
  t(f, 290, 460, 'TOTAL', 12, C.red, true);
  t(f, 290, 480, '477,50 €', 15, C.red, true);

  // Bouton suivant
  btn(f, 16, 514, 358, 48, 'Étape suivante – Récapitulatif', true);

  // Clavier numérique simulé
  r(f, 0, 576, 390, 214, C.light, 0, C.border);
  t(f, 150, 582, '[ Clavier numérique virtuel ]', 11, C.g8);
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];
  keys.forEach((k, i) => {
    if (!k) return;
    const col = i % 3, row = Math.floor(i / 3);
    r(f, 6 + col * 128, 600 + row * 48, 122, 42, C.white, 6, C.border);
    t(f, 48 + col * 128, 614 + row * 48, k, 16, C.dark, true);
  });

  footer(f, 800, 390);
  return f;
}

// ── RUN ──────────────────────────────────────────────────
async function run() {
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });

  const frames = [
    buildDesktopAccueil(),
    buildDesktopMenus(),
    buildDesktopEspaceUser(),
    buildMobileAccueil(),
    buildMobileMenus(),
    buildMobileCommande(),
  ];

  figma.viewport.scrollAndZoomIntoView(frames);
  figma.closePlugin('✅ 6 wireframes Vite & Gourmand créés !');
}

run();