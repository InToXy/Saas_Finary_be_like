# 🐳 Guide Docker Compose

Ce guide explique comment utiliser Docker Compose pour lancer l'application complète (backend, frontend, PostgreSQL, Redis).

## 📋 Prérequis

- Docker Desktop installé ([télécharger](https://www.docker.com/products/docker-desktop))
- Docker Compose (inclus avec Docker Desktop)

## 🚀 Démarrage rapide

### 1. Configuration initiale

Créer le fichier `.env` pour le backend :

```bash
cd backend
cp .env.example .env
```

Modifier les variables si nécessaire (les valeurs par défaut fonctionnent pour le développement local).

### 2. Lancer tous les services

Depuis la racine du projet :

```bash
docker-compose up -d
```

Cette commande va :
- 🗄️ Démarrer PostgreSQL sur le port 5432
- 🔴 Démarrer Redis sur le port 6379
- ⚙️ Builder et démarrer le backend sur le port 3000
- ⚛️ Builder et démarrer le frontend sur le port 5173

### 3. Vérifier le statut

```bash
docker-compose ps
```

Vous devriez voir 4 services en cours d'exécution :
- `wealth-postgres`
- `wealth-redis`
- `wealth-backend`
- `wealth-frontend`

### 4. Accéder à l'application

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3000
- **API Docs** : http://localhost:3000/api/docs (Swagger)

## 📦 Gestion de Prisma

Le script d'entrypoint automatise :
- ✅ Génération du client Prisma
- ✅ Application du schéma à la base de données
- ✅ Seeding initial (si configuré)

### Commandes manuelles Prisma

Si besoin d'exécuter des commandes Prisma manuellement :

```bash
# Générer le client Prisma
docker-compose exec backend npx prisma generate

# Appliquer les changements de schéma
docker-compose exec backend npx prisma db push

# Créer une migration
docker-compose exec backend npx prisma migrate dev --name nom_migration

# Ouvrir Prisma Studio (interface graphique DB)
docker-compose exec backend npx prisma studio
```

Puis accéder à Prisma Studio : http://localhost:5555

## 🔧 Commandes utiles

### Logs en temps réel

```bash
# Tous les services
docker-compose logs -f

# Un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Redémarrer un service

```bash
docker-compose restart backend
docker-compose restart frontend
```

### Rebuilder après modifications

Si vous modifiez les Dockerfiles ou les dépendances :

```bash
# Rebuild et restart
docker-compose up -d --build

# Rebuild un seul service
docker-compose up -d --build backend
```

### Arrêter les services

```bash
# Arrêter
docker-compose stop

# Arrêter et supprimer les conteneurs
docker-compose down

# Supprimer tout (conteneurs + volumes)
docker-compose down -v
```

### Accéder au shell d'un conteneur

```bash
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend sh

# PostgreSQL
docker-compose exec postgres psql -U postgres -d wealth_management
```

## 🗄️ Gestion de la base de données

### Sauvegarder la base de données

```bash
docker-compose exec postgres pg_dump -U postgres wealth_management > backup.sql
```

### Restaurer une sauvegarde

```bash
docker-compose exec -T postgres psql -U postgres wealth_management < backup.sql
```

### Réinitialiser complètement la DB

```bash
docker-compose down -v
docker-compose up -d
```

## 🐛 Dépannage

### Le backend ne démarre pas

```bash
# Vérifier les logs
docker-compose logs backend

# Vérifier que PostgreSQL est prêt
docker-compose exec postgres pg_isready -U postgres

# Rebuild le backend
docker-compose up -d --build backend
```

### Erreur "port already allocated"

Un service utilise déjà le port. Arrêtez le service local :

```bash
# Vérifier quel processus utilise le port
lsof -i :3000  # Backend
lsof -i :5173  # Frontend
lsof -i :5432  # PostgreSQL

# Ou modifier les ports dans docker-compose.yml
```

### Prisma client pas généré

```bash
docker-compose exec backend npx prisma generate
docker-compose restart backend
```

### Frontend ne se connecte pas au backend

Vérifier la variable `VITE_API_URL` dans docker-compose.yml :
```yaml
environment:
  VITE_API_URL: http://localhost:3000/api/v1
```

### Nettoyer complètement Docker

Si problèmes persistants :

```bash
# Arrêter et supprimer tout
docker-compose down -v

# Supprimer les images
docker-compose down --rmi all

# Nettoyer le cache Docker
docker system prune -a --volumes
```

## 🔄 Mode développement

Les volumes sont montés pour permettre le hot-reload :

- **Backend** : `/app` → `./backend` (nodemon redémarre automatiquement)
- **Frontend** : `/app` → `./frontend` (Vite HMR activé)

Modifiez votre code localement, les changements sont reflétés instantanément !

## 🚀 Production

Pour un déploiement production, utilisez les Dockerfiles de production :

```bash
docker-compose -f docker-compose.prod.yml up -d
```

(À créer si nécessaire)

## 📚 Resources

- [Docker Compose documentation](https://docs.docker.com/compose/)
- [Prisma with Docker](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)
- [NestJS Docker](https://docs.nestjs.com/recipes/prisma#docker)

---

💡 **Astuce** : Ajoutez des alias dans votre `.bashrc` ou `.zshrc` :

```bash
alias dc='docker-compose'
alias dcup='docker-compose up -d'
alias dcdown='docker-compose down'
alias dclogs='docker-compose logs -f'
alias dcps='docker-compose ps'
```
