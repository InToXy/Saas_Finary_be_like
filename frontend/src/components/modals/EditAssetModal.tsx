import { useState, useRef, useEffect } from 'react';
import { X, Upload, Trash2, Wand2 } from 'lucide-react';
import { useAssetsStore, type Asset } from '../../stores/assetsStore';
import { ImageService } from '../../services/imageService';
import { AutoImageNotification } from '../ui/AutoImageNotification';

interface EditAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
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
  monthlyInvestment?: number;
  notes?: string;
}

export function EditAssetModal({ isOpen, onClose, asset }: EditAssetModalProps) {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [autoImages, setAutoImages] = useState<string[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateAsset } = useAssetsStore();
  
  const [formData, setFormData] = useState<AssetFormData>({
    type: asset.type,
    name: asset.name,
    symbol: asset.symbol || '',
    brand: asset.brand || '',
    model: asset.model || '',
    year: asset.year,
    condition: asset.condition || '',
    quantity: asset.quantity,
    purchasePrice: asset.purchasePrice,
    purchaseDate: new Date(asset.purchaseDate).toISOString().split('T')[0],
    monthlyInvestment: asset.monthlyInvestment,
    notes: asset.notes || ''
  });

  useEffect(() => {
    if (asset.images) {
      setExistingImages([...asset.images]);
    }
  }, [asset.images]);

  if (!isOpen) return null;

  const watchConditions = ['Neuve', 'Comme neuve', 'Excellente', 'Très bon état', 'Bon état', 'État correct'];
  const carConditions = ['Concours', 'Excellente', 'Très bonne', 'Bonne', 'Correcte', 'À restaurer'];

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const maxImages = 5;
    const currentCount = selectedImages.length + existingImages.length;
    const availableSlots = maxImages - currentCount;
    const filesToAdd = files.slice(0, availableSlots);

    const maxSize = 10 * 1024 * 1024; // 10MB
    const validFiles = filesToAdd.filter(file => {
      if (file.size > maxSize) {
        alert(`Le fichier "${file.name}" est trop volumineux (max 10MB)`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        alert(`Le fichier "${file.name}" n'est pas une image`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setSelectedImages(prev => [...prev, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageRemove = (index: number, isExisting = false) => {
    if (isExisting) {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setSelectedImages(prev => prev.filter((_, i) => i !== index));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const maxImages = 5;
    const currentCount = selectedImages.length + existingImages.length;
    const availableSlots = maxImages - currentCount;
    const filesToAdd = files.slice(0, availableSlots);

    const maxSize = 10 * 1024 * 1024;
    const validFiles = filesToAdd.filter(file => {
      if (file.size > maxSize) {
        alert(`Le fichier "${file.name}" est trop volumineux (max 10MB)`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        alert(`Le fichier "${file.name}" n'est pas une image`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setSelectedImages(prev => [...prev, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newImageUrls = imagePreviews.length > 0 ? imagePreviews : [];
    
    const allImages = [...existingImages, ...autoImages, ...newImageUrls];
    
    const updates = {
      ...formData,
      hasImages: allImages.length > 0,
      images: allImages,
      lastUpdate: new Date().toISOString()
    };
    
    updateAsset(asset.id, updates);
    onClose();
    resetForm();
  };
  
  const resetForm = () => {
    setSelectedImages([]);
    setImagePreviews([]);
    setAutoImages([]);
    setExistingImages(asset.images || []);
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
          setShowNotification(true);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des images:', error);
      }
    }
  };
  
  // Déclencher la recherche d'images quand brand/model changent
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.brand && formData.model) {
        fetchAutoImages();
      } else {
        setAutoImages([]);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [formData.brand, formData.model, formData.year, formData.type]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => { onClose(); resetForm(); }} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Modifier {asset.name}
            </h2>
            <button
              onClick={() => { onClose(); resetForm(); }}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
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

              {/* Monthly Investment (for stocks/ETF/crypto/commodity) */}
              {(formData.type === 'STOCK' || formData.type === 'ETF' || formData.type === 'CRYPTO' || formData.type === 'COMMODITY') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investissement mensuel (€) - Optionnel
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.monthlyInvestment || ''}
                    onChange={(e) => setFormData({ ...formData, monthlyInvestment: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="Montant à investir chaque mois"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Image Upload (for watches/cars) */}
              {(formData.type === 'LUXURY_WATCH' || formData.type === 'COLLECTOR_CAR') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photos - {existingImages.length + selectedImages.length}/5
                  </label>
                  
                  {/* Existing Images */}
                  {existingImages.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-3">Images existantes :</p>
                      <div className="grid grid-cols-3 gap-3">
                        {existingImages.map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={imageUrl}
                              alt={`Existing ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => handleImageRemove(index, true)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Images automatiques */}
                  {autoImages.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-green-600 mb-3 flex items-center">
                        <Wand2 className="w-4 h-4 mr-1" />
                        Images trouvées automatiquement :
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {autoImages.map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={imageUrl}
                              alt={`Auto ${index + 1}`}
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
                  
                  {/* Upload Area */}
                  {(existingImages.length + autoImages.length + selectedImages.length) < 5 && (
                    <div
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
                    >
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        Glissez vos nouvelles photos ici ou cliquez pour sélectionner
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG jusqu'à 10MB
                      </p>
                    </div>
                  )}
                  
                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  
                  {/* New Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-3">Images ajoutées manuellement :</p>
                      <div className="grid grid-cols-3 gap-3">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`New Preview ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => handleImageRemove(index, false)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                  onClick={() => { onClose(); resetForm(); }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Notification d'images automatiques */}
      <AutoImageNotification 
        show={showNotification}
        imagesCount={autoImages.length}
        brand={formData.brand || ''}
        model={formData.model || ''}
      />
    </div>
  );
}