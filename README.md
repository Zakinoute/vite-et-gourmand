# Vite & Gourmand – Application Traiteur

Application web complète pour un service de traiteur bordelais, développée dans le cadre d'une Évaluation en Cours de Formation (ECF).

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | HTML5, Bootstrap 5.3, Bootstrap Icons, JavaScript (Fetch API) |
| Backend | PHP 8.1+ (API REST, sessions) |
| Base relationnelle | MySQL / MariaDB |
| Base non-relationnelle | MongoDB (statistiques) |
| Graphiques | Chart.js 4.4 |

## Prérequis

- PHP 8.1 ou supérieur (extension `pdo_mysql`, `mongodb`)
- MySQL / MariaDB 8+
- MongoDB 6+ *(optionnel — fallback MySQL automatique si indisponible)*
- Serveur web Apache avec `mod_rewrite` et `mod_headers` (ou WAMP / XAMPP en local)
- Composer *(uniquement pour le driver MongoDB PHP : `mongodb/mongodb`)*

## Installation locale

### 1. Cloner le dépôt

```bash
git clone <url-du-depot>
cd vite-et-gourmand
```

### 2. Base de données MySQL

```bash
mysql -u root -p < sql/schema.sql
mysql -u root -p vite_et_gourmand < sql/seed.sql
```

### 3. Configuration PHP

Éditer `php/config/database.php` et renseigner vos identifiants MySQL :

```php
define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'vite_et_gourmand');
define('DB_USER', 'root');
define('DB_PASS', '');
```

Pour MongoDB, éditer `php/config/mongodb.php` :

```php
define('MONGO_URI',  'mongodb://localhost:27017');
define('MONGO_DB',   'vite_et_gourmand');
define('MONGO_COLL', 'commandes_stats');
```

### 4. Driver MongoDB (optionnel)

```bash
composer require mongodb/mongodb
```

Si MongoDB n'est pas installé, l'application bascule automatiquement sur MySQL pour les statistiques.

### 5. Lancer le serveur

Placer le dossier `vite-et-gourmand/` dans le répertoire `www/` (WAMP) ou `htdocs/` (XAMPP), puis accéder à :

```
http://localhost/vite-et-gourmand/
```

## Comptes de test

Tous les mots de passe sont : `Test1234!`

| Email | Rôle |
|---|---|
| `admin@vite-gourmand.fr` | Administrateur |
| `employe@vite-gourmand.fr` | Employé |
| `jean.dupont@email.fr` | Utilisateur |
| `marie.martin@email.fr` | Utilisateur |
| `pierre.durand@email.fr` | Utilisateur |

## Structure du projet

```
vite-et-gourmand/
├── index.html                  # Accueil
├── menus.html                  # Catalogue des menus
├── menu-detail.html            # Détail d'un menu
├── commande.html               # Tunnel de commande (3 étapes)
├── connexion.html              # Authentification
├── inscription.html            # Création de compte
├── reinitialisation-mdp.html   # Mot de passe oublié
├── contact.html                # Formulaire de contact
├── espace-utilisateur.html     # Espace client
├── espace-employe.html         # Espace employé
├── espace-admin.html           # Tableau de bord admin
├── mentions-legales.html
├── cgv.html
├── .htaccess                   # Sécurité Apache, HTTPS
├── assets/
│   ├── css/style.css
│   ├── js/
│   │   ├── main.js             # Utilitaires globaux, bannière RGPD
│   │   ├── auth.js             # Authentification client
│   │   ├── menus.js            # Catalogue + détail menu
│   │   ├── commande.js         # Tunnel de commande
│   │   ├── utilisateur.js      # Espace client
│   │   ├── employe.js          # Espace employé
│   │   ├── admin.js            # Tableau de bord admin
│   │   └── contact.js          # Formulaire de contact
│   └── img/                    # Images (hero, galeries)
├── php/
│   ├── .htaccess               # Protection du répertoire API
│   ├── config/
│   │   ├── database.php        # Connexion MySQL (PDO)
│   │   ├── mongodb.php         # Connexion MongoDB
│   │   └── helpers.php         # Fonctions partagées (auth, mail, JSON)
│   ├── auth/                   # login, register, logout, reset
│   ├── menus/                  # CRUD menus, plats, allergènes
│   ├── commandes/              # CRUD commandes
│   ├── avis/                   # CRUD avis
│   ├── contact/                # Envoi email contact
│   ├── horaires/               # CRUD horaires
│   ├── utilisateur/            # Mise à jour profil
│   └── admin/                  # Stats, gestion employés
└── sql/
    ├── schema.sql              # Création de la base (10 tables)
    └── seed.sql                # Données de démonstration
```

## Fonctionnalités

### Utilisateur
- Parcourir et filtrer le catalogue de menus (thème, régime, nb personnes, prix, note)
- Consulter le détail d'un menu (plats par catégorie, allergènes, galerie)
- Commander en 3 étapes avec calcul automatique du prix et réduction –10%
- Suivre ses commandes (timeline de statut)
- Laisser un avis (note + commentaire)
- Gérer son profil et changer son mot de passe

### Employé
- Gérer les commandes (filtres, mise à jour de statut, email automatique au client)
- Gérer les menus (création, modification, suppression douce)
- Gérer les plats et leurs allergènes
- Gérer les horaires d'ouverture
- Valider ou refuser les avis clients

### Administrateur
- Tout ce que peut faire l'employé
- Tableau de bord avec KPIs (chiffre d'affaires, commandes, note moyenne, menu top)
- Graphiques Chart.js (commandes par menu, CA par menu)
- Statistiques via MongoDB avec fallback MySQL
- Gestion des employés (création, activation/désactivation)

## Règles métier

- **Prix** : prix_base × (nb_personnes / nb_min), **–10% si nb_personnes ≥ nb_min + 5**
- **Frais de livraison** : 5 € si Bordeaux, sinon 5 € + 0,59 €/km
- **Matériel** : pénalité de 600 € si non retourné
- **Mot de passe** : 10 caractères min., majuscule, minuscule, chiffre, caractère spécial
- **Suppression plat** : bloquée si le plat est lié à un menu actif

## Sécurité

- Mots de passe hashés avec **bcrypt** (coût 12)
- Sessions PHP sécurisées, vérification du rôle côté serveur à chaque requête
- Délai artificiel de 1 s sur les tentatives de connexion échouées (anti brute-force)
- Token de réinitialisation mot de passe à usage unique (expiration 1 heure)
- Validation et assainissement de toutes les entrées côté serveur (`strip_tags`, `PDO` préparé)
- En-têtes de sécurité HTTP (`X-Content-Type-Options`, `X-Frame-Options`, CSP, etc.)
- Bannière de consentement aux cookies (RGPD)
- Accès direct au répertoire `php/config/` bloqué par `.htaccess`
