/**
 * Les requêtes GROQ du site, regroupées pour n'avoir qu'un endroit à relire
 * quand le schéma bouge.
 */
import groq from 'groq';

const IMAGE = groq`{ asset, alt, hotspot, crop }`;

export const REQ_PARAMETRES = groq`*[_type == "parametres"][0]{
  nom, nomComplet, numeroFFBB, mentionAffiliation,
  salle, adresse, email, emailLicences, telephone, lienPlan,
  logo ${IMAGE},
  reseaux[]{ plateforme, libelle, url },
  bandeauActif, bandeauMessages,
  accrochePied, lienMentions[]{ libelle, url }
}`;

/** Champs communs à toutes les pages. */
const ENTETE = groq`surtitre, titre, intro, seo{ titre, description, image ${IMAGE} }`;

export const REQ_PAGE = (type: string) => groq`*[_type == "${type}"][0]`;

export const REQ_ACCUEIL = groq`*[_type == "pageAccueil"][0]{
  surtitre, titre, motAccentue, intro,
  ctaPrincipal, ctaVideo,
  photo ${IMAGE},
  chiffres[]{ _key, valeur, libelle },
  badgeProchainMatch,
  "classement": classementMisEnAvant->{
    libelle,
    "releve": *[_type == "classement" && competition._ref == ^._id] | order(misAJourLe desc)[0]{
      misAJourLe, syncSource, lignes[]{ _key, rang, equipe, estESGA, points, joues, gagnes, perdus, pointsMarques, pointsEncaisses, difference, horsClassement, forme }
    }
  },
  blocBenevole, blocInscription{ titre, texte, libelleBouton, etapes[]{ _key, titre, texte } },
  seo{ titre, description, image ${IMAGE} }
}`;

export const REQ_CLUB = groq`*[_type == "pageClub"][0]{
  ${ENTETE},
  valeurs[]{ _key, titre, texte },
  photos[]${IMAGE},
  titreBureau
}`;

export const REQ_EQUIPES_PAGE = groq`*[_type == "pageEquipes"][0]{ ${ENTETE}, mentionAttente }`;
export const REQ_RESULTATS_PAGE = groq`*[_type == "pageResultats"][0]{ ${ENTETE}, titreDerniersResultats, nombreResultats }`;
export const REQ_AGENDA_PAGE = groq`*[_type == "pageAgenda"][0]{ ${ENTETE}, blocConvocations }`;
export const REQ_ACTUS_PAGE = groq`*[_type == "pageActus"][0]{ ${ENTETE}, blocNewsletter }`;
export const REQ_INSCRIPTIONS_PAGE = groq`*[_type == "pageInscriptions"][0]{
  ${ENTETE},
  etapes[]{ _key, titre, texte },
  titreTarifs, mentionTarifs,
  faq[]{ _key, question, reponse },
  blocContact
}`;
export const REQ_PARTENAIRES_PAGE = groq`*[_type == "pagePartenaires"][0]{ ${ENTETE}, titrePartenaires }`;
export const REQ_BOUTIQUE_PAGE = groq`*[_type == "pageBoutique"][0]{ ${ENTETE}, commandeGroupee, mentionAttente }`;
export const REQ_CONTACT_PAGE = groq`*[_type == "pageContact"][0]{ ${ENTETE}, titreFormulaire, motifs }`;

export const REQ_CATEGORIES = groq`*[_type == "categorie"] | order(ordre asc){
  _id, libelle, "slug": slug.current, ordre, anneesNaissance, regroupement, accroche, detail
}`;

export const REQ_REGROUPEMENTS = groq`*[_type == "categorie" && defined(regroupement)] | order(ordre asc){
  _id, regroupement, accroche, detail
}`;

/* Les équipes que le club a choisi de masquer ne sortent pas du CMS. */
export const REQ_EQUIPES = groq`*[_type == "equipe" && visibleSurSite != false] | order(ordre asc){
  _id, nom, "slug": slug.current, championnat, poule, genre, position, coach,
  creneaux[]{ _key, jour, debut, fin, lieu },
  photo ${IMAGE},
  categorie->{ _id, libelle, "slug": slug.current, ordre }
}`;

/** Un match, tel qu'affiché partout : agenda, résultats, bandeau. */
const MATCH = groq`{
  _id, journee, adversaire, debut, domicile, lieu, nature, statut,
  scoreEsga, scoreAdverse, afficheDeLaSemaine, dansLeBandeau, note,
  logoAdversaire ${IMAGE},
  equipe->{ _id, nom, championnat },
  competition->{ libelle }
}`;

/*
  Ce qui décide de l'affichage, c'est la DATE et la présence d'un score — pas
  un statut qu'il faudrait penser à basculer. Un bénévole qui saisit le score
  d'un match voit le site se mettre à jour sans autre manipulation, et un match
  dont la date est passée quitte de lui-même la liste des rencontres à venir,
  même si personne n'a touché à son statut.
*/
export const REQ_MATCHS_A_VENIR = groq`*[_type == "match"
  && statut != "reporte"
  && !defined(scoreEsga)
  && dateTime(debut) > dateTime(now())]
  | order(debut asc) ${MATCH}`;

/** Un match est « joué » dès que les deux scores sont saisis. */
export const REQ_MATCHS_JOUES = groq`*[_type == "match"
  && defined(scoreEsga) && defined(scoreAdverse)]
  | order(debut desc) ${MATCH}`;

/*
  Le bandeau n'annonce que les rencontres À VENIR, jamais de score.
  La FFBB ne fournit pas les résultats : les scores sont saisis à la main, donc
  parfois en retard. Un bandeau qui affiche « LIVE 47—41 » sur une donnée
  vieille de trois jours est pire que pas de bandeau du tout.
*/
export const REQ_MATCHS_BANDEAU = groq`*[_type == "match" && dansLeBandeau == true
  && statut != "reporte" && !defined(scoreEsga)
  && dateTime(debut) > dateTime(now())]
  | order(debut asc)[0...8] ${MATCH}`;

/*
  Un classement n'a de sens que rattaché à une équipe : « Poule B » ne dit rien
  à un parent. On remonte donc l'équipe du club qui joue dans cette poule, via
  son ffbbPouleId, plutôt que par la référence `competition` que la synchro ne
  renseigne pas.
*/
export const REQ_CLASSEMENTS = groq`*[_type == "classement"]{
  _id, misAJourLe, syncSource, derniereSync, ffbbPouleId, ffbbCompetitionCode,
  "equipe": *[_type == "equipe" && ffbbPouleId == ^.ffbbPouleId && visibleSurSite != false][0]{
    _id, nom, "slug": slug.current, championnat, poule, genre, position,
    categorie->{ libelle, ordre }
  },
  lignes[]{ _key, rang, equipe, estESGA, points, joues, gagnes, perdus,
            pointsMarques, pointsEncaisses, difference, horsClassement, forme }
} | order(equipe.categorie.ordre desc, equipe.nom asc)`;

export const REQ_ACTUALITES = groq`*[_type == "actualite"] | order(date desc){
  _id, titre, "slug": slug.current, date, rubrique, extrait, aLaUne,
  image ${IMAGE}
}`;

export const REQ_ACTUALITE = groq`*[_type == "actualite" && slug.current == $slug][0]{
  _id, titre, "slug": slug.current, date, rubrique, extrait, corps,
  image ${IMAGE},
  seo{ titre, description, image ${IMAGE} }
}`;

export const REQ_BUREAU = groq`*[_type == "membreBureau"] | order(ordre asc){
  _id, nom, role, email, portrait ${IMAGE}
}`;

export const REQ_TARIFS = groq`*[_type == "tarif"] | order(ordre asc){
  _id, libelle, montant, mutationIncluse,
  categories[]->{ libelle, anneesNaissance }
}`;

export const REQ_PRODUITS = groq`*[_type == "produit"] | order(ordre asc){
  _id, nom, detail, prix, tailles, disponible, photo ${IMAGE}
}`;

export const REQ_PACKS = groq`*[_type == "packPartenaire"] | order(ordre asc){
  _id, nom, avantages, montant, mentionFiscale, misEnAvant
}`;

export const REQ_PARTENAIRES = groq`*[_type == "partenaire"] | order(ordre asc){
  _id, nom, url, logo ${IMAGE}
}`;
