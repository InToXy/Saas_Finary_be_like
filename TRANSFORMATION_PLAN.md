# Plan de Transformation : SaaS de Prédiction et Suivi d'Actifs Diversifiés

## 🎯 Vision du Projet

Créer une plateforme SaaS permettant de **suivre, analyser et prédire** la valeur de multiples types d'actifs :
- 📈 Bourse & Indices
- 💰 ETF
- ₿ Cryptomonnaies
- ⌚ Montres de collection
- 🚗 Voitures de collection
- 🎨 Objets de collection (art, vins, etc.)

Avec un **grand tableau de bord visuel** incluant des images des actifs suivis et des **prédictions de tendances**.

---

## 📊 État Actuel du Projet

✅ **Déjà implémenté :**
- Backend NestJS + Frontend React
- Authentification JWT
- Base de données Prisma/PostgreSQL
- Module Accounts (gestion de comptes)
- Module Assets (structure de base)
- Structure Docker complète

🔧 **À adapter :**
- Élargir les types d'actifs
- Ajouter le support d'images
- Créer le système de prédiction
- Améliorer le dashboard

---

## 🗂️ Phase 1 : Adaptation du Schéma de Base de Données

### 1.1 Nouveaux Types d'Actifs

Ajouter à l'enum `AssetType` dans Prisma :
```prisma
enum AssetType {
  // Existants
  STOCK
  ETF
  BOND
  CRYPTO
  SCPI
  REAL_ESTATE
  COMMODITY
  FUND
  CASH

  // Nouveaux
  LUXURY_WATCH      // Montres de luxe
  COLLECTOR_CAR     // Voitures de collection
  ARTWORK           // Œuvres d'art
  WINE              // Vins
  JEWELRY           // Bijoux
  COLLECTIBLE       // Objets de collection génériques
}
```

### 1.2 Extension du Modèle Asset

```prisma
model Asset {
  id              String       @id @default(cuid())
  type            AssetType
  name            String
  description     String?

  // Données financières
  quantity        Float        @default(1)
  purchasePrice   Decimal      @db.Decimal(15, 2)
  currentPrice    Decimal?     @db.Decimal(15, 2)
  currency        String       @default("EUR")

  // NOUVEAU : Métadonnées pour objets de collection
  brand           String?      // Rolex, Ferrari, etc.
  model           String?      // Daytona, 250 GTO, etc.
  year            Int?         // Année de fabrication
  condition       String?      // État (Excellent, Bon, Moyen)
  serialNumber    String?      // Numéro de série
  certification   String?      // Certificat d'authenticité

  // NOUVEAU : Support d'images
  images          AssetImage[]
  thumbnailUrl    String?

  // NOUVEAU : Prédictions
  predictions     AssetPrediction[]

  // Données de tracking
  symbol          String?      // Pour stocks/crypto
  isin            String?      // Pour titres financiers
  marketData      Json?        // Données de marché brutes

  // Relations existantes
  accountId       String
  account         Account      @relation(...)
  userId          String
  user            User         @relation(...)

  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}

// NOUVEAU : Table pour les images
model AssetImage {
  id          String   @id @default(cuid())
  assetId     String
  asset       Asset    @relation(...)

  url         String   // URL de l'image (stockage local ou S3)
  filename    String
  mimeType    String
  size        Int      // Taille en bytes
  order       Int      @default(0) // Ordre d'affichage
  isMain      Boolean  @default(false) // Image principale

  createdAt   DateTime @default(now())
}

// NOUVEAU : Table pour les prédictions
model AssetPrediction {
  id              String   @id @default(cuid())
  assetId         String
  asset           Asset    @relation(...)

  predictedPrice  Decimal  @db.Decimal(15, 2)
  confidence      Float    // 0-100% niveau de confiance
  timeframe       String   // "1_MONTH", "3_MONTHS", "6_MONTHS", "1_YEAR"
  algorithm       String   // "LINEAR_REGRESSION", "MOVING_AVERAGE", "ML_MODEL"

  factors         Json?    // Facteurs ayant influencé la prédiction

  createdAt       DateTime @default(now())
  expiresAt       DateTime // Date d'expiration de la prédiction
}

// NOUVEAU : Historique des prix
model PriceHistory {
  id          String   @id @default(cuid())
  assetId     String
  asset       Asset    @relation(...)

  price       Decimal  @db.Decimal(15, 2)
  source      String   // "API", "MANUAL", "ESTIMATED"

  recordedAt  DateTime @default(now())

  @@index([assetId, recordedAt])
}
```

---

## 🖼️ Phase 2 : Système de Gestion d'Images

### 2.1 Backend - Module Upload

**Nouveau module : `backend/src/modules/upload/`**

```typescript
// upload.controller.ts
@Controller('upload')
export class UploadController {
  @Post('asset-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAssetImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('assetId') assetId: string,
  ) {
    // Validation : max 5MB, formats acceptés
    // Redimensionnement automatique (thumbnail 200x200)
    // Stockage : uploads/ ou AWS S3
    // Retour URL publique
  }

  @Delete('asset-image/:id')
  async deleteAssetImage(@Param('id') id: string) {}
}
```

**Dépendances à ajouter :**
```bash
npm install --save @nestjs/platform-express multer
npm install --save-dev @types/multer
npm install --save sharp  # Pour le redimensionnement d'images
```

### 2.2 Frontend - Composant Upload

**Nouveau composant : `frontend/src/components/AssetImageUpload.tsx`**
- Drag & drop zone
- Prévisualisation des images
- Gestion multi-images
- Compression côté client avant upload

---

## 📊 Phase 3 : Système de Prédiction

### 3.1 Module Predictions (Backend)

**Nouveau module : `backend/src/modules/predictions/`**

```typescript
// predictions.service.ts
export class PredictionsService {
  // Algorithme 1 : Régression linéaire simple
  async predictLinearTrend(assetId: string, timeframe: string) {
    // Récupère historique prix (PriceHistory)
    // Calcule tendance linéaire
    // Retourne prix prédit + confidence
  }

  // Algorithme 2 : Moyenne mobile
  async predictMovingAverage(assetId: string, timeframe: string) {
    // Calcule moyennes mobiles (7j, 30j, 90j)
    // Identifie tendances
  }

  // Algorithme 3 : Comparaison market similaire
  async predictByComparison(assetId: string) {
    // Pour objets collection : compare avec items similaires
    // Ex: Rolex Daytona 1960 vs autres Daytona vendues récemment
  }
}

// Cron job pour mise à jour automatique
@Cron('0 0 * * *') // Tous les jours à minuit
async updateAllPredictions() {
  // Recalcule prédictions pour tous les actifs
}
```

### 3.2 APIs de Prédiction

```
GET  /api/v1/predictions/asset/:id           - Prédictions pour un actif
POST /api/v1/predictions/calculate/:id       - Recalculer prédictions
GET  /api/v1/predictions/trending            - Actifs avec meilleures prévisions
```

---

## 🔌 Phase 4 : Intégrations APIs Externes

### 4.1 APIs pour Données de Prix

**Module : `backend/src/modules/aggregation/providers/`**

| Type d'Actif | API | Prix | Données |
|--------------|-----|------|---------|
| **Crypto** | CoinGecko | Gratuit | Prix, volume, market cap |
| **Stocks/ETF** | Alpha Vantage | Gratuit | Prix temps réel, historique |
| **Stocks/ETF** | Yahoo Finance | Gratuit | Alternative |
| **Montres** | Chrono24 API | Payant | Prix marché montres |
| **Voitures** | Hemmings API | Payant | Prix voitures collection |
| **Art** | Artsy API | Gratuit | Prix œuvres d'art |

**Implémentation :**

```typescript
// aggregation.service.ts
export class AggregationService {
  async fetchCryptoPrice(symbol: string) {
    // CoinGecko API
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=eur`
    );
    return response.data[symbol].eur;
  }

  async fetchStockPrice(symbol: string) {
    // Alpha Vantage API
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
    );
    return parseFloat(response.data['Global Quote']['05. price']);
  }

  async fetchWatchPrice(brand: string, model: string) {
    // Chrono24 API ou scraping
    // Retourne prix moyen du marché
  }
}

// Cron job pour mise à jour prix
@Cron('*/15 * * * *') // Toutes les 15 minutes
async updatePrices() {
  // Met à jour currentPrice pour tous les actifs suivis
}
```

### 4.2 Configuration

Ajouter dans `.env` :
```env
COINGECKO_API_KEY=optional
ALPHA_VANTAGE_API_KEY=your_key
YAHOO_FINANCE_ENABLED=true
CHRONO24_API_KEY=your_key
```

---

## 📈 Phase 5 : Grand Tableau de Bord

### 5.1 Backend - Dashboard Module

```typescript
// dashboard.service.ts
export class DashboardService {
  async getOverview(userId: string) {
    return {
      totalValue: await this.calculateTotalPortfolio(userId),
      totalGain: await this.calculateTotalGain(userId),
      gainPercentage: ...,

      assetsByType: await this.groupAssetsByType(userId),
      topPerformers: await this.getTopPerformers(userId, 5),
      worstPerformers: await this.getWorstPerformers(userId, 5),

      recentPredictions: await this.getRecentPredictions(userId),
      alerts: await this.getActiveAlerts(userId),

      priceHistory: await this.getPriceHistory(userId, '30d'),
    };
  }

  async getTrendingAssets(timeframe: string) {
    // Assets avec meilleures prédictions de croissance
  }
}
```

### 5.2 Frontend - Dashboard Amélioré

**Page : `frontend/src/pages/DashboardPage.tsx`**

Composants à créer :
1. **PortfolioSummaryCard** - Vue d'ensemble (valeur totale, gains)
2. **AssetDistributionChart** - Répartition par type (pie chart)
3. **PerformanceChart** - Évolution dans le temps (line chart)
4. **TopAssetsGrid** - Grille des meilleurs/pires performers (avec images)
5. **PredictionsPanel** - Prédictions à venir
6. **AlertsList** - Alertes actives
7. **MarketTrendsWidget** - Tendances du marché

**Layout suggéré :**
```
┌────────────────────────────────────────────────────┐
│  Valeur Totale    │  Gains Total  │  Performance   │
│    €158,240       │   +€12,580    │     +8.6%      │
├─────────────────────┬──────────────────────────────┤
│                     │                              │
│  Répartition        │  Évolution (12 mois)         │
│  par Type           │                              │
│  (Pie Chart)        │  (Line Chart)                │
│                     │                              │
├─────────────────────┴──────────────────────────────┤
│  Top Performers (avec images)                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │
│  │ 🏎️   │ │ ⌚   │ │ ₿    │ │ 📈   │ │ 🎨   │    │
│  │+18.2%│ │+12.1%│ │+9.8% │ │+7.5% │ │+6.2% │    │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘    │
├────────────────────────────────────────────────────┤
│  Prédictions                │  Alertes              │
│  - Rolex Daytona: +15% (6m) │  - BTC > 50k€        │
│  - Ferrari 250: +8% (1y)    │  - ETF S&P500 -5%    │
└────────────────────────────────────────────────────┘
```

---

## 🎨 Phase 6 : Amélioration UX

### 6.1 Page Assets Améliorée

**`frontend/src/pages/AssetsPage.tsx`**

Fonctionnalités :
- Vue grille (avec images) + vue liste
- Filtres par type, performance, valeur
- Recherche avancée
- Tri personnalisable
- Cartes d'actifs avec image principale
- Indicateur de prédiction (🟢 hausse, 🔴 baisse)

### 6.2 Page Détail d'un Actif

**Nouvelle page : `frontend/src/pages/AssetDetailPage.tsx`**

Sections :
1. **Header** - Image principale + infos clés
2. **Galerie photos** - Toutes les images de l'actif
3. **Informations** - Métadonnées (marque, modèle, année, etc.)
4. **Graphique de prix** - Historique + prédictions
5. **Performances** - Gains/pertes
6. **Comparaison** - Avec actifs similaires
7. **Alertes** - Créer des alertes sur cet actif

---

## 🛠️ Phase 7 : Nouvelles Fonctionnalités

### 7.1 Import en Masse

```
POST /api/v1/assets/import
```
- Upload CSV avec liste d'actifs
- Template Excel pour import
- Validation et prévisualisation avant import

### 7.2 Export de Données

```
GET /api/v1/assets/export?format=csv|xlsx|pdf
```
- Export portfolio complet
- Rapport PDF avec graphiques
- Export pour déclarations fiscales

### 7.3 Partage de Portfolio

```
POST /api/v1/portfolio/share
```
- Génération lien public (read-only)
- Partage sélectif (certains actifs uniquement)
- QR code pour partage mobile

### 7.4 Notifications

```typescript
// notifications.service.ts
- Email quotidien avec résumé performances
- Alerte quand prédiction change significativement
- Notification quand actif atteint prix cible
```

---

## 🗓️ Planning d'Implémentation

### Sprint 1 (3-4 jours) : Infrastructure
- [ ] Migration Prisma (nouveaux modèles)
- [ ] Module Upload (images)
- [ ] Configuration APIs externes
- [ ] Tests de connexion aux APIs

### Sprint 2 (3-4 jours) : Données
- [ ] Enrichissement module Assets
- [ ] Historique de prix (PriceHistory)
- [ ] Cron jobs de mise à jour
- [ ] Tests avec vraies données

### Sprint 3 (4-5 jours) : Prédictions
- [ ] Module Predictions (backend)
- [ ] Algorithmes de prédiction
- [ ] API endpoints prédictions
- [ ] Tests algorithmes

### Sprint 4 (5-6 jours) : Frontend - Dashboard
- [ ] Refonte DashboardPage
- [ ] Composants de visualisation
- [ ] Intégration graphiques (Recharts)
- [ ] Responsive design

### Sprint 5 (4-5 jours) : Frontend - Assets
- [ ] Page Assets avec images
- [ ] Page détail Asset
- [ ] Upload d'images
- [ ] Filtres et recherche

### Sprint 6 (2-3 jours) : Polissage
- [ ] Tests E2E
- [ ] Performance optimization
- [ ] Documentation utilisateur
- [ ] Déploiement

**Total estimé : 21-27 jours** (4-5 semaines)

---

## 🎯 MVP Minimum (Version 1.0)

Pour une première version fonctionnelle :

✅ **Must Have:**
1. Support des 6 types d'actifs principaux (Stock, Crypto, ETF, Montres, Voitures, Art)
2. Upload d'images (1-5 par actif)
3. Dashboard avec graphiques de performance
4. Prédictions simples (régression linéaire)
5. Mise à jour automatique des prix (crypto, stocks)
6. Historique de prix (30 jours minimum)

⏳ **Can Wait (v2.0):**
- Prédictions ML avancées
- Import/Export en masse
- Partage de portfolio
- Notifications email
- Intégrations APIs payantes (Chrono24, Hemmings)

---

## 💰 Modèle SaaS Ajusté

| Plan | Prix | Assets | Images/Asset | Prédictions | API Update Freq |
|------|-------|---------|--------------|-------------|-----------------|
| **Free** | €0/mo | 10 actifs | 1 image | 1 algorithme | 1x/jour |
| **Pro** | €19/mo | 100 actifs | 5 images | 3 algorithmes | 4x/jour |
| **Premium** | €49/mo | Illimité | Illimité | Tous + ML | Temps réel |

---

## 📚 Ressources APIs Gratuites

- **CoinGecko** : https://www.coingecko.com/api/documentation (50 calls/min gratuit)
- **Alpha Vantage** : https://www.alphavantage.co/ (5 calls/min gratuit)
- **Yahoo Finance Unofficial** : https://github.com/ranaroussi/yfinance
- **Artsy API** : https://developers.artsy.net/ (gratuit avec compte dev)

---

## 🚀 Commande de Démarrage

Pour commencer l'implémentation, il faut :

1. **Valider ce plan** avec vous
2. **Prioriser** les fonctionnalités (MVP d'abord ?)
3. **Créer la migration Prisma** (nouveaux modèles)
4. **Configurer les APIs** (obtenir les clés)
5. **Commencer Sprint 1**

---

## ❓ Questions à Clarifier

1. **Stockage images** : Local (uploads/) ou cloud (AWS S3, Cloudinary) ?
2. **APIs payantes** : Budget pour Chrono24 API (montres) et autres ?
3. **Prédictions ML** : Inclure dès v1.0 ou attendre v2.0 ?
4. **Prix manuels** : Permettre saisie manuelle pour actifs sans API ?
5. **MVP timeline** : Viser livraison en combien de temps ?

---

Créé le : 2025-11-05
Projet : Saas_Finary_be_like
Branche : claude/stock-prediction-saas-011CUpu6HR3dPf2TBVyFgWhR
