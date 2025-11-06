import { TrendingUp, TrendingDown } from 'lucide-react';

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

interface AssetCardProps {
  asset: AssetType;
}

export function AssetCard({ asset }: AssetCardProps) {
  const isPositive = asset.change > 0;
  const IconComponent = asset.icon;

  return (
    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className={`p-2 rounded-lg ${asset.color.replace('bg-', 'bg-opacity-20 bg-')}`}>
        <IconComponent className={`w-5 h-5 ${asset.color.replace('bg-', 'text-')}`} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-medium text-gray-900">{asset.name}</h4>
          <div className="flex items-center space-x-1">
            {isPositive ? (
              <TrendingUp className="w-3 h-3 text-green-500" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-500" />
            )}
            <span className={`text-xs font-medium ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositive ? '+' : ''}{asset.change.toFixed(1)}%
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            €{asset.value.toLocaleString()}
          </span>
          <span className="text-xs text-gray-500">
            {asset.count} asset{asset.count > 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Part du portfolio</span>
            <span>{asset.percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`${asset.color} h-1.5 rounded-full transition-all duration-300`}
              style={{ width: `${asset.percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}