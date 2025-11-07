import { useState } from 'react';
import { StockSearchMenu } from './StockSearchMenu';

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  region?: string;
  currency?: string;
  provider: string;
}

export function SearchDemo() {
  const [selectedAsset, setSelectedAsset] = useState<SearchResult | null>(null);

  const handleSelect = (asset: SearchResult) => {
    setSelectedAsset(asset);
    console.log('Asset sélectionné:', asset);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Demo de Recherche</h2>
        <p className="text-gray-600">Testez la recherche d'actions et ETFs</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Recherche d'Assets</h3>
        <StockSearchMenu
          onSelect={handleSelect}
          placeholder="Recherchez Apple, Microsoft, Tesla..."
        />
      </div>

      {selectedAsset && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-2">Asset Sélectionné</h4>
          <div className="text-sm space-y-1">
            <p><strong>Nom:</strong> {selectedAsset.name}</p>
            <p><strong>Symbole:</strong> {selectedAsset.symbol}</p>
            <p><strong>Type:</strong> {selectedAsset.type}</p>
            {selectedAsset.region && <p><strong>Région:</strong> {selectedAsset.region}</p>}
            {selectedAsset.currency && <p><strong>Devise:</strong> {selectedAsset.currency}</p>}
            <p><strong>Provider:</strong> {selectedAsset.provider}</p>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Instructions</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Tapez au moins 2 caractères pour déclencher la recherche</li>
          <li>• Utilisez ↑↓ pour naviguer dans les résultats</li>
          <li>• Appuyez sur Entrée pour sélectionner</li>
          <li>• Appuyez sur Échap pour fermer</li>
          <li>• La recherche couvre les actions et ETFs mondiaux</li>
        </ul>
      </div>
    </div>
  );
}