import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RecurringInvestment {
  id: string;
  assetId?: string; // Lien vers un asset existant
  assetName: string;
  assetType: 'STOCK' | 'CRYPTO' | 'LUXURY_WATCH' | 'COLLECTOR_CAR' | 'COMMODITY' | 'ETF';
  symbol?: string;
  monthlyAmount: number;
  currentPrice: number;
  estimatedShares: number;
  nextInvestmentDate: string;
  totalInvested: number;
  isActive: boolean;
  createdAt: string;
}

interface InvestmentsState {
  investments: RecurringInvestment[];
  addInvestment: (investment: Omit<RecurringInvestment, 'id' | 'createdAt'>) => void;
  updateInvestment: (id: string, updates: Partial<RecurringInvestment>) => void;
  removeInvestment: (id: string) => void;
  getInvestmentsByAsset: (assetId: string) => RecurringInvestment[];
  toggleInvestmentStatus: (id: string) => void;
}

export const useInvestmentsStore = create<InvestmentsState>()(persist(
    (set, get) => ({
  investments: [],

  addInvestment: (investmentData) => {
    const newInvestment: RecurringInvestment = {
      ...investmentData,
      id: `investment-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    set((state) => ({
      investments: [...state.investments, newInvestment]
    }));
  },

  updateInvestment: (id, updates) => {
    set((state) => ({
      investments: state.investments.map((investment) =>
        investment.id === id ? { ...investment, ...updates } : investment
      )
    }));
  },

  removeInvestment: (id) => {
    set((state) => ({
      investments: state.investments.filter((investment) => investment.id !== id)
    }));
  },

  getInvestmentsByAsset: (assetId) => {
    return get().investments.filter((investment) => investment.assetId === assetId);
  },

  toggleInvestmentStatus: (id) => {
    set((state) => ({
      investments: state.investments.map((investment) =>
        investment.id === id ? { ...investment, isActive: !investment.isActive } : investment
      )
    }));
  },
}),
    {
      name: 'investments-storage',
    }
  )
);