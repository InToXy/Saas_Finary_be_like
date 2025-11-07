import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export interface Asset {
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
  purchaseDate: string;
  lastUpdate: string;
  hasImages?: boolean;
  hasPrediction?: boolean;
  predictionChange?: number;
  monthlyInvestment?: number;
  notes?: string;
  images?: string[];
}

interface AssetsState {
  assets: Asset[];
  loading: boolean;
  error: string | null;
  fetchAssets: () => Promise<void>;
  addAsset: (asset: Omit<Asset, 'id' | 'currentPrice' | 'totalValue' | 'gain' | 'gainPercent' | 'lastUpdate'>) => Promise<void>;
  updateAsset: (id: string, updates: Partial<Asset>) => Promise<void>;
  removeAsset: (id: string) => Promise<void>;
  getAssetsByType: (type: string) => Asset[];
}

// Note: Prix réels récupérés via l'API backend

// Convert API asset to store format
const convertApiAsset = (apiAsset: any): Asset => ({
  id: apiAsset.id,
  name: apiAsset.name,
  type: apiAsset.type,
  symbol: apiAsset.symbol,
  brand: apiAsset.brand,
  model: apiAsset.model,
  year: apiAsset.year,
  condition: apiAsset.condition,
  quantity: apiAsset.quantity,
  purchasePrice: apiAsset.purchasePrice,
  currentPrice: apiAsset.currentPrice,
  totalValue: apiAsset.totalValue,
  gain: apiAsset.totalGain,
  gainPercent: apiAsset.totalGainPercent,
  purchaseDate: apiAsset.purchaseDate || new Date().toISOString(),
  lastUpdate: apiAsset.lastPriceUpdate || new Date().toISOString(),
  hasImages: apiAsset.hasImages || false,
  hasPrediction: false, // Will be updated when we implement predictions
  predictionChange: undefined,
  monthlyInvestment: apiAsset.monthlyInvestment,
  notes: apiAsset.notes || apiAsset.description,
  images: apiAsset.images || []
});

export const useAssetsStore = create<AssetsState>()(persist(
    (set, get) => ({
  assets: [],
  loading: false,
  error: null,

  fetchAssets: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/assets');
      const convertedAssets = response.data.map(convertApiAsset);
      set({ assets: convertedAssets, loading: false });
    } catch (error: any) {
      console.error('Failed to fetch assets:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to load assets',
        loading: false 
      });
    }
  },

  addAsset: async (assetData) => {
    try {
      console.log('📤 Données envoyées à l\'API:', assetData);
      console.log('🔐 Token d\'auth disponible:', !!api.defaults.headers.Authorization);
      
      const response = await api.post('/assets', assetData);
      console.log('📥 Réponse de l\'API:', response.data);
      
      // Refresh assets from server to ensure consistency
      await get().fetchAssets();
      console.log('🔄 Assets rechargés depuis le serveur après ajout');
    } catch (error: any) {
      console.error('❌ Failed to add asset:', error);
      console.error('❌ Détails de l\'erreur:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      set({ error: error.response?.data?.message || 'Failed to add asset' });
      throw error; // Re-throw pour que le modal puisse l'afficher
    }
  },

  updateAsset: async (id, updates) => {
    try {
      const response = await api.patch(`/assets/${id}`, updates);
      const updatedAsset = convertApiAsset(response.data);
      set((state) => ({
        assets: state.assets.map((asset) => 
          asset.id === id ? updatedAsset : asset
        )
      }));
    } catch (error: any) {
      console.error('Failed to update asset:', error);
      set({ error: error.response?.data?.message || 'Failed to update asset' });
    }
  },

  removeAsset: async (id) => {
    try {
      await api.delete(`/assets/${id}`);
      set((state) => ({
        assets: state.assets.filter((asset) => asset.id !== id)
      }));
    } catch (error: any) {
      console.error('Failed to remove asset:', error);
      set({ error: error.response?.data?.message || 'Failed to remove asset' });
    }
  },

  getAssetsByType: (type) => {
    return get().assets.filter((asset) => type === 'ALL' || asset.type === type);
  },
}),
    {
      name: 'assets-storage',
    }
  )
);