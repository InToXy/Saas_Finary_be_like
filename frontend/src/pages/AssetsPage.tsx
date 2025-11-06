import { useState } from 'react';
import { Plus, Filter, Search, TrendingUp, TrendingDown, Bot, Image, Eye } from 'lucide-react';
import { AddAssetModal } from '../components/modals/AddAssetModal';

interface Asset {
  id: string;
  name: string;
  type: 'STOCK' | 'CRYPTO' | 'LUXURY_WATCH' | 'COLLECTOR_CAR' | 'COMMODITY' | 'ETF';
  symbol?: string;
  brand?: string;
  model?: string;
  year?: number;
  condition?: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  totalValue: number;
  gain: number;
  gainPercent: number;
  lastUpdate: string;
  hasImages?: boolean;
  hasPrediction?: boolean;
  predictionChange?: number;
}

export default function AssetsPage() {
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [assets] = useState<Asset[]>([
    {
      id: '1',
      name: 'Bitcoin',
      type: 'CRYPTO',
      symbol: 'BTC',
      quantity: 0.25,
      purchasePrice: 45000,
      currentPrice: 89234,
      totalValue: 22308.5,
      gain: 11058.5,
      gainPercent: 98.3,
      lastUpdate: '2025-11-06T15:30:00Z',
      hasPrediction: true,
      predictionChange: 18.3
    },
    {
      id: '2',
      name: 'Rolex Submariner',
      type: 'LUXURY_WATCH',
      brand: 'Rolex',
      model: 'Submariner Date',
      year: 2020,
      condition: 'Excellent',
      quantity: 1,
      purchasePrice: 10500,
      currentPrice: 12500,
      totalValue: 12500,
      gain: 2000,
      gainPercent: 19.0,
      lastUpdate: '2025-11-06T14:00:00Z',
      hasImages: true,
      hasPrediction: true,
      predictionChange: 10.0
    },
    {
      id: '3',
      name: 'Tesla Inc.',
      type: 'STOCK',
      symbol: 'TSLA',
      quantity: 25,
      purchasePrice: 220.50,
      currentPrice: 248.50,
      totalValue: 6212.5,
      gain: 700,
      gainPercent: 12.7,
      lastUpdate: '2025-11-06T15:35:00Z',
      hasPrediction: true,
      predictionChange: 14.8
    },
    {
      id: '4',
      name: 'Porsche 911 Turbo',
      type: 'COLLECTOR_CAR',
      brand: 'Porsche',
      model: '911 Turbo',
      year: 1995,
      condition: 'Bon',
      quantity: 1,
      purchasePrice: 75000,
      currentPrice: 87500,
      totalValue: 87500,
      gain: 12500,
      gainPercent: 16.7,
      lastUpdate: '2025-11-06T12:00:00Z',
      hasImages: true,
      hasPrediction: true,
      predictionChange: 7.7
    },
    {
      id: '5',
      name: 'Ethereum',
      type: 'CRYPTO',
      symbol: 'ETH',
      quantity: 5.2,
      purchasePrice: 2800,
      currentPrice: 3240,
      totalValue: 16848,
      gain: 2288,
      gainPercent: 15.7,
      lastUpdate: '2025-11-06T15:30:00Z',
      hasPrediction: true,
      predictionChange: 8.5
    },
    {
      id: '6',
      name: 'Or physique',
      type: 'COMMODITY',
      symbol: 'GOLD',
      quantity: 50, // en grammes
      purchasePrice: 65,
      currentPrice: 68.5,
      totalValue: 3425,
      gain: 175,
      gainPercent: 5.4,
      lastUpdate: '2025-11-06T14:15:00Z',
      hasPrediction: false
    }
  ]);

  const assetTypes = [
    { key: 'ALL', label: 'Tous les assets', count: assets.length },
    { key: 'STOCK', label: 'Actions', count: assets.filter(a => a.type === 'STOCK').length },
    { key: 'CRYPTO', label: 'Crypto', count: assets.filter(a => a.type === 'CRYPTO').length },
    { key: 'LUXURY_WATCH', label: 'Montres', count: assets.filter(a => a.type === 'LUXURY_WATCH').length },
    { key: 'COLLECTOR_CAR', label: 'Voitures', count: assets.filter(a => a.type === 'COLLECTOR_CAR').length },
    { key: 'COMMODITY', label: 'Matières 1ères', count: assets.filter(a => a.type === 'COMMODITY').length },
  ];

  const filteredAssets = assets.filter(asset => {
    const matchesFilter = selectedFilter === 'ALL' || asset.type === selectedFilter;
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.model?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getAssetTypeIcon = (type: string) => {
    switch (type) {
      case 'CRYPTO': return '₿';
      case 'STOCK': return '📈';
      case 'LUXURY_WATCH': return '⌚';
      case 'COLLECTOR_CAR': return '🚗';
      case 'COMMODITY': return '🏆';
      case 'ETF': return '📊';
      default: return '💎';
    }
  };

  const formatAssetName = (asset: Asset) => {
    if (asset.brand && asset.model) {
      return `${asset.brand} ${asset.model}`;
    }
    return asset.name;
  };

  const formatAssetSubtitle = (asset: Asset) => {
    if (asset.type === 'LUXURY_WATCH' || asset.type === 'COLLECTOR_CAR') {
      return `${asset.year || ''} • ${asset.condition || ''}`.trim().replace(/^• |• $/g, '');
    }
    return asset.symbol || asset.type;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Portfolio Multi-Assets</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gérez vos investissements actions, crypto, montres et voitures de collection
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Ajouter un asset</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par nom, symbole, marque..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {assetTypes.map(type => (
              <option key={type.key} value={type.key}>
                {type.label} ({type.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Valeur Totale</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            €{filteredAssets.reduce((sum, asset) => sum + asset.totalValue, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Gain Total</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            +€{filteredAssets.reduce((sum, asset) => sum + asset.gain, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Assets avec Prédictions</h3>
          <p className="mt-2 text-3xl font-bold text-purple-600">
            {filteredAssets.filter(a => a.hasPrediction).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Performance Moyenne</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            +{(filteredAssets.reduce((sum, asset) => sum + asset.gainPercent, 0) / filteredAssets.length).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAssets.map((asset) => (
          <div key={asset.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getAssetTypeIcon(asset.type)}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{formatAssetName(asset)}</h3>
                  <p className="text-sm text-gray-500">{formatAssetSubtitle(asset)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {asset.hasImages && (
                  <div className="p-1 bg-blue-100 rounded">
                    <Image className="w-4 h-4 text-blue-600" />
                  </div>
                )}
                {asset.hasPrediction && (
                  <div className="p-1 bg-purple-100 rounded">
                    <Bot className="w-4 h-4 text-purple-600" />
                  </div>
                )}
                <button className="p-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                  <Eye className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Quantité</span>
                <span className="font-medium">
                  {asset.quantity} {asset.type === 'COMMODITY' ? 'g' : ''}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Prix d'achat</span>
                <span className="font-medium">€{asset.purchasePrice.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Prix actuel</span>
                <span className="font-medium">€{asset.currentPrice.toLocaleString()}</span>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-900">Valeur totale</span>
                  <span className="font-bold text-lg">€{asset.totalValue.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Performance</span>
                  <div className="flex items-center space-x-1">
                    {asset.gainPercent > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`font-medium ${
                      asset.gainPercent > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {asset.gainPercent > 0 ? '+' : ''}{asset.gainPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                {asset.hasPrediction && asset.predictionChange && (
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-purple-600">Prédiction IA</span>
                    <span className="text-sm font-medium text-purple-600">
                      +{asset.predictionChange}% (30j)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun asset trouvé</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery 
              ? `Aucun résultat pour "${searchQuery}"`
              : "Commencez par ajouter votre premier asset"
            }
          </p>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Ajouter un asset</span>
          </button>
        </div>
      )}

      {/* Add Asset Modal */}
      <AddAssetModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}