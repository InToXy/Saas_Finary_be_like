import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import yahooFinance from 'yahoo-finance2';
import { StockPriceDto } from '../dto/price.dto';

@Injectable()
export class YahooFinanceService {
  private readonly logger = new Logger(YahooFinanceService.name);
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.enabled = this.configService.get<boolean>('YAHOO_FINANCE_ENABLED') !== false;
  }

  /**
   * Get current price for a stock/ETF
   */
  async getPrice(symbol: string): Promise<StockPriceDto | null> {
    if (!this.enabled) {
      return null;
    }

    try {
      const quote = await yahooFinance.quote(symbol);

      if (!quote) {
        this.logger.warn(`No data found for symbol: ${symbol}`);
        return null;
      }

      return {
        symbol: quote.symbol,
        name: quote.longName || quote.shortName,
        price: quote.regularMarketPrice || 0,
        open: quote.regularMarketOpen,
        high: quote.regularMarketDayHigh,
        low: quote.regularMarketDayLow,
        previousClose: quote.regularMarketPreviousClose,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        volume: quote.regularMarketVolume,
        lastUpdated: quote.regularMarketTime ? new Date(quote.regularMarketTime) : new Date(),
      };
    } catch (error: any) {
      this.logger.error(`Failed to fetch price for ${symbol}: ${error.message}`);
      return null;
    }
  }

  /**
   * Get prices for multiple stocks/ETFs
   */
  async getPrices(symbols: string[]): Promise<Map<string, StockPriceDto>> {
    if (!this.enabled) {
      return new Map();
    }

    const prices = new Map<string, StockPriceDto>();

    for (const symbol of symbols) {
      const price = await this.getPrice(symbol);
      if (price) {
        prices.set(symbol, price);
      }
    }

    return prices;
  }

  /**
   * Get simple price (faster)
   */
  async getSimplePrice(symbol: string): Promise<number | null> {
    if (!this.enabled) {
      return null;
    }

    try {
      const quote = await yahooFinance.quote(symbol);
      return quote?.regularMarketPrice || null;
    } catch (error: any) {
      this.logger.error(`Failed to fetch simple price for ${symbol}: ${error.message}`);
      return null;
    }
  }

  /**
   * Get historical prices
   */
  async getHistoricalPrices(
    symbol: string,
    period1: Date,
    period2: Date = new Date(),
    interval: '1d' | '1wk' | '1mo' = '1d',
  ): Promise<Array<{ date: Date; open: number; high: number; low: number; close: number; volume: number }>> {
    if (!this.enabled) {
      return [];
    }

    try {
      const result = await yahooFinance.historical(symbol, {
        period1,
        period2,
        interval,
      });

      return result.map(item => ({
        date: item.date,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
      }));
    } catch (error: any) {
      this.logger.error(`Failed to fetch historical prices for ${symbol}: ${error.message}`);
      return [];
    }
  }

  /**
   * Search for stocks/ETFs
   */
  async search(query: string): Promise<Array<{ symbol: string; name: string; type: string }>> {
    if (!this.enabled) {
      return [];
    }

    try {
      const results = await yahooFinance.search(query);

      return results.quotes.slice(0, 10).map(quote => ({
        symbol: quote.symbol,
        name: quote.longname || quote.shortname || quote.symbol,
        type: quote.quoteType || 'EQUITY',
      }));
    } catch (error: any) {
      this.logger.error(`Failed to search with query "${query}": ${error.message}`);
      return [];
    }
  }

  /**
   * Get quote summary (fundamental data)
   */
  async getQuoteSummary(symbol: string): Promise<any> {
    if (!this.enabled) {
      return null;
    }

    try {
      const result = await yahooFinance.quoteSummary(symbol, {
        modules: ['price', 'summaryDetail', 'assetProfile'],
      });

      return result;
    } catch (error: any) {
      this.logger.error(`Failed to fetch quote summary for ${symbol}: ${error.message}`);
      return null;
    }
  }

  /**
   * Check if service is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}
