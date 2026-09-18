/**
 * Contenu initial du site, repris mot pour mot de la maquette.
 *
 * Règle : rien n'est inventé. Ce que la maquette laisse « à définir » reste
 * vide ici — le site affiche alors sa mention d'attente, ce qui est honnête et
 * signale au club ce qu'il lui reste à fournir.
 *
 * Les identifiants sont fixes : rejouer `pnpm seed` remplace au lieu d'empiler.
 */

import { SF1, SM1, SM2, versMatchs } from './calendriers.mjs';

/** Saison en cours, telle qu'affichée par la maquette. */
export const SAISON = '2026 / 2027';

export const parametres = {
  _id: 'parametres',
  _type: 'parametres',
  nom: 'ESGA Basket',
  nomComplet: 'Éveil Sportif Genas Azieu',
  numeroFFBB: 'ARA0069090',
  mentionAffiliation: 'Club affilié FFBB — Comité du Rhône & Métropole de Lyon',
  salle: 'Complexe Sportif Marcel Gonzales',
  adresse: '2 rue de la Fraternité, 69740 Genas',
  email: 'president.esgabasket@gmail.com',
  telephone: '06 88 59 67 20',
  reseaux: [
    { _key: 'insta', _type: 'lienReseau', plateforme: 'instagram', libelle: '@esgagenas', url: 'https://instagram.com/esgagenas' },
    { _key: 'fb', _type: 'lienReseau', plateforme: 'facebook', libelle: 'Facebook', url: 'https://facebook.com/' },
  ],
  bandeauActif: true,
  bandeauMessages: ['TOURNOI ESGA 5-6-7 JUIN'],
  accrochePied: 'Éveil Sportif Genas Azieu',
  lienMentions: [
    { _key: 'ml', libelle: 'Mentions légales', url: '/mentions-legales' },
    { _key: 'cf', libelle: 'Confidentialité', url: '/confidentialite' },
  ],
};

export const categories = [
  { _id: 'cat-u9', libelle: 'U9', ordre: 1, regroupement: 'U9 —U11', accroche: 'École de basket', detail: 'Mercredi après-midi · plateaux le samedi' },
  { _id: 'cat-u11', libelle: 'U11', ordre: 2 },
  { _id: 'cat-u13', libelle: 'U13', ordre: 3, regroupement: 'U13 —U15', accroche: 'Compétition départementale', detail: '2 entraînements · match le week-end' },
  { _id: 'cat-u15', libelle: 'U15', ordre: 4 },
  { _id: 'cat-u18', libelle: 'U18', ordre: 5, regroupement: 'U18', accroche: 'Formation & arbitrage', detail: 'Passerelle vers les seniors' },
  { _id: 'cat-sr', libelle: 'Séniors', ordre: 6, regroupement: 'SR', accroche: 'PRM · DM3 · DF2 · loisir', detail: 'Compétition 5×5, loisir et 3×3' },
  { _id: 'cat-loisir', libelle: 'Loisir', ordre: 7 },
].map((c) => ({ ...c, _type: 'categorie', slug: { _type: 'slug', current: c.libelle.toLowerCase().replace(/é/g, 'e') } }));

/**
 * Les 16 équipes engagées en championnat 5×5, relevées sur la fiche FFBB du
 * club. L'école de basket (plateaux U7/U9) n'y figure pas : elle ne joue pas
 * de championnat.
 *
 * Nommage : niveau + genre + numéro quand le club en engage plusieurs dans la
 * même catégorie. Modifiable dans le Studio si le club utilise d'autres noms.
 */
export const equipes = [
  // Masculin
  { _id: 'eq-sm1', nom: 'SM1', categorie: 'cat-sr', championnat: 'PRM poule A2', ordre: 1 },
  { _id: 'eq-sm2', nom: 'SM2', categorie: 'cat-sr', championnat: 'DM3 poule B', ordre: 2 },
  { _id: 'eq-u18m1', nom: 'U18M 1', categorie: 'cat-u18', championnat: 'DMU18-2 poule A', ordre: 3 },
  { _id: 'eq-u18m2', nom: 'U18M 2', categorie: 'cat-u18', championnat: 'DMU18-6 poule préligue F', ordre: 4 },
  { _id: 'eq-u15m1', nom: 'U15M 1', categorie: 'cat-u15', championnat: 'DMU15-2 poule D', ordre: 5 },
  { _id: 'eq-u15m2', nom: 'U15M 2', categorie: 'cat-u15', championnat: 'DMU15-3 poule C', ordre: 6 },
  { _id: 'eq-u13m1', nom: 'U13M 1', categorie: 'cat-u13', championnat: 'DMU13-2 poule E', ordre: 7 },
  { _id: 'eq-u13m2', nom: 'U13M 2', categorie: 'cat-u13', championnat: 'DMU13-3 poule E', ordre: 8 },
  // Féminin
  { _id: 'eq-sf1', nom: 'SF1', categorie: 'cat-sr', championnat: 'DF2 poule B', ordre: 9 },
  { _id: 'eq-u18f', nom: 'U18F', categorie: 'cat-u18', championnat: 'DFU18-2 poule C', ordre: 10 },
  { _id: 'eq-u15f', nom: 'U15F', categorie: 'cat-u15', championnat: 'DFU15 poule A', ordre: 11 },
  { _id: 'eq-u13f1', nom: 'U13F 1', categorie: 'cat-u13', championnat: 'DFU13-2 poule B', ordre: 12 },
  { _id: 'eq-u13f2', nom: 'U13F 2', categorie: 'cat-u13', championnat: 'DFU13-3 poule D', ordre: 13 },
  { _id: 'eq-u11f1', nom: 'U11F 1', categorie: 'cat-u11', championnat: 'DFU11-2 poule D', ordre: 14 },
  { _id: 'eq-u11f2', nom: 'U11F 2', categorie: 'cat-u11', championnat: 'DFU11-3 poule E', ordre: 15 },
  { _id: 'eq-u9f', nom: 'U9F', categorie: 'cat-u9', championnat: 'DFU9-2 poule D', ordre: 16 },
].map((e) => ({
  ...e,
  _type: 'equipe',
  slug: { _type: 'slug', current: e.nom.toLowerCase().replace(/\s+/g, '-') },
  categorie: { _type: 'reference', _ref: e.categorie },
  genre: e.nom.includes('F') ? 'F' : 'M',
  visibleSurSite: true,
  // Saisie à la main tant que la synchronisation FFBB n'a pas pris la main.
  syncSource: 'manuel',
}));

/**
 * Les compétitions pour lesquelles un calendrier a été fourni. Les autres
 * s'ajoutent dans le Studio au fur et à mesure que le club transmet les
 * feuilles FFBB.
 */
export const competitions = [
  { _id: 'comp-prm', libelle: 'PRM poule A2', equipe: 'eq-sm1', ordre: 1 },
  { _id: 'comp-dm3', libelle: 'DM3 poule B', equipe: 'eq-sm2', ordre: 2 },
  { _id: 'comp-df2', libelle: 'DF2 poule B', equipe: 'eq-sf1', ordre: 3 },
].map((c) => ({
  ...c,
  _type: 'competition',
  slug: { _type: 'slug', current: c.libelle.toLowerCase().replace(/\s+/g, '-') },
  equipe: { _type: 'reference', _ref: c.equipe },
}));

/**
 * Aucun classement au démarrage : la saison commence, aucune rencontre n'a été
 * jouée. Un tableau de classement rempli de zéros — ou pire, de valeurs
 * inventées — ferait passer pour réel ce qui ne l'est pas. Le site masque
 * simplement le bloc tant qu'aucun relevé n'est saisi dans le Studio.
 */
export const classements = [];

/**
 * Les trois calendriers séniors réels de la saison 2026/2027.
 * Les équipes de jeunes n'ont pas encore de calendrier fourni : elles se
 * saisissent dans le Studio, rien n'est inventé ici.
 */
export const matchs = [
  ...versMatchs(SM1, { equipe: 'eq-sm1', competition: 'comp-prm', prefixe: 'sm1' }),
  ...versMatchs(SM2, { equipe: 'eq-sm2', competition: 'comp-dm3', prefixe: 'sm2' }),
  ...versMatchs(SF1, { equipe: 'eq-sf1', competition: 'comp-df2', prefixe: 'sf1' }),
];

export const actualites = [
  {
    _id: 'act-reprise-ecole',
    titre: "Reprise de l'école de basket : 38 enfants sur le parquet",
    date: '2026-09-12',
    rubrique: 'École de basket',
    aLaUne: true,
    extrait:
      "Premier mercredi de la saison au Gonzales. Deux groupes U9, trois éducateurs, et déjà des paniers qui rentrent.",
  },
  { _id: 'act-sm1-pre-regionale', titre: 'Les SM1 lancent la saison en pré-régionale', date: '2026-09-05', rubrique: 'Seniors' },
  { _id: 'act-tournoi', titre: 'Le tournoi ESGA revient les 5, 6 et 7 juin', date: '2026-08-28', rubrique: 'Tournoi' },
  { _id: 'act-textile', titre: 'Nouveau textile club : la collection 2026', date: '2026-08-20', rubrique: 'Club' },
  { _id: 'act-arbitres', titre: 'Trois jeunes arbitres formés au club', date: '2026-07-10', rubrique: 'Formation' },
].map((a) => ({
  ...a,
  _type: 'actualite',
  slug: { _type: 'slug', current: a._id.replace('act-', '') },
}));

/** La maquette ne nomme que deux membres ; les trois autres restent à compléter. */
export const bureau = [
  { _id: 'bur-president', nom: 'Vincent Calleau', role: 'Président', ordre: 1 },
  { _id: 'bur-correspondante', nom: 'Noémie Mazaud', role: 'Correspondante', ordre: 2 },
  { _id: 'bur-tresorier', nom: 'À compléter', role: 'Trésorier·ère', ordre: 3 },
  { _id: 'bur-secretaire', nom: 'À compléter', role: 'Secrétaire', ordre: 4 },
  { _id: 'bur-technique', nom: 'À compléter', role: 'Responsable technique', ordre: 5 },
].map((m) => ({ ...m, _type: 'membreBureau' }));

/** Montants volontairement absents : la maquette affiche « à définir ». */
export const tarifs = [
  { _id: 'tar-ecole', libelle: 'École de basket (U7—U9)', categories: ['cat-u9'], ordre: 1 },
  { _id: 'tar-u11-u13', libelle: 'U11 — U13', categories: ['cat-u11', 'cat-u13'], ordre: 2 },
  { _id: 'tar-u15-u18', libelle: 'U15 — U18', categories: ['cat-u15', 'cat-u18'], ordre: 3 },
  { _id: 'tar-seniors', libelle: 'Seniors compétition', categories: ['cat-sr'], ordre: 4 },
  { _id: 'tar-loisir', libelle: 'Loisir 5×5 / 3×3', categories: ['cat-loisir'], ordre: 5 },
].map((t) => ({
  ...t,
  _type: 'tarif',
  categories: t.categories.map((c, i) => ({ _key: `c${i}`, _type: 'reference', _ref: c })),
}));

export const packs = [
  {
    _id: 'pack-supporter',
    nom: 'Supporter',
    avantages: ['Logo sur le site', 'Mention sur les réseaux', '2 invitations au tournoi'],
    ordre: 1,
  },
  {
    _id: 'pack-club',
    nom: 'Club',
    avantages: ['Panneau en salle', "Logo sur les maillots d'échauffement", 'Post dédié + page partenaire'],
    misEnAvant: true,
    ordre: 2,
  },
  {
    _id: 'pack-maillot',
    nom: 'Maillot',
    avantages: ["Logo sur le maillot de match d'une équipe", 'Présence au tournoi ESGA'],
    mentionFiscale: 'Reçu fiscal mécénat',
    ordre: 3,
  },
].map((p) => ({ ...p, _type: 'packPartenaire' }));

export const pages = [
  {
    _id: 'pageAccueil',
    _type: 'pageAccueil',
    surtitre: 'Inscriptions ouvertes · dès 6 ans',
    titre: 'Vingt équipes, une seule famille',
    motAccentue: 'famille',
    /*
      Le chapô ne répète plus le nombre : il est déjà dans le titre.
      Et il dit « vingt », pas « quinze » — la fiche FFBB du club recense
      20 engagements en championnat 5×5, le chiffre de la maquette était périmé.
    */
    intro:
      "De l'école de basket aux seniors pré-régionaux. Un club formateur au cœur de l'Est lyonnais : tu viens tester un entraînement, on s'occupe du reste.",
    ctaPrincipal: { libelle: 'Rejoindre le club', url: '/inscriptions' },
    ctaVideo: { libelle: 'Le club en 40s' },
    chiffres: [
      { _key: 'c1', valeur: '20', libelle: 'Équipes engagées' },
      { _key: 'c2', valeur: 'U9 → SR', libelle: 'Toutes catégories' },
      { _key: 'c3', valeur: '5·6·7 juin', libelle: 'Tournoi annuel ESGA' },
    ],
    badgeProchainMatch: '1er entraînement offert',
    blocBenevole: {
      surtitre: 'On a besoin de toi',
      titre: 'Bénévole ou arbitre',
      texte: 'Table de marque, buvette, transport : quelques heures suffisent.',
      libelleBouton: 'Je me propose',
    },
    blocInscription: {
      titre: "S'inscrire, c'est 3 étapes",
      texte: "Licence FFBB, certificat médical, cotisation. Paiement en 3 fois et pass'Sport acceptés.",
      libelleBouton: 'Ouvrir le formulaire',
      etapes: [
        { _key: 'e1', _type: 'etape', titre: 'Essai gratuit', texte: 'Un entraînement offert dans ta catégorie' },
        { _key: 'e2', _type: 'etape', titre: 'Dossier en ligne', texte: 'Formulaire FFBB + certificat, 10 minutes' },
        { _key: 'e3', _type: 'etape', titre: 'Cotisation', texte: 'Tarifs par catégorie à confirmer' },
      ],
    },
  },
  {
    _id: 'pageClub',
    _type: 'pageClub',
    surtitre: 'Le club',
    titre: 'Un club de village, un jeu de ville',
    intro:
      "L'Éveil Sportif Genas Azieu fait pratiquer le basket aux enfants dès 6 ans et engage 20 équipes chaque saison, de l'école de basket aux seniors pré-régionaux. Tout se joue au Complexe Sportif Marcel Gonzales, à Genas.",
    valeurs: [
      { _key: 'v1', _type: 'etape', titre: 'Former avant tout', texte: "Des éducateurs diplômés à chaque catégorie, une progression pensée de l'U9 aux seniors." },
      { _key: 'v2', _type: 'etape', titre: 'Respect & collectif', texte: 'Arbitres, adversaires, coéquipiers, bénévoles : au club, personne ne joue seul.' },
      { _key: 'v3', _type: 'etape', titre: 'Ouvert à tous', texte: 'Compétition 5×5, loisir et 3×3 : chacun trouve son niveau et son créneau.' },
    ],
    titreBureau: 'Le bureau',
  },
  {
    _id: 'pageEquipes',
    _type: 'pageEquipes',
    surtitre: 'Équipes & catégories',
    titre: '20 équipes, une seule couleur',
    intro: 'Filtre par catégorie pour voir le championnat, les créneaux et le coach de chaque équipe.',
    mentionAttente: 'créneaux et coachs à confirmer',
  },
  {
    _id: 'pageResultats',
    _type: 'pageResultats',
    surtitre: 'Résultats & classements',
    titre: 'Où en sont les équipes',
    titreDerniersResultats: 'Derniers résultats',
    nombreResultats: 6,
  },
  {
    _id: 'pageAgenda',
    _type: 'pageAgenda',
    surtitre: 'Agenda',
    titre: 'Le week-end du club',
    blocConvocations: {
      surtitre: 'Convocations',
      titre: 'Ton créneau de table de marque',
      texte: 'Les convocations arbitres et table sont publiées chaque mercredi soir.',
      libelleBouton: 'Voir les convocations',
    },
  },
  {
    _id: 'pageActus',
    _type: 'pageActus',
    surtitre: 'Actualités',
    titre: 'La vie du club',
    blocNewsletter: {
      titre: 'La newsletter du club',
      texte: 'Un mail par mois : résultats, convocations, événements.',
      libelleBouton: "Je m'abonne",
      actif: false,
    },
  },
  {
    _id: 'pageInscriptions',
    _type: 'pageInscriptions',
    surtitre: `Saison ${SAISON}`,
    titre: "Rejoindre l'ESGA",
    intro:
      "Premier entraînement offert, dossier en ligne, paiement en 3 fois. Pass'Sport et Coupons Sport acceptés.",
    etapes: [
      { _key: 'e1', _type: 'etape', titre: 'Viens essayer', texte: 'Un entraînement gratuit dans ta catégorie, sans engagement.' },
      { _key: 'e2', _type: 'etape', titre: 'Dossier en ligne', texte: 'Formulaire FFBB, photo, certificat médical ou questionnaire de santé.' },
      { _key: 'e3', _type: 'etape', titre: 'Cotisation', texte: 'Par virement, CB ou chèques. Réduction à partir du 2e licencié d’une famille.' },
    ],
    titreTarifs: 'Tarifs par catégorie',
    mentionTarifs: 'montants à renseigner',
    faq: [
      { _key: 'q1', _type: 'questionReponse', question: 'À partir de quel âge ?', reponse: "Dès 6 ans à l'école de basket, sur le créneau du mercredi." },
      { _key: 'q2', _type: 'questionReponse', question: 'Faut-il du matériel ?', reponse: 'Une paire de chaussures de salle suffit. Le maillot de match est fourni par le club.' },
      { _key: 'q3', _type: 'questionReponse', question: 'Peut-on jouer sans compétition ?', reponse: 'Oui : le club propose du loisir 5×5 et du 3×3, sans championnat le week-end.' },
    ],
    blocContact: {
      titre: 'Une question sur le dossier ?',
      texte: "Écris-nous, on répond sous 48h.",
      libelleBouton: 'Nous contacter',
    },
  },
  {
    _id: 'pagePartenaires',
    _type: 'pagePartenaires',
    surtitre: 'Partenaires',
    titre: 'Votre marque sur le parquet',
    intro:
      "Plus de 200 licenciés et leurs familles, une quinzaine de rencontres à domicile par saison, un tournoi de trois jours en juin : une visibilité locale réelle, à Genas et dans l'Est lyonnais.",
    titrePartenaires: 'Ils nous soutiennent',
  },
  {
    _id: 'pageBoutique',
    _type: 'pageBoutique',
    surtitre: 'Boutique',
    titre: 'Le textile du club',
    intro:
      'Commande groupée deux fois par saison : tu choisis, le club commande, tu récupères au gymnase.',
    commandeGroupee: {
      surtitre: 'Prochaine commande groupée',
      cloture: '2026-10-15',
      texte: 'Retrait au gymnase deux semaines après la clôture. Floquage prénom offert.',
      libelleBouton: 'Voir mon panier',
    },
    mentionAttente: 'prix et tailles à renseigner',
  },
  {
    _id: 'pageContact',
    _type: 'pageContact',
    surtitre: 'Contact & accès',
    titre: 'On se voit au Gonzales',
    titreFormulaire: 'Écrire au club',
    motifs: ['Inscription', 'Bénévolat / arbitrage', 'Partenariat', 'Autre'],
  },
];
