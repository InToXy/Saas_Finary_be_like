export class PriceDataDto {
  price: number;
  currency: string;
  source: string;
  timestamp: Date;
  metadata?: any;
}

export class CryptoPriceDto {
  symbol: string;
  name: string;
  price: number;
  priceChange24h?: number;
  priceChangePercentage24h?: number;
  marketCap?: number;
  volume24h?: number;
  lastUpdated: Date;
}

export class StockPriceDto {
  symbol: string;
  name?: string;
  price: number;
  open?: number;
  high?: number;
  low?: number;
  previousClose?: number;
  change?: number;
  changePercent?: number;
  volume?: number;
  lastUpdated: Date;
}

export class UpdatePriceDto {
  assetId: string;
  symbol: string;
  type: 'CRYPTO' | 'STOCK' | 'ETF';
}

export class BulkUpdateResponseDto {
  success: number;
  failed: number;
  details: Array<{
    assetId: string;
    success: boolean;
    price?: number;
    error?: string;
  }>;
}
