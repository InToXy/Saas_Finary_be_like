# Backend - SaaS de Suivi d'Actifs Diversifiés

## 🚀 Démarrage Rapide

### 1. Installation des dépendances

```bash
cd backend
npm install
```

### 2. Configuration des variables d'environnement

Copiez le fichier `.env.example` vers `.env` :

```bash
cp .env.example .env
```

**Configuration minimale requise pour démarrer :**

```env
# Database (Docker Compose le configure automatiquement)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wealth_management?schema=public"

# JWT (changez ces valeurs en production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# APIs (à configurer - voir API_SETUP_GUIDE.md)
COINGECKO_API_KEY=CG-XXXXXXXXXXXXXXXXXXXXXXXX
ALPHA_VANTAGE_API_KEY=YOUR_API_KEY_HERE
```

### 3. Configurer les APIs externes

📖 **Voir le guide complet :** `../API_SETUP_GUIDE.md`

**APIs prioritaires à configurer (15 minutes) :**

1. **CoinGecko** (Crypto) - https://www.coingecko.com/en/api/pricing
2. **Alpha Vantage** (Stocks/ETF) - https://www.alphavantage.co/support/#api-key
3. **Exchange Rates** (Optionnel) - https://exchangerate-api.com/

### 4. Démarrer la base de données (Docker)

```bash
# Depuis la racine du projet
docker compose up -d postgres redis
```

### 5. Appliquer les migrations Prisma

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

Si vous avez déjà des migrations, utilisez :

```bash
npx prisma migrate deploy
```

### 6. (Optionnel) Tester les APIs configurées

```bash
npm run test:apis
```

Ce script teste toutes les APIs configurées dans votre `.env`.

### 7. Démarrer le serveur de développement

```bash
npm run start:dev
```

Le serveur démarre sur : **http://localhost:3000/api/v1**

### 8. Accéder à la documentation Swagger

Ouvrez votre navigateur : **http://localhost:3000/api/v1/docs**

---

## 📁 Nouvelles Fonctionnalités Ajoutées

### 🖼️ Système d'Upload d'Images

Le module Upload permet d'uploader des images pour chaque actif :

**Endpoints :**

- `POST /api/v1/upload/asset-image` - Upload une image pour un actif
- `GET /api/v1/upload/asset/:assetId/images` - Liste toutes les images d'un actif
- `PATCH /api/v1/upload/image/:imageId/set-main` - Définir l'image principale
- `DELETE /api/v1/upload/image/:imageId` - Supprimer une image

**Caractéristiques :**

- ✅ Max 5 images par actif (configurable via `MAX_IMAGES_PER_ASSET`)
- ✅ Taille max : 5MB par image (configurable via `MAX_FILE_SIZE`)
- ✅ Formats supportés : JPEG, PNG, WebP
- ✅ Redimensionnement automatique (max 1920x1920)
- ✅ Génération de thumbnails (400x400)
- ✅ Images servies via `/uploads/`

**Exemple d'upload (curl) :**

```bash
curl -X POST http://localhost:3000/api/v1/upload/asset-image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "assetId=YOUR_ASSET_ID" \
  -F "isMain=true"
```

### 🗄️ Nouveaux Modèles de Base de Données

**Types d'actifs ajoutés :**

- `LUXURY_WATCH` - Montres de luxe
- `COLLECTOR_CAR` - Voitures de collection
- `ARTWORK` - Œuvres d'art
- `WINE` - Vins
- `JEWELRY` - Bijoux
- `COLLECTIBLE` - Objets de collection

**Nouveaux modèles Prisma :**

- `AssetImage` - Stockage des images d'actifs
- `PriceHistory` - Historique des prix
- `AssetPrediction` - Prédictions de valeurs futures

**Nouveaux champs dans Asset :**

- `brand` - Marque (ex: Rolex, Ferrari)
- `model` - Modèle (ex: Daytona, 250 GTO)
- `year` - Année de fabrication
- `condition` - État (Excellent, Bon, Moyen)
- `serialNumber` - Numéro de série
- `certification` - Certificat d'authenticité
- `description` - Description détaillée
- `thumbnailUrl` - URL de la vignette

---

## 🛠️ Scripts Disponibles

### Développement

```bash
npm run start:dev       # Démarrer en mode développement (hot-reload)
npm run start:debug     # Démarrer en mode debug
npm run build           # Compiler le projet
npm run start:prod      # Démarrer en mode production
```

### Base de données

```bash
npm run prisma:generate # Générer le client Prisma
npm run prisma:migrate  # Créer une nouvelle migration
npm run prisma:studio   # Ouvrir Prisma Studio (GUI)
npm run prisma:seed     # Peupler la base de données
```

### Tests

```bash
npm run test            # Tests unitaires
npm run test:watch      # Tests en mode watch
npm run test:cov        # Tests avec couverture
npm run test:e2e        # Tests end-to-end
npm run test:apis       # Tester les APIs externes configurées
```

### Code Quality

```bash
npm run lint            # Linter
npm run format          # Formatter (Prettier)
```

---

## 🌐 Configuration des APIs Externes

### APIs Gratuites (Priorité 1)

| API | Usage | Clé Requise | Limite Gratuite |
|-----|-------|-------------|-----------------|
| **CoinGecko** | Prix crypto | Oui | 10-50 calls/min |
| **Alpha Vantage** | Actions/ETF | Oui | 5 calls/min |
| **Binance** | Prix crypto (backup) | Non | Illimité |
| **Yahoo Finance** | Actions (backup) | Non | Illimité |

### APIs Optionnelles

| API | Usage | Coût | Statut MVP |
|-----|-------|------|------------|
| Artsy | Œuvres d'art | Gratuit | Optionnel |
| Exchange Rates | Devises | Gratuit | Recommandé |
| Chrono24 | Montres | ~$1000/mois | ⏸️ Saisie manuelle |
| Hemmings | Voitures | Variable | ⏸️ Saisie manuelle |

**📖 Guide complet :** Voir `../API_SETUP_GUIDE.md`

---

## 📊 Structure des Modules

```
backend/src/
├── common/
│   ├── prisma/          # Service Prisma global
│   └── redis/           # Service Redis global
│
├── modules/
│   ├── auth/            # ✅ Authentification JWT
│   ├── users/           # ✅ Gestion utilisateurs
│   ├── accounts/        # ✅ Comptes financiers
│   ├── assets/          # ⏳ Actifs (à enrichir)
│   ├── upload/          # ✅ Upload d'images (NOUVEAU)
│   ├── aggregation/     # ⏳ APIs externes (à développer)
│   ├── predictions/     # ⏳ Prédictions (à développer)
│   ├── dashboard/       # ⏳ Tableau de bord
│   ├── transactions/    # ⏳ Transactions
│   ├── alerts/          # ⏳ Alertes
│   └── ...
│
└── main.ts              # Point d'entrée
```

**Légende :**
- ✅ Implémenté et fonctionnel
- ⏳ Structure créée, à développer
- 🔜 À créer

---

## 🔐 Authentification

L'API utilise JWT Bearer tokens.

### Obtenir un token

```bash
# 1. S'inscrire
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe"
  }'

# 2. Se connecter
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'

# Réponse :
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

### Utiliser le token

```bash
curl -X GET http://localhost:3000/api/v1/assets \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🐳 Docker

### Démarrer tous les services

```bash
# Depuis la racine du projet
docker compose up -d
```

Cela démarre :
- PostgreSQL (port 5432)
- Redis (port 6379)
- Backend (port 3000)
- Frontend (port 5173)

### Logs

```bash
docker compose logs -f backend     # Logs du backend
docker compose logs -f postgres    # Logs de la base de données
```

### Arrêter les services

```bash
docker compose down
```

---

## 🗃️ Base de Données

### Prisma Studio (GUI)

```bash
npm run prisma:studio
```

Ouvre une interface web sur http://localhost:5555 pour visualiser et éditer les données.

### Migrations

```bash
# Créer une nouvelle migration
npx prisma migrate dev --name add_images_support

# Appliquer les migrations en production
npx prisma migrate deploy

# Réinitialiser la base de données (⚠️ efface les données)
npx prisma migrate reset
```

### Seed (données de test)

```bash
npm run prisma:seed
```

---

## 📈 Prochaines Étapes de Développement

### Sprint en cours : Module Upload ✅

- [x] Créer le schéma Prisma (AssetImage, PriceHistory, AssetPrediction)
- [x] Installer les dépendances (multer, sharp)
- [x] Créer le module Upload
- [x] Configurer le serveur pour les fichiers statiques
- [x] Ajouter les variables d'environnement

### Sprint suivant : Module Aggregation

- [ ] Créer le service CoinGecko
- [ ] Créer le service Alpha Vantage
- [ ] Créer le service Binance (backup)
- [ ] Cron job pour mise à jour des prix (toutes les 4h)
- [ ] Tests des intégrations

### Après : Module Predictions

- [ ] Algorithme de régression linéaire
- [ ] Algorithme de moyennes mobiles
- [ ] Cron job pour recalcul des prédictions (quotidien)
- [ ] API endpoints pour récupérer les prédictions

---

## 🆘 Dépannage

### Erreur Prisma "Can't reach database"

```bash
# Vérifier que PostgreSQL tourne
docker compose ps

# Redémarrer PostgreSQL
docker compose restart postgres
```

### Erreur "Port 3000 already in use"

```bash
# Trouver le processus
lsof -i :3000

# Tuer le processus
kill -9 <PID>
```

### Les uploads ne fonctionnent pas

```bash
# Créer le répertoire manuellement
mkdir -p uploads

# Vérifier les permissions
chmod 755 uploads
```

### Les images ne s'affichent pas

Vérifiez que la configuration CORS autorise les images :
- `CORS_ORIGIN` doit inclure l'URL du frontend
- Helmet doit avoir `crossOriginResourcePolicy: { policy: "cross-origin" }`

---

## 📚 Documentation

- **API Reference :** http://localhost:3000/api/v1/docs (Swagger)
- **Guide d'installation des APIs :** `../API_SETUP_GUIDE.md`
- **Plan de transformation :** `../TRANSFORMATION_PLAN.md`
- **Architecture :** `../ARCHITECTURE.md`
- **Prisma Schema :** `prisma/schema.prisma`

---

## 🤝 Support

Pour toute question :
1. Consulter la documentation Swagger
2. Voir les guides dans le répertoire racine
3. Créer une issue sur GitHub

---

Dernière mise à jour : 2025-11-05
