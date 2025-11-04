# Wealth Management SaaS

Application SaaS complète de gestion de patrimoine permettant l'agrégation de comptes financiers, le suivi en temps réel, et l'optimisation de portefeuille.

## 🚀 Fonctionnalités Principales

- ✅ **Authentification sécurisée** - JWT, refresh tokens, OAuth2
- ✅ **Agrégation de comptes** - Banque, crypto, immobilier, SCPI, assurance-vie
- ✅ **Tableau de bord temps réel** - Valorisation globale, performances, KPIs
- ✅ **Gestion des actifs** - Actions, ETF, crypto, immobilier, SCPI
- ✅ **Suivi des transactions** - Historique complet, catégorisation
- ✅ **Alertes personnalisées** - Seuils, échéances, performances
- ✅ **Modèle SaaS** - Abonnements Stripe, plans Free/Pro/Premium
- ✅ **Conformité RGPD** - Chiffrement, audit logs, export de données
- ✅ **Architecture scalable** - Microservices, cache Redis, PostgreSQL

## 📋 Prérequis

- **Node.js** 20+
- **Docker** & **Docker Compose**
- **npm** ou **yarn**

## 🛠️ Stack Technique

### Backend
- **Framework**: NestJS (Node.js/TypeScript)
- **Base de données**: PostgreSQL 15+
- **ORM**: Prisma
- **Cache**: Redis
- **Auth**: JWT + Passport.js
- **Paiements**: Stripe
- **Documentation**: Swagger

### Frontend
- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS
- **State**: Zustand + React Query
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts

## 🚀 Démarrage Rapide

### Option 1 : Avec Docker Compose (Recommandé)

```bash
# 1. Cloner le repository
git clone <repository-url>
cd Saas_Finary_be_like

# 2. Créer les fichiers .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Lancer tous les services
docker-compose up -d

# 4. Initialiser la base de données
docker-compose exec backend npx prisma migrate dev
docker-compose exec backend npx prisma db seed
```

L'application sera accessible sur :
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api/v1
- **Swagger Docs**: http://localhost:3000/api/v1/docs

### Option 2 : Installation Locale

#### Backend

```bash
cd backend

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Lancer PostgreSQL et Redis localement ou via Docker
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15-alpine
docker run -d -p 6379:6379 redis:7-alpine

# Générer Prisma Client
npx prisma generate

# Lancer les migrations
npx prisma migrate dev

# Démarrer le serveur
npm run start:dev
```

#### Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env

# Démarrer le serveur de développement
npm run dev
```

## 📁 Structure du Projet

```
Saas_Finary_be_like/
├── backend/                    # Backend NestJS
│   ├── prisma/
│   │   └── schema.prisma      # Schéma de base de données
│   ├── src/
│   │   ├── common/            # Modules communs (Prisma, Redis)
│   │   ├── modules/           # Modules fonctionnels
│   │   │   ├── auth/          # Authentification
│   │   │   ├── users/         # Utilisateurs
│   │   │   ├── accounts/      # Comptes financiers
│   │   │   ├── assets/        # Actifs
│   │   │   ├── transactions/  # Transactions
│   │   │   ├── alerts/        # Alertes
│   │   │   ├── subscriptions/ # Abonnements Stripe
│   │   │   ├── dashboard/     # Dashboard
│   │   │   └── aggregation/   # Agrégation externe
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── package.json
│
├── frontend/                   # Frontend React
│   ├── src/
│   │   ├── components/        # Composants React
│   │   │   └── layouts/       # Layouts (Auth, Main)
│   │   ├── pages/             # Pages
│   │   │   ├── auth/          # Login, Register
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── AccountsPage.tsx
│   │   │   ├── AssetsPage.tsx
│   │   │   └── TransactionsPage.tsx
│   │   ├── services/          # Services API
│   │   ├── stores/            # Zustand stores
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
├── docker-compose.yml         # Configuration Docker Compose
├── ARCHITECTURE.md            # Documentation architecture
└── README.md                  # Ce fichier
```

## 🔐 Sécurité

- Authentification JWT avec refresh tokens
- Chiffrement AES-256 pour les données sensibles
- Hashing bcrypt pour les mots de passe
- Rate limiting sur les endpoints
- CORS configuré
- Helmet.js pour les headers de sécurité
- Validation des entrées avec class-validator et Zod
- Conformité RGPD (export, suppression, audit logs)

## 📊 Modèle de Données

Le schéma Prisma complet est disponible dans `backend/prisma/schema.prisma`.

Principales entités :
- **User** - Utilisateur avec profil et abonnement
- **Account** - Comptes financiers (banque, crypto, etc.)
- **Asset** - Actifs (actions, immobilier, crypto, etc.)
- **Transaction** - Transactions financières
- **Alert** - Alertes personnalisées
- **Subscription** - Abonnements Stripe
- **SharedAccess** - Partage avec conseillers/famille
- **AuditLog** - Logs d'audit RGPD

## 🔄 APIs Externes

### Agrégation Bancaire
- **Budget Insight** (recommandé pour FR/EU)
- **Plaid** (US/international)

### Prix Crypto
- **CoinGecko API**
- **Blockchain explorers**

### Prix Actions/ETF
- **Alpha Vantage API**
- **Yahoo Finance API**

### Immobilier
- **MeilleursAgents API** (estimations FR)

### Paiements
- **Stripe** (abonnements, paiements)

## 💳 Plans d'Abonnement

| Plan | Prix/mois | Comptes | Alertes | Support |
|------|-----------|---------|---------|---------|
| **Free** | 0€ | 3 | 5 | Email |
| **Pro** | 19€ | 20 | Illimitées | Priority |
| **Premium** | 49€ | Illimités | Illimitées + IA | Dédié |

## 🧪 Tests

```bash
# Backend
cd backend
npm run test              # Tests unitaires
npm run test:e2e          # Tests d'intégration
npm run test:cov          # Coverage

# Frontend
cd frontend
npm run test
```

## 📦 Déploiement

### Production avec Docker

```bash
# Build des images
docker-compose -f docker-compose.prod.yml build

# Déploiement
docker-compose -f docker-compose.prod.yml up -d
```

### Cloud Providers

L'application est compatible avec :
- **AWS** (ECS, RDS, ElastiCache, S3)
- **Google Cloud** (Cloud Run, Cloud SQL, Cloud Storage)
- **Azure** (App Service, Azure Database, Blob Storage)
- **DigitalOcean** (App Platform, Managed Databases)

## 🔧 Scripts Utiles

```bash
# Backend
npm run prisma:migrate    # Créer une migration
npm run prisma:studio     # Interface Prisma Studio
npm run prisma:seed       # Seed la base de données

# Frontend
npm run build             # Build production
npm run preview           # Preview build
```

## 📚 Documentation

- **Architecture**: Voir [ARCHITECTURE.md](./ARCHITECTURE.md)
- **API Docs**: http://localhost:3000/api/v1/docs (Swagger)
- **Prisma Schema**: [backend/prisma/schema.prisma](./backend/prisma/schema.prisma)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Roadmap MVP

- [x] Architecture et plan technique
- [x] Backend NestJS avec authentification
- [x] Schéma de base de données Prisma
- [x] Frontend React avec Tailwind
- [x] Pages d'authentification
- [x] Dashboard avec KPIs
- [ ] Intégration APIs financières
- [ ] Système d'alertes
- [ ] Intégration Stripe
- [ ] Tests complets
- [ ] Déploiement production

## 🐛 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Email : support@wealth-management.com

## 📄 Licence

Ce projet est sous licence MIT.

---

**Note**: Ce projet est un MVP. Les APIs externes nécessitent des clés API valides pour fonctionner. Consultez la documentation de chaque provider pour obtenir vos clés.
