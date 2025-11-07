import { useState } from 'react';
import { StockSearchMenu } from '../components/search/StockSearchMenu';
import { Plus, TrendingUp, Building2, ExternalLink } from 'lucide-react';

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  region?: string;
  currency?: string;
  provider: string;
}

export default function SearchPage() {
  const [selectedAssets, setSelectedAssets] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);

  const handleAssetSelect = (asset: SearchResult) => {
    // Éviter les doublons
    if (!selectedAssets.find(a => a.symbol === asset.symbol)) {
      setSelectedAssets(prev => [asset, ...prev]);
    }

    // Ajouter aux recherches récentes
    const filtered = recentSearches.filter(a => a.symbol !== asset.symbol);
    setRecentSearches([asset, ...filtered].slice(0, 5));
  };

  const handleRecommendationClick = (symbol: string, name: string, type: 'STOCK' | 'ETF' = 'STOCK') => {
    // Créer un objet SearchResult pour la recommandation
    const recommendedAsset: SearchResult = {
      symbol,
      name,
      type,
      region: 'United States',
      currency: 'USD',
      provider: 'RECOMMENDATION'
    };
    
    handleAssetSelect(recommendedAsset);
  };

  const removeSelected = (symbol: string) => {
    setSelectedAssets(prev => prev.filter(a => a.symbol !== symbol));
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'ETF':
        return <Building2 className="w-5 h-5 text-blue-500" />;
      case 'STOCK':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      default:
        return <Building2 className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAssetBadge = (type: string) => {
    const badges = {
      STOCK: { text: 'Action', color: 'bg-green-100 text-green-800' },
      ETF: { text: 'ETF', color: 'bg-blue-100 text-blue-800' }
    };
    
    const badge = badges[type as keyof typeof badges] || { text: type, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Recherche d'Actions & ETFs</h1>
        <p className="mt-2 text-lg text-gray-600">
          Recherchez et explorez des milliers d'actions et d'ETFs du monde entier
        </p>
      </div>

      {/* Menu de recherche principal */}
      <div className="max-w-2xl mx-auto">
        <StockSearchMenu
          onSelect={handleAssetSelect}
          placeholder="Recherchez par nom d'entreprise, symbole ou secteur..."
          className="w-full"
        />
      </div>

      {/* Assets sélectionnés */}
      {selectedAssets.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Assets sélectionnés ({selectedAssets.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedAssets.map((asset) => (
              <div key={asset.symbol} className="bg-white rounded-lg shadow border p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getAssetIcon(asset.type)}
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">
                        {asset.name}
                      </h3>
                      <p className="text-blue-600 font-mono text-sm">
                        {asset.symbol}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeSelected(asset.symbol)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    {getAssetBadge(asset.type)}
                    <span className="text-xs text-gray-500">
                      {asset.currency}
                    </span>
                  </div>
                  
                  {asset.region && (
                    <p className="text-xs text-gray-500">
                      📍 {asset.region}
                    </p>
                  )}
                  
                  <p className="text-xs text-gray-400">
                    Source: {asset.provider}
                  </p>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-md text-xs font-medium hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1">
                    <Plus className="w-3 h-3" />
                    <span>Ajouter au portfolio</span>
                  </button>
                  <button className="bg-gray-50 text-gray-700 px-2 py-2 rounded-md text-xs hover:bg-gray-100 transition-colors">
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recherches récentes */}
      {recentSearches.length > 0 && (
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg font-medium text-gray-900 mb-3">
            Recherches récentes
          </h2>
          <div className="space-y-2">
            {recentSearches.map((asset) => (
              <button
                key={asset.symbol}
                onClick={() => handleAssetSelect(asset)}
                className="w-full text-left bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {getAssetIcon(asset.type)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900 text-sm">
                        {asset.name}
                      </p>
                      {getAssetBadge(asset.type)}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-blue-600 font-mono text-xs">
                        {asset.symbol}
                      </p>
                      {asset.region && (
                        <span className="text-xs text-gray-500">
                          • {asset.region}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Meilleures Actions & ETFs */}
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Actions */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            🏆 Top Actions 2024-2025
            <span className="ml-3 text-sm font-normal text-green-600 bg-green-50 px-2 py-1 rounded">
              Performance exceptionnelle
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { symbol: 'NVDA', name: 'NVIDIA Corporation', performance: '+173%', sector: 'AI/Semi-conducteurs', reason: 'Leader IA' },
              { symbol: 'TSLA', name: 'Tesla Inc', performance: '+67%', sector: 'Véhicules électriques', reason: 'Innovation continue' },
              { symbol: 'AVGO', name: 'Broadcom Inc', performance: '+84%', sector: 'Semi-conducteurs', reason: 'Croissance IA' },
              { symbol: 'META', name: 'Meta Platforms', performance: '+58%', sector: 'Réseaux sociaux', reason: 'Métaverse + IA' },
              { symbol: 'AMD', name: 'Advanced Micro Devices', performance: '+45%', sector: 'Processeurs', reason: 'Concurrence Intel' },
              { symbol: 'AAPL', name: 'Apple Inc', performance: '+28%', sector: 'Technologie', reason: 'Vision Pro + Services' },
              { symbol: 'MSFT', name: 'Microsoft Corporation', performance: '+42%', sector: 'Cloud + IA', reason: 'Copilot + Azure' },
              { symbol: 'GOOGL', name: 'Alphabet Inc', performance: '+35%', sector: 'Recherche + Cloud', reason: 'Bard + GCP' }
            ].map((stock) => (
              <div key={stock.symbol} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-mono text-green-600 font-bold text-lg">{stock.symbol}</p>
                    <p className="text-sm text-gray-600 truncate">{stock.name}</p>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">
                    {stock.performance}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-blue-600 font-medium">{stock.sector}</p>
                  <p className="text-xs text-gray-500">{stock.reason}</p>
                </div>
                <button
                  onClick={() => handleRecommendationClick(stock.symbol, stock.name, 'STOCK')}
                  className="w-full mt-3 bg-green-50 text-green-700 px-3 py-2 rounded text-xs hover:bg-green-100 transition-colors"
                >
                  Ajouter au portfolio
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Top ETFs */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            📈 Meilleurs ETFs 2024-2025
            <span className="ml-3 text-sm font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">
              Diversification optimale
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { symbol: 'QQQ', name: 'Invesco QQQ Trust', performance: '+38%', type: 'Tech NASDAQ', reason: 'Top 100 tech US', expense: '0.20%' },
              { symbol: 'VOO', name: 'Vanguard S&P 500', performance: '+24%', type: 'Large Cap US', reason: 'S&P 500 complet', expense: '0.03%' },
              { symbol: 'VTI', name: 'Vanguard Total Stock', performance: '+23%', type: 'Marché total US', reason: 'Toutes entreprises US', expense: '0.03%' },
              { symbol: 'ARKK', name: 'ARK Innovation ETF', performance: '+67%', type: 'Innovation', reason: 'Technologies disruptives', expense: '0.75%' },
              { symbol: 'SCHD', name: 'Schwab US Dividend', performance: '+18%', type: 'Dividendes', reason: 'Revenus réguliers', expense: '0.06%' },
              { symbol: 'VXUS', name: 'Vanguard International', performance: '+15%', type: 'International', reason: 'Diversification monde', expense: '0.08%' }
            ].map((etf) => (
              <div key={etf.symbol} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-mono text-blue-600 font-bold text-lg">{etf.symbol}</p>
                    <p className="text-sm text-gray-600 truncate">{etf.name}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                    {etf.performance}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-purple-600 font-medium">{etf.type}</p>
                  <p className="text-xs text-gray-500">{etf.reason}</p>
                  <p className="text-xs text-gray-400">Frais: {etf.expense}</p>
                </div>
                <button
                  onClick={() => handleRecommendationClick(etf.symbol, etf.name, 'ETF')}
                  className="w-full mt-3 bg-blue-50 text-blue-700 px-3 py-2 rounded text-xs hover:bg-blue-100 transition-colors"
                >
                  Ajouter au portfolio
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Pires Actions (À éviter) */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            ⚠️ Actions à Surveiller / Éviter
            <span className="ml-3 text-sm font-normal text-red-600 bg-red-50 px-2 py-1 rounded">
              Performance décevante
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { symbol: 'INTC', name: 'Intel Corporation', performance: '-35%', sector: 'Semi-conducteurs', reason: 'Retard technologique vs AMD/NVIDIA' },
              { symbol: 'NFLX', name: 'Netflix Inc', performance: '-18%', sector: 'Streaming', reason: 'Concurrence accrue, saturation' },
              { symbol: 'PYPL', name: 'PayPal Holdings', performance: '-28%', sector: 'Fintech', reason: 'Concurrence Apple Pay, réduction marge' },
              { symbol: 'ZOOM', name: 'Zoom Communications', performance: '-45%', sector: 'Visioconférence', reason: 'Post-pandémie, concurrence Teams' },
              { symbol: 'PTON', name: 'Peloton Interactive', performance: '-72%', sector: 'Fitness connecté', reason: 'Modèle économique fragile' },
              { symbol: 'SNAP', name: 'Snap Inc', performance: '-41%', sector: 'Réseaux sociaux', reason: 'Perte utilisateurs vs TikTok/Instagram' }
            ].map((stock) => (
              <div key={stock.symbol} className="bg-white border border-red-200 rounded-lg p-4 hover:border-red-300 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-mono text-red-600 font-bold text-lg">{stock.symbol}</p>
                    <p className="text-sm text-gray-600 truncate">{stock.name}</p>
                  </div>
                  <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">
                    {stock.performance}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-orange-600 font-medium">{stock.sector}</p>
                  <p className="text-xs text-gray-500">{stock.reason}</p>
                </div>
                <button
                  onClick={() => console.log('Analyze', stock.symbol)}
                  className="w-full mt-3 bg-red-50 text-red-700 px-3 py-2 rounded text-xs hover:bg-red-100 transition-colors"
                >
                  Analyser les risques
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Avertissement:</strong> Ces actions ont eu une performance décevante récemment. 
              Cependant, certaines peuvent présenter des opportunités d'achat à prix réduit. 
              Toujours faire ses propres recherches avant d'investir.
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      {selectedAssets.length > 0 && (
        <div className="max-w-4xl mx-auto bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiques</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {selectedAssets.length}
              </p>
              <p className="text-sm text-gray-500">Assets sélectionnés</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {selectedAssets.filter(a => a.type === 'STOCK').length}
              </p>
              <p className="text-sm text-gray-500">Actions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {selectedAssets.filter(a => a.type === 'ETF').length}
              </p>
              <p className="text-sm text-gray-500">ETFs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {new Set(selectedAssets.map(a => a.region)).size}
              </p>
              <p className="text-sm text-gray-500">Régions</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}