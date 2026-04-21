-- =========================================================
-- seed.sql – Vite & Gourmand
-- Données de test / démonstration
-- À exécuter APRÈS schema.sql
-- =========================================================

USE vite_et_gourmand;

-- =========================================================
-- USERS
-- Mots de passe (bcrypt) : tous = "Test1234!"
-- Hash généré avec password_hash('Test1234!', PASSWORD_BCRYPT)
-- =========================================================
INSERT INTO users (nom, prenom, email, gsm, adresse, mot_de_passe, role, actif) VALUES
-- Administrateur (compte José)
('Martin',  'José',
 'jose@vite-et-gourmand.fr',
 '0612000001',
 '12 rue des Saveurs, 33000 Bordeaux',
 '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'administrateur', 1),

-- Employée (compte Julie)
('Durand',  'Julie',
 'julie@vite-et-gourmand.fr',
 '0612000002',
 '12 rue des Saveurs, 33000 Bordeaux',
 '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'employe', 1),

-- Utilisateurs clients
('Dupont',  'Marie',
 'marie.dupont@exemple.fr',
 '0612345678',
 '5 allée des Roses, 33000 Bordeaux',
 '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'utilisateur', 1),

('Bernard', 'Pierre',
 'pierre.bernard@exemple.fr',
 '0687654321',
 '14 avenue du Lac, 33100 Bordeaux',
 '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'utilisateur', 1),

('Leroy',   'Sophie',
 'sophie.leroy@exemple.fr',
 '0698765432',
 '3 impasse du Moulin, 33300 Bordeaux',
 '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'utilisateur', 1);

-- =========================================================
-- HORAIRES
-- =========================================================
INSERT INTO horaires (jour, ouverture, fermeture, ferme) VALUES
('Lundi',    '09:00', '19:00', 0),
('Mardi',    '09:00', '19:00', 0),
('Mercredi', '09:00', '19:00', 0),
('Jeudi',    '09:00', '19:00', 0),
('Vendredi', '09:00', '19:00', 0),
('Samedi',   '09:00', '17:00', 0),
('Dimanche', '10:00', '13:00', 0);

-- =========================================================
-- ALLERGÈNES
-- =========================================================
INSERT INTO allergenes (nom) VALUES
('Gluten'),
('Crustacés'),
('Œufs'),
('Poissons'),
('Arachides'),
('Soja'),
('Lait / Lactose'),
('Fruits à coque'),
('Céleri'),
('Moutarde'),
('Graines de sésame'),
('Anhydride sulfureux / Sulfites'),
('Lupin'),
('Mollusques');

-- =========================================================
-- PLATS
-- =========================================================
INSERT INTO plats (nom, type, description) VALUES
-- Entrées
('Velouté de butternut', 'entree', 'Crème de courge butternut, crème fraîche et noisettes torréfiées'),
('Foie gras maison', 'entree', 'Mi-cuit, chutney de figues et brioche toastée'),
('Salade de chèvre chaud', 'entree', 'Miel, noix et vinaigrette balsamique'),
('Tartare de saumon', 'entree', 'Saumon Label Rouge, avocat et citron vert'),
('Gaspacho andalou', 'entree', 'Tomates fraîches, poivrons et basilic – servi frais'),
-- Plats
('Magret de canard', 'plat', 'Sauce aux cerises, gratin dauphinois et haricots verts'),
('Filet de bœuf Wellington', 'plat', 'Duxelles de champignons, croûte feuilletée et sauce périgueux'),
('Saumon rôti en croûte d\'herbes', 'plat', 'Écrasé de pommes de terre et beurre blanc'),
('Risotto aux champignons forestiers', 'plat', 'Parmesan 24 mois, truffe noire et herbes fraîches – végétarien'),
('Tajine d\'agneau aux pruneaux', 'plat', 'Semoule aux amandes et raisins secs'),
('Curry de pois chiches', 'plat', 'Lait de coco, épinards frais et riz basmati – végan'),
('Pintade farcie aux marrons', 'plat', 'Jus de viande, purée de céleri-rave et choux de Bruxelles'),
-- Desserts
('Bûche de Noël chocolat', 'dessert', 'Ganache chocolat noir, éclats de noisettes et déco festive'),
('Pavlova aux fruits rouges', 'dessert', 'Meringue croustillante, chantilly légère et fruits frais de saison'),
('Tarte tatin normande', 'dessert', 'Pommes caramélisées, pâte brisée maison et crème fraîche'),
('Mousse au chocolat végan', 'dessert', 'Aquafaba, chocolat noir 70% – sans produits animaux'),
('Charlotte aux fraises', 'dessert', 'Biscuits cuillère maison, crème mascarpone et fraises fraîches'),
('Crème brûlée à la vanille', 'dessert', 'Vanille Bourbon de Madagascar, caramel croustillant');

-- =========================================================
-- PLAT_ALLERGÈNES
-- =========================================================
INSERT INTO plat_allergenes (plat_id, allergene_id) VALUES
-- Velouté butternut : fruits à coque (noisettes)
(1, 8),
-- Foie gras maison : gluten (brioche), œufs, lait
(2, 1), (2, 3), (2, 7),
-- Salade chèvre chaud : lait, fruits à coque (noix), œufs
(3, 7), (3, 8), (3, 3),
-- Tartare de saumon : poissons
(4, 4),
-- Gaspacho : sulfites
(5, 12),
-- Magret de canard : sulfites
(6, 12),
-- Filet bœuf Wellington : gluten, œufs, lait
(7, 1), (7, 3), (7, 7),
-- Saumon rôti : poissons, lait
(8, 4), (8, 7),
-- Risotto : lait
(9, 7),
-- Tajine agneau : fruits à coque (amandes)
(10, 8),
-- Curry pois chiches : soja
(11, 6),
-- Pintade farcie aux marrons : fruits à coque
(12, 8),
-- Bûche chocolat : lait, œufs, gluten, fruits à coque
(13, 7), (13, 3), (13, 1), (13, 8),
-- Pavlova : œufs, lait
(14, 3), (14, 7),
-- Tarte tatin : gluten, œufs, lait
(15, 1), (15, 3), (15, 7),
-- Mousse végan : aucun (aquafaba + chocolat)
-- Charlotte : gluten, œufs, lait
(17, 1), (17, 3), (17, 7),
-- Crème brûlée : lait, œufs
(18, 7), (18, 3);

-- =========================================================
-- MENUS
-- =========================================================
INSERT INTO menus (titre, description, theme, regime, nb_personnes_min, prix, stock, conditions) VALUES
(
  'Menu Noël Prestige',
  'Un repas de fête complet pour émerveiller vos convives. Foie gras, magret de canard et bûche de Noël maison pour un réveillon inoubliable.',
  'noel', 'classique', 8, 420.00, 10,
  'À commander au minimum 72 heures avant la prestation. Livraison en température dirigée. Conserver au réfrigérateur et consommer dans les 24h.'
),
(
  'Menu Noël Végétarien',
  'Toute la magie de Noël sans viande ! Velouté de butternut, risotto aux champignons et pavlova pour une soirée festive et gourmande.',
  'noel', 'vegetarien', 6, 280.00, 8,
  'À commander au minimum 48 heures avant la prestation. Peut contenir des traces de fruits à coque.'
),
(
  'Menu Pâques Gourmand',
  'Célébrez Pâques avec fraîcheur et légèreté. Gaspacho, saumon rôti et tarte tatin pour un repas printanier plein de saveurs.',
  'paques', 'classique', 6, 260.00, 6,
  'À commander au minimum 48 heures avant la prestation. Livraison incluse dans Bordeaux.'
),
(
  'Menu Classique Maison',
  'La valeur sûre de Vite & Gourmand. Salade de chèvre chaud, filet de bœuf Wellington et crème brûlée, cuisinés avec passion.',
  'classique', 'classique', 10, 380.00, 15,
  'À commander au minimum 48 heures avant la prestation. Menu disponible toute l'année.'
),
(
  'Menu Corporate Prestige',
  'Impressionnez vos collaborateurs et clients avec ce menu raffiné. Foie gras, pintade farcie et charlotte aux fraises pour un déjeuner d'affaires mémorable.',
  'evenement', 'classique', 15, 650.00, 4,
  'À commander au minimum 1 semaine avant la prestation. Prestation de service incluse sur demande. Devis personnalisé disponible.'
),
(
  'Menu Végan Festif',
  'Engagement éthique et plaisir gustatif réunis. Gaspacho, curry de pois chiches et mousse au chocolat végan – zéro compromis sur le goût !',
  'evenement', 'vegan', 6, 200.00, 12,
  'À commander au minimum 48 heures avant la prestation. 100% végétal, sans produits animaux.'
);

-- =========================================================
-- MENU_PLATS (associations menus ↔ plats)
-- =========================================================
INSERT INTO menu_plats (menu_id, plat_id) VALUES
-- Menu Noël Prestige : foie gras, magret, bûche
(1, 2), (1, 6), (1, 13),
-- Menu Noël Végétarien : velouté, risotto, pavlova
(2, 1), (2, 9), (2, 14),
-- Menu Pâques Gourmand : gaspacho, saumon, tarte tatin
(3, 5), (3, 8), (3, 15),
-- Menu Classique Maison : salade chèvre, bœuf Wellington, crème brûlée
(4, 3), (4, 7), (4, 18),
-- Menu Corporate Prestige : foie gras, pintade, charlotte
(5, 2), (5, 12), (5, 17),
-- Menu Végan Festif : gaspacho, curry pois chiches, mousse végan
(6, 5), (6, 11), (6, 16);

-- =========================================================
-- IMAGES MENUS (chemins relatifs)
-- =========================================================
INSERT INTO images_menu (menu_id, chemin, ordre) VALUES
(1, 'assets/img/menus/noel-prestige-1.jpg', 1),
(2, 'assets/img/menus/noel-vege-1.jpg',     1),
(3, 'assets/img/menus/paques-1.jpg',         1),
(4, 'assets/img/menus/classique-1.jpg',      1),
(5, 'assets/img/menus/corporate-1.jpg',      1),
(6, 'assets/img/menus/vegan-1.jpg',          1);

-- =========================================================
-- COMMANDES DE DÉMONSTRATION
-- =========================================================
INSERT INTO commandes (user_id, menu_id, nb_personnes, adresse, date_prestation, heure_prestation, prix_total, prix_livraison, reduction, statut) VALUES
-- Commande terminée (Marie, Menu Classique)
(3, 4, 12, '5 allée des Roses, 33000 Bordeaux', '2025-12-25', '13:00:00', 461.60, 5.00, 45.60, 'terminee'),
-- Commande acceptée (Pierre, Menu Noël)
(4, 1, 8,  '14 avenue du Lac, 33100 Bordeaux',  '2026-01-10', '19:30:00', 425.00, 5.00,  0.00, 'acceptee'),
-- Commande en attente (Sophie, Menu Végan)
(5, 6, 8,  '3 impasse du Moulin, 33300 Bordeaux','2026-01-15', '12:00:00', 272.53, 5.00, 26.67, 'en_attente'),
-- Commande en préparation (Marie, Menu Pâques)
(3, 3, 6,  '5 allée des Roses, 33000 Bordeaux', '2026-04-20', '13:00:00', 265.00, 5.00,  0.00, 'en_preparation');

-- =========================================================
-- SUIVI DES COMMANDES
-- =========================================================
INSERT INTO suivi_commandes (commande_id, statut, created_at) VALUES
(1, 'en_attente',   '2025-12-01 10:00:00'),
(1, 'acceptee',     '2025-12-02 09:30:00'),
(1, 'en_preparation','2025-12-24 08:00:00'),
(1, 'en_cours_livraison','2025-12-25 11:00:00'),
(1, 'livree',       '2025-12-25 12:45:00'),
(1, 'terminee',     '2025-12-25 20:00:00'),
(2, 'en_attente',   '2025-12-20 14:00:00'),
(2, 'acceptee',     '2025-12-21 10:00:00'),
(3, 'en_attente',   '2026-01-05 16:30:00'),
(4, 'en_attente',   '2026-03-01 11:00:00'),
(4, 'acceptee',     '2026-03-02 09:00:00'),
(4, 'en_preparation','2026-04-19 08:00:00');

-- =========================================================
-- AVIS CLIENTS
-- =========================================================
INSERT INTO avis (user_id, commande_id, note, commentaire, valide) VALUES
(3, 1, 5, 'Repas exceptionnel ! Toute la famille a adoré. Le bœuf Wellington était parfait, et la crème brûlée divine. Livraison ponctuelle. Merci Julie et José !', 1),
(4, 2, 4, 'Très bon menu de Noël, présentation soignée et saveurs au rendez-vous. Un léger retard de livraison mais rien de grave.', 1);

-- =========================================================
-- VÉRIFICATION
-- =========================================================
SELECT 'Tables créées et données insérées avec succès.' AS message;
SELECT COUNT(*) AS nb_users    FROM users;
SELECT COUNT(*) AS nb_menus    FROM menus;
SELECT COUNT(*) AS nb_plats    FROM plats;
SELECT COUNT(*) AS nb_commandes FROM commandes;
SELECT COUNT(*) AS nb_avis     FROM avis;