# Dreamy

Application de démonstration SOS ISIMM · Latino Impact pour les mamans SOS et les organisateurs d’événements. Les données de démonstration sont fictives. Les enfants n’ont pas de compte.

## Démarrage local

Prérequis : Node.js 20.9 ou plus récent, MySQL ou MariaDB, et une base dédiée accessible par l’application.

1. `npm install`
2. Copiez `.env.example` vers `.env.local`, puis renseignez `DATABASE_URL` et un `AUTH_SECRET` aléatoire d’au moins 32 caractères. Gardez ce fichier hors de Git.
3. Créez la base `petits_mondes` et un utilisateur MySQL limité à cette base. N’utilisez pas un compte administrateur en déploiement.
4. `npm run db:migrate`
5. `npm run db:seed` (développement uniquement)
6. `npm run dev`, puis ouvrez `http://localhost:3000`.

Comptes fictifs créés par le seed :

| Rôle           | E-mail                          |
| -------------- | ------------------------------- |
| Administrateur | `admin@demo.petitsmondes.local` |
| Maman A        | `mouna@demo.petitsmondes.local` |
| Maman B        | `salma@demo.petitsmondes.local` |

Mot de passe de démonstration : `PetitsMondes2026!`. Définissez `DEMO_PASSWORD` avant le seed pour le changer. Le seed refuse `NODE_ENV=production`.

## IA cloud

L’application utilise les endpoints HTTPS GroqCloud côté serveur : `openai/gpt-oss-20b` pour les suggestions et `whisper-large-v3-turbo` pour la transcription. Ajoutez `GROQ_API_KEY`, gardez `AI_ENABLED=true`, puis consultez `/api/ai/status` en étant connecté pour vérifier l’accès des deux modèles **avec votre compte**. Les modèles et les quotas doivent être confirmés dans la console GroqCloud avant la démonstration. En l’absence de clé, les fonctionnalités manuelles restent disponibles et l’IA renvoie une erreur explicite.

Après avoir modifié `.env.local`, redémarrez `npm run dev` pour que le serveur utilise la nouvelle clé. Pour organiser une note, saisissez du texte dans « Nouvelle note » (ou choisissez « Modifier la note » sur une note existante), puis cliquez sur « Organiser avec l’IA ». Les suggestions apparaissent sous le formulaire et attendent votre approbation.

Les limites applicatives sont de 30 requêtes LLM et 10 transcriptions par utilisateur et par jour, avec 25–30 secondes de délai maximal par appel. Les enregistrements sont limités à 90 secondes et à 10 Mo. Le serveur vérifie indépendamment la durée du média et rejette les fichiers illisibles. Les fichiers audio ne sont pas conservés par l’application. Les messages de quota ou de panne ne déclenchent aucun fournisseur payant.

La transcription peut reconnaître le français et l’arabe ; l’arabe tunisien ou la parole mêlant plusieurs langues reste de qualité variable. Le texte doit être relu avant l’enregistrement. Les suggestions IA sont modifiables et ne changent le profil qu’après approbation explicite de la maman.

## Confidentialité et hébergement

Les notes de la maman ne sont visibles que par elle. Les organisateurs voient les champs de profil approuvés et les projets d’événements ; chaque maman ne voit que la participation de ses propres enfants. Les routes API appliquent les mêmes contrôles côté serveur. Les appels IA transmettent le minimum nécessaire, sans nom complet ni audio conservé.

Ne traitez aucune donnée réelle d’enfant avant autorisation SOS, revue des conditions de traitement GroqCloud, évaluation des transferts transfrontaliers et des permissions nécessaires pour la parole et les textes. Configurez la rétention nulle du fournisseur si elle est disponible et adaptée. Le prestataire cloud ne remplace pas les règles d’accès de l’application.

Un hébergement Next.js doit pouvoir joindre GroqCloud en HTTPS et une base MySQL distante. Une base locale n’est généralement pas accessible depuis un hébergement cloud. Vérifiez les quotas et conditions du niveau gratuit GroqCloud et de l’hébergeur choisis ; aucun changement automatique vers un niveau payant n’est prévu.

## Vérification

`npm run typecheck`, `npm run lint`, `npm run build` et `npm audit` vérifient le code et ses dépendances. Les migrations et le seed ont été appliqués à une base MySQL locale pendant le développement. Les connexions et les scénarios de navigation ont été exercés avec les comptes fictifs. Les appels GroqCloud, la transcription réelle et le microphone nécessitent une clé de compte et un navigateur avec microphone ; ils n’ont pas été vérifiés sans ces ressources.
