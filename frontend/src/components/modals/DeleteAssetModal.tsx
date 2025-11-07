import { AlertTriangle, X } from 'lucide-react';
import { useAssetsStore, type Asset } from '../../stores/assetsStore';
import { useInvestmentsStore } from '../../stores/investmentsStore';

interface DeleteAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
}

export function DeleteAssetModal({ isOpen, onClose, asset }: DeleteAssetModalProps) {
  const { removeAsset } = useAssetsStore();
  const { investments, removeInvestment } = useInvestmentsStore();

  if (!isOpen || !asset) return null;

  // Vérifier s'il y a des investissements programmés liés à cet asset
  const relatedInvestments = investments.filter(inv => inv.assetId === asset.id);
  const hasActiveInvestments = relatedInvestments.some(inv => inv.isActive);

  const handleDelete = () => {
    // Supprimer les investissements programmés liés
    relatedInvestments.forEach(investment => {
      removeInvestment(investment.id);
    });

    // Supprimer l'asset
    removeAsset(asset.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
              Supprimer l'asset
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6">
            <div className="mb-4">
              <p className="text-gray-700 mb-3">
                Êtes-vous sûr de vouloir supprimer définitivement cet asset ?
              </p>
              
              {/* Informations de l'asset */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">
                    {asset.type === 'CRYPTO' ? '₿' : 
                     asset.type === 'STOCK' ? '📈' : 
                     asset.type === 'LUXURY_WATCH' ? '⌚' : 
                     asset.type === 'COLLECTOR_CAR' ? '🚗' : 
                     asset.type === 'COMMODITY' ? '🏆' : '📊'}
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {asset.brand && asset.model ? `${asset.brand} ${asset.model}` : asset.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Valeur: €{asset.totalValue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Avertissement pour les investissements programmés */}
              {relatedInvestments.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-1">
                        Investissements programmés détectés
                      </h4>
                      <p className="text-sm text-yellow-700 mb-2">
                        Cet asset a {relatedInvestments.length} investissement{relatedInvestments.length > 1 ? 's' : ''} programmé{relatedInvestments.length > 1 ? 's' : ''} :
                      </p>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {relatedInvestments.map(inv => (
                          <li key={inv.id} className="flex items-center justify-between">
                            <span>• {inv.monthlyAmount}€/mois</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              inv.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {inv.isActive ? 'Actif' : 'Inactif'}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm text-yellow-700 mt-2 font-medium">
                        {hasActiveInvestments ? 
                          '⚠️ Ces investissements seront également supprimés !' :
                          'Ces investissements inactifs seront supprimés.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-500">
                <strong>Cette action est irréversible.</strong> Toutes les données associées, 
                y compris l'historique des prix et les images, seront perdues définitivement.
              </p>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}