=# 🚀 APIs GRATUITES - Guide de Configuration

Ce guide vous explique comment obtenir et configurer toutes les APIs gratuites pour votre application de gestion de patrimoine.

---

## 📋 **LISTE DES APIs GRATUITES PRIORITAIRES**

### 1. 🥇 **CoinGecko** (Crypto) - ⚡ PRIORITÉ MAXIMALE
- **Usage** : Prix de toutes les cryptomonnaies en temps réel
- **Limite gratuite** : 30-50 requêtes/minute
- **Inscription** : AUCUNE REQUISE
- **URL** : https://api.coingecko.com/api/v3
- **Test** : `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=eur`

### 2. 🥇 **Binance API** (Crypto) - ⚡ PRIORITÉ MAXIMALE  
- **Usage** : Prix crypto en temps réel (backup de CoinGecko)
- **Limite gratuite** : 1200 requêtes/minute
- **Inscription** : AUCUNE REQUISE pour les prix publics
- **URL** : https://api.binance.com/api/v3
- **Test** : `https://api.binance.com/api/v3/ticker/price?symbol=BTCEUR`

### 3. 🥈 **Alpha Vantage** (Actions/Stocks) - ⚡ PRIORITÉ HAUTE
- **Usage** : Prix des actions, ETF, indices
- **Limite gratuite** : 25 requêtes/jour
- **Inscription** : REQUISE (gratuite)
- **Steps** :
  1. Aller sur : https://www.alphavantage.co/support/#api-key
  2. Remplir le formulaire
  3. Récupérer votre clé API
  4. Ajouter dans `.env` : `ALPHA_VANTAGE_API_KEY=VOTRE_CLE`
- **Test** : `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=VOTRE_CLE`

### 4. 🥈 **Yahoo Finance** (Actions backup) - ⚡ PRIORITÉ HAUTE
- **Usage** : Prix des actions (backup d'Alpha Vantage)
- **Limite gratuite** : Pas de limite stricte
- **Inscription** : AUCUNE REQUISE
- **URL** : https://query1.finance.yahoo.com
- **Test** : `https://query1.finance.yahoo.com/v8/finance/chart/AAPL`

### 5. 🥉 **ExchangeRate-API** (Devises) - PRIORITÉ MOYENNE
- **Usage** : Taux de change EUR/USD/etc
- **Limite gratuite** : 1500 requêtes/mois
- **Inscription** : REQUISE (gratuite)
- **Steps** :
  1. Aller sur : https://app.exchangerate-api.com/sign-up/free
  2. Vérifier votre email
  3. Récupérer votre clé API
  4. Ajouter dans `.env` : `EXCHANGE_RATE_API_KEY=VOTRE_CLE`
- **Test** : `https://v6.exchangerate-api.com/v6/VOTRE_CLE/latest/USD`

### 6. 🥉 **FRED** (Données économiques) - PRIORITÉ MOYENNE
- **Usage** : Indicateurs économiques (inflation, PIB, etc.)
- **Limite gratuite** : Illimitée avec clé
- **Inscription** : REQUISE (gratuite)
- **Steps** :
  1. Aller sur : https://fred.stlouisfed.org/docs/api/api_key.html
  2. Créer un compte FRED
  3. Demander une clé API
  4. Ajouter dans `.env` : `FRED_API_KEY=VOTRE_CLE`
- **Test** : `https://api.stlouisfed.org/fred/series/observations?series_id=GDP&api_key=VOTRE_CLE`

### 7. 🏆 **NHTSA Vehicle API** (Véhicules) - PRIORITÉ BASSE
- **Usage** : Spécifications techniques des véhicules
- **Limite gratuite** : Illimitée
- **Inscription** : AUCUNE REQUISE
- **URL** : https://vpic.nhtsa.dot.gov/api
- **Test** : `https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/honda?format=json`

---

## ⚙️ **CONFIGURATION BACKEND**

### Étape 1 : Copier le fichier de configuration
```bash
cp .env.example .env
```

### Étape 2 : Éditer le fichier `.env`
Ouvrez `/backend/.env` et remplacez les valeurs suivantes :

```bash
# APIs PRIORITAIRES (à configurer en premier)
ALPHA_VANTAGE_API_KEY=REMPLACER_PAR_VOTRE_CLE_ALPHA_VANTAGE
EXCHANGE_RATE_API_KEY=REMPLACER_PAR_VOTRE_CLE_EXCHANGE_RATE

# APIs SECONDAIRES (optionnelles)  
FRED_API_KEY=REMPLACER_PAR_VOTRE_CLE_FRED

# APIs sans clé (déjà configurées)
COINGECKO_API_URL=https://api.coingecko.com/api/v3
BINANCE_API_URL=https://api.binance.com/api/v3
YAHOO_FINANCE_API_URL=https://query1.finance.yahoo.com
NHTSA_BASE_URL=https://vpic.nhtsa.dot.gov/api
```

### Étape 3 : Redémarrer l'application
```bash
docker-compose restart backend
```

---

## 🧪 **TESTS DE CONFIGURATION**

### Test manuel des APIs

1. **Tester CoinGecko** :
```bash
curl "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur"
```

2. **Tester Binance** :
```bash
curl "https://api.binance.com/api/v3/ticker/price?symbol=BTCEUR"
```

3. **Tester Alpha Vantage** (avec votre clé) :
```bash
curl "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=VOTRE_CLE"
```

4. **Tester ExchangeRate-API** (avec votre clé) :
```bash
curl "https://v6.exchangerate-api.com/v6/VOTRE_CLE/latest/USD"
```

### Test via l'application
```bash
# Depuis le dossier backend
npm run test:apis
```

---

## 📊 **MONITORING DES QUOTAS**

### Surveillance des limites gratuites :

| API | Limite | Surveillance |
|-----|--------|-------------|
| CoinGecko | 30-50 req/min | Headers `x-ratelimit-*` |
| Binance | 1200 req/min | Headers `x-mbx-*` |
| Alpha Vantage | 25 req/jour | Note sur quotas épuisés |
| ExchangeRate | 1500 req/mois | Dashboard web |
| FRED | Illimité | Aucun |

### Optimisation des requêtes :
- **Cache Redis** : 15 minutes pour les prix
- **Batch requests** : Grouper les demandes
- **Fallback strategy** : Yahoo → Alpha Vantage → Cache

---

## 🔧 **DÉPANNAGE**

### Erreur "API key invalid"
1. Vérifiez que la clé est dans le fichier `.env`
2. Redémarrez le conteneur Docker
3. Vérifiez les logs : `docker-compose logs backend`

### Erreur "Rate limit exceeded"
1. Attendez la réinitialisation du quota
2. Activez le cache Redis
3. Utilisez les APIs de fallback

### Prices non mis à jour
1. Vérifiez que les cron jobs fonctionnent
2. Regardez les logs d'erreur
3. Testez manuellement une API

---

## 🎯 **PROCHAINES ÉTAPES**

1. **Configurer les APIs prioritaires** (CoinGecko, Binance, Alpha Vantage)
2. **Tester l'application** avec de vrais prix
3. **Surveiller les quotas** pendant quelques jours
4. **Ajouter des APIs supplémentaires** si nécessaire

---

## 🆘 **SUPPORT**

Si vous avez des problèmes :
1. Vérifiez les logs : `docker-compose logs backend`
2. Testez les APIs manuellement avec curl
3. Vérifiez que les variables d'environnement sont chargées

**Enjoy your real-time financial data! 🚀**