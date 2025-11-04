# 🚀 Guide de Démarrage Rapide

## Installation en 5 minutes

### Prérequis
- Docker & Docker Compose installés
- Git installé

### Étapes

1. **Cloner le projet**
```bash
git clone <repository-url>
cd Saas_Finary_be_like
```

2. **Configuration**
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env

# Éditer backend/.env et configurer :
# - JWT_SECRET (générer une clé aléatoire)
# - JWT_REFRESH_SECRET (générer une autre clé aléatoire)
# Les autres valeurs par défaut fonctionnent pour le développement local
```

3. **Lancer l'application**
```bash
docker-compose up -d
```

4. **Initialiser la base de données**
```bash
# Attendre que les conteneurs démarrent (30 secondes)
docker-compose exec backend npx prisma migrate dev --name init

# Optionnel : Ajouter des données de test
docker-compose exec backend npx prisma db seed
```

5. **Accéder à l'application**
- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3000/api/v1
- **Documentation API** : http://localhost:3000/api/v1/docs

## Premier Compte

1. Ouvrir http://localhost:5173
2. Cliquer sur "Créer un compte"
3. Remplir le formulaire :
   - Email : test@example.com
   - Mot de passe : Test1234! (respecter les règles)
4. Se connecter automatiquement
5. Explorer le dashboard !

## Commandes Utiles

```bash
# Voir les logs
docker-compose logs -f

# Arrêter l'application
docker-compose down

# Nettoyer complètement
docker-compose down -v  # Attention : supprime les données !

# Redémarrer un service
docker-compose restart backend
docker-compose restart frontend

# Accéder au shell d'un conteneur
docker-compose exec backend sh
docker-compose exec frontend sh

# Prisma Studio (interface graphique BD)
docker-compose exec backend npx prisma studio
# Puis ouvrir http://localhost:5555
```

## Développement Local (sans Docker)

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Éditer .env

# Lancer PostgreSQL et Redis via Docker
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres --name postgres postgres:15-alpine
docker run -d -p 6379:6379 --name redis redis:7-alpine

# Migrations
npx prisma generate
npx prisma migrate dev

# Lancer le serveur
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Structure des Données

### Comptes Supportés
- 🏦 **Banque** : Comptes courants, épargne, livrets
- 📈 **Bourse** : PEA, compte-titres, actions, ETF
- 💰 **Crypto** : Bitcoin, Ethereum, altcoins
- 🏠 **Immobilier** : Biens propres, locations
- 🏢 **SCPI** : Parts de SCPI
- 📊 **Assurance-vie** : Contrats d'assurance-vie

### Types d'Actifs
- Actions (AAPL, MSFT, etc.)
- ETF (S&P 500, etc.)
- Cryptomonnaies (BTC, ETH, etc.)
- Immobilier
- Parts de SCPI
- Obligations
- Liquidités

## Fonctionnalités Disponibles (MVP)

✅ **Authentification**
- Inscription/Connexion
- JWT avec refresh tokens
- Profil utilisateur

✅ **Dashboard**
- Valorisation totale du patrimoine
- Performance mensuelle
- Répartition des actifs
- Transactions récentes

✅ **Gestion des Comptes**
- Ajout de comptes manuels
- Visualisation des soldes
- Types : Banque, Crypto, Immobilier, etc.

✅ **Gestion des Actifs**
- Ajout d'actifs
- Suivi de valorisation
- Actions, crypto, immobilier, SCPI

✅ **Transactions**
- Historique complet
- Filtrage par date/catégorie
- Débits/crédits

✅ **Paramètres**
- Profil utilisateur
- Préférences (devise, timezone)
- Sécurité

## Fonctionnalités à Venir

🔄 **En développement**
- Agrégation bancaire automatique (Budget Insight/Plaid)
- Prix temps réel (actions, crypto)
- Alertes personnalisées
- Intégration Stripe (abonnements)
- Simulation de portefeuille
- Export PDF/Excel
- Partage avec conseillers
- Application mobile (React Native)

## Dépannage

### Le backend ne démarre pas
```bash
# Vérifier les logs
docker-compose logs backend

# Problème courant : PostgreSQL pas prêt
# Solution : Attendre 30 secondes et relancer
docker-compose restart backend
```

### Erreur de migration Prisma
```bash
# Réinitialiser la base de données
docker-compose exec backend npx prisma migrate reset
docker-compose exec backend npx prisma migrate dev
```

### Le frontend ne se connecte pas au backend
```bash
# Vérifier que VITE_API_URL est correct dans frontend/.env
# Par défaut : http://localhost:3000/api/v1
```

### Port déjà utilisé
```bash
# Changer les ports dans docker-compose.yml
# Par exemple, pour le backend :
ports:
  - "3001:3000"  # Au lieu de "3000:3000"
```

## Variables d'Environnement Importantes

### Backend (.env)
```env
# Obligatoires
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/wealth_management
JWT_SECRET=votre-secret-jwt-tres-long-et-aleatoire
JWT_REFRESH_SECRET=votre-secret-refresh-different

# Optionnelles pour le MVP
STRIPE_SECRET_KEY=sk_test_...
BUDGET_INSIGHT_CLIENT_ID=...
COINGECKO_API_KEY=...
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api/v1
```

## Tests

```bash
# Backend - Tests unitaires
docker-compose exec backend npm run test

# Backend - Tests E2E
docker-compose exec backend npm run test:e2e

# Frontend - Tests
docker-compose exec frontend npm run test
```

## Production

Pour déployer en production, consultez :
- [ARCHITECTURE.md](./ARCHITECTURE.md) pour l'architecture complète
- [README.md](./README.md) pour les détails de déploiement

**Important** : En production, changez TOUS les secrets et utilisez des services managés (RDS, ElastiCache, etc.)

## Support

- 📚 Documentation : Voir ARCHITECTURE.md et README.md
- 🐛 Issues : Ouvrir une issue sur GitHub
- 💬 Questions : Contacter l'équipe de développement

---

**Bon développement ! 🚀**
