# 🔌 Guide de Configuration des APIs

Ce document liste toutes les APIs nécessaires pour le fonctionnement du SaaS de suivi d'actifs, avec les liens d'inscription et la configuration.

---

## 📊 APIs GRATUITES (À créer en priorité)

### 1. CoinGecko - Prix des Cryptomonnaies ⭐ PRIORITÉ 1

**Pourquoi :** Suivi en temps réel des prix de 10,000+ cryptomonnaies

**Compte :** Gratuit (Demo API) ou Pro ($129/mois)

**Inscription :**
- 🔗 https://www.coingecko.com/en/api/pricing
- Cliquer sur "Get Your Free API Key"
- S'inscrire avec email
- Confirmer l'email
- Récupérer la clé API dans le dashboard

**Limites Gratuites :**
- 10-50 appels/minute
- 10,000 appels/mois
- Délai de 30 secondes sur les données

**Configuration .env :**
```env
COINGECKO_API_KEY=CG-XXXXXXXXXXXXXXXXXXXXXXXX
COINGECKO_API_URL=https://api.coingecko.com/api/v3
```

**Exemple d'utilisation :**
```bash
# Test API
curl "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=eur"

# Réponse
{
  "bitcoin": { "eur": 45000 },
  "ethereum": { "eur": 3000 }
}
```

**Documentation :** https://docs.coingecko.com/reference/introduction

---

### 2. Alpha Vantage - Actions & ETF ⭐ PRIORITÉ 1

**Pourquoi :** Données boursières temps réel (NYSE, NASDAQ, Paris, etc.)

**Compte :** Gratuit (5 appels/min) ou Premium ($50-$600/mois)

**Inscription :**
- 🔗 https://www.alphavantage.co/support/#api-key
- Remplir le formulaire simple
- Recevoir la clé API par email instantanément

**Limites Gratuites :**
- 5 appels/minute
- 500 appels/jour
- Données temps réel

**Configuration .env :**
```env
ALPHA_VANTAGE_API_KEY=YOUR_API_KEY_HERE
ALPHA_VANTAGE_API_URL=https://www.alphavantage.co/query
```

**Exemple d'utilisation :**
```bash
# Test API - Prix Apple
curl "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=YOUR_KEY"

# Test API - Prix action française (TotalEnergies)
curl "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=TTE.PA&apikey=YOUR_KEY"
```

**Documentation :** https://www.alphavantage.co/documentation/

---

### 3. Yahoo Finance (yfinance) - Alternative Gratuite ⭐ PRIORITÉ 2

**Pourquoi :** Backup si Alpha Vantage atteint les limites

**Compte :** Aucun compte nécessaire (API non officielle)

**Installation :**
```bash
# Backend déjà en Node.js, on utilisera axios + scraping léger
# Ou utiliser la bibliothèque yahoo-finance2
npm install yahoo-finance2
```

**Pas de clé API nécessaire**

**Configuration .env :**
```env
YAHOO_FINANCE_ENABLED=true
```

**Exemple d'utilisation :**
```typescript
import yahooFinance from 'yahoo-finance2';

const quote = await yahooFinance.quote('AAPL');
console.log(quote.regularMarketPrice); // 178.50
```

**Documentation :** https://github.com/gadicc/node-yahoo-finance2

---

### 4. Binance API - Prix Crypto Alternative ⭐ PRIORITÉ 2

**Pourquoi :** Alternative à CoinGecko, plus de détails sur le trading

**Compte :** Gratuit (pas besoin de compte Binance pour lire les prix publics)

**Pas d'inscription nécessaire pour les données publiques**

**Configuration .env :**
```env
BINANCE_API_URL=https://api.binance.com/api/v3
```

**Exemple d'utilisation :**
```bash
# Test API - Prix Bitcoin
curl "https://api.binance.com/api/v3/ticker/price?symbol=BTCEUR"

# Réponse
{
  "symbol": "BTCEUR",
  "price": "45234.50"
}
```

**Documentation :** https://binance-docs.github.io/apidocs/spot/en/

---

## 💰 APIs PAYANTES (Optionnelles pour MVP)

### 5. Chrono24 API - Montres de Luxe 💎

**Pourquoi :** Base de données de 500,000+ montres avec prix du marché

**Compte :** Payant uniquement (tarif sur demande, ~$500-2000/mois)

**Inscription :**
- 🔗 https://www.chrono24.com/info/businesssolutions/api.htm
- Contacter le service B2B : api@chrono24.com
- Négocier un contrat

**Alternative GRATUITE :**
- Scraping léger (attention aux CGU)
- Utiliser l'API WatchBase (https://watchbase.com/)
- Saisie manuelle des prix par les utilisateurs

**Configuration .env :**
```env
CHRONO24_API_KEY=YOUR_KEY
CHRONO24_API_URL=https://api.chrono24.com/v1
```

**Statut : ⏸️ OPTIONNEL - Utiliser saisie manuelle pour MVP**

---

### 6. Hemmings Motor News API - Voitures de Collection 🚗

**Pourquoi :** Prix du marché des voitures de collection

**Compte :** Payant (tarif sur demande)

**Inscription :**
- 🔗 https://www.hemmings.com/
- Contacter pour API B2B

**Alternative GRATUITE :**
- Classic.com API (https://www.classic.com/developers/)
- Hagerty Valuation Tools (https://www.hagerty.com/valuation-tools)
- Saisie manuelle

**Configuration .env :**
```env
HEMMINGS_API_KEY=YOUR_KEY
CLASSIC_COM_API_KEY=YOUR_KEY (alternative gratuite)
```

**Statut : ⏸️ OPTIONNEL - Utiliser saisie manuelle pour MVP**

---

### 7. Artsy API - Œuvres d'Art 🎨

**Pourquoi :** Base de données de 1M+ œuvres d'art avec prix

**Compte :** Gratuit avec compte développeur

**Inscription :**
- 🔗 https://developers.artsy.net/
- Créer un compte développeur
- Demander un Client ID et Secret
- Approuvé sous 24-48h

**Limites Gratuites :**
- 60 appels/minute
- Usage non-commercial OK

**Configuration .env :**
```env
ARTSY_CLIENT_ID=YOUR_CLIENT_ID
ARTSY_CLIENT_SECRET=YOUR_SECRET
ARTSY_API_URL=https://api.artsy.net/api
```

**Exemple d'utilisation :**
```bash
# 1. Obtenir un token
curl -X POST https://api.artsy.net/api/tokens/xapp_token \
  -d client_id=YOUR_ID \
  -d client_secret=YOUR_SECRET

# 2. Rechercher une œuvre
curl -H "X-Xapp-Token: YOUR_TOKEN" \
  "https://api.artsy.net/api/search?q=picasso"
```

**Documentation :** https://developers.artsy.net/docs/

**Statut : ✅ RECOMMANDÉ - Gratuit et utile**

---

## 🌍 APIs COMPLÉMENTAIRES (Bonus)

### 8. Exchange Rates API - Taux de Change 💱

**Pourquoi :** Conversion EUR/USD/GBP pour actifs internationaux

**Compte :** Gratuit (1500 appels/mois) ou Pro ($10+/mois)

**Inscription :**
- 🔗 https://exchangerate-api.com/
- S'inscrire gratuitement
- Récupérer la clé API

**Configuration .env :**
```env
EXCHANGE_RATE_API_KEY=YOUR_KEY
```

**Exemple d'utilisation :**
```bash
curl "https://v6.exchangerate-api.com/v6/YOUR_KEY/latest/USD"
```

**Statut : ✅ UTILE - Pour multi-devises**

---

### 9. Polygon.io - Actions Temps Réel 📊

**Pourquoi :** Alternative premium à Alpha Vantage (meilleure pour prod)

**Compte :** Gratuit (5 appels/min) ou Starter ($29/mois)

**Inscription :**
- 🔗 https://polygon.io/dashboard/signup
- S'inscrire
- Récupérer la clé API

**Configuration .env :**
```env
POLYGON_API_KEY=YOUR_KEY
```

**Statut : ⏸️ OPTIONNEL - Si Alpha Vantage insuffisant**

---

### 10. News API - Actualités Financières 📰

**Pourquoi :** Afficher actualités liées aux actifs suivis

**Compte :** Gratuit (100 appels/jour) ou Pro ($449/mois)

**Inscription :**
- 🔗 https://newsapi.org/register
- S'inscrire
- Récupérer la clé API

**Configuration .env :**
```env
NEWS_API_KEY=YOUR_KEY
```

**Statut : ⏸️ OPTIONNEL - Feature v2.0**

---

## 🎯 RÉCAPITULATIF : APIs à Créer MAINTENANT

### Phase 1 - MVP (À faire cette semaine)

| API | Priorité | Coût | Temps Setup | Lien |
|-----|----------|------|-------------|------|
| **CoinGecko** | ⭐⭐⭐ | Gratuit | 5 min | https://www.coingecko.com/en/api/pricing |
| **Alpha Vantage** | ⭐⭐⭐ | Gratuit | 2 min | https://www.alphavantage.co/support/#api-key |
| **Artsy** | ⭐⭐ | Gratuit | 24-48h | https://developers.artsy.net/ |
| **Exchange Rates** | ⭐⭐ | Gratuit | 5 min | https://exchangerate-api.com/ |

### Phase 2 - Amélioration (Optionnel)

| API | Priorité | Coût | Notes |
|-----|----------|------|-------|
| Polygon.io | ⭐ | $29/mois | Si Alpha Vantage insuffisant |
| Yahoo Finance | ⭐⭐ | Gratuit | Backup automatique (pas de clé) |
| Binance Public | ⭐⭐ | Gratuit | Alternative crypto |

### Phase 3 - Premium (Futur)

| API | Coût Estimé | Usage |
|-----|-------------|-------|
| Chrono24 | ~$1000/mois | Montres - Remplacer par saisie manuelle MVP |
| Hemmings/Classic.com | Variable | Voitures - Saisie manuelle MVP |

---

## 📋 CHECKLIST DE CONFIGURATION

Copiez cette checklist et cochez au fur et à mesure :

```
## APIs Crypto
- [ ] CoinGecko : Compte créé
- [ ] CoinGecko : Clé API récupérée
- [ ] CoinGecko : Clé ajoutée au .env
- [ ] CoinGecko : Test API réussi

## APIs Actions/ETF
- [ ] Alpha Vantage : Compte créé
- [ ] Alpha Vantage : Clé API reçue par email
- [ ] Alpha Vantage : Clé ajoutée au .env
- [ ] Alpha Vantage : Test avec action US (AAPL)
- [ ] Alpha Vantage : Test avec action FR (TTE.PA)

## APIs Art
- [ ] Artsy : Compte développeur créé
- [ ] Artsy : Demande API soumise
- [ ] Artsy : Approbation reçue (24-48h)
- [ ] Artsy : Client ID/Secret récupérés
- [ ] Artsy : Credentials ajoutés au .env
- [ ] Artsy : Test authentification

## APIs Taux de Change
- [ ] Exchange Rate API : Compte créé
- [ ] Exchange Rate API : Clé ajoutée au .env
- [ ] Exchange Rate API : Test conversion EUR/USD

## Installation Bibliothèques
- [ ] yahoo-finance2 installé (npm install)
- [ ] axios configuré
- [ ] Tests de connexion réussis
```

---

## 🔐 FICHIER .env COMPLET

Voici le fichier `.env` complet à créer dans `/backend/.env` :

```env
# ========================================
# CORE CONFIGURATION
# ========================================
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# ========================================
# DATABASE
# ========================================
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/wealth_management

# ========================================
# JWT AUTHENTICATION
# ========================================
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_REFRESH_EXPIRES_IN=7d

# ========================================
# CACHE (REDIS)
# ========================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ========================================
# CRYPTO APIS
# ========================================
# CoinGecko (Priorité 1)
COINGECKO_API_KEY=CG-XXXXXXXXXXXXXXXXXXXXXXXX
COINGECKO_API_URL=https://api.coingecko.com/api/v3

# Binance (Backup crypto - pas de clé nécessaire)
BINANCE_API_URL=https://api.binance.com/api/v3
BINANCE_ENABLED=true

# ========================================
# STOCK/ETF APIS
# ========================================
# Alpha Vantage (Priorité 1)
ALPHA_VANTAGE_API_KEY=YOUR_API_KEY_HERE
ALPHA_VANTAGE_API_URL=https://www.alphavantage.co/query

# Yahoo Finance (Backup - pas de clé nécessaire)
YAHOO_FINANCE_ENABLED=true

# Polygon.io (Optionnel - payant)
POLYGON_API_KEY=
POLYGON_ENABLED=false

# ========================================
# ART & COLLECTIBLES
# ========================================
# Artsy API
ARTSY_CLIENT_ID=
ARTSY_CLIENT_SECRET=
ARTSY_API_URL=https://api.artsy.net/api
ARTSY_ENABLED=false

# ========================================
# LUXURY WATCHES (Optionnel - MVP saisie manuelle)
# ========================================
CHRONO24_API_KEY=
CHRONO24_ENABLED=false

# ========================================
# COLLECTOR CARS (Optionnel - MVP saisie manuelle)
# ========================================
HEMMINGS_API_KEY=
CLASSIC_COM_API_KEY=
COLLECTOR_CARS_API_ENABLED=false

# ========================================
# EXCHANGE RATES
# ========================================
EXCHANGE_RATE_API_KEY=YOUR_KEY
EXCHANGE_RATE_API_URL=https://v6.exchangerate-api.com/v6

# ========================================
# FILE UPLOAD
# ========================================
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# AWS S3 (Optionnel - pour stockage cloud)
AWS_S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=eu-west-1
USE_S3_STORAGE=false

# ========================================
# EMAIL (Optionnel - pour notifications)
# ========================================
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=
MAIL_PASSWORD=
MAIL_FROM=noreply@yourapp.com

# ========================================
# STRIPE (Optionnel - pour abonnements)
# ========================================
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_ENABLED=false

# ========================================
# CRON JOBS
# ========================================
PRICE_UPDATE_CRON=0 */4 * * *
PREDICTION_UPDATE_CRON=0 2 * * *
```

---

## 🚀 SCRIPT DE TEST DES APIS

Créer ce fichier pour tester toutes les APIs : `backend/scripts/test-apis.ts`

```typescript
import axios from 'axios';

async function testAPIs() {
  console.log('🧪 Testing API Connections...\n');

  // 1. Test CoinGecko
  try {
    const coinGecko = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur'
    );
    console.log('✅ CoinGecko:', coinGecko.data);
  } catch (e) {
    console.log('❌ CoinGecko failed:', e.message);
  }

  // 2. Test Alpha Vantage
  try {
    const alpha = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    );
    console.log('✅ Alpha Vantage:', alpha.data['Global Quote']);
  } catch (e) {
    console.log('❌ Alpha Vantage failed:', e.message);
  }

  // 3. Test Binance
  try {
    const binance = await axios.get(
      'https://api.binance.com/api/v3/ticker/price?symbol=BTCEUR'
    );
    console.log('✅ Binance:', binance.data);
  } catch (e) {
    console.log('❌ Binance failed:', e.message);
  }

  // 4. Test Exchange Rate
  try {
    const exchange = await axios.get(
      `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/USD`
    );
    console.log('✅ Exchange Rate API:', exchange.data.conversion_rates.EUR);
  } catch (e) {
    console.log('❌ Exchange Rate failed:', e.message);
  }
}

testAPIs();
```

**Lancer le test :**
```bash
cd backend
npx ts-node scripts/test-apis.ts
```

---

## 📞 SUPPORT ET DOCUMENTATION

| API | Documentation | Support |
|-----|---------------|---------|
| CoinGecko | https://docs.coingecko.com | support@coingecko.com |
| Alpha Vantage | https://www.alphavantage.co/documentation | support@alphavantage.co |
| Artsy | https://developers.artsy.net/docs | developers@artsy.net |
| Exchange Rates | https://www.exchangerate-api.com/docs | contact@exchangerate-api.com |

---

## ⏱️ TEMPS ESTIMÉ POUR LA CONFIGURATION

- **Configuration minimale (MVP)** : 30-45 minutes
  - CoinGecko : 5 min
  - Alpha Vantage : 5 min
  - Exchange Rates : 5 min
  - Installation NPM packages : 10 min
  - Tests APIs : 15 min

- **Configuration complète** : 2-3 jours
  - APIs prioritaires : 30-45 min
  - Attente approbation Artsy : 24-48h
  - Configuration AWS S3 (optionnel) : 30 min
  - Tests complets : 1-2h

---

## 🎯 ACTION IMMÉDIATE

**À faire MAINTENANT (15 minutes) :**

1. ✅ Aller sur https://www.coingecko.com/en/api/pricing
2. ✅ Créer un compte et récupérer la clé API
3. ✅ Aller sur https://www.alphavantage.co/support/#api-key
4. ✅ Remplir le formulaire et recevoir la clé par email
5. ✅ Aller sur https://exchangerate-api.com/
6. ✅ Créer un compte et récupérer la clé
7. ✅ Copier le fichier `.env.example` vers `.env` dans `/backend`
8. ✅ Ajouter les 3 clés API dans le fichier `.env`
9. ✅ Me dire quand c'est fait pour que je continue l'implémentation !

---

Créé le : 2025-11-05
Mis à jour : 2025-11-05
Projet : Saas_Finary_be_like
