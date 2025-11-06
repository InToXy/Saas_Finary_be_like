.PHONY: help up down restart logs build clean prisma-generate prisma-push prisma-studio db-backup db-restore shell-backend shell-frontend shell-db

# Variables
COMPOSE = docker-compose
BACKEND = backend
FRONTEND = frontend
POSTGRES = postgres

help: ## Afficher l'aide
	@echo "📦 Commandes disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

up: ## Démarrer tous les services
	$(COMPOSE) up -d
	@echo "✅ Services démarrés! Frontend: http://localhost:5173 | Backend: http://localhost:3000"

down: ## Arrêter tous les services
	$(COMPOSE) down
	@echo "✅ Services arrêtés"

restart: ## Redémarrer tous les services
	$(COMPOSE) restart
	@echo "✅ Services redémarrés"

restart-backend: ## Redémarrer uniquement le backend
	$(COMPOSE) restart $(BACKEND)
	@echo "✅ Backend redémarré"

restart-frontend: ## Redémarrer uniquement le frontend
	$(COMPOSE) restart $(FRONTEND)
	@echo "✅ Frontend redémarré"

logs: ## Afficher les logs de tous les services
	$(COMPOSE) logs -f

logs-backend: ## Afficher les logs du backend
	$(COMPOSE) logs -f $(BACKEND)

logs-frontend: ## Afficher les logs du frontend
	$(COMPOSE) logs -f $(FRONTEND)

logs-db: ## Afficher les logs de PostgreSQL
	$(COMPOSE) logs -f $(POSTGRES)

build: ## Rebuilder tous les services
	$(COMPOSE) up -d --build
	@echo "✅ Services rebuildés et démarrés"

build-backend: ## Rebuilder uniquement le backend
	$(COMPOSE) up -d --build $(BACKEND)
	@echo "✅ Backend rebuil"

build-frontend: ## Rebuilder uniquement le frontend
	$(COMPOSE) up -d --build $(FRONTEND)
	@echo "✅ Frontend rebuil"

clean: ## Supprimer tous les conteneurs et volumes
	$(COMPOSE) down -v
	@echo "✅ Nettoyage complet effectué"

ps: ## Afficher le statut des services
	$(COMPOSE) ps

# Commandes Prisma
prisma-generate: ## Générer le client Prisma
	$(COMPOSE) exec $(BACKEND) npx prisma generate
	@echo "✅ Client Prisma généré"

prisma-push: ## Appliquer le schéma Prisma à la DB
	$(COMPOSE) exec $(BACKEND) npx prisma db push
	@echo "✅ Schéma appliqué à la base de données"

prisma-studio: ## Ouvrir Prisma Studio (http://localhost:5555)
	$(COMPOSE) exec $(BACKEND) npx prisma studio

prisma-migrate: ## Créer une nouvelle migration (usage: make prisma-migrate name=nom_migration)
	@if [ -z "$(name)" ]; then \
		echo "❌ Erreur: Spécifiez un nom de migration (make prisma-migrate name=nom_migration)"; \
	else \
		$(COMPOSE) exec $(BACKEND) npx prisma migrate dev --name $(name); \
		echo "✅ Migration '$(name)' créée"; \
	fi

# Commandes base de données
db-backup: ## Sauvegarder la base de données
	@mkdir -p backups
	$(COMPOSE) exec $(POSTGRES) pg_dump -U postgres wealth_management > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "✅ Sauvegarde créée dans backups/"

db-restore: ## Restaurer la dernière sauvegarde (usage: make db-restore file=backup.sql)
	@if [ -z "$(file)" ]; then \
		echo "❌ Erreur: Spécifiez un fichier de sauvegarde (make db-restore file=backups/backup.sql)"; \
	else \
		$(COMPOSE) exec -T $(POSTGRES) psql -U postgres wealth_management < $(file); \
		echo "✅ Base de données restaurée depuis $(file)"; \
	fi

db-reset: ## Réinitialiser complètement la base de données
	@echo "⚠️  Cela va supprimer toutes les données. Continuer? [y/N]" && read ans && [ $${ans:-N} = y ]
	$(COMPOSE) down -v
	$(COMPOSE) up -d
	@echo "✅ Base de données réinitialisée"

# Commandes shell
shell-backend: ## Accéder au shell du backend
	$(COMPOSE) exec $(BACKEND) sh

shell-frontend: ## Accéder au shell du frontend
	$(COMPOSE) exec $(FRONTEND) sh

shell-db: ## Accéder au shell PostgreSQL
	$(COMPOSE) exec $(POSTGRES) psql -U postgres wealth_management

# Commandes npm
npm-install-backend: ## Installer les dépendances backend
	$(COMPOSE) exec $(BACKEND) npm install
	@echo "✅ Dépendances backend installées"

npm-install-frontend: ## Installer les dépendances frontend
	$(COMPOSE) exec $(FRONTEND) npm install
	@echo "✅ Dépendances frontend installées"

# Installation initiale
install: ## Installation complète du projet
	@echo "📦 Installation du projet..."
	@if [ ! -f backend/.env ]; then \
		cp backend/.env.example backend/.env; \
		echo "✅ Fichier .env créé"; \
	fi
	$(COMPOSE) up -d --build
	@echo "⏳ Attente que les services soient prêts..."
	@sleep 10
	@echo "✅ Installation terminée!"
	@echo "🎉 Frontend: http://localhost:5173"
	@echo "🎉 Backend: http://localhost:3000"
	@echo "🎉 API Docs: http://localhost:3000/api/docs"
