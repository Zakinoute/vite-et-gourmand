-- =========================================================
-- seed.sql – Vite & Gourmand
-- Données de test / démonstration
-- À exécuter APRÈS schema.sql
-- =========================================================

USE vite_et_gourmand;

-- Nettoyage avant insertion (idempotent)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE avis;
TRUNCATE TABLE suivi_commandes;
TRUNCATE TABLE commandes;
TRUNCATE TABLE images_menu;
TRUNCATE TABLE menu_plats;
TRUNCATE TABLE plat_allergenes;
TRUNCATE TABLE plats;
TRUNCATE TABLE menus;
TRUNCATE TABLE allergenes;
TRUNCATE TABLE horaires;
TRUNCATE TABLE tokens_reinitialisation;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

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
  'À commander au minimum 48 heures avant la prestation. Menu disponible toute l\'année.'
),
(
  'Menu Corporate Prestige',
  'Impressionnez vos collaborateurs et clients avec ce menu raffiné. Foie gras, pintade farcie et charlotte aux fraises pour un déjeuner d\'affaires mémorable.',
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
-- UTILISATEURS SUPPLÉMENTAIRES (ids 6-8)
-- Mots de passe (bcrypt) : tous = "Test1234!"
-- =========================================================
INSERT INTO users (nom, prenom, email, gsm, adresse, mot_de_passe, role, actif) VALUES
('Moreau',   'Thomas',
 'thomas.moreau@exemple.fr',
 '0611223344',
 '27 rue du Palais-Gallien, 33000 Bordeaux',
 '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'utilisateur', 1),

('Petit',    'Claire',
 'claire.petit@exemple.fr',
 '0622334455',
 '8 allée de Chartres, 33000 Bordeaux',
 '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'utilisateur', 1),

('Girard',   'Lucas',
 'lucas.girard@exemple.fr',
 '0633445566',
 '45 cours Victor-Hugo, 33000 Bordeaux',
 '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'utilisateur', 1);

-- =========================================================
-- PLATS SUPPLÉMENTAIRES (ids 19-28)
-- =========================================================
INSERT INTO plats (nom, type, description) VALUES
-- Entrées
('Verrine melon & jambon cru',          'entree', 'Melon charentais, jambon de Bayonne, menthe fraîche et huile d\'olive'),
('Blinis au saumon fumé',               'entree', 'Blinis maison, crème fraîche ciboulette, saumon fumé Label Rouge et œufs de saumon'),
('Soupe à l\'oignon gratinée',          'entree', 'Bouillon de bœuf maison, croûtons et gruyère fondu – tradition française'),
-- Plats
('Côte de bœuf à partager',             'plat',   'Fleur de sel, beurre maître d\'hôtel, frites maison et salade verte'),
('Gigot d\'agneau rôti au romarin',     'plat',   'Cuit lentement, ail confit, flageolets verts à la provençale'),
('Poulet fermier rôti aux herbes',      'plat',   'Herbes de Provence, jus corsé, gratin de courgettes et pommes de terre sarladaises'),
('Paella royale',                       'plat',   'Riz bomba, crevettes, moules, calamars, poulet, chorizo et safran'),
-- Desserts
('Pièce montée aux choux',              'dessert', 'Choux garnis de crème pâtissière vanille, caramel filé et dragées'),
('Tiramisu maison',                     'dessert', 'Mascarpone, espresso, biscuits savoiards et cacao – recette italienne traditionnelle'),
('Mille-feuille à la vanille',          'dessert', 'Feuilletage pur beurre, crème diplomate vanille Bourbon et fondant blanc');

-- =========================================================
-- ALLERGÈNES – NOUVEAUX PLATS
-- =========================================================
INSERT INTO plat_allergenes (plat_id, allergene_id) VALUES
-- Verrine melon & jambon cru : sulfites (charcuterie)
(19, 12),
-- Blinis saumon fumé : gluten, œufs, lait, poissons
(20, 1), (20, 3), (20, 7), (20, 4),
-- Soupe à l'oignon gratinée : gluten (croûtons), lait (gruyère)
(21, 1), (21, 7),
-- Côte de bœuf : aucun (beurre → lait)
(22, 7),
-- Gigot d'agneau : aucun allergène majeur
-- Poulet fermier rôti : aucun allergène majeur
-- Paella royale : crustacés, mollusques, poissons
(25, 2), (25, 14), (25, 4),
-- Pièce montée : gluten, œufs, lait
(26, 1), (26, 3), (26, 7),
-- Tiramisu maison : gluten, œufs, lait
(27, 1), (27, 3), (27, 7),
-- Mille-feuille à la vanille : gluten, œufs, lait
(28, 1), (28, 3), (28, 7);

-- =========================================================
-- MENUS SUPPLÉMENTAIRES (ids 7-10)
-- =========================================================
INSERT INTO menus (titre, description, theme, regime, nb_personnes_min, prix, stock, conditions) VALUES
(
  'Menu Mariage Élégant',
  'Une prestation d\'exception pour le plus beau jour de votre vie. Blinis au saumon, côte de bœuf et pièce montée maison pour une cérémonie inoubliable.',
  'evenement', 'classique', 20, 1200.00, 3,
  'À commander au minimum 2 semaines avant la prestation. Devis personnalisé sur demande. Coordinateur de réception inclus. Matériel de service fourni et à retourner sous 48h.'
),
(
  'Menu Anniversaire Festif',
  'Faites de votre anniversaire un moment magique. Foie gras, magret de canard et tiramisu maison pour célébrer en grand.',
  'evenement', 'classique', 10, 480.00, 6,
  'À commander au minimum 72 heures avant la prestation. Décoration de table thématique disponible sur demande. Livraison incluse dans Bordeaux.'
),
(
  'Menu Été & Terrasse',
  'Profitez des beaux jours avec notre menu estival. Gaspacho rafraîchissant, paella royale généreuse et pavlova aux fruits de saison.',
  'evenement', 'classique', 8, 340.00, 8,
  'À commander au minimum 48 heures avant la prestation. Menu disponible de mai à septembre. Livraison en température dirigée.'
),
(
  'Menu Épiphanie & Galette',
  'Célébrez l\'Épiphanie avec tradition et gourmandise. Soupe à l\'oignon, gigot d\'agneau confit et mille-feuille à la vanille.',
  'classique', 'classique', 6, 195.00, 5,
  'À commander au minimum 48 heures avant la prestation. La galette des rois est offerte pour toute commande passée en janvier.'
);

-- =========================================================
-- MENU_PLATS – NOUVEAUX MENUS
-- =========================================================
INSERT INTO menu_plats (menu_id, plat_id) VALUES
-- Menu Mariage Élégant : blinis saumon (20), côte de bœuf (22), pièce montée (26)
(7, 20), (7, 22), (7, 26),
-- Menu Anniversaire Festif : foie gras (2), magret (6), tiramisu (27)
(8, 2),  (8, 6),  (8, 27),
-- Menu Été & Terrasse : gaspacho (5), paella royale (25), pavlova (14)
(9, 5),  (9, 25), (9, 14),
-- Menu Épiphanie : soupe oignon (21), gigot agneau (23), mille-feuille (28)
(10, 21),(10, 23),(10, 28);

-- =========================================================
-- IMAGES – NOUVEAUX MENUS (2 photos par menu)
-- =========================================================
INSERT INTO images_menu (menu_id, chemin, ordre) VALUES
(7, 'assets/img/menus/mariage-1.jpg',       1),
(7, 'assets/img/menus/mariage-2.jpg',       2),
(8, 'assets/img/menus/anniversaire-1.jpg',  1),
(8, 'assets/img/menus/anniversaire-2.jpg',  2),
(9, 'assets/img/menus/ete-1.jpg',           1),
(9, 'assets/img/menus/ete-2.jpg',           2),
(10,'assets/img/menus/epiphanie-1.jpg',     1),
(10,'assets/img/menus/epiphanie-2.jpg',     2);

-- Ajouter une 2e image aux menus existants pour enrichir le carousel
INSERT INTO images_menu (menu_id, chemin, ordre) VALUES
(1, 'assets/img/menus/noel-prestige-2.jpg', 2),
(2, 'assets/img/menus/noel-vege-2.jpg',     2),
(3, 'assets/img/menus/paques-2.jpg',         2),
(4, 'assets/img/menus/classique-2.jpg',      2),
(5, 'assets/img/menus/corporate-2.jpg',      2),
(6, 'assets/img/menus/vegan-2.jpg',          2);

-- =========================================================
-- COMMANDES SUPPLÉMENTAIRES (ids 5-15)
-- Prix calculés : base × (nb / min), –10 % si nb ≥ min + 5
-- =========================================================
INSERT INTO commandes (user_id, menu_id, nb_personnes, adresse, date_prestation, heure_prestation, prix_total, prix_livraison, reduction, statut) VALUES
-- Commande terminée : Thomas, Menu Noël Prestige (min=8, prix=420), 10p → 525 + 5 = 530
(6, 1, 10, '27 rue du Palais-Gallien, 33000 Bordeaux', '2025-11-30', '13:00:00', 530.00, 5.00,   0.00, 'terminee'),
-- Commande terminée : Claire, Menu Classique Maison (min=10, prix=380), 16p → 608 –10% = 547,20 + 5 = 552,20
(7, 4, 16, '8 allée de Chartres, 33000 Bordeaux',      '2025-10-18', '12:30:00', 552.20, 5.00,  60.80, 'terminee'),
-- Commande terminée : Lucas, Menu Noël Végétarien (min=6, prix=280), 6p → 280 + 5 = 285
(8, 2,  6, '45 cours Victor-Hugo, 33000 Bordeaux',     '2025-12-28', '19:00:00', 285.00, 5.00,   0.00, 'terminee'),
-- Commande terminée : Marie, Menu Corporate Prestige (min=15, prix=650), 20p → 866,67 –10% = 780 + 5 = 785
(3, 5, 20, '5 allée des Roses, 33000 Bordeaux',        '2025-09-12', '12:00:00', 785.00, 5.00,  86.67, 'terminee'),
-- Commande terminée : Pierre, Menu Végan Festif (min=6, prix=200), 6p → 200 + 5 = 205
(4, 6,  6, '14 avenue du Lac, 33100 Bordeaux',         '2025-11-08', '19:30:00', 205.00, 5.00,   0.00, 'terminee'),
-- Commande acceptée : Sophie, Menu Mariage Élégant (min=20, prix=1200), 20p → 1200 + 5 = 1205
(5, 7, 20, '3 impasse du Moulin, 33300 Bordeaux',      '2026-06-14', '12:00:00', 1205.00, 5.00,  0.00, 'acceptee'),
-- Commande en préparation : Thomas, Menu Anniversaire Festif (min=10, prix=480), 14p → 672 + 5 = 677
(6, 8, 14, '27 rue du Palais-Gallien, 33000 Bordeaux', '2026-05-03', '20:00:00', 677.00, 5.00,   0.00, 'en_preparation'),
-- Commande en attente : Claire, Menu Été & Terrasse (min=8, prix=340), 8p → 340 + 5 = 345
(7, 9,  8, '8 allée de Chartres, 33000 Bordeaux',      '2026-07-19', '13:00:00', 345.00, 5.00,   0.00, 'en_attente'),
-- Commandes terminées pour avoir des avis en attente de validation
-- Sophie, Menu Anniversaire Festif (min=10, prix=480), 10p → 480 + 5 = 485
(5, 8, 10, '3 impasse du Moulin, 33300 Bordeaux',      '2026-01-20', '13:00:00', 485.00, 5.00,   0.00, 'terminee'),
-- Thomas, Menu Pâques Gourmand (min=6, prix=260), 8p → 346,67 + 5 = 351,67
(6, 3,  8, '27 rue du Palais-Gallien, 33000 Bordeaux', '2025-04-20', '13:00:00', 351.67, 5.00,   0.00, 'terminee'),
-- Lucas, Menu Classique Maison (min=10, prix=380), 10p → 380 + 5 = 385
(8, 4, 10, '45 cours Victor-Hugo, 33000 Bordeaux',     '2025-10-05', '12:30:00', 385.00, 5.00,   0.00, 'terminee');

-- =========================================================
-- SUIVI COMMANDES – NOUVELLES COMMANDES
-- =========================================================
INSERT INTO suivi_commandes (commande_id, statut, created_at) VALUES
-- Commande 5 : Thomas → terminée
(5, 'en_attente',           '2025-11-01 10:00:00'),
(5, 'acceptee',             '2025-11-02 09:00:00'),
(5, 'en_preparation',       '2025-11-29 08:00:00'),
(5, 'en_cours_livraison',   '2025-11-30 11:30:00'),
(5, 'livree',               '2025-11-30 12:50:00'),
(5, 'terminee',             '2025-11-30 20:00:00'),
-- Commande 6 : Claire → terminée
(6, 'en_attente',           '2025-09-25 14:30:00'),
(6, 'acceptee',             '2025-09-26 10:00:00'),
(6, 'en_preparation',       '2025-10-17 07:30:00'),
(6, 'en_cours_livraison',   '2025-10-18 11:00:00'),
(6, 'livree',               '2025-10-18 12:15:00'),
(6, 'terminee',             '2025-10-18 20:30:00'),
-- Commande 7 : Lucas → terminée
(7, 'en_attente',           '2025-12-10 16:00:00'),
(7, 'acceptee',             '2025-12-11 09:30:00'),
(7, 'en_preparation',       '2025-12-27 08:00:00'),
(7, 'en_cours_livraison',   '2025-12-28 17:00:00'),
(7, 'livree',               '2025-12-28 18:30:00'),
(7, 'terminee',             '2025-12-28 22:00:00'),
-- Commande 8 : Marie → terminée
(8, 'en_attente',           '2025-08-20 11:00:00'),
(8, 'acceptee',             '2025-08-21 09:00:00'),
(8, 'en_preparation',       '2025-09-11 07:00:00'),
(8, 'en_cours_livraison',   '2025-09-12 10:00:00'),
(8, 'livree',               '2025-09-12 11:45:00'),
(8, 'terminee',             '2025-09-12 20:00:00'),
-- Commande 9 : Pierre → terminée
(9, 'en_attente',           '2025-10-25 15:00:00'),
(9, 'acceptee',             '2025-10-26 10:00:00'),
(9, 'en_preparation',       '2025-11-07 08:00:00'),
(9, 'en_cours_livraison',   '2025-11-08 17:30:00'),
(9, 'livree',               '2025-11-08 19:00:00'),
(9, 'terminee',             '2025-11-08 22:30:00'),
-- Commande 10 : Sophie → acceptée (mariage juin)
(10, 'en_attente',          '2026-03-10 10:00:00'),
(10, 'acceptee',            '2026-03-11 09:00:00'),
-- Commande 11 : Thomas → en préparation
(11, 'en_attente',          '2026-04-01 11:30:00'),
(11, 'acceptee',            '2026-04-02 09:30:00'),
(11, 'en_preparation',      '2026-04-21 08:00:00'),
-- Commande 12 : Claire → en attente
(12, 'en_attente',          '2026-04-20 17:00:00'),
-- Commande 13 : Sophie, Anniversaire → terminée
(13, 'en_attente',          '2026-01-05 10:00:00'),
(13, 'acceptee',            '2026-01-06 09:00:00'),
(13, 'en_preparation',      '2026-01-19 08:00:00'),
(13, 'en_cours_livraison',  '2026-01-20 11:00:00'),
(13, 'livree',              '2026-01-20 12:30:00'),
(13, 'terminee',            '2026-01-20 20:00:00'),
-- Commande 14 : Thomas, Pâques → terminée
(14, 'en_attente',          '2025-04-05 09:00:00'),
(14, 'acceptee',            '2025-04-06 10:00:00'),
(14, 'en_preparation',      '2025-04-19 08:00:00'),
(14, 'en_cours_livraison',  '2025-04-20 11:30:00'),
(14, 'livree',              '2025-04-20 12:45:00'),
(14, 'terminee',            '2025-04-20 20:00:00'),
-- Commande 15 : Lucas, Classique → terminée
(15, 'en_attente',          '2025-09-20 14:00:00'),
(15, 'acceptee',            '2025-09-21 09:00:00'),
(15, 'en_preparation',      '2025-10-04 07:30:00'),
(15, 'en_cours_livraison',  '2025-10-05 11:00:00'),
(15, 'livree',              '2025-10-05 12:30:00'),
(15, 'terminee',            '2025-10-05 20:00:00');

-- =========================================================
-- AVIS CLIENTS SUPPLÉMENTAIRES
-- Règle : 1 seul avis par commande (UNIQUE KEY uq_avis_commande)
-- user_id = propriétaire de la commande
--
-- Commandes terminées disponibles :
--   1 → user 3 (Marie)   Menu Classique         [avis existant]
--   2 → user 4 (Pierre)  Menu Noël Prestige     [avis existant]
--   5 → user 6 (Thomas)  Menu Noël Prestige     → avis validé
--   6 → user 7 (Claire)  Menu Classique Maison  → avis validé
--   7 → user 8 (Lucas)   Menu Noël Végétarien   → avis validé
--   8 → user 3 (Marie)   Menu Corporate         → avis validé
--   9 → user 4 (Pierre)  Menu Végan Festif      → avis validé
--  13 → user 5 (Sophie)  Menu Anniversaire      → avis en attente
--  14 → user 6 (Thomas)  Menu Pâques Gourmand   → avis en attente
--  15 → user 8 (Lucas)   Menu Classique Maison  → avis en attente
-- =========================================================
INSERT INTO avis (user_id, commande_id, note, commentaire, valide) VALUES

-- 5 AVIS VALIDÉS (valide = 1)

-- Commande 5 : Thomas (user 6), Menu Noël Prestige – note 5
(6, 5, 5,
 'Un sans-faute ! Le foie gras était d\'une finesse remarquable et le magret cuit à la perfection, rosé comme il se doit. Nos 10 convives ont été ravis. On recommande les yeux fermés, sans hésitation.',
 1),

-- Commande 6 : Claire (user 7), Menu Classique Maison – note 4
(7, 6, 4,
 'Très beau repas pour notre réunion de famille. Le bœuf Wellington était sublime et la crème brûlée onctueuse. Seul bémol : la livraison avait une vingtaine de minutes de retard. Cela n\'a pas gâché la soirée, mais c\'est à noter.',
 1),

-- Commande 7 : Lucas (user 8), Menu Noël Végétarien – note 5
(8, 7, 5,
 'Bluffant pour un menu sans viande ! Le risotto aux champignons était d\'une richesse incroyable et la pavlova aux fruits rouges parfaitement équilibrée. Bravo à toute l\'équipe de Vite & Gourmand.',
 1),

-- Commande 8 : Marie (user 3), Menu Corporate Prestige – note 5
(3, 8, 5,
 'Prestation impeccable pour notre séminaire d\'entreprise. 20 personnes servies avec élégance, plats dignes d\'un grand restaurant. Nos clients ont été bluffés. Nous ferons à nouveau appel à vous sans hésiter.',
 1),

-- Commande 9 : Pierre (user 4), Menu Végan Festif – note 4
(4, 9, 4,
 'Agréablement surpris par la richesse de ce menu entièrement végétal. Le curry de pois chiches était savoureux et bien parfumé. La mousse au chocolat végan a même convaincu les non-vegans de notre tablée !',
 1),

-- 3 AVIS EN ATTENTE DE VALIDATION (valide = 0)

-- Commande 13 : Sophie (user 5), Menu Anniversaire Festif – note 4
(5, 13, 4,
 'Repas d\'anniversaire très réussi. Les convives ont adoré le foie gras et le magret. Le tiramisu maison était la meilleure conclusion possible. Service attentionné et livraison dans les temps. Bravo !',
 0),

-- Commande 14 : Thomas (user 6), Menu Pâques Gourmand – note 5
(6, 14, 5,
 'Le menu de Pâques était une vraie réussite. Fraîcheur du gaspacho, finesse du saumon rôti et la tarte tatin… on en reparle encore. Merci à l\'équipe pour ce beau moment printanier. Je retenterai l\'expérience !',
 0),

-- Commande 15 : Lucas (user 8), Menu Classique Maison – note 2
(8, 15, 2,
 'Déçu par le manque de communication. La livraison avait 45 minutes de retard sans aucun appel pour prévenir. Les plats étaient bons en eux-mêmes, mais ce genre de désagrément gâche l\'expérience. Des efforts à faire sur la logistique.',
 0);

-- =========================================================
-- VÉRIFICATION
-- =========================================================
SELECT 'Tables créées et données insérées avec succès.' AS message;
SELECT COUNT(*) AS nb_users     FROM users;
SELECT COUNT(*) AS nb_menus     FROM menus;
SELECT COUNT(*) AS nb_plats     FROM plats;
SELECT COUNT(*) AS nb_commandes FROM commandes;
SELECT COUNT(*) AS nb_avis      FROM avis;