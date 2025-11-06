import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

interface WatchMarketData {
  price: number;
  currency: string;
  lastUpdated: Date;
  source: string;
  marketTrend?: number;
  estimatedValue?: {
    low: number;
    high: number;
    average: number;
  };
}

@Injectable()
export class WatchMarketService {
  private readonly logger = new Logger(WatchMarketService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.watchmarket.com/v1'; // Hypothetical API
  private readonly axiosInstance: AxiosInstance;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('WATCH_MARKET_API_KEY') || '';
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'User-Agent': 'Investment-Tracker/1.0',
      },
    });
  }

  isEnabled(): boolean {
    return !!this.apiKey;
  }

  async getWatchPrice(brand: string, model: string, year?: number): Promise<WatchMarketData | null> {
    if (!this.isEnabled()) {
      this.logger.warn('Watch Market API not configured');
      return null;
    }

    try {
      const searchQuery = `${brand} ${model}${year ? ` ${year}` : ''}`;
      
      const response = await this.axiosInstance.get('/watches/price', {
        params: {
          q: searchQuery,
          apikey: this.apiKey,
        },
      });

      const data = response.data as any;

      if (data && data.price) {
        return {
          price: parseFloat(data.price),
          currency: data.currency || 'EUR',
          lastUpdated: new Date(data.last_updated || Date.now()),
          source: 'WATCH_MARKET',
          marketTrend: data.trend_percentage,
          estimatedValue: data.estimated_value ? {
            low: parseFloat(data.estimated_value.low),
            high: parseFloat(data.estimated_value.high),
            average: parseFloat(data.estimated_value.average),
          } : undefined,
        };
      }

      return null;
    } catch (error: any) {
      this.logger.error(`Failed to fetch watch price for ${brand} ${model}: ${error.message}`);
      return null;
    }
  }

  async searchWatch(query: string): Promise<any[]> {
    if (!this.isEnabled()) {
      return [];
    }

    try {
      const response = await this.axiosInstance.get('/watches/search', {
        params: {
          q: query,
          limit: 10,
          apikey: this.apiKey,
        },
      });

      return (response.data as any).watches || [];
    } catch (error: any) {
      this.logger.error(`Failed to search watches: ${error.message}`);
      return [];
    }
  }

  // Méthode pour estimer le prix basé sur des données historiques
  async getEstimatedWatchValue(
    brand: string, 
    model: string, 
    condition: string, 
    year?: number,
    serialNumber?: string
  ): Promise<WatchMarketData | null> {
    if (!this.isEnabled()) {
      this.logger.warn('Watch Market API not configured, using fallback estimation');
      return this.getFallbackWatchEstimate(brand, model, year, condition);
    }

    try {
      const response = await this.axiosInstance.post('/watches/estimate', {
        brand,
        model,
        year,
        condition,
        serial_number: serialNumber,
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      const data = response.data as any;

      if (data && data.estimated_price) {
        return {
          price: parseFloat(data.estimated_price),
          currency: data.currency || 'EUR',
          lastUpdated: new Date(),
          source: 'WATCH_MARKET_AI',
          estimatedValue: {
            low: parseFloat(data.price_range.low),
            high: parseFloat(data.price_range.high),
            average: parseFloat(data.estimated_price),
          },
        };
      }

      return null;
    } catch (error: any) {
      this.logger.error(`Failed to estimate watch value: ${error.message}`);
      return this.getFallbackWatchEstimate(brand, model, year, condition);
    }
  }

  private async getFallbackWatchEstimate(
    brand: string, 
    model: string, 
    year?: number,
    condition?: string
  ): Promise<WatchMarketData | null> {
    // Estimation basique basée sur la marque
    const brandMultipliers: Record<string, number> = {
      'rolex': 8000,
      'patek philippe': 25000,
      'audemars piguet': 15000,
      'vacheron constantin': 20000,
      'omega': 3000,
      'tag heuer': 2000,
      'breitling': 2500,
      'iwc': 4000,
      'cartier': 5000,
      'jaeger-lecoultre': 6000,
    };

    const brandKey = brand.toLowerCase();
    const basePrice = brandMultipliers[brandKey] || 1000;

    // Ajustements pour l'année
    let ageAdjustment = 1;
    if (year) {
      const currentYear = new Date().getFullYear();
      const age = currentYear - year;
      if (age > 20) ageAdjustment = 1.2; // Vintage premium
      else if (age > 10) ageAdjustment = 0.9;
      else if (age > 5) ageAdjustment = 0.8;
      else ageAdjustment = 0.7; // Depreciation moderne
    }

    // Ajustements pour la condition
    const conditionMultipliers: Record<string, number> = {
      'new': 1.0,
      'like new': 0.95,
      'excellent': 0.9,
      'good': 0.75,
      'fair': 0.6,
      'poor': 0.4,
    };

    const conditionAdjustment = condition ? 
      conditionMultipliers[condition.toLowerCase()] || 0.8 : 0.8;

    const estimatedPrice = basePrice * ageAdjustment * conditionAdjustment;

    return {
      price: Math.round(estimatedPrice),
      currency: 'EUR',
      lastUpdated: new Date(),
      source: 'FALLBACK_ESTIMATE',
      estimatedValue: {
        low: Math.round(estimatedPrice * 0.8),
        high: Math.round(estimatedPrice * 1.2),
        average: Math.round(estimatedPrice),
      },
    };
  }
}