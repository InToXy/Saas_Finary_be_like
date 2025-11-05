import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CoinGeckoService } from './providers/coingecko.service';
import { AlphaVantageService } from './providers/alpha-vantage.service';
import { BinanceService } from './providers/binance.service';
import { YahooFinanceService } from './providers/yahoo-finance.service';
import { PriceHistoryService } from './providers/price-history.service';
import { PriceDataDto, BulkUpdateResponseDto } from './dto/price.dto';

@Injectable()
export class AggregationService {
  private readonly logger = new Logger(AggregationService.name);
  private readonly priceUpdatesEnabled: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly coinGecko: CoinGeckoService,
    private readonly alphaVantage: AlphaVantageService,
    private readonly binance: BinanceService,
    private readonly yahooFinance: YahooFinanceService,
    private readonly priceHistory: PriceHistoryService,
  ) {
    this.priceUpdatesEnabled = this.configService.get<boolean>('ENABLE_PRICE_UPDATES') !== false;
  }

  /**
   * Update price for a single asset
   */
  async updateAssetPrice(assetId: string): Promise<{ success: boolean; price?: number; error?: string }> {
    try {
      const asset = await this.prisma.asset.findUnique({
        where: { id: assetId },
        select: {
          id: true,
          type: true,
          symbol: true,
          currency: true,
          quantity: true,
          purchasePrice: true,
        },
      });

      if (!asset) {
        return { success: false, error: 'Asset not found' };
      }

      if (!asset.symbol) {
        return { success: false, error: 'Asset has no symbol' };
      }

      const priceData = await this.fetchPrice(asset.type, asset.symbol, asset.currency);

      if (!priceData) {
        return { success: false, error: 'Failed to fetch price' };
      }

      // Calculate values
      const currentPrice = priceData.price;
      const totalValue = currentPrice * asset.quantity;
      const totalGain = totalValue - (asset.purchasePrice * asset.quantity);
      const totalGainPercent = ((totalGain / (asset.purchasePrice * asset.quantity)) * 100);

      // Update asset
      await this.prisma.asset.update({
        where: { id: assetId },
        data: {
          currentPrice,
          totalValue,
          totalGain,
          totalGainPercent,
          lastPriceUpdate: new Date(),
        },
      });

      // Record in history
      await this.priceHistory.recordPrice(assetId, currentPrice, priceData.source);

      this.logger.log(`Updated price for asset ${assetId}: ${currentPrice} ${asset.currency}`);

      return { success: true, price: currentPrice };
    } catch (error: any) {
      this.logger.error(`Failed to update asset price ${assetId}: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update prices for multiple assets
   */
  async updateAssetsPrices(assetIds: string[]): Promise<BulkUpdateResponseDto> {
    const results: BulkUpdateResponseDto = {
      success: 0,
      failed: 0,
      details: [],
    };

    for (const assetId of assetIds) {
      const result = await this.updateAssetPrice(assetId);

      results.details.push({
        assetId,
        success: result.success,
        price: result.price,
        error: result.error,
      });

      if (result.success) {
        results.success++;
      } else {
        results.failed++;
      }
    }

    return results;
  }

  /**
   * Update all assets with automatic price tracking
   */
  async updateAllAssets(): Promise<BulkUpdateResponseDto> {
    try {
      const assets = await this.prisma.asset.findMany({
        where: {
          isActive: true,
          symbol: { not: null },
          type: {
            in: ['STOCK', 'ETF', 'CRYPTO', 'BOND', 'COMMODITY', 'FUND'],
          },
        },
        select: { id: true },
      });

      this.logger.log(`Found ${assets.length} assets to update`);

      return await this.updateAssetsPrices(assets.map(a => a.id));
    } catch (error: any) {
      this.logger.error(`Failed to update all assets: ${error.message}`);
      return { success: 0, failed: 0, details: [] };
    }
  }

  /**
   * Fetch price from appropriate provider based on asset type
   */
  private async fetchPrice(
    assetType: string,
    symbol: string,
    currency: string,
  ): Promise<PriceDataDto | null> {
    try {
      switch (assetType) {
        case 'CRYPTO':
          return await this.fetchCryptoPrice(symbol, currency);

        case 'STOCK':
        case 'ETF':
        case 'BOND':
        case 'FUND':
          return await this.fetchStockPrice(symbol);

        default:
          this.logger.warn(`Unsupported asset type for price fetching: ${assetType}`);
          return null;
      }
    } catch (error: any) {
      this.logger.error(`Failed to fetch price for ${symbol}: ${error.message}`);
      return null;
    }
  }

  /**
   * Fetch crypto price (CoinGecko primary, Binance fallback)
   */
  private async fetchCryptoPrice(symbol: string, currency: string): Promise<PriceDataDto | null> {
    // Try CoinGecko first
    const coinGeckoPrice = await this.coinGecko.getSimplePrice(symbol, currency.toLowerCase());
    if (coinGeckoPrice !== null) {
      return {
        price: coinGeckoPrice,
        currency,
        source: 'COINGECKO',
        timestamp: new Date(),
      };
    }

    // Fallback to Binance
    const binancePrice = await this.binance.getSimplePrice(symbol, currency);
    if (binancePrice !== null) {
      return {
        price: binancePrice,
        currency,
        source: 'BINANCE',
        timestamp: new Date(),
      };
    }

    this.logger.warn(`No price data available for crypto ${symbol}`);
    return null;
  }

  /**
   * Fetch stock price (Alpha Vantage primary, Yahoo Finance fallback)
   */
  private async fetchStockPrice(symbol: string): Promise<PriceDataDto | null> {
    // Try Alpha Vantage first
    if (this.alphaVantage.isEnabled()) {
      const alphaPrice = await this.alphaVantage.getPrice(symbol);
      if (alphaPrice) {
        return {
          price: alphaPrice.price,
          currency: 'USD', // Alpha Vantage returns USD by default
          source: 'ALPHA_VANTAGE',
          timestamp: alphaPrice.lastUpdated,
          metadata: alphaPrice,
        };
      }
    }

    // Fallback to Yahoo Finance
    if (this.yahooFinance.isEnabled()) {
      const yahooPrice = await this.yahooFinance.getSimplePrice(symbol);
      if (yahooPrice !== null) {
        return {
          price: yahooPrice,
          currency: 'USD',
          source: 'YAHOO_FINANCE',
          timestamp: new Date(),
        };
      }
    }

    this.logger.warn(`No price data available for stock ${symbol}`);
    return null;
  }

  /**
   * Search for assets across all providers
   */
  async searchAsset(query: string, type?: 'CRYPTO' | 'STOCK'): Promise<any[]> {
    const results: any[] = [];

    if (!type || type === 'CRYPTO') {
      const cryptoResults = await this.coinGecko.searchCoin(query);
      results.push(...cryptoResults.map(r => ({ ...r, type: 'CRYPTO', provider: 'COINGECKO' })));
    }

    if (!type || type === 'STOCK') {
      if (this.alphaVantage.isEnabled()) {
        const stockResults = await this.alphaVantage.search(query);
        results.push(...stockResults.map(r => ({ ...r, type: 'STOCK', provider: 'ALPHA_VANTAGE' })));
      }

      if (this.yahooFinance.isEnabled()) {
        const yahooResults = await this.yahooFinance.search(query);
        results.push(...yahooResults.map(r => ({ ...r, type: 'STOCK', provider: 'YAHOO_FINANCE' })));
      }
    }

    return results;
  }

  /**
   * CRON JOB: Update all asset prices every 4 hours
   */
  @Cron(CronExpression.EVERY_4_HOURS)
  async scheduledPriceUpdate() {
    if (!this.priceUpdatesEnabled) {
      this.logger.debug('Price updates are disabled');
      return;
    }

    this.logger.log('Starting scheduled price update...');

    const startTime = Date.now();
    const result = await this.updateAllAssets();
    const duration = Date.now() - startTime;

    this.logger.log(
      `Scheduled price update completed in ${duration}ms: ${result.success} success, ${result.failed} failed`,
    );
  }

  /**
   * CRON JOB: Clean old price history every day at 3 AM
   */
  @Cron('0 3 * * *')
  async scheduledHistoryCleanup() {
    if (!this.priceUpdatesEnabled) {
      return;
    }

    this.logger.log('Starting price history cleanup...');

    const deleted = await this.priceHistory.cleanOldHistory(365); // Keep 1 year

    this.logger.log(`Price history cleanup completed: ${deleted} records deleted`);
  }
}
