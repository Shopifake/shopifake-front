# Shopifake Front

## Démarrer en local avec des sous-domaines `nip.io`

Les sites storefront sont identifiés par leur slug via des sous-domaines (`<slug>.domaine`). Pour les tester en local
sans toucher à votre fichier `hosts`, l'application utilise par défaut `127.0.0.1.nip.io`, un domaine qui résout
automatiquement n'importe quel sous-domaine vers `127.0.0.1`.

### Pré-requis

1. Installer les dépendances : `npm install`
2. (Optionnel) créer un fichier `.env.local` si vous souhaitez forcer un autre domaine :
   ```
   VITE_BASE_DOMAIN=mon-domaine.dev
   ```
   Par défaut en développement, `VITE_BASE_DOMAIN` vaut `127.0.0.1.nip.io`.

### Lancer le serveur

```bash
npm run dev
```

La config Vite écoute sur le port `3000` et accepte tous les hôtes. Vous pouvez donc ouvrir :

- Interface propriétaire / landing : `http://127.0.0.1.nip.io:3000`
- Storefront d'un site : `http://<slug>.127.0.0.1.nip.io:3000` (remplacez `<slug>` par le slug réel du site)

Si vous préférez un autre service wildcard (ex. `sslip.io`), définissez simplement `VITE_BASE_DOMAIN` avec ce domaine.

### Statut des sites

Lorsqu'un site est en statut `DRAFT` ou `DISABLED`, ses sous-domaines affichent une page dédiée expliquant que la
publication n'est pas encore active. Seuls les sites `ACTIVE` chargent leur storefront.