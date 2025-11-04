# Architecture SaaS de Gestion de Patrimoine

## 🎯 Vue d'ensemble

Application SaaS moderne permettant la gestion complète de patrimoine financier avec agrégation multi-sources, tableau de bord temps réel, et outils d'optimisation.

---

## 🏗️ Architecture Technique

### Stack Technologique

#### **Backend**
- **Framework**: NestJS (Node.js/TypeScript)
  - Architecture modulaire et scalable
  - Support natif de TypeScript
  - Injection de dépendances
  - Excellente intégration avec Prisma
- **Base de données**: PostgreSQL 15+
  - Relationnel pour la cohérence des données financières
  - Support JSON pour données flexibles
  - Extensions PostGIS pour données géographiques (immobilier)
- **ORM**: Prisma
  - Type-safety complet
  - Migrations automatiques
  - Excellent tooling
- **Cache**: Redis
  - Cache des valorisations temps réel
  - Gestion des sessions
  - Rate limiting

#### **Frontend**
- **Framework**: React 18+ avec TypeScript
- **Build tool**: Vite
- **Styling**: Tailwind CSS + Shadcn/UI
- **State Management**: Zustand + React Query
- **Charts**: Recharts + Chart.js
- **Formulaires**: React Hook Form + Zod
- **Routing**: React Router v6

#### **Authentification & Sécurité**
- **Authentification**: JWT + Refresh Tokens
- **OAuth2**: Google, Microsoft (via Passport.js)
- **2FA**: TOTP (Time-based OTP) via speakeasy
- **Chiffrement**:
  - AES-256-GCM pour données sensibles
  - bcrypt pour mots de passe
  - TLS 1.3 pour transit
- **RGPD**:
  - Chiffrement at-rest et in-transit
  - Audit logs
  - Export/suppression données
  - Consentements traçables

#### **APIs Financières**

**Agrégation bancaire**:
- **Budget Insight** (API française) - Agrégation comptes bancaires FR/EU
- **Plaid** (alternative US/international)
- **Tink** (alternative EU)

**Crypto**:
- **CoinGecko API** - Prix et données crypto
- **Etherscan/Blockchain.com** - Vérification wallets

**Immobilier**:
- **MeilleursAgents API** - Estimations immobilières FR
- Saisie manuelle avec photos

**SCPI**:
- Saisie manuelle + import fichiers

**Actions/ETF**:
- **Alpha Vantage API** ou **Yahoo Finance API**

#### **Paiements & Abonnements**
- **Stripe**:
  - Subscriptions
  - Webhooks pour événements
  - Customer Portal
  - Facturation automatique

#### **Infrastructure**

**Containerisation**:
- Docker + Docker Compose (dev)
- Kubernetes (production)

**Cloud Provider** (au choix):
- **AWS**: ECS/EKS, RDS, S3, CloudFront, SES
- **Google Cloud**: Cloud Run, Cloud SQL, Cloud Storage
- **Azure**: App Service, PostgreSQL, Blob Storage

**CI/CD**:
- GitHub Actions
- Tests automatisés
- Déploiement automatique

**Monitoring**:
- **Sentry**: Error tracking
- **DataDog** ou **Grafana**: Métriques
- **ELK Stack**: Logs

---

## 📊 Architecture de la Base de Données

### Modèles Principaux

```prisma
// User Management
User
├── id, email, password, role
├── profile (1:1)
├── accounts (1:N) - Comptes financiers
├── assets (1:N) - Actifs
├── transactions (1:N)
├── subscriptions (1:N)
└── sharedAccess (1:N)

// Financial Accounts
Account
├── id, userId, type (BANK, CRYPTO, SCPI, INSURANCE, REALESTATE)
├── provider, externalId
├── balance, currency
├── lastSync
└── transactions (1:N)

// Assets (Actifs)
Asset
├── id, userId, accountId
├── type (STOCK, CRYPTO, REALESTATE, SCPI, BOND, etc.)
├── name, quantity, purchasePrice
├── currentPrice, currency
└── metadata (JSON)

// Transactions
Transaction
├── id, accountId, userId
├── date, amount, type (DEBIT/CREDIT)
├── category, description
└── metadata

// Alerts
Alert
├── id, userId
├── type (THRESHOLD, DATE, PERFORMANCE)
├── conditions (JSON)
├── isActive, lastTriggered

// Subscription
Subscription
├── id, userId
├── stripeCustomerId, stripeSubscriptionId
├── plan, status, currentPeriodEnd
└── paymentMethods

// Shared Access
SharedAccess
├── id, ownerId, sharedWithEmail
├── permissions (JSON)
├── expiresAt
```

---

## 🎨 Structure Frontend

```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/           # Login, Register, 2FA
│   │   ├── dashboard/      # Dashboard widgets
│   │   ├── accounts/       # Gestion comptes
│   │   ├── assets/         # Gestion actifs
│   │   ├── transactions/   # Liste transactions
│   │   ├── charts/         # Graphiques réutilisables
│   │   ├── alerts/         # Alertes
│   │   ├── simulation/     # Outils simulation
│   │   ├── settings/       # Paramètres compte
│   │   └── ui/             # Composants UI (shadcn)
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Accounts.tsx
│   │   ├── Portfolio.tsx
│   │   ├── Transactions.tsx
│   │   ├── Simulation.tsx
│   │   ├── Settings.tsx
│   │   └── Subscription.tsx
│   ├── hooks/              # Custom hooks
│   ├── services/           # API calls
│   ├── stores/             # Zustand stores
│   ├── utils/              # Helpers
│   └── types/              # TypeScript types
```

---

## 🔧 Structure Backend

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/           # Authentification, JWT, OAuth
│   │   ├── users/          # Gestion utilisateurs
│   │   ├── accounts/       # Comptes financiers
│   │   ├── assets/         # Actifs
│   │   ├── transactions/   # Transactions
│   │   ├── aggregation/    # Agrégation APIs externes
│   │   ├── alerts/         # Système d'alertes
│   │   ├── simulation/     # Outils simulation
│   │   ├── reports/        # Génération rapports
│   │   ├── payments/       # Stripe, subscriptions
│   │   ├── notifications/  # Email, push
│   │   └── shared-access/  # Partage avec conseillers
│   ├── common/
│   │   ├── guards/         # Auth guards
│   │   ├── decorators/     # Custom decorators
│   │   ├── filters/        # Exception filters
│   │   ├── pipes/          # Validation pipes
│   │   └── interceptors/   # Logging, transform
│   ├── config/             # Configuration
│   ├── database/           # Prisma
│   └── main.ts
```

---

## 🚀 Plan de Développement MVP

### Phase 1: Fondations (Semaines 1-2)

**Backend**:
- ✅ Setup NestJS + TypeScript
- ✅ Configuration PostgreSQL + Prisma
- ✅ Modèles de base (User, Account, Asset, Transaction)
- ✅ Authentification JWT + Register/Login
- ✅ Guards et middleware sécurité

**Frontend**:
- ✅ Setup React + Vite + TypeScript
- ✅ Configuration Tailwind + Shadcn/UI
- ✅ Pages d'authentification (Login/Register)
- ✅ Routing et layout de base
- ✅ Service API client (Axios)

**DevOps**:
- ✅ Docker Compose (PostgreSQL, Redis, backend, frontend)
- ✅ Variables d'environnement
- ✅ Scripts de développement

### Phase 2: Agrégation & Dashboard (Semaines 3-4)

**Backend**:
- ✅ Module d'agrégation (Budget Insight/Plaid)
- ✅ CRUD Accounts/Assets
- ✅ Endpoints Dashboard (valorisation totale, répartition)
- ✅ Service de calcul de performance
- ✅ Webhook handling pour syncs

**Frontend**:
- ✅ Dashboard avec KPIs
- ✅ Graphiques (répartition, évolution)
- ✅ Formulaires ajout comptes/actifs manuels
- ✅ Liste des comptes et actifs
- ✅ Refresh automatique

### Phase 3: Transactions & Alertes (Semaine 5)

**Backend**:
- ✅ CRUD Transactions
- ✅ Catégorisation automatique
- ✅ Système d'alertes (cron jobs)
- ✅ Notifications email (SendGrid/SES)

**Frontend**:
- ✅ Page transactions (filtres, recherche)
- ✅ Configuration alertes
- ✅ Notifications UI

### Phase 4: Paiements & Abonnements (Semaine 6)

**Backend**:
- ✅ Intégration Stripe
- ✅ Plans d'abonnement (Free, Pro, Premium)
- ✅ Webhooks Stripe
- ✅ Gestion facturation

**Frontend**:
- ✅ Page pricing
- ✅ Checkout Stripe
- ✅ Customer portal
- ✅ Gestion abonnement

### Phase 5: Features Avancées (Semaines 7-8)

**Backend**:
- ✅ Simulation / Optimisation (algorithmes basiques)
- ✅ Export données (PDF, Excel)
- ✅ Partage avec conseillers
- ✅ RGPD endpoints (export, suppression)

**Frontend**:
- ✅ Outils de simulation
- ✅ Rapports téléchargeables
- ✅ Gestion accès partagés
- ✅ Page paramètres RGPD

### Phase 6: Production Ready (Semaines 9-10)

**Backend**:
- ✅ Tests unitaires + intégration (Jest)
- ✅ Documentation API (Swagger)
- ✅ Rate limiting
- ✅ Monitoring (Sentry)

**Frontend**:
- ✅ Tests (Vitest, Testing Library)
- ✅ Optimisations performance
- ✅ PWA (optionnel)
- ✅ Mobile responsive final

**DevOps**:
- ✅ CI/CD GitHub Actions
- ✅ Déploiement cloud (AWS/GCP)
- ✅ SSL/CDN
- ✅ Backups automatiques
- ✅ Monitoring production

---

## 💰 Modèle de Pricing (Exemple)

| Plan | Prix/mois | Comptes | Alertes | Support | API Access |
|------|-----------|---------|---------|---------|------------|
| **Free** | 0€ | 3 | 5 | Email | ❌ |
| **Pro** | 19€ | 20 | Illimitées | Priority | ✅ |
| **Premium** | 49€ | Illimités | Illimitées + IA | Dédié | ✅ + Advanced |

---

## 🔐 Sécurité

### Mesures Implémentées

1. **Authentification**:
   - JWT avec refresh tokens (rotation)
   - 2FA obligatoire pour plans Pro+
   - Rate limiting sur login
   - Blocage après X tentatives

2. **Données**:
   - Chiffrement AES-256 pour données sensibles
   - Hashing bcrypt (rounds: 12) pour passwords
   - PCI DSS compliance (via Stripe)

3. **API**:
   - CORS configuré
   - Helmet.js (sécurité headers)
   - Input validation (Zod)
   - SQL injection protection (Prisma)

4. **RGPD**:
   - Consentement explicite
   - Export données (JSON)
   - Suppression compte + données
   - Audit logs
   - Privacy Policy + CGU

---

## 📈 Métriques de Succès

- **Performance**:
  - Time to First Byte < 200ms
  - Dashboard load < 1s
  - API response < 100ms (p95)

- **Disponibilité**:
  - Uptime 99.9%
  - RTO < 1h
  - RPO < 15min

- **Business**:
  - Taux de conversion Free → Pro > 5%
  - Churn rate < 5%
  - NPS > 40

---

## 🛠️ Outils de Développement

- **IDE**: VSCode + Extensions (Prisma, ESLint, Prettier)
- **API Testing**: Postman/Insomnia
- **DB Client**: TablePlus / DBeaver
- **Git Flow**: Feature branches + PR reviews
- **Documentation**: Swagger (backend) + Storybook (frontend)

---

## 📦 Dépendances Principales

### Backend
```json
{
  "@nestjs/core": "^10.0.0",
  "@nestjs/jwt": "^10.0.0",
  "@prisma/client": "^5.0.0",
  "passport": "^0.6.0",
  "stripe": "^14.0.0",
  "axios": "^1.6.0",
  "ioredis": "^5.3.0"
}
```

### Frontend
```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "zustand": "^4.4.0",
  "@tanstack/react-query": "^5.0.0",
  "recharts": "^2.10.0",
  "tailwindcss": "^3.4.0"
}
```

---

## 🎯 Prochaines Étapes

1. Initialiser les projets backend et frontend
2. Configurer Docker Compose
3. Créer les schémas Prisma
4. Développer l'authentification
5. Implémenter le dashboard
6. Intégrer les APIs financières
7. Déployer le MVP

---

**Date de création**: 2025-11-04
**Version**: 1.0.0
**Statut**: En développement
