# OTERIHACK RUMP

Planning des RUMPs hebdomadaires : tous les jeudis, 18:00–19:00, créneaux de 8 minutes. Une candidature n’est officielle qu’après validation admin.

## Stack

Next.js · Vercel · Neon (Postgres) · Drizzle · Auth.js

## Local

```bash
npm install
cp .env.example .env.local
# renseigner DATABASE_URL, DATABASE_URL_UNPOOLED, AUTH_SECRET
npm run db:push
npm run db:seed
npm run dev
```

## Comptes de démo (après seed)

- Admin : `admin@oterihack.fr` / `AdminRump2026`
- Membre : `lucas@oterihack.fr` / `DemoRump2026`

## Vercel

Le Framework Preset doit être **Next.js**, pas Other. Sinon Vercel sert `public/` en statique et la home renvoie 404.

Variables d’environnement à ajouter dans le projet Vercel :

- `DATABASE_URL`
- `DATABASE_URL_UNPOOLED`
- `AUTH_SECRET`
- `AUTH_TRUST_HOST=true`
