import { useState, useEffect } from 'react';
import { TrendingUp, Bot, Target, Zap, Watch, Car, TrendingDown } from 'lucide-react';
import { AssetTypeChart } from '../components/charts/AssetTypeChart';
import { PredictionCard } from '../components/cards/PredictionCard';
import { AssetCard } from '../components/cards/AssetCard';

interface DashboardStats {
  totalValue: number;
  monthlyGain: number;
  activePredictions: number;
  averageConfidence: number;
  assetsTracked: number;
  marketTrend: 'up' | 'down' | 'neutral';
}

interface AssetType {
  type: string;
  name: string;
  value: number;
  percentage: number;
  change: number;
  count: number;
  icon: any;
  color: string;
}

interface Prediction {
  id: string;
  assetId: string;
  assetName: string;
  assetType: string;
  currentPrice: number;
  predictedPrice: number;
  confidence: number;
  timeframe: string;
  change: number;
  changePercent: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalValue: 0,
    monthlyGain: 0,
    activePredictions: 0,
    averageConfidence: 0,
    assetsTracked: 0,
    marketTrend: 'neutral'
  });

  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [topPredictions, setTopPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - À remplacer par API calls
  useEffect(() => {
    // Simuler un appel API
    setTimeout(() => {
      setStats({
        totalValue: 324750,
        monthlyGain: 15420,
        activePredictions: 18,
        averageConfidence: 73.5,
        assetsTracked: 45,
        marketTrend: 'up'
      });

      setAssetTypes([
        {
          type: 'STOCK',
          name: 'Actions',
          value: 125340,
          percentage: 38.6,
          change: 8.2,
          count: 12,
          icon: TrendingUp,
          color: 'bg-blue-500'
        },
        {
          type: 'CRYPTO',
          name: 'Crypto',
          value: 89230,
          percentage: 27.5,
          change: 15.6,
          count: 8,
          icon: Zap,
          color: 'bg-purple-500'
        },
        {
          type: 'LUXURY_WATCH',
          name: 'Montres',
          value: 67450,
          percentage: 20.8,
          change: 12.3,
          count: 5,
          icon: Watch,
          color: 'bg-amber-500'
        },
        {
          type: 'COLLECTOR_CAR',
          name: 'Voitures',
          value: 32890,
          percentage: 10.1,
          change: 6.7,
          count: 2,
          icon: Car,
          color: 'bg-red-500'
        },
        {
          type: 'COMMODITY',
          name: 'Matières 1ères',
          value: 9840,
          percentage: 3.0,
          change: -2.1,
          count: 3,
          icon: TrendingDown,
          color: 'bg-green-500'
        }
      ]);

      setTopPredictions([
        {
          id: '1',
          assetId: 'btc-1',
          assetName: 'Bitcoin',
          assetType: 'CRYPTO',
          currentPrice: 89234,
          predictedPrice: 105600,
          confidence: 84.2,
          timeframe: '30d',
          change: 16366,
          changePercent: 18.3
        },
        {
          id: '2',
          assetId: 'rolex-1',
          assetName: 'Rolex Submariner 2020',
          assetType: 'LUXURY_WATCH',
          currentPrice: 12500,
          predictedPrice: 13750,
          confidence: 76.8,
          timeframe: '90d',
          change: 1250,
          changePercent: 10.0
        },
        {
          id: '3',
          assetId: 'tsla-1',
          assetName: 'Tesla Inc.',
          assetType: 'STOCK',
          currentPrice: 248.50,
          predictedPrice: 285.20,
          confidence: 68.4,
          timeframe: '30d',
          change: 36.70,
          changePercent: 14.8
        },
        {
          id: '4',
          assetId: 'porsche-1',
          assetName: 'Porsche 911 Turbo 1995',
          assetType: 'COLLECTOR_CAR',
          currentPrice: 87500,
          predictedPrice: 94200,
          confidence: 82.1,
          timeframe: '90d',
          change: 6700,
          changePercent: 7.7
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Investment Tracker</h1>
        <p className="mt-2 text-sm text-gray-600">
          Prédictions IA pour vos investissements multi-assets
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Valeur Totale</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                €{stats.totalValue.toLocaleString()}
              </p>
              <p className="mt-2 text-sm font-medium text-green-600">
                +{stats.monthlyGain.toLocaleString()} ce mois
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Prédictions Actives</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.activePredictions}</p>
              <p className="mt-2 text-sm font-medium text-purple-600">
                {stats.averageConfidence}% confiance moy.
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Bot className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Assets Suivis</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.assetsTracked}</p>
              <p className="mt-2 text-sm font-medium text-orange-600">
                5 types différents
              </p>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Tendance Marché</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {stats.marketTrend === 'up' ? '📈' : stats.marketTrend === 'down' ? '📉' : '➡️'}
              </p>
              <p className={`mt-2 text-sm font-medium ${
                stats.marketTrend === 'up' ? 'text-green-600' : 
                stats.marketTrend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {stats.marketTrend === 'up' ? 'Haussière' : 
                 stats.marketTrend === 'down' ? 'Baissière' : 'Stable'}
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              stats.marketTrend === 'up' ? 'bg-green-100' : 
              stats.marketTrend === 'down' ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              <TrendingUp className={`w-6 h-6 ${
                stats.marketTrend === 'up' ? 'text-green-600' : 
                stats.marketTrend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* Asset Types Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Répartition par Type d'Asset</h3>
          <AssetTypeChart data={assetTypes} />
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance par Catégorie</h3>
          <div className="space-y-4">
            {assetTypes.map((asset) => (
              <AssetCard key={asset.type} asset={asset} />
            ))}
          </div>
        </div>
      </div>

      {/* Top Predictions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Top Prédictions IA</h3>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            Voir toutes →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {topPredictions.map((prediction) => (
            <PredictionCard key={prediction.id} prediction={prediction} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Activité Récente</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-full">
              <Bot className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Nouvelle prédiction générée pour Bitcoin
              </p>
              <p className="text-sm text-gray-500">Confiance: 84.2% • +18.3% en 30j</p>
            </div>
            <span className="text-sm text-gray-500">Il y a 5 min</span>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
            <div className="p-2 bg-green-100 rounded-full">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Prix Rolex Submariner mis à jour
              </p>
              <p className="text-sm text-gray-500">€12,500 → €12,650 (+1.2%)</p>
            </div>
            <span className="text-sm text-gray-500">Il y a 1h</span>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
            <div className="p-2 bg-purple-100 rounded-full">
              <Zap className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Alerte: Tesla atteint le prix prédit
              </p>
              <p className="text-sm text-gray-500">Prédiction réalisée 3 jours en avance</p>
            </div>
            <span className="text-sm text-gray-500">Il y a 2h</span>
          </div>
        </div>
      </div>
    </div>
  );
}