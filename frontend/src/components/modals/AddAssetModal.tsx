import { useState, useRef, useEffect } from 'react';
import { X, Search, Upload, Trash2, Wand2, Check } from 'lucide-react';
import { useAssetsStore } from '../../stores/assetsStore';
import { useAuthStore } from '../../stores/authStore';
import { StockSearchMenu } from '../search/StockSearchMenu';
import { ImageService } from '../../services/imageService';
import api from '../../services/api';

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
  currentPrice: number;
  purchaseDate: string;
  monthlyInvestment?: number;
  notes?: string;
}

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  region?: string;
  currency?: string;
  provider: string;
}

export function AddAssetModal({ isOpen, onClose }: AddAssetModalProps) {
  console.log('🔄 AddAssetModal rendu, props:', { isOpen, onClose: typeof onClose });
  
  const { addAsset, assets } = useAssetsStore();
  const { user, accessToken, isAuthenticated } = useAuthStore();
  const [formData, setFormData] = useState<AssetFormData>({
    type: 'STOCK',
    name: '',
    quantity: 1,
    purchasePrice: 0,
    currentPrice: 0,
    purchaseDate: new Date().toISOString().split('T')[0]
  });

  // State pour le chargement du prix
  const [loadingPrice, setLoadingPrice] = useState(false);
  
  // State pour les images automatiques
  const [autoImages, setAutoImages] = useState<string[]>([]);

  // Debug auth info
  useEffect(() => {
    if (isOpen) {
      console.log('🔐 Auth Debug Info:', {
        isAuthenticated,
        hasUser: !!user,
        hasToken: !!accessToken,
        userEmail: user?.email,
        tokenLength: accessToken?.length
      });
    }
  }, [isOpen, isAuthenticated, user, accessToken]);

  // Fonction pour récupérer le prix actuel via l'API
  const fetchCurrentPrice = async (symbol: string, type: string = 'STOCK') => {
    if (!symbol) return;
    
    setLoadingPrice(true);
    try {
      console.log('💰 Récupération du prix pour:', symbol, 'type:', type);
      
      // Essayer d'abord l'endpoint de prix dédié
      const priceResponse = await api.get(`/aggregation/price/${symbol}?type=${type}`);
      
      if (priceResponse.data && priceResponse.data.price) {
        const fetchedPrice = priceResponse.data.price;
        setFormData(prev => ({ ...prev, currentPrice: fetchedPrice }));
        console.log('💰 Prix récupéré via API:', fetchedPrice, priceResponse.data.currency);
        return;
      }
    } catch (priceError) {
      console.warn('⚠️ API prix indisponible pour', symbol);
      // Afficher une erreur claire à l'utilisateur
      alert(`⚠️ Service de prix temporairement indisponible pour ${symbol}. Veuillez entrer le prix manuellement.`);
    } finally {
      setLoadingPrice(false);
    }
  };

  // Fonction pour récupérer automatiquement les images
  const fetchAutoImages = async () => {
    if ((formData.type === 'LUXURY_WATCH' || formData.type === 'COLLECTOR_CAR') && 
        formData.brand && formData.model) {
      try {
        const images = await ImageService.getAssetImages({
          type: formData.type,
          brand: formData.brand,
          model: formData.model,
          year: formData.year
        });
        
        const imageUrls = images.map(img => img.url);
        setAutoImages(imageUrls);
        if (imageUrls.length > 0) {
          console.log(`🖼️ ${imageUrls.length} images trouvées pour ${formData.brand} ${formData.model}`);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des images:', error);
      }
    }
  };

  // Déclencher la recherche d'images quand brand/model changent
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.brand && formData.model && (formData.type === 'LUXURY_WATCH' || formData.type === 'COLLECTOR_CAR')) {
        fetchAutoImages();
      } else {
        setAutoImages([]);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [formData.brand, formData.model, formData.year, formData.type]);

  
  if (!isOpen) {
    console.log('🚫 Modal fermé, isOpen:', isOpen);
    return null;
  }
  
  console.log('✅ Modal ouvert, isOpen:', isOpen);

  // Handle selecting a search result
  const handleSelectSearchResult = (result: SearchResult) => {
    setFormData(prev => ({
      ...prev,
      name: result.name,
      symbol: result.symbol
    }));
    
    // Récupérer automatiquement le prix actuel
    if (result.symbol) {
      fetchCurrentPrice(result.symbol, result.type);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Début du handleSubmit');
    console.log('📝 FormData:', formData);
    console.log('🔐 isAuthenticated:', isAuthenticated);
    console.log('👤 User:', user);
    console.log('🎫 AccessToken exists:', !!accessToken);
    
    // Validation de l'authentification
    if (!isAuthenticated) {
      alert('Vous devez être connecté pour ajouter un asset');
      return;
    }
    
    // Validation simple
    if (!formData.name || formData.name.trim() === '') {
      alert('Veuillez entrer un nom pour l\'asset');
      return;
    }
    
    if (formData.quantity <= 0 || formData.purchasePrice <= 0 || formData.currentPrice <= 0) {
      alert('La quantité, le prix d\'achat et le prix actuel doivent être supérieurs à zéro');
      return;
    }

    try {
      console.log('📤 Appel de addAsset...');
      
      // Ajouter les images automatiques aux données
      const assetDataWithImages = {
        ...formData,
        hasImages: autoImages.length > 0,
        images: autoImages
      };
      
      await addAsset(assetDataWithImages);
      console.log('✅ Asset ajouté avec succès');
      onClose();
      
      // Reset form
      setFormData({
        type: 'STOCK',
        name: '',
        quantity: 1,
        purchasePrice: 0,
        currentPrice: 0,
        purchaseDate: new Date().toISOString().split('T')[0]
      });
      setAutoImages([]);
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout:', error);
      console.error('❌ Type d\'erreur:', typeof error);
      console.error('❌ Message:', error?.message);
      console.error('❌ Stack:', error?.stack);
      alert('Erreur lors de l\'ajout de l\'asset. Consultez la console pour plus de détails.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Ajouter un Asset</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type d'asset */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type d'asset
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="STOCK">📈 Actions</option>
              <option value="CRYPTO">₿ Cryptomonnaies</option>
              <option value="LUXURY_WATCH">⌚ Montres de luxe</option>
              <option value="COLLECTOR_CAR">🚗 Voitures de collection</option>
              <option value="COMMODITY">🏆 Matières premières</option>
              <option value="ETF">📊 ETF</option>
            </select>
          </div>

          {/* Search & Nom */}
          {(formData.type === 'STOCK' || formData.type === 'ETF' || formData.type === 'CRYPTO') ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher {formData.type === 'STOCK' ? 'une action' : formData.type === 'ETF' ? 'un ETF' : 'une cryptomonnaie'}
              </label>
              <StockSearchMenu
                onSelect={handleSelectSearchResult}
                placeholder={`Rechercher ${formData.type === 'STOCK' ? 'une action' : formData.type === 'ETF' ? 'un ETF' : 'une cryptomonnaie'}...`}
                className="w-full"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'asset
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Rolex Submariner, Ferrari 250 GT..."
                required
              />
            </div>
          )}

          {/* Manual name input for selected assets */}
          {(formData.type === 'STOCK' || formData.type === 'ETF' || formData.type === 'CRYPTO') && formData.name && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asset sélectionné
              </label>
              <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-green-800">{formData.name} ({formData.symbol})</span>
              </div>
            </div>
          )}

          {/* Brand and Model (for watches/cars) */}
          {(formData.type === 'LUXURY_WATCH' || formData.type === 'COLLECTOR_CAR') && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marque *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.brand || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    placeholder={formData.type === 'LUXURY_WATCH' ? 'Submariner, Nautilus...' : '911, F40...'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Year and Condition */}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) || undefined }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    État
                  </label>
                  <select
                    value={formData.condition || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner...</option>
                    {(formData.type === 'LUXURY_WATCH' ? 
                      ['Neuve', 'Comme neuve', 'Excellente', 'Très bon état', 'Bon état', 'État correct'] : 
                      ['Concours', 'Excellente', 'Très bonne', 'Bonne', 'Correcte', 'À restaurer']
                    ).map(condition => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Images automatiques */}
              {autoImages.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Images trouvées automatiquement
                  </label>
                  <p className="text-sm text-green-600 mb-3 flex items-center">
                    <Wand2 className="w-4 h-4 mr-1" />
                    {autoImages.length} images trouvées pour {formData.brand} {formData.model}
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {autoImages.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`${formData.brand} ${formData.model} ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg border border-green-200"
                        />
                        <button
                          type="button"
                          onClick={() => setAutoImages(prev => prev.filter((_, i) => i !== index))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Quantité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantité
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Prix d'achat */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prix d'achat (€)
            </label>
            <input
              type="number"
              value={formData.purchasePrice}
              onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Prix actuel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prix actuel (€)
              {loadingPrice && (
                <span className="ml-2 text-blue-600 text-xs">
                  🔄 Récupération du prix...
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.currentPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, currentPrice: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="0.01"
                required
                placeholder="Prix de marché actuel"
                disabled={loadingPrice}
              />
              {loadingPrice && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                💡 Prix récupéré automatiquement (si l'API fonctionne)
              </p>
              {formData.symbol && (
                <button
                  type="button"
                  onClick={() => fetchCurrentPrice(formData.symbol!, formData.type)}
                  disabled={loadingPrice}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
                >
                  🔄 Actualiser le prix
                </button>
              )}
            </div>
          </div>

          {/* Date d'achat */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date d'achat
            </label>
            <input
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Debug d'authentification */}
          {!isAuthenticated && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-800 text-sm">
                ⚠️ Problème d'authentification détecté. Veuillez vous reconnecter.
              </p>
            </div>
          )}

          {/* Boutons */}
          <div className="flex space-x-4 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit"
              disabled={!isAuthenticated}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                isAuthenticated 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isAuthenticated ? 'Ajouter' : 'Non connecté'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}