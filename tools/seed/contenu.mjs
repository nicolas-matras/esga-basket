/**
 * Contenu initial du site, repris mot pour mot de la maquette.
 *
 * Règle : rien n'est inventé. Ce que la maquette laisse « à définir » reste
 * vide ici — le site affiche alors sa mention d'attente, ce qui est honnête et
 * signale au club ce qu'il lui reste à fournir.
 *
 * Les identifiants sont fixes : rejouer `pnpm seed` remplace au lieu d'empiler.
 */

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
 * Seules les équipes que la maquette nomme explicitement.
 * Le club en annonce 15 : les neuf autres sont à saisir dans le Studio.
 */
export const equipes = [
  { _id: 'eq-sm1', nom: 'SM1', categorie: 'cat-sr', championnat: 'Pré-régionale', ordre: 1 },
  { _id: 'eq-sm2', nom: 'SM2', categorie: 'cat-sr', championnat: 'DM3 poule B', ordre: 2 },
  { _id: 'eq-sf1', nom: 'SF1', categorie: 'cat-sr', championnat: 'DF2 poule B', ordre: 3 },
  { _id: 'eq-u15m', nom: 'U15M', categorie: 'cat-u15', championnat: 'Départemental', ordre: 4 },
  { _id: 'eq-u13f', nom: 'U13F', categorie: 'cat-u13', championnat: 'Plateau', ordre: 5 },
  { _id: 'eq-u11f', nom: 'U11F', categorie: 'cat-u11', championnat: 'Plateau', ordre: 6 },
].map((e) => ({
  ...e,
  _type: 'equipe',
  slug: { _type: 'slug', current: e.nom.toLowerCase() },
  categorie: { _type: 'reference', _ref: e.categorie },
}));

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
 * Classement d'exemple. La maquette elle-même l'annonce comme tel
 * (« classement d'exemple — remplacé par le flux FFBB au build »).
 * À remplacer par le relevé réel avant mise en ligne.
 */
export const classements = [
  {
    _id: 'clt-prm',
    _type: 'classement',
    competition: { _type: 'reference', _ref: 'comp-prm' },
    misAJourLe: '2026-09-15',
    source: 'manuelle',
    lignes: [
      { _key: 'l1', _type: 'ligneClassement', rang: 1, equipe: 'Beaumarchais Lyon Métropole', points: 6, joues: 3, difference: 41 },
      { _key: 'l2', _type: 'ligneClassement', rang: 2, equipe: 'ESGA Genas Azieu 1', estESGA: true, points: 5, joues: 3, difference: 18 },
      { _key: 'l3', _type: 'ligneClassement', rang: 3, equipe: 'CO St Fons Basket', points: 5, joues: 3, difference: 7 },
      { _key: 'l4', _type: 'ligneClassement', rang: 4, equipe: 'AS Andéolaise', points: 4, joues: 3, difference: -5 },
      { _key: 'l5', _type: 'ligneClassement', rang: 5, equipe: 'BC Communay Ternay', points: 4, joues: 3, difference: -12 },
      { _key: 'l6', _type: 'ligneClassement', rang: 6, equipe: 'Irigny Vernaison', points: 3, joues: 3, difference: -21 },
      { _key: 'l7', _type: 'ligneClassement', rang: 7, equipe: 'ASC Mionnay', points: 3, joues: 3, difference: -28 },
    ],
  },
];

/** Les rencontres que la maquette affiche dans l'agenda et les résultats. */
export const matchs = [
  // Le week-end à venir — agenda du samedi 26 et dimanche 27 septembre.
  { _id: 'm-u13f-irigny', equipe: 'eq-u13f', adversaire: 'Irigny Vernaison', debut: '2026-09-26T13:00:00+02:00', domicile: true, lieu: 'Gonzales', nature: 'plateau', statut: 'a-venir' },
  { _id: 'm-u15m-mionnay', equipe: 'eq-u15m', adversaire: 'ASC Mionnay', debut: '2026-09-26T15:00:00+02:00', domicile: false, lieu: 'Mionnay', statut: 'a-venir' },
  { _id: 'm-sm2-andeolaise', equipe: 'eq-sm2', adversaire: 'AS Andéolaise 2', debut: '2026-09-26T18:30:00+02:00', domicile: true, lieu: 'Gonzales', competition: 'comp-dm3', statut: 'a-venir' },
  { _id: 'm-sm1-beaumarchais', equipe: 'eq-sm1', adversaire: 'Beaumarchais Lyon Métropole', debut: '2026-09-26T20:30:00+02:00', domicile: true, lieu: 'Gonzales', competition: 'comp-prm', statut: 'a-venir', afficheDeLaSemaine: true },
  { _id: 'm-u11f-plateau', equipe: 'eq-u11f', adversaire: 'Plateau à Genas', debut: '2026-09-27T10:00:00+02:00', domicile: true, lieu: 'Gonzales', nature: 'plateau', statut: 'a-venir', note: '3 clubs invités' },
  { _id: 'm-sf1-communay', equipe: 'eq-sf1', adversaire: 'BC Communay Ternay', debut: '2026-09-27T15:30:00+02:00', domicile: false, lieu: 'Communay', competition: 'comp-df2', statut: 'a-venir' },

  // Derniers résultats.
  { _id: 'm-sm1-stfons', equipe: 'eq-sm1', adversaire: 'CO St Fons Basket', debut: '2026-09-13T20:30:00+02:00', domicile: true, lieu: 'Gonzales', competition: 'comp-prm', statut: 'termine', scoreEsga: 78, scoreAdverse: 64 },
  { _id: 'm-sf1-bouchoux', equipe: 'eq-sf1', adversaire: 'Bouchoux', debut: '2026-09-13T15:30:00+02:00', domicile: false, lieu: 'Bouchoux', competition: 'comp-df2', statut: 'termine', scoreEsga: 52, scoreAdverse: 49 },
  { _id: 'm-u15m-mionnay-retour', equipe: 'eq-u15m', adversaire: 'ASC Mionnay', debut: '2026-09-12T15:00:00+02:00', domicile: true, lieu: 'Gonzales', statut: 'termine', scoreEsga: 61, scoreAdverse: 58 },
].map((m) => ({
  ...m,
  _type: 'match',
  equipe: { _type: 'reference', _ref: m.equipe },
  ...(m.competition ? { competition: { _type: 'reference', _ref: m.competition } } : {}),
  dansLeBandeau: true,
}));

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
    titre: 'On joue tous pour le même maillot',
    intro:
      "15 équipes, de l'école de basket aux seniors pré-régionaux. Un club formateur au cœur de l'Est lyonnais : tu viens tester un entraînement, on s'occupe du reste.",
    ctaPrincipal: { libelle: 'Rejoindre le club', url: '/inscriptions' },
    ctaVideo: { libelle: 'Le club en 40s' },
    chiffres: [
      { _key: 'c1', valeur: '15', libelle: 'Équipes engagées' },
      { _key: 'c2', valeur: 'U9 → SR', libelle: 'Toutes catégories' },
      { _key: 'c3', valeur: '5·6·7 juin', libelle: 'Tournoi annuel ESGA' },
    ],
    badgeProchainMatch: '1er entraînement offert',
    classementMisEnAvant: { _type: 'reference', _ref: 'comp-prm' },
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
      "L'Éveil Sportif Genas Azieu fait pratiquer le basket aux enfants dès 6 ans et engage 15 équipes chaque saison, de l'école de basket aux seniors pré-régionaux. Tout se joue au Complexe Sportif Marcel Gonzales, à Genas.",
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
    titre: '15 équipes, une seule couleur',
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
