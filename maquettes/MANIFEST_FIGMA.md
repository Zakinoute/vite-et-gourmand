# Manifest Figma — Vite & Gourmand
## Charte graphique + 6 maquettes (3 bureau + 3 mobile)

---

## 1. Charte graphique

### Palette de couleurs
| Rôle | Nom | Hex |
|---|---|---|
| Primaire (rouge-orangé) | `--vg-primary` | `#D4370C` |
| Primaire foncé (hover) | `--vg-primary-dk` | `#B02C08` |
| Secondaire (orange doux) | `--vg-secondary` | `#F4A261` |
| Fond clair (crème) | `--vg-light` | `#F8F3EE` |
| Texte / navbar | `--vg-dark` | `#2B2D42` |
| Succès / végétal | `--vg-green` | `#2D6A4F` |
| Blanc | — | `#FFFFFF` |
| Gris texte secondaire | Bootstrap `text-muted` | `#6C757D` |

### Typographie
| Usage | Police | Graisse | Taille indicative |
|---|---|---|---|
| Corps de texte | System UI / Bootstrap par défaut | Regular 400 | 16px |
| Titres de section | System UI | Bold 700 | 24–32px |
| Boutons | System UI | SemiBold 600 | 16px |
| Badges / labels | System UI | Regular 400 | 12–14px |

> Bootstrap 5 utilise la font-stack système (`-apple-system, Segoe UI, Roboto…`). Aucune Google Font n'est importée.

### Composants UI clés
- **Boutons primaires** : `bg #D4370C`, blanc, `border-radius 0.5rem`, padding `0.5rem 1.25rem`
- **Navbar** : `bg #D4370C`, hauteur 72px, liens blancs
- **Cards menus** : fond blanc, `border-radius 1rem`, ombre légère, hover → `translateY(-6px)`
- **Badges** : Bootstrap (`bg-success`, `bg-warning`, `bg-danger`, `bg-secondary`)
- **Stepper commande** : cercles 36px, rouge actif, vert complété, gris inactif

---

## 2. Maquettes à créer sur Figma

### Format des frames
| Type | Largeur | Hauteur |
|---|---|---|
| Desktop (bureau) | 1440 px | Auto / 900 px min |
| Mobile | 390 px | Auto / 844 px min |

Créer pour chaque maquette : **1 wireframe** (niveaux de gris, structure) + **1 mockup** (couleurs, images, typo finale).

---

### Maquette 1 — Accueil (Desktop)
**Fichier :** `Desktop-1-Accueil`

Zones à représenter :
1. **Navbar** : logo gauche, liens (Menus, Contact), bouton Connexion droite
2. **Hero** : image de fond sombre, titre « Vite & Gourmand », sous-titre, 2 boutons (Découvrir les menus / Nous contacter)
3. **Bandeau stats** : 3 chiffres clés (25 ans, X menus, Y clients)
4. **Section professionnalisme** : 3 cartes icône + texte
5. **Section avis** : 3 cartes avis avec étoiles, avatar initiales, nom client
6. **Footer** : horaires, liens légaux

---

### Maquette 2 — Catalogue des menus (Desktop)
**Fichier :** `Desktop-2-Menus`

Zones à représenter :
1. **Navbar**
2. **Sidebar gauche (filtres)** : thème (select), régime (select), nb personnes (select), prix max (slider + valeur affichée), bouton "Filtrer"
3. **Grille de menus** (col 3) : carte avec image, badge thème, badge régime, titre, description tronquée, prix, nb min personnes, badge stock, bouton "Voir le détail"
4. **Pagination** en bas de grille

---

### Maquette 3 — Espace utilisateur (Desktop)
**Fichier :** `Desktop-3-EspaceUtilisateur`

Zones à représenter :
1. **Navbar** (connecté : lien "Mon espace", bouton Déconnexion)
2. **Sidebar onglets** : Mes commandes / Mon profil
3. **Onglet Mes commandes** : liste de cartes commandes (badge statut, menu, date, prix, boutons Voir / Suivi / Modifier / Annuler / Laisser un avis)
4. **Modale "Suivi de commande"** ouverte : timeline verticale avec étapes et horodatages

---

### Maquette 4 — Accueil (Mobile)
**Fichier :** `Mobile-1-Accueil`

Zones à représenter :
1. **Navbar mobile** : hamburger menu, logo centré
2. **Hero** : plein écran, boutons empilés en colonne
3. **Stats** : disposition colonne
4. **Section avis** : défilement horizontal (1 carte visible)
5. **Footer simplifié**

---

### Maquette 5 — Catalogue des menus (Mobile)
**Fichier :** `Mobile-2-Menus`

Zones à représenter :
1. **Navbar mobile**
2. **Bouton "Filtres"** → ouvre un panneau/offcanvas Bootstrap avec tous les filtres
3. **Grille menus** : 1 colonne, cartes pleine largeur
4. **Pagination** simplifiée (précédent / suivant)

---

### Maquette 6 — Tunnel de commande étape 2 (Mobile)
**Fichier :** `Mobile-3-Commande`

Zones à représenter :
1. **Stepper horizontal** en haut : 3 cercles, labels masqués sur mobile
2. **Étape 2 visible** : select menu (grisé si mode édition), input nb personnes, encart info menu (prix, stock, conditions), encart réduction –10% (si applicable), bouton "Étape suivante"
3. **Clavier numérique visible** sous l'input nb personnes (simulation UX)

---

## 3. Organisation Figma recommandée

```
📁 Vite & Gourmand
├── 🎨 Charte graphique
│   ├── Couleurs (swatches)
│   ├── Typographie (specimens)
│   └── Composants (bouton, badge, card, navbar, stepper)
├── 🖥️ Bureau – Wireframes
│   ├── Desktop-1-Accueil-WF
│   ├── Desktop-2-Menus-WF
│   └── Desktop-3-EspaceUtilisateur-WF
├── 🖥️ Bureau – Mockups
│   ├── Desktop-1-Accueil-MK
│   ├── Desktop-2-Menus-MK
│   └── Desktop-3-EspaceUtilisateur-MK
├── 📱 Mobile – Wireframes
│   ├── Mobile-1-Accueil-WF
│   ├── Mobile-2-Menus-WF
│   └── Mobile-3-Commande-WF
└── 📱 Mobile – Mockups
    ├── Mobile-1-Accueil-MK
    ├── Mobile-2-Menus-MK
    └── Mobile-3-Commande-MK
```

---

## 4. Contenu à exporter pour la charte graphique PDF

1. Capture du tableau **Palette de couleurs** (swatches colorés)
2. Capture du **specimen typographique** (Regular / Bold / SemiBold)
3. Capture des **composants clés** (bouton, card, badge, stepper)
4. Export des **6 wireframes** (PNG ou PDF)
5. Export des **6 mockups** (PNG ou PDF)

→ Tout assembler dans un PDF unique : `charte-graphique-vite-et-gourmand.pdf`