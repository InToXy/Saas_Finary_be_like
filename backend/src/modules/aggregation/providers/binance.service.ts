import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { CryptoPriceDto } from '../dto/price.dto';

@Injectable()
export class BinanceService {
  private readonly logger = new Logger(BinanceService.name);
  private readonly apiUrl: string;
  private readonly client: AxiosInstance;
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('BINANCE_API_URL') || 'https://api.binance.com/api/v3';
    this.enabled = this.configService.get<boolean>('BINANCE_ENABLED') !== false;

    this.client = axios.create({
      baseURL: this.apiUrl,
      timeout: 10000,
    });
  }

  /**
   * Get current price for a crypto pair
   */
  async getPrice(symbol: string, currency = 'EUR'): Promise<CryptoPriceDto | null> {
    if (!this.enabled) {
      return null;
    }

    try {
      const pair = this.formatPair(symbol, currency);

      // Get current price
      const priceResponse = await this.client.get('/ticker/price', {
        params: { symbol: pair },
      });

      // Get 24h stats
      const statsResponse = await this.client.get('/ticker/24hr', {
        params: { symbol: pair },
      });

      if (!priceResponse.data || !statsResponse.data) {
        return null;
      }

      const stats = statsResponse.data;

      return {
        symbol: symbol.toUpperCase(),
        name: symbol.toUpperCase(),
        price: parseFloat(priceResponse.data.price),
        priceChange24h: parseFloat(stats.priceChange),
        priceChangePercentage24h: parseFloat(stats.priceChangePercent),
        volume24h: parseFloat(stats.volume),
        lastUpdated: new Date(),
      };
    } catch (error: any) {
      this.logger.error(`Failed to fetch price for ${symbol}: ${error.message}`);
      return null;
    }
  }

  /**
   * Get prices for multiple pairs
   */
  async getPrices(symbols: string[], currency = 'EUR'): Promise<Map<string, CryptoPriceDto>> {
    if (!this.enabled) {
      return new Map();
    }

    const prices = new Map<string, CryptoPriceDto>();

    try {
      // Get all prices at once
      const pricesResponse = await this.client.get('/ticker/price');
      const statsResponse = await this.client.get('/ticker/24hr');

      const pricesMap = new Map(
        pricesResponse.data.map((item: any) => [item.symbol, parseFloat(item.price)])
      );

      const statsMap = new Map(
        statsResponse.data.map((item: any) => [
          item.symbol,
          {
            priceChange: parseFloat(item.priceChange),
            priceChangePercent: parseFloat(item.priceChangePercent),
            volume: parseFloat(item.volume),
          },
        ])
      );

      for (const symbol of symbols) {
        const pair = this.formatPair(symbol, currency);
        const price = pricesMap.get(pair);
        const stats = statsMap.get(pair);

        if (price && stats) {
          prices.set(symbol.toUpperCase(), {
            symbol: symbol.toUpperCase(),
            name: symbol.toUpperCase(),
            price,
            priceChange24h: stats.priceChange,
            priceChangePercentage24h: stats.priceChangePercent,
            volume24h: stats.volume,
            lastUpdated: new Date(),
          });
        }
      }
    } catch (error: any) {
      this.logger.error(`Failed to fetch multiple prices: ${error.message}`);
    }

    return prices;
  }

  /**
   * Get simple price (faster)
   */
  async getSimplePrice(symbol: string, currency = 'EUR'): Promise<number | null> {
    if (!this.enabled) {
      return null;
    }

    try {
      const pair = this.formatPair(symbol, currency);

      const response = await this.client.get('/ticker/price', {
        params: { symbol: pair },
      });

      if (response.data && response.data.price) {
        return parseFloat(response.data.price);
      }

      return null;
    } catch (error: any) {
      this.logger.error(`Failed to fetch simple price for ${symbol}: ${error.message}`);
      return null;
    }
  }

  /**
   * Get historical klines/candlestick data
   */
  async getHistoricalPrices(
    symbol: string,
    currency = 'EUR',
    interval: '1h' | '1d' | '1w' = '1d',
    limit = 30,
  ): Promise<Array<{ timestamp: Date; price: number }>> {
    if (!this.enabled) {
      return [];
    }

    try {
      const pair = this.formatPair(symbol, currency);

      const response = await this.client.get('/klines', {
        params: {
          symbol: pair,
          interval,
          limit,
        },
      });

      if (!response.data) {
        return [];
      }

      return response.data.map((kline: any[]) => ({
        timestamp: new Date(kline[0]), // Open time
        price: parseFloat(kline[4]), // Close price
      }));
    } catch (error: any) {
      this.logger.error(`Failed to fetch historical prices for ${symbol}: ${error.message}`);
      return [];
    }
  }

  /**
   * Get exchange info (available trading pairs)
   */
  async getExchangeInfo(): Promise<any> {
    if (!this.enabled) {
      return null;
    }

    try {
      const response = await this.client.get('/exchangeInfo');
      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to fetch exchange info: ${error.message}`);
      return null;
    }
  }

  /**
   * Check if a trading pair exists
   */
  async isPairAvailable(symbol: string, currency = 'EUR'): Promise<boolean> {
    if (!this.enabled) {
      return false;
    }

    try {
      const pair = this.formatPair(symbol, currency);
      const response = await this.client.get('/ticker/price', {
        params: { symbol: pair },
      });
      return !!response.data;
    } catch {
      return false;
    }
  }

  /**
   * Format trading pair (e.g., BTC + EUR = BTCEUR)
   */
  private formatPair(symbol: string, currency: string): string {
    return `${symbol.toUpperCase()}${currency.toUpperCase()}`;
  }

  /**
   * Check if service is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}
