# TODO ECF – Vite & Gourmand
> Référence à relire en début de session pour savoir ce qui reste à faire selon le PDF.
> PDF : `regle/Evaluation en Cours de Formation (ECF)…pdf`

---

## ✅ TERMINÉ

- [x] HTML – 13 pages complètes (accueil, menus, détail, commande, auth, espaces, légal)
- [x] CSS – `style.css` responsive (3 breakpoints), variables marque, composants
- [x] JS – 8 modules (main, auth, menus, commande, utilisateur, employe, admin, contact)
- [x] PHP – 32 endpoints REST (auth, menus, plats, commandes, avis, horaires, admin, stats)
- [x] SQL – `schema.sql` (10 tables) + `seed.sql` enrichi (8 users, 10 menus, 28 plats, 15 commandes, 10 avis)
- [x] NoSQL – MongoDB : sync MySQL → MongoDB, agrégation pipeline, fallback MySQL
- [x] Sécurité – `.htaccess` (HTTPS, CSP, headers), `php/.htaccess`, bcrypt, sessions, anti brute-force
- [x] RGPD – Bannière cookie dans `main.js` (localStorage)
- [x] Modification de commande – `modifier-commande.php` + mode `?edit=ID` dans `commande.js`
- [x] README – Installation locale, comptes de test, structure, règles métier
- [x] Git – `main` + `develop`, 7 commits organisés par couche
- [x] Maquettes Figma – Plugin `maquettes/figma-plugin/` (manifest.json + code.js) générant 6 wireframes

---

## ❌ RESTE À FAIRE

### 1. Git — branches de fonctionnalité (PDF p.11)
> *"Chaque fonctionnalité sera une branche issue de la branche développement, après test,
> le merge sera effectué vers la branche développement. Une fois develop testée,
> merge vers main."*

- [ ] Créer des branches `feature/xxx` depuis `develop` pour les prochains ajouts
- [ ] Merger feature → develop → main proprement
- **Note :** les commits actuels sont monolithiques (ok pour l'existant, à respecter pour la suite)

---

### 2. Déploiement en ligne (PDF p.9 — OBLIGATOIRE, pénalités si absent)
> *"Le client exige le déploiement de l'application. Des pénalités seront appliquées
> si l'application n'est pas en ligne et fonctionnelle au moment de la livraison."*

- [ ] Choisir une plateforme : **fly.io**, Heroku, Azure ou Vercel
- [ ] Configurer la base MySQL en ligne (PlanetScale, Railway, ClearDB…)
- [ ] Configurer MongoDB Atlas (gratuit)
- [ ] Mettre à jour `php/config/database.php` et `php/config/mongodb.php` avec les vars d'env
- [ ] Déployer et tester tous les parcours
- [ ] **Fournir le lien** de l'application dans la copie à rendre

---

### 3. Dépôt GitHub PUBLIC (PDF p.11)
> *"Le lien du (ou des) dépôt(s) github PUBLIC où sera présent le code de votre application"*

- [ ] Créer un repo GitHub PUBLIC
- [ ] `git remote add origin <url>` puis `git push -u origin main develop`
- [ ] Vérifier que README, schema.sql, seed.sql sont bien présents
- [ ] **Fournir le lien** dans la copie à rendre

---

### 4. Logiciel de gestion de projet (PDF p.11)
> *"Le lien vers votre logiciel de gestion de projet (Jira, Notion, Trello, etc.)"*

- [ ] Créer un board Notion / Trello / Jira avec les tâches du projet
- [ ] Documenter les sprints / étapes (analyse → maquette → intégration → déploiement)
- [ ] **Fournir le lien public** dans la copie à rendre

---

### 5. Manuel d'utilisation (PDF p.11) — format PDF
> *"Il doit présenter l'application et donner des identifiants afin de réaliser
> les différents parcours possibles."*

Contenu attendu :
- [ ] Présentation générale de l'application (contexte Vite & Gourmand)
- [ ] Tableau des identifiants de test (tous les rôles)
- [ ] Parcours 1 — Visiteur : parcourir les menus, voir le détail
- [ ] Parcours 2 — Utilisateur : inscription, commande, suivi, avis, modification profil
- [ ] Parcours 3 — Employé : gestion commandes, menus, plats, horaires, avis
- [ ] Parcours 4 — Administrateur : stats MongoDB, graphiques, gestion employés
- [ ] Captures d'écran de chaque étape clé
- [ ] Exporter en PDF : `manuel-utilisation-vite-et-gourmand.pdf`

**Identifiants à inclure :**
| Email | Rôle | Mot de passe |
|---|---|---|
| `jose@vite-et-gourmand.fr` | Administrateur | `Test1234!` |
| `julie@vite-et-gourmand.fr` | Employé | `Test1234!` |
| `marie.dupont@exemple.fr` | Utilisateur | `Test1234!` |

---

### 6. Charte graphique (PDF p.11) — format PDF
> *"Palette de couleurs, police. Export des maquettes (wireframes & mockup)
> 3 maquettes bureautiques et 3 maquettes mobiles."*

- [ ] Lancer le plugin Figma (`maquettes/figma-plugin/`) → génère 6 wireframes
- [ ] Créer les 6 **mockups** (version colorée) dans Figma en s'appuyant sur les wireframes
- [ ] Exporter la charte graphique (palette, typo, composants)
- [ ] Assembler en PDF : `charte-graphique-vite-et-gourmand.pdf`

**Palette à inclure :**
| Nom | Hex |
|---|---|
| Primaire | `#D4370C` |
| Primaire foncé | `#B02C08` |
| Secondaire | `#F4A261` |
| Fond crème | `#F8F3EE` |
| Texte sombre | `#2B2D42` |
| Vert végétal | `#2D6A4F` |

**Police :** Bootstrap System Font Stack (pas de Google Font importée)

---

### 7. Documentation technique (PDF p.12) — format PDF
> *"Réflexions initiales technologiques, configuration environnement, MCD,
> diagrammes d'utilisation et de séquence, documentation de déploiement."*

- [ ] **Réflexions technologiques** : pourquoi PHP/MySQL/MongoDB/Bootstrap vs alternatives
- [ ] **Config environnement** : PHP 8.1, extensions requises, WAMP/XAMPP, Composer
- [ ] **MCD** (Modèle Conceptuel de Données) : schéma des 10 tables avec relations
- [ ] **Diagramme de cas d'utilisation** : visiteur / utilisateur / employé / admin
- [ ] **Diagramme de séquence** : au moins 2 (ex : commande d'un menu, mise à jour statut)
- [ ] **Documentation de déploiement** : étapes fly.io / Railway / Atlas détaillées
- [ ] Assembler en PDF : `documentation-technique-vite-et-gourmand.pdf`

---

### 8. Documentation gestion de projet (PDF p.12) — format PDF
> *"Explication de votre gestion de projet"*

- [ ] Méthode choisie (agile, kanban, sprints…)
- [ ] Planning / timeline des grandes phases
- [ ] Répartition des tâches (si travail seul : auto-organisation)
- [ ] Lien vers l'outil de gestion (voir point 4)
- [ ] Assembler en PDF : `gestion-de-projet-vite-et-gourmand.pdf`

---

### 9. Copie à rendre Word/Excel (PDF p.1)
> *"Une copie à rendre (Excel ou Word) à télécharger, remplir et déposer."*

- [ ] Télécharger le fichier copie depuis l'espace Studi
- [ ] Remplir avec les liens (GitHub, app déployée, outil de projet)
- [ ] Nommer : `ECF_TPDeveloppeurWebEtWebMobile_copiearendre_NOM_Prenom`
- [ ] Déposer dans l'espace de dépôt Studi

---

## ORDRE SUGGÉRÉ POUR LES PROCHAINES SESSIONS

1. **Déploiement** (bloquant — pénalités si absent) → fournit le lien pour la copie
2. **GitHub PUBLIC** → push du repo existant, fournit le lien
3. **Outil gestion de projet** → Notion ou Trello, 30 min
4. **Manuel d'utilisation PDF** → captures d'écran de l'app déployée
5. **Charte graphique PDF** → mockups Figma + export
6. **Documentation technique PDF** → MCD, diagrammes, déploiement
7. **Documentation gestion de projet PDF**
8. **Copie à rendre** → remplir et déposer sur Studi