import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { StockPriceDto } from '../dto/price.dto';

@Injectable()
export class AlphaVantageService {
  private readonly logger = new Logger(AlphaVantageService.name);
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly client: AxiosInstance;
  private readonly enabled: boolean;

  // Rate limiting: 5 calls per minute for free tier
  private lastCallTimestamp = 0;
  private readonly minIntervalMs = 12000; // 12 seconds between calls

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ALPHA_VANTAGE_API_KEY') || '';
    this.apiUrl = this.configService.get<string>('ALPHA_VANTAGE_API_URL') || 'https://www.alphavantage.co/query';
    this.enabled = this.apiKey && this.apiKey !== 'YOUR_API_KEY_HERE';

    this.client = axios.create({
      baseURL: this.apiUrl,
      timeout: 15000,
    });
  }

  /**
   * Get current price for a stock/ETF
   */
  async getPrice(symbol: string): Promise<StockPriceDto | null> {
    if (!this.enabled) {
      this.logger.warn('Alpha Vantage API key not configured');
      return null;
    }

    try {
      await this.respectRateLimit();

      const response = await this.client.get('', {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol,
          apikey: this.apiKey,
        },
      });

      if (response.data.Note) {
        this.logger.warn('Alpha Vantage rate limit reached');
        return null;
      }

      if (response.data['Error Message']) {
        this.logger.error(`Alpha Vantage error: ${response.data['Error Message']}`);
        return null;
      }

      const quote = response.data['Global Quote'];
      if (!quote || Object.keys(quote).length === 0) {
        this.logger.warn(`No data found for symbol: ${symbol}`);
        return null;
      }

      return {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        open: parseFloat(quote['02. open']),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        previousClose: parseFloat(quote['08. previous close']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        lastUpdated: new Date(quote['07. latest trading day']),
      };
    } catch (error: any) {
      this.logger.error(`Failed to fetch price for ${symbol}: ${error.message}`);
      return null;
    }
  }

  /**
   * Get intraday prices (for charts)
   */
  async getIntradayPrices(
    symbol: string,
    interval: '1min' | '5min' | '15min' | '30min' | '60min' = '5min',
  ): Promise<Array<{ timestamp: Date; price: number; volume: number }>> {
    if (!this.enabled) {
      this.logger.warn('Alpha Vantage API key not configured');
      return [];
    }

    try {
      await this.respectRateLimit();

      const response = await this.client.get('', {
        params: {
          function: 'TIME_SERIES_INTRADAY',
          symbol,
          interval,
          apikey: this.apiKey,
          outputsize: 'compact', // Last 100 data points
        },
      });

      if (response.data.Note || response.data['Error Message']) {
        return [];
      }

      const timeSeries = response.data[`Time Series (${interval})`];
      if (!timeSeries) {
        return [];
      }

      const prices: Array<{ timestamp: Date; price: number; volume: number }> = [];

      for (const [timestamp, data] of Object.entries(timeSeries)) {
        prices.push({
          timestamp: new Date(timestamp),
          price: parseFloat((data as any)['4. close']),
          volume: parseInt((data as any)['5. volume']),
        });
      }

      return prices.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    } catch (error: any) {
      this.logger.error(`Failed to fetch intraday prices for ${symbol}: ${error.message}`);
      return [];
    }
  }

  /**
   * Get daily historical prices
   */
  async getDailyPrices(symbol: string, outputsize: 'compact' | 'full' = 'compact'): Promise<
    Array<{
      date: Date;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    }>
  > {
    if (!this.enabled) {
      this.logger.warn('Alpha Vantage API key not configured');
      return [];
    }

    try {
      await this.respectRateLimit();

      const response = await this.client.get('', {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol,
          apikey: this.apiKey,
          outputsize, // compact = 100 days, full = 20+ years
        },
      });

      if (response.data.Note || response.data['Error Message']) {
        return [];
      }

      const timeSeries = response.data['Time Series (Daily)'];
      if (!timeSeries) {
        return [];
      }

      const prices: Array<{
        date: Date;
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
      }> = [];

      for (const [date, data] of Object.entries(timeSeries)) {
        prices.push({
          date: new Date(date),
          open: parseFloat((data as any)['1. open']),
          high: parseFloat((data as any)['2. high']),
          low: parseFloat((data as any)['3. low']),
          close: parseFloat((data as any)['4. close']),
          volume: parseInt((data as any)['5. volume']),
        });
      }

      return prices.sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch (error: any) {
      this.logger.error(`Failed to fetch daily prices for ${symbol}: ${error.message}`);
      return [];
    }
  }

  /**
   * Search for stocks/ETFs
   */
  async search(keywords: string): Promise<
    Array<{
      symbol: string;
      name: string;
      type: string;
      region: string;
      currency: string;
    }>
  > {
    if (!this.enabled) {
      this.logger.warn('Alpha Vantage API key not configured');
      return [];
    }

    try {
      await this.respectRateLimit();

      const response = await this.client.get('', {
        params: {
          function: 'SYMBOL_SEARCH',
          keywords,
          apikey: this.apiKey,
        },
      });

      if (response.data.Note || response.data['Error Message']) {
        return [];
      }

      const matches = response.data.bestMatches;
      if (!matches) {
        return [];
      }

      return matches.map((match: any) => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        type: match['3. type'],
        region: match['4. region'],
        currency: match['8. currency'],
      }));
    } catch (error: any) {
      this.logger.error(`Failed to search with keywords "${keywords}": ${error.message}`);
      return [];
    }
  }

  /**
   * Get company overview (fundamental data)
   */
  async getCompanyOverview(symbol: string): Promise<any> {
    if (!this.enabled) {
      this.logger.warn('Alpha Vantage API key not configured');
      return null;
    }

    try {
      await this.respectRateLimit();

      const response = await this.client.get('', {
        params: {
          function: 'OVERVIEW',
          symbol,
          apikey: this.apiKey,
        },
      });

      if (response.data.Note || response.data['Error Message']) {
        return null;
      }

      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to fetch company overview for ${symbol}: ${error.message}`);
      return null;
    }
  }

  /**
   * Check if service is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Rate limiting: ensure minimum interval between API calls
   */
  private async respectRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTimestamp;

    if (timeSinceLastCall < this.minIntervalMs) {
      const waitTime = this.minIntervalMs - timeSinceLastCall;
      this.logger.debug(`Rate limiting: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastCallTimestamp = Date.now();
  }
}
