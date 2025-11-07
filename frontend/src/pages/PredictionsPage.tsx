import { useState } from 'react';
import { Bot, TrendingUp, TrendingDown, Brain, Target, Zap, Clock } from 'lucide-react';
import { PredictionChart } from '../components/charts/PredictionChart';

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
  algorithm: string;
  createdAt: string;
  expiresAt: string;
  factors?: any;
}

export default function PredictionsPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedAssetType, setSelectedAssetType] = useState('ALL');
  
  const [predictions] = useState<Prediction[]>([ // TODO: Charger depuis l'API backend
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
      changePercent: 18.3,
      algorithm: 'TECHNICAL_ANALYSIS_ML',
      createdAt: '2025-11-06T10:00:00Z',
      expiresAt: '2025-12-06T10:00:00Z'
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
      changePercent: 10.0,
      algorithm: 'COLLECTIBLE_VALUATION_ML',
      createdAt: '2025-11-06T09:30:00Z',
      expiresAt: '2025-12-06T09:30:00Z'
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
      changePercent: 14.8,
      algorithm: 'TECHNICAL_ANALYSIS_ML',
      createdAt: '2025-11-06T11:15:00Z',
      expiresAt: '2025-12-06T11:15:00Z'
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
      changePercent: 7.7,
      algorithm: 'COLLECTIBLE_VALUATION_ML',
      createdAt: '2025-11-06T08:45:00Z',
      expiresAt: '2025-12-06T08:45:00Z'
    },
    {
      id: '5',
      assetId: 'eth-1',
      assetName: 'Ethereum',
      assetType: 'CRYPTO',
      currentPrice: 3240,
      predictedPrice: 3515,
      confidence: 71.5,
      timeframe: '30d',
      change: 275,
      changePercent: 8.5,
      algorithm: 'TECHNICAL_ANALYSIS_ML',
      createdAt: '2025-11-06T12:00:00Z',
      expiresAt: '2025-12-06T12:00:00Z'
    }
  ]);

  const assetTypes = [
    { key: 'ALL', label: 'Tous les assets' },
    { key: 'CRYPTO', label: 'Crypto', icon: '₿' },
    { key: 'STOCK', label: 'Actions', icon: '📈' },
    { key: 'LUXURY_WATCH', label: 'Montres', icon: '⌚' },
    { key: 'COLLECTOR_CAR', label: 'Voitures', icon: '🚗' },
  ];

  const timeframes = [
    { key: '1d', label: '24h' },
    { key: '7d', label: '7 jours' },
    { key: '30d', label: '30 jours' },
    { key: '90d', label: '90 jours' },
  ];

  const filteredPredictions = predictions.filter(prediction => {
    const matchesType = selectedAssetType === 'ALL' || prediction.assetType === selectedAssetType;
    const matchesTimeframe = prediction.timeframe === selectedTimeframe;
    return matchesType && matchesTimeframe;
  });

  const avgConfidence = filteredPredictions.reduce((sum, p) => sum + p.confidence, 0) / filteredPredictions.length;
  const bullishPredictions = filteredPredictions.filter(p => p.changePercent > 0).length;
  const totalPotentialGain = filteredPredictions.reduce((sum, p) => sum + (p.changePercent > 0 ? p.change : 0), 0);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getAssetTypeIcon = (type: string) => {
    const typeData = assetTypes.find(t => t.key === type);
    return typeData?.icon || '💎';
  };

  const formatTimeframe = (timeframe: string) => {
    const tf = timeframes.find(t => t.key === timeframe);
    return tf?.label || timeframe;
  };

  // Mock data for charts
  const chartData = [
    { date: '2025-10-01', actual: 85000, predicted: 85000 },
    { date: '2025-10-08', actual: 87500, predicted: 87000 },
    { date: '2025-10-15', actual: 89000, predicted: 89500 },
    { date: '2025-10-22', actual: 89234, predicted: 90000 },
    { date: '2025-11-01', actual: 89234, predicted: 92500 },
    { date: '2025-11-08', actual: 89234, predicted: 96200 },
    { date: '2025-11-15', actual: 89234, predicted: 101500 },
    { date: '2025-11-22', actual: 89234, predicted: 105600 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Prédictions IA</h1>
        <p className="mt-2 text-sm text-gray-600">
          Prédictions générées par intelligence artificielle pour vos investissements
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Type d'asset</h3>
            <div className="flex flex-wrap gap-2">
              {assetTypes.map(type => (
                <button
                  key={type.key}
                  onClick={() => setSelectedAssetType(type.key)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedAssetType === type.key
                      ? 'bg-blue-100 text-blue-700 border-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.icon && <span>{type.icon}</span>}
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Horizon temporel</h3>
            <div className="flex flex-wrap gap-2">
              {timeframes.map(tf => (
                <button
                  key={tf.key}
                  onClick={() => setSelectedTimeframe(tf.key)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTimeframe === tf.key
                      ? 'bg-purple-100 text-purple-700 border-purple-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Bot className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Prédictions</p>
              <p className="text-2xl font-bold text-gray-900">{filteredPredictions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Confiance Moy.</p>
              <p className="text-2xl font-bold text-gray-900">{avgConfidence.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Haussières</p>
              <p className="text-2xl font-bold text-gray-900">{bullishPredictions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Gain Potentiel</p>
              <p className="text-2xl font-bold text-gray-900">€{totalPotentialGain.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Prédiction Bitcoin - Analyse Technique + IA
        </h3>
        <PredictionChart data={chartData} currency="€" />
      </div>

      {/* Predictions List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Prédictions ({formatTimeframe(selectedTimeframe)})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredPredictions.map((prediction) => (
            <div key={prediction.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <span className="text-2xl">{getAssetTypeIcon(prediction.assetType)}</span>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{prediction.assetName}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(prediction.confidence)}`}>
                        {prediction.confidence.toFixed(1)}% confiance
                      </span>
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                        {prediction.algorithm === 'TECHNICAL_ANALYSIS_ML' ? 'Analyse Technique + ML' :
                         prediction.algorithm === 'COLLECTIBLE_VALUATION_ML' ? 'Valorisation Collectible + IA' :
                         prediction.algorithm}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Prix actuel</p>
                        <p className="font-semibold">€{prediction.currentPrice.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Prix prédit</p>
                        <p className="font-semibold">€{prediction.predictedPrice.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Variation</p>
                        <div className="flex items-center space-x-1">
                          {prediction.changePercent > 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                          <span className={`font-semibold ${
                            prediction.changePercent > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {prediction.changePercent > 0 ? '+' : ''}{prediction.changePercent.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-600">Expire dans</p>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">
                            {Math.ceil((new Date(prediction.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} jours
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors">
                    Détails
                  </button>
                  <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 transition-colors">
                    Nouvelle prédiction
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPredictions.length === 0 && (
          <div className="text-center py-12">
            <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune prédiction trouvée</h3>
            <p className="text-gray-500 mb-4">
              Aucune prédiction pour {formatTimeframe(selectedTimeframe)} sur {
                assetTypes.find(t => t.key === selectedAssetType)?.label.toLowerCase() || 'ces assets'
              }
            </p>
            <button className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <Bot className="w-5 h-5" />
              <span>Générer prédictions IA</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}