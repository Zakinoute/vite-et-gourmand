# Déploiement Vite & Gourmand — Railway + MongoDB Atlas

## Vue d'ensemble

| Service | Rôle | Coût |
|---|---|---|
| Railway | Hébergement PHP + Apache | Gratuit (500h/mois) |
| Railway MySQL | Base de données relationnelle | Inclus |
| MongoDB Atlas | Base NoSQL (stats) | Gratuit (M0, 512 Mo) |

---

## Étape 1 — MongoDB Atlas (5 min)

1. Aller sur [https://cloud.mongodb.com](https://cloud.mongodb.com) → créer un compte
2. **Create a deployment** → choisir **M0 Free**
3. Provider : AWS, région : `eu-west-1 (Ireland)`
4. Cluster name : `vite-et-gourmand`
5. **Create** → attendre ~2 min

**Créer un utilisateur de base :**
- Database Access → Add New Database User
- Username : `veg_user` / Password : *(voir `.env` local — ne jamais commiter)*
- Role : `Read and write to any database`

**Autoriser les IPs Railway :**
- Network Access → Add IP Address → **Allow Access from Anywhere** (`0.0.0.0/0`)
  *(Railway utilise des IPs dynamiques — nécessaire)*

**Récupérer l'URI de connexion :**
- Connect → Drivers → PHP → copier l'URI
- Format : `mongodb+srv://veg_user:<MOT_DE_PASSE>@vite-et-gourmand.hwuziwu.mongodb.net/?appName=vite-et-gourmand`

---

## Étape 2 — Dépôt GitHub PUBLIC (prérequis Railway)

```bash
git remote add origin https://github.com/Zakinoute/vite-et-gourmand.git
git push -u origin main
git push origin develop
```

---

## Étape 3 — Railway (déploiement PHP)

1. Aller sur [https://railway.app](https://railway.app) → se connecter avec GitHub
2. **New Project** → **Deploy from GitHub repo** → sélectionner `vite-et-gourmand`
3. Railway détecte `composer.json` → active Nixpacks → build PHP automatique

**Ajouter le plugin MySQL :**
- Dans le projet Railway → **+ New** → **Database** → **Add MySQL**
- Railway crée automatiquement les variables `MYSQL_*`

**Variables d'environnement à configurer :**

Dans Railway → service `vite-et-gourmand` → **Variables** → **Raw Editor** → coller :

```
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASS=${{MySQL.MYSQLPASSWORD}}
MONGO_URI=${{MongoDB.MONGO_URL}}
MONGO_DB=vite_et_gourmand_stats
MONGO_COLL=commandes_stats
```

Cliquer **Update Variables** — l'app redémarre automatiquement.

---

## Étape 4 — Initialiser la base MySQL en ligne

**Récupérer les identifiants Railway MySQL :**
- Railway → plugin MySQL → **Connect** → copier les variables

**Importer le schéma et les données :**

Option A — Via MySQL Workbench (interface graphique) :
1. Nouvelle connexion avec les identifiants Railway
2. File → Run SQL Script → `sql/schema.sql`
3. File → Run SQL Script → `sql/seed.sql`

Option B — Via ligne de commande :
```bash
mysql -h HOST -P PORT -u USER -p DATABASE < sql/schema.sql
mysql -h HOST -P PORT -u USER -p DATABASE < sql/seed.sql
```

---

## Étape 5 — Vérification

1. Railway génère un domaine : `https://vite-et-gourmand-production.up.railway.app`
2. Tester les parcours :
   - [ ] Page d'accueil charge correctement
   - [ ] Connexion avec `jose@vite-et-gourmand.fr` / `Test1234!`
   - [ ] Affichage des menus
   - [ ] Passer une commande (compte `marie.dupont@exemple.fr`)
   - [ ] Tableau de bord admin avec graphiques MongoDB
   - [ ] Espace employé

---

## Étape 6 — Domaine personnalisé (optionnel)

Railway → Settings → Networking → **Generate Domain** ou ajouter un domaine custom.

---

## Comptes de test

| Email | Rôle | Mot de passe |
|---|---|---|
| `jose@vite-et-gourmand.fr` | Administrateur | `Test1234!` |
| `julie@vite-et-gourmand.fr` | Employé | `Test1234!` |
| `marie.dupont@exemple.fr` | Utilisateur | `Test1234!` |

---

## En cas de problème

**Logs Railway :** Railway → votre service → **Deployments** → cliquer sur le dernier deploy → **View Logs**

**Erreur PDO :** vérifier que les variables `DB_*` sont bien renseignées et que le schéma SQL a été importé.

**Erreur MongoDB :** vérifier que l'IP `0.0.0.0/0` est autorisée dans Atlas et que l'URI est correcte.

**Page blanche :** vérifier les logs Apache — souvent un `.htaccess` mal interprété ou un `require` manquant.