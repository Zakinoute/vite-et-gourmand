-- =========================================================
-- schema.sql – Vite & Gourmand
-- Base de données relationnelle MySQL / MariaDB
-- =========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =========================================================
-- BASE
-- =========================================================
CREATE DATABASE IF NOT EXISTS vite_et_gourmand
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE vite_et_gourmand;

-- =========================================================
-- TABLE : users
-- Rôles : utilisateur | employe | administrateur
-- =========================================================
CREATE TABLE IF NOT EXISTS users (
    id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    nom           VARCHAR(100)    NOT NULL,
    prenom        VARCHAR(100)    NOT NULL,
    email         VARCHAR(255)    NOT NULL,
    gsm           VARCHAR(20)     NOT NULL,
    adresse       VARCHAR(500)    NOT NULL,
    mot_de_passe  VARCHAR(255)    NOT NULL,  -- bcrypt hash
    role          ENUM('utilisateur','employe','administrateur') NOT NULL DEFAULT 'utilisateur',
    actif         TINYINT(1)      NOT NULL DEFAULT 1,
    created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- TABLE : tokens_reinitialisation
-- Réinitialisation de mot de passe par email
-- =========================================================
CREATE TABLE IF NOT EXISTS tokens_reinitialisation (
    id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    user_id       INT UNSIGNED    NOT NULL,
    token         VARCHAR(255)    NOT NULL,
    expire_at     DATETIME        NOT NULL,
    utilise       TINYINT(1)      NOT NULL DEFAULT 0,
    created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_token (token),
    CONSTRAINT fk_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- TABLE : allergenes
-- =========================================================
CREATE TABLE IF NOT EXISTS allergenes (
    id    INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nom   VARCHAR(100) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_allergene (nom)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- TABLE : plats
-- Type : entree | plat | dessert
-- Un plat peut appartenir à plusieurs menus
-- =========================================================
CREATE TABLE IF NOT EXISTS plats (
    id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    nom         VARCHAR(255)    NOT NULL,
    type        ENUM('entree','plat','dessert') NOT NULL,
    description TEXT            NULL,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- TABLE : plat_allergenes (pivot plats ↔ allergènes)
-- =========================================================
CREATE TABLE IF NOT EXISTS plat_allergenes (
    plat_id      INT UNSIGNED NOT NULL,
    allergene_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (plat_id, allergene_id),
    CONSTRAINT fk_pa_plat      FOREIGN KEY (plat_id)      REFERENCES plats(id)      ON DELETE CASCADE,
    CONSTRAINT fk_pa_allergene FOREIGN KEY (allergene_id) REFERENCES allergenes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- TABLE : menus
-- Thème  : noel | paques | classique | evenement
-- Régime : classique | vegetarien | vegan
-- =========================================================
CREATE TABLE IF NOT EXISTS menus (
    id               INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    titre            VARCHAR(255)    NOT NULL,
    description      TEXT            NOT NULL,
    theme            ENUM('noel','paques','classique','evenement') NOT NULL DEFAULT 'classique',
    regime           ENUM('classique','vegetarien','vegan')        NOT NULL DEFAULT 'classique',
    nb_personnes_min INT UNSIGNED    NOT NULL DEFAULT 1,
    prix             DECIMAL(10,2)   NOT NULL,
    stock            INT             NOT NULL DEFAULT 0,
    conditions       TEXT            NULL,
    actif            TINYINT(1)      NOT NULL DEFAULT 1,
    created_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- TABLE : menu_plats (pivot menus ↔ plats)
-- Un plat peut être dans plusieurs menus
-- =========================================================
CREATE TABLE IF NOT EXISTS menu_plats (
    menu_id INT UNSIGNED NOT NULL,
    plat_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (menu_id, plat_id),
    CONSTRAINT fk_mp_menu FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
    CONSTRAINT fk_mp_plat FOREIGN KEY (plat_id) REFERENCES plats(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- TABLE : images_menu
-- =========================================================
CREATE TABLE IF NOT EXISTS images_menu (
    id       INT UNSIGNED NOT NULL AUTO_INCREMENT,
    menu_id  INT UNSIGNED NOT NULL,
    chemin   VARCHAR(500) NOT NULL,
    ordre    INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT fk_img_menu FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- TABLE : commandes
-- Statuts : en_attente | acceptee | en_preparation |
--           en_cours_livraison | livree |
--           attente_materiel | terminee | annulee
-- =========================================================
CREATE TABLE IF NOT EXISTS commandes (
    id               INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    user_id          INT UNSIGNED    NOT NULL,
    menu_id          INT UNSIGNED    NOT NULL,
    nb_personnes     INT UNSIGNED    NOT NULL,
    adresse          VARCHAR(500)    NOT NULL,
    date_prestation  DATE            NOT NULL,
    heure_prestation TIME            NOT NULL,
    prix_total       DECIMAL(10,2)   NOT NULL,
    prix_livraison   DECIMAL(10,2)   NOT NULL DEFAULT 5.00,
    reduction        DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    statut           ENUM(
                       'en_attente','acceptee','en_preparation',
                       'en_cours_livraison','livree',
                       'attente_materiel','terminee','annulee'
                     ) NOT NULL DEFAULT 'en_attente',
    motif_annulation TEXT            NULL,
    mode_contact     ENUM('gsm','email') NULL,
    created_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_cmd_user FOREIGN KEY (user_id) REFERENCES users(id)  ON DELETE RESTRICT,
    CONSTRAINT fk_cmd_menu FOREIGN KEY (menu_id) REFERENCES menus(id)  ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- TABLE : suivi_commandes
-- Historique de tous les changements de statut
-- =========================================================
CREATE TABLE IF NOT EXISTS suivi_commandes (
    id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
    commande_id  INT UNSIGNED NOT NULL,
    statut       ENUM(
                   'en_attente','acceptee','en_preparation',
                   'en_cours_livraison','livree',
                   'attente_materiel','terminee','annulee'
                 ) NOT NULL,
    note         TEXT         NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_suivi_cmd FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- TABLE : avis
-- Visible sur l'accueil uniquement si valide = 1
-- valide : 0=en attente | 1=validé | -1=refusé
-- =========================================================
CREATE TABLE IF NOT EXISTS avis (
    id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id      INT UNSIGNED NOT NULL,
    commande_id  INT UNSIGNED NOT NULL,
    note         TINYINT      NOT NULL CHECK (note BETWEEN 1 AND 5),
    commentaire  TEXT         NULL,
    valide       TINYINT(1)   NOT NULL DEFAULT 0,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_avis_commande (commande_id),
    CONSTRAINT fk_avis_user FOREIGN KEY (user_id)     REFERENCES users(id)     ON DELETE CASCADE,
    CONSTRAINT fk_avis_cmd  FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- TABLE : horaires
-- Un enregistrement par jour de la semaine
-- =========================================================
CREATE TABLE IF NOT EXISTS horaires (
    id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    jour       ENUM('Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche') NOT NULL,
    ouverture  TIME         NULL,
    fermeture  TIME         NULL,
    ferme      TINYINT(1)   NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uq_jour (jour)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;