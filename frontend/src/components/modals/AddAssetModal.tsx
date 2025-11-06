import { useState } from 'react';
import { X, Search, Upload } from 'lucide-react';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AssetFormData {
  type: 'STOCK' | 'CRYPTO' | 'LUXURY_WATCH' | 'COLLECTOR_CAR' | 'COMMODITY' | 'ETF';
  name: string;
  symbol?: string;
  brand?: string;
  model?: string;
  year?: number;
  condition?: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  notes?: string;
}

export function AddAssetModal({ isOpen, onClose }: AddAssetModalProps) {
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<AssetFormData>({
    type: 'STOCK',
    name: '',
    quantity: 1,
    purchasePrice: 0,
    purchaseDate: new Date().toISOString().split('T')[0]
  });

  if (!isOpen) return null;

  const assetTypes = [
    { value: 'STOCK', label: 'Actions', icon: '📈', description: 'Actions individuelles, ETF listés' },
    { value: 'CRYPTO', label: 'Cryptomonnaies', icon: '₿', description: 'Bitcoin, Ethereum, altcoins' },
    { value: 'LUXURY_WATCH', label: 'Montres de luxe', icon: '⌚', description: 'Rolex, Patek Philippe, AP...' },
    { value: 'COLLECTOR_CAR', label: 'Voitures de collection', icon: '🚗', description: 'Voitures classiques et sportives' },
    { value: 'COMMODITY', label: 'Matières premières', icon: '🏆', description: 'Or, argent, pétrole...' },
  ];

  const watchConditions = ['Neuve', 'Comme neuve', 'Excellente', 'Très bon état', 'Bon état', 'État correct'];
  const carConditions = ['Concours', 'Excellente', 'Très bonne', 'Bonne', 'Correcte', 'À restaurer'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding asset:', formData);
    onClose();
    setStep(1);
    setFormData({
      type: 'STOCK',
      name: '',
      quantity: 1,
      purchasePrice: 0,
      purchaseDate: new Date().toISOString().split('T')[0]
    });
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Choisissez le type d'asset</h3>
            <div className="grid grid-cols-1 gap-3">
              {assetTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => {
                    setFormData({ ...formData, type: type.value as any });
                    setStep(2);
                  }}
                  className="flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                >
                  <span className="text-2xl">{type.icon}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{type.label}</h4>
                    <p className="text-sm text-gray-500">{type.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">
                {assetTypes.find(t => t.value === formData.type)?.icon}
              </span>
              <h3 className="text-lg font-semibold text-gray-900">
                Ajouter {assetTypes.find(t => t.value === formData.type)?.label}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Search for existing assets */}
              {(formData.type === 'STOCK' || formData.type === 'CRYPTO') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rechercher
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder={formData.type === 'STOCK' ? 'Nom ou symbole (ex: AAPL, Tesla)' : 'Nom de crypto (ex: BTC, Ethereum)'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Asset Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'asset *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={
                    formData.type === 'LUXURY_WATCH' ? 'ex: Rolex Submariner' :
                    formData.type === 'COLLECTOR_CAR' ? 'ex: Porsche 911 Turbo' :
                    'Nom de l\'asset'
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Symbol (for stocks/crypto) */}
              {(formData.type === 'STOCK' || formData.type === 'CRYPTO' || formData.type === 'COMMODITY') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Symbole
                  </label>
                  <input
                    type="text"
                    value={formData.symbol || ''}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    placeholder={
                      formData.type === 'STOCK' ? 'AAPL, TSLA...' :
                      formData.type === 'CRYPTO' ? 'BTC, ETH...' : 'GOLD, OIL...'
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Brand and Model (for watches/cars) */}
              {(formData.type === 'LUXURY_WATCH' || formData.type === 'COLLECTOR_CAR') && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marque *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.brand || ''}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder={formData.type === 'LUXURY_WATCH' ? 'Rolex, Patek Philippe...' : 'Porsche, Ferrari...'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Modèle *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.model || ''}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder={formData.type === 'LUXURY_WATCH' ? 'Submariner, Nautilus...' : '911, F40...'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Year and Condition (for watches/cars) */}
              {(formData.type === 'LUXURY_WATCH' || formData.type === 'COLLECTOR_CAR') && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Année
                    </label>
                    <input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={formData.year || ''}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      État
                    </label>
                    <select
                      value={formData.condition || ''}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Sélectionner...</option>
                      {(formData.type === 'LUXURY_WATCH' ? watchConditions : carConditions).map(condition => (
                        <option key={condition} value={condition}>{condition}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Quantity and Purchase Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantité *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step={formData.type === 'CRYPTO' ? '0.00001' : '1'}
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix d'achat (€) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Purchase Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date d'achat
                </label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Image Upload (for watches/cars) */}
              {(formData.type === 'LUXURY_WATCH' || formData.type === 'COLLECTOR_CAR') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photos (optionnel)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Glissez vos photos ici ou cliquez pour sélectionner
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG jusqu'à 10MB
                    </p>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Informations complémentaires..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ajouter l'asset
                </button>
              </div>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {step === 1 ? 'Nouvel Asset' : 'Informations Asset'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6">
            {renderStepContent()}
          </div>
        </div>
      </div>
    </div>
  );
}