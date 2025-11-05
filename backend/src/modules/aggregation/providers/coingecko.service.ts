import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { CryptoPriceDto } from '../dto/price.dto';

@Injectable()
export class CoinGeckoService {
  private readonly logger = new Logger(CoinGeckoService.name);
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly client: AxiosInstance;

  // Mapping des symboles crypto vers les IDs CoinGecko
  private readonly symbolToId: Map<string, string> = new Map([
    ['BTC', 'bitcoin'],
    ['ETH', 'ethereum'],
    ['USDT', 'tether'],
    ['BNB', 'binancecoin'],
    ['SOL', 'solana'],
    ['XRP', 'ripple'],
    ['USDC', 'usd-coin'],
    ['ADA', 'cardano'],
    ['DOGE', 'dogecoin'],
    ['TRX', 'tron'],
    ['AVAX', 'avalanche-2'],
    ['DOT', 'polkadot'],
    ['MATIC', 'matic-network'],
    ['LTC', 'litecoin'],
    ['LINK', 'chainlink'],
  ]);

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('COINGECKO_API_KEY') || '';
    this.apiUrl = this.configService.get<string>('COINGECKO_API_URL') || 'https://api.coingecko.com/api/v3';

    this.client = axios.create({
      baseURL: this.apiUrl,
      timeout: 10000,
      headers: this.apiKey ? { 'x-cg-demo-api-key': this.apiKey } : {},
    });
  }

  /**
   * Get price for a single cryptocurrency
   */
  async getPrice(symbol: string, currency = 'eur'): Promise<CryptoPriceDto | null> {
    try {
      const coinId = this.getCoinId(symbol);

      const response = await this.client.get('/coins/markets', {
        params: {
          vs_currency: currency,
          ids: coinId,
          order: 'market_cap_desc',
          per_page: 1,
          page: 1,
          sparkline: false,
        },
      });

      if (!response.data || response.data.length === 0) {
        this.logger.warn(`No data found for ${symbol} (${coinId})`);
        return null;
      }

      const data = response.data[0];

      return {
        symbol: symbol.toUpperCase(),
        name: data.name,
        price: data.current_price,
        priceChange24h: data.price_change_24h,
        priceChangePercentage24h: data.price_change_percentage_24h,
        marketCap: data.market_cap,
        volume24h: data.total_volume,
        lastUpdated: new Date(data.last_updated),
      };
    } catch (error: any) {
      this.logger.error(`Failed to fetch price for ${symbol}: ${error.message}`);
      return null;
    }
  }

  /**
   * Get prices for multiple cryptocurrencies
   */
  async getPrices(symbols: string[], currency = 'eur'): Promise<Map<string, CryptoPriceDto>> {
    const prices = new Map<string, CryptoPriceDto>();

    try {
      const coinIds = symbols.map(s => this.getCoinId(s)).join(',');

      const response = await this.client.get('/coins/markets', {
        params: {
          vs_currency: currency,
          ids: coinIds,
          order: 'market_cap_desc',
          per_page: 250,
          page: 1,
          sparkline: false,
        },
      });

      if (response.data) {
        for (const data of response.data) {
          const symbol = this.getSymbolFromId(data.id);
          if (symbol) {
            prices.set(symbol, {
              symbol: symbol.toUpperCase(),
              name: data.name,
              price: data.current_price,
              priceChange24h: data.price_change_24h,
              priceChangePercentage24h: data.price_change_percentage_24h,
              marketCap: data.market_cap,
              volume24h: data.total_volume,
              lastUpdated: new Date(data.last_updated),
            });
          }
        }
      }
    } catch (error: any) {
      this.logger.error(`Failed to fetch prices for multiple symbols: ${error.message}`);
    }

    return prices;
  }

  /**
   * Simple price lookup (faster, less data)
   */
  async getSimplePrice(symbol: string, currency = 'eur'): Promise<number | null> {
    try {
      const coinId = this.getCoinId(symbol);

      const response = await this.client.get('/simple/price', {
        params: {
          ids: coinId,
          vs_currencies: currency,
        },
      });

      if (response.data && response.data[coinId]) {
        return response.data[coinId][currency];
      }

      return null;
    } catch (error: any) {
      this.logger.error(`Failed to fetch simple price for ${symbol}: ${error.message}`);
      return null;
    }
  }

  /**
   * Get historical price data
   */
  async getHistoricalPrice(symbol: string, days = 30, currency = 'eur'): Promise<Array<{ timestamp: Date; price: number }>> {
    try {
      const coinId = this.getCoinId(symbol);

      const response = await this.client.get(`/coins/${coinId}/market_chart`, {
        params: {
          vs_currency: currency,
          days,
        },
      });

      if (response.data && response.data.prices) {
        return response.data.prices.map(([timestamp, price]: [number, number]) => ({
          timestamp: new Date(timestamp),
          price,
        }));
      }

      return [];
    } catch (error: any) {
      this.logger.error(`Failed to fetch historical price for ${symbol}: ${error.message}`);
      return [];
    }
  }

  /**
   * Search for a coin by name or symbol
   */
  async searchCoin(query: string): Promise<Array<{ id: string; symbol: string; name: string }>> {
    try {
      const response = await this.client.get('/search', {
        params: { query },
      });

      if (response.data && response.data.coins) {
        return response.data.coins.slice(0, 10).map((coin: any) => ({
          id: coin.id,
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
        }));
      }

      return [];
    } catch (error: any) {
      this.logger.error(`Failed to search coin with query "${query}": ${error.message}`);
      return [];
    }
  }

  /**
   * Convert symbol to CoinGecko ID
   */
  private getCoinId(symbol: string): string {
    const upperSymbol = symbol.toUpperCase();
    return this.symbolToId.get(upperSymbol) || symbol.toLowerCase();
  }

  /**
   * Convert CoinGecko ID back to symbol
   */
  private getSymbolFromId(id: string): string | null {
    for (const [symbol, coinId] of this.symbolToId.entries()) {
      if (coinId === id) {
        return symbol;
      }
    }
    return null;
  }

  /**
   * Add custom mapping for a coin
   */
  addCoinMapping(symbol: string, coinId: string): void {
    this.symbolToId.set(symbol.toUpperCase(), coinId);
    this.logger.log(`Added mapping: ${symbol.toUpperCase()} -> ${coinId}`);
  }
}
