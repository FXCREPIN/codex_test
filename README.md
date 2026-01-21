# MVP Conseils de classe & quorum

Application interne (FR) pour suivre la présence des professeurs aux conseils de classe et garantir un quorum minimal de 70%.

## Stack
- Next.js + TypeScript + Tailwind
- Prisma + SQLite
- NextAuth (credentials)
- Zod pour la validation

## Installation
```bash
npm install
cp .env.example .env
```

## Commandes
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

## Comment visualiser l'application ?
1. Démarrer le serveur de dev avec `npm run dev`.
2. Ouvrir `http://localhost:3000`.
3. Se connecter via `/login` avec les comptes de démonstration (ci-dessous).

Tests :
```bash
npm run test
```

## Comptes de démonstration (seed)
- Direction : `direction@gmail.com` / `direction`
- Professeur : `professeur@gmail.com` / `professeur`

## Endpoints principaux
### Admin
- `GET/POST /api/admin/teachers`
- `PUT/DELETE /api/admin/teachers/:id`
- `GET/POST /api/admin/classes`
- `GET/PUT/DELETE /api/admin/classes/:id`
- `POST/DELETE /api/admin/assignments`
- `GET/POST /api/admin/councils`
- `GET/PUT/DELETE /api/admin/councils/:id`
- `GET /api/admin/export?type=councils|teachers`

### Prof
- `GET /api/me/councils`
- `POST /api/me/attendance`

## CSV import classes
Le CSV doit contenir **une seule colonne** : le nom de la classe. L’import est disponible sur `/admin/classes`.

## Prochaines étapes
- Notifications email/SMS
- Quotas avancés par professeur
- Import CSV complet (profs/classes/assignations)
- Exports enrichis (présences par conseil détaillées)
