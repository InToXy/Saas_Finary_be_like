import { AssetType } from '../../../types/prisma-types';

export class AssetResponseDto {
  id: string;
  userId: string;
  accountId?: string;
  name: string;
  type: AssetType;
  symbol?: string;
  isin?: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate?: Date;
  monthlyInvestment?: number;
  currentPrice: number;
  currency: string;
  totalValue: number;
  totalGain: number;
  totalGainPercent: number;
  lastPriceUpdate?: Date;
  isActive: boolean;
  description?: string;
  brand?: string;
  model?: string;
  year?: number;
  condition?: string;
  serialNumber?: string;
  certification?: string;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
