import { TrendingUp, TrendingDown, Brain } from 'lucide-react';

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

interface PredictionCardProps {
  prediction: Prediction;
}

export function PredictionCard({ prediction }: PredictionCardProps) {
  const isPositive = prediction.changePercent > 0;
  const confidenceColor = 
    prediction.confidence > 80 ? 'text-green-600' :
    prediction.confidence > 60 ? 'text-yellow-600' : 'text-red-600';

  const getAssetTypeIcon = (type: string) => {
    switch (type) {
      case 'CRYPTO':
        return '₿';
      case 'STOCK':
        return '📈';
      case 'LUXURY_WATCH':
        return '⌚';
      case 'COLLECTOR_CAR':
        return '🚗';
      default:
        return '💎';
    }
  };

  const formatPrice = (price: number, type: string) => {
    if (type === 'CRYPTO' && price > 1000) {
      return `€${price.toLocaleString()}`;
    }
    if (type === 'STOCK') {
      return `€${price.toFixed(2)}`;
    }
    return `€${price.toLocaleString()}`;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getAssetTypeIcon(prediction.assetType)}</span>
          <div>
            <h4 className="font-medium text-sm text-gray-900 truncate">
              {prediction.assetName}
            </h4>
            <p className="text-xs text-gray-500">{prediction.timeframe}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Brain className="w-4 h-4 text-purple-500" />
          <span className={`text-xs font-medium ${confidenceColor}`}>
            {prediction.confidence.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Actuel</span>
          <span className="font-medium text-gray-900">
            {formatPrice(prediction.currentPrice, prediction.assetType)}
          </span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Prédit</span>
          <span className="font-medium text-gray-900">
            {formatPrice(prediction.predictedPrice, prediction.assetType)}
          </span>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500">Variation</span>
          <div className="flex items-center space-x-1">
            {isPositive ? (
              <TrendingUp className="w-3 h-3 text-green-500" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-500" />
            )}
            <span className={`text-sm font-medium ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositive ? '+' : ''}{prediction.changePercent.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}