import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CoinGeckoService } from './providers/coingecko.service';
import { AlphaVantageService } from './providers/alpha-vantage.service';
import { BinanceService } from './providers/binance.service';
import { YahooFinanceService } from './providers/yahoo-finance.service';
import { WatchMarketService } from './providers/watch-market.service';
import { CarValuationService } from './providers/car-valuation.service';
import { PriceHistoryService } from './providers/price-history.service';
import { FallbackSearchService } from './providers/fallback-search.service';
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
    private readonly watchMarket: WatchMarketService,
    private readonly carValuation: CarValuationService,
    private readonly priceHistory: PriceHistoryService,
    private readonly fallbackSearch: FallbackSearchService,
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
          brand: true,
          model: true,
          year: true,
          condition: true,
        },
      });

      if (!asset) {
        return { success: false, error: 'Asset not found' };
      }

      // For collectibles, we don't require symbol
      if (!asset.symbol && !['LUXURY_WATCH', 'COLLECTOR_CAR'].includes(asset.type)) {
        return { success: false, error: 'Asset has no symbol' };
      }

      const priceData = await this.fetchPrice(asset);

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

      return await this.updateAssetsPrices(assets.map((a: { id: string }) => a.id));
    } catch (error: any) {
      this.logger.error(`Failed to update all assets: ${error.message}`);
      return { success: 0, failed: 0, details: [] };
    }
  }

  /**
   * Fetch price from appropriate provider based on asset type
   */
  private async fetchPrice(asset: any): Promise<PriceDataDto | null> {
    try {
      switch (asset.type) {
        case 'CRYPTO':
          return await this.fetchCryptoPrice(asset.symbol, asset.currency);

        case 'STOCK':
        case 'ETF':
        case 'BOND':
        case 'FUND':
          return await this.fetchStockPrice(asset.symbol);

        case 'LUXURY_WATCH':
          return await this.fetchWatchPrice(asset);

        case 'COLLECTOR_CAR':
          return await this.fetchCarPrice(asset);

        case 'COMMODITY':
          return await this.fetchCommodityPrice(asset.symbol, asset.currency);

        default:
          this.logger.warn(`Unsupported asset type for price fetching: ${asset.type}`);
          return null;
      }
    } catch (error: any) {
      this.logger.error(`Failed to fetch price for asset ${asset.id}: ${error.message}`);
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
   * Fetch watch price using brand, model and year
   */
  private async fetchWatchPrice(asset: any): Promise<PriceDataDto | null> {
    if (!asset.brand || !asset.model) {
      this.logger.warn(`Watch asset ${asset.id} missing brand or model`);
      return null;
    }

    const watchData = await this.watchMarket.getEstimatedWatchValue(
      asset.brand,
      asset.model,
      asset.condition || 'good',
      asset.year,
    );

    if (watchData) {
      return {
        price: watchData.price,
        currency: watchData.currency,
        source: watchData.source,
        timestamp: watchData.lastUpdated,
        metadata: {
          estimatedValue: watchData.estimatedValue,
          marketTrend: watchData.marketTrend,
        },
      };
    }

    return null;
  }

  /**
   * Fetch car price using brand, model, year and other details
   */
  private async fetchCarPrice(asset: any): Promise<PriceDataDto | null> {
    if (!asset.brand || !asset.model || !asset.year) {
      this.logger.warn(`Car asset ${asset.id} missing brand, model or year`);
      return null;
    }

    // Try collector car valuation first if it's likely a collectible
    const currentYear = new Date().getFullYear();
    const age = currentYear - asset.year;

    if (age >= 25 || this.isLikelyCollectorCar(asset.brand, asset.model)) {
      const collectorData = await this.carValuation.getCollectorCarValue(
        asset.brand,
        asset.model,
        asset.year,
        'rare', // Default rarity - could be configurable
        asset.condition || 'good',
        true, // originalParts - could be configurable
        true, // documentation - could be configurable
      );

      if (collectorData) {
        return {
          price: collectorData.price,
          currency: collectorData.currency,
          source: collectorData.source,
          timestamp: collectorData.lastUpdated,
          metadata: {
            estimatedValue: collectorData.estimatedValue,
            marketTrend: collectorData.marketTrend,
          },
        };
      }
    }

    // Fall back to regular car valuation
    const carData = await this.carValuation.getCarValue(
      asset.brand,
      asset.model,
      asset.year,
      undefined, // mileage - could be added to asset model
      undefined, // fuelType - could be added to asset model
      asset.condition,
    );

    if (carData) {
      return {
        price: carData.price,
        currency: carData.currency,
        source: carData.source,
        timestamp: carData.lastUpdated,
        metadata: {
          estimatedValue: carData.estimatedValue,
          marketTrend: carData.marketTrend,
        },
      };
    }

    return null;
  }

  /**
   * Fetch commodity prices (gold, silver, oil, etc.)
   */
  private async fetchCommodityPrice(symbol: string, currency: string): Promise<PriceDataDto | null> {
    // Use Yahoo Finance for commodities as fallback
    if (this.yahooFinance.isEnabled()) {
      const commodityPrice = await this.yahooFinance.getSimplePrice(symbol);
      if (commodityPrice !== null) {
        return {
          price: commodityPrice,
          currency: 'USD',
          source: 'YAHOO_FINANCE',
          timestamp: new Date(),
        };
      }
    }

    this.logger.warn(`No price data available for commodity ${symbol}`);
    return null;
  }

  private isLikelyCollectorCar(brand: string, model: string): boolean {
    const collectorBrands = [
      'ferrari', 'lamborghini', 'porsche', 'aston martin', 'mclaren',
      'bugatti', 'koenigsegg', 'pagani', 'lotus', 'alpine',
    ];

    const collectorModels = [
      'golf gti', 'bmw m3', '911 turbo', 'type r', 'rs', 'amg', 'quattro'
    ];

    return collectorBrands.some(b => brand.toLowerCase().includes(b)) ||
           collectorModels.some(m => model.toLowerCase().includes(m));
  }

  /**
   * Search for assets across all providers
   */
  async searchAsset(query: string, type?: 'CRYPTO' | 'STOCK' | 'ETF' | 'LUXURY_WATCH' | 'COLLECTOR_CAR'): Promise<any[]> {
    const results: any[] = [];

    if (!type || type === 'CRYPTO') {
      try {
        const cryptoResults = await this.coinGecko.searchCoin(query);
        results.push(...cryptoResults.map(r => ({ ...r, type: 'CRYPTO', provider: 'COINGECKO' })));
      } catch (error) {
        this.logger.warn('CoinGecko search failed, using fallback');
        const fallbackResults = this.fallbackSearch.search(query, 'CRYPTO');
        results.push(...fallbackResults.map(r => ({ ...r, provider: 'FALLBACK' })));
      }
    }

    if (!type || type === 'STOCK' || type === 'ETF') {
      // Try Alpha Vantage first
      if (this.alphaVantage.isEnabled()) {
        try {
          const stockResults = await this.alphaVantage.search(query);
          results.push(...stockResults.map(r => ({ ...r, type: 'STOCK', provider: 'ALPHA_VANTAGE' })));
        } catch (error) {
          this.logger.warn('Alpha Vantage search failed');
        }
      }

      // Yahoo Finance temporarily disabled due to v3 compatibility issues
      // TODO: Fix Yahoo Finance initialization for v3+
      if (false && this.yahooFinance.isEnabled()) {
        try {
          const yahooResults = await this.yahooFinance.search(query);
          results.push(...yahooResults.map(r => ({ ...r, type: 'STOCK', provider: 'YAHOO_FINANCE' })));
        } catch (error) {
          this.logger.warn('Yahoo Finance search failed, skipping');
        }
      }

      // Always try fallback search for stocks and ETFs
      if (results.length === 0 || !this.alphaVantage.isEnabled()) {
        this.logger.log('Using fallback search for stocks/ETFs');
        const fallbackStocks = this.fallbackSearch.search(query, type === 'ETF' ? 'ETF' : 'STOCK');
        results.push(...fallbackStocks.map(r => ({ ...r, provider: 'FALLBACK' })));
        
        // If searching for both or no specific type, also search ETFs
        if (!type || type === 'ETF') {
          const fallbackETFs = this.fallbackSearch.search(query, 'ETF');
          results.push(...fallbackETFs.map(r => ({ ...r, provider: 'FALLBACK' })));
        }
      }
    }

    if (!type || type === 'LUXURY_WATCH') {
      if (this.watchMarket.isEnabled()) {
        const watchResults = await this.watchMarket.searchWatch(query);
        results.push(...watchResults.map(r => ({ ...r, type: 'LUXURY_WATCH', provider: 'WATCH_MARKET' })));
      }
    }

    if (!type || type === 'COLLECTOR_CAR') {
      if (this.carValuation.isEnabled()) {
        const carResults = await this.carValuation.searchCar(query);
        results.push(...carResults.map(r => ({ ...r, type: 'COLLECTOR_CAR', provider: 'CAR_VALUATION' })));
      }
    }

    this.logger.log(`Search for "${query}" (type: ${type}): found ${results.length} results`);
    return results;
  }

  /**
   * Get current price for a specific symbol
   */
  async getCurrentPrice(symbol: string, type?: 'CRYPTO' | 'STOCK' | 'ETF'): Promise<{ symbol: string; price: number; currency: string; source: string; lastUpdated: Date } | null> {
    try {
      this.logger.log(`Fetching current price for symbol: ${symbol}, type: ${type}`);

      // Determine asset type if not provided
      const assetType = type || (symbol.match(/^[A-Z]{1,5}$/) ? 'STOCK' : 'CRYPTO');

      switch (assetType) {
        case 'CRYPTO':
          const cryptoPrice = await this.fetchCryptoPrice(symbol, 'USD');
          if (cryptoPrice) {
            return {
              symbol,
              price: cryptoPrice.price,
              currency: cryptoPrice.currency,
              source: cryptoPrice.source,
              lastUpdated: cryptoPrice.timestamp,
            };
          }
          break;

        case 'STOCK':
        case 'ETF':
          const stockPrice = await this.fetchStockPrice(symbol);
          if (stockPrice) {
            return {
              symbol,
              price: stockPrice.price,
              currency: stockPrice.currency,
              source: stockPrice.source,
              lastUpdated: stockPrice.timestamp,
            };
          }
          break;
      }

      this.logger.warn(`No price found for symbol: ${symbol}`);
      return null;
    } catch (error: any) {
      this.logger.error(`Failed to get current price for ${symbol}: ${error.message}`);
      return null;
    }
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
