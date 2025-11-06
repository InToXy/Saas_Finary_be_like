import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

interface CarValuationData {
  price: number;
  currency: string;
  lastUpdated: Date;
  source: string;
  mileageAdjustment?: number;
  conditionAdjustment?: number;
  marketTrend?: number;
  estimatedValue?: {
    trade: number;
    private: number;
    retail: number;
  };
}

@Injectable()
export class CarValuationService {
  private readonly logger = new Logger(CarValuationService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.lacentrale.fr/v1'; // API française pour les voitures
  private readonly axiosInstance: AxiosInstance;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('CAR_VALUATION_API_KEY') || '';
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

  async getCarValue(
    brand: string,
    model: string,
    year: number,
    mileage?: number,
    fuelType?: string,
    condition?: string
  ): Promise<CarValuationData | null> {
    if (!this.isEnabled()) {
      this.logger.warn('Car Valuation API not configured, using fallback estimation');
      return this.getFallbackCarEstimate(brand, model, year, mileage, condition);
    }

    try {
      const response = await this.axiosInstance.get('/valuation', {
        params: {
          brand: brand.toLowerCase(),
          model: model.toLowerCase(),
          year,
          mileage: mileage || 100000,
          fuel_type: fuelType || 'essence',
          apikey: this.apiKey,
        },
      });

      const data = response.data as any;

      if (data && data.valuation) {
        return {
          price: parseFloat(data.valuation.average),
          currency: 'EUR',
          lastUpdated: new Date(data.last_updated || Date.now()),
          source: 'LA_CENTRALE',
          mileageAdjustment: data.adjustments?.mileage,
          conditionAdjustment: data.adjustments?.condition,
          marketTrend: data.market_trend,
          estimatedValue: {
            trade: parseFloat(data.valuation.trade),
            private: parseFloat(data.valuation.private),
            retail: parseFloat(data.valuation.retail),
          },
        };
      }

      return this.getFallbackCarEstimate(brand, model, year, mileage, condition);
    } catch (error: any) {
      this.logger.error(`Failed to fetch car valuation for ${brand} ${model}: ${error.message}`);
      return this.getFallbackCarEstimate(brand, model, year, mileage, condition);
    }
  }

  async searchCar(query: string): Promise<any[]> {
    if (!this.isEnabled()) {
      return [];
    }

    try {
      const response = await this.axiosInstance.get('/search', {
        params: {
          q: query,
          limit: 10,
          apikey: this.apiKey,
        },
      });

      return (response.data as any).cars || [];
    } catch (error: any) {
      this.logger.error(`Failed to search cars: ${error.message}`);
      return [];
    }
  }

  // Estimation pour voitures de collection avec logique spécialisée
  async getCollectorCarValue(
    brand: string,
    model: string,
    year: number,
    rarity: 'common' | 'rare' | 'very_rare' | 'legendary',
    condition: string,
    originalParts: boolean,
    documentation: boolean
  ): Promise<CarValuationData | null> {
    try {
      // Pour les voitures de collection, on utilise une logique différente
      if (!this.isCollectorCar(brand, model, year)) {
        return this.getCarValue(brand, model, year);
      }

      const baseValue = await this.getCollectorCarBaseValue(brand, model, year);
      if (!baseValue) {
        return null;
      }

      // Multiplicateurs pour voitures de collection
      const rarityMultipliers = {
        common: 1.0,
        rare: 1.5,
        very_rare: 2.5,
        legendary: 5.0,
      };

      const conditionMultipliers: Record<string, number> = {
        concours: 1.3,
        excellent: 1.1,
        good: 1.0,
        fair: 0.7,
        poor: 0.4,
        restoration: 0.3,
      };

      let finalValue = baseValue;
      finalValue *= rarityMultipliers[rarity];
      finalValue *= conditionMultipliers[condition.toLowerCase()] || 0.8;

      // Bonus pour authenticité
      if (originalParts) finalValue *= 1.15;
      if (documentation) finalValue *= 1.1;

      return {
        price: Math.round(finalValue),
        currency: 'EUR',
        lastUpdated: new Date(),
        source: 'COLLECTOR_CAR_ALGORITHM',
        estimatedValue: {
          trade: Math.round(finalValue * 0.85),
          private: Math.round(finalValue),
          retail: Math.round(finalValue * 1.15),
        },
      };
    } catch (error: any) {
      this.logger.error(`Failed to estimate collector car value: ${error.message}`);
      return null;
    }
  }

  private isCollectorCar(brand: string, model: string, year: number): boolean {
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;

    // Voitures de + de 25 ans ou modèles spéciaux
    const collectorBrands = [
      'ferrari', 'lamborghini', 'porsche', 'aston martin', 'mclaren',
      'bugatti', 'koenigsegg', 'pagani', 'lotus', 'alpine',
    ];

    const collectorModels = [
      'golf gti', 'bmw m3', '911 turbo', 'type r', 'rs', 'amg', 'quattro'
    ];

    return age >= 25 || 
           collectorBrands.some(b => brand.toLowerCase().includes(b)) ||
           collectorModels.some(m => model.toLowerCase().includes(m));
  }

  private async getCollectorCarBaseValue(brand: string, model: string, year: number): Promise<number | null> {
    // Base de données simplifiée pour voitures de collection
    const collectorValues: Record<string, Record<string, number[]>> = {
      'porsche': {
        '911': [50000, 80000, 120000, 200000], // par décennie
        '944': [15000, 25000, 35000, 50000],
        'boxster': [20000, 30000, 45000, 65000],
      },
      'ferrari': {
        '308': [80000, 120000, 180000, 300000],
        '348': [60000, 90000, 130000, 200000],
        '355': [90000, 130000, 180000, 280000],
      },
      'bmw': {
        'm3': [25000, 35000, 50000, 80000],
        'z3': [15000, 25000, 35000, 50000],
        'z4': [20000, 30000, 45000, 65000],
      },
    };

    const brandKey = brand.toLowerCase();
    const modelKey = model.toLowerCase();

    if (collectorValues[brandKey]?.[modelKey]) {
      const decade = Math.floor((year - 1970) / 10);
      const values = collectorValues[brandKey][modelKey];
      return values[Math.min(decade, values.length - 1)] || values[0];
    }

    return null;
  }

  private async getFallbackCarEstimate(
    brand: string,
    model: string,
    year: number,
    mileage?: number,
    condition?: string
  ): Promise<CarValuationData | null> {
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;

    // Valeurs de base par marque (prix neufs approximatifs)
    const brandBaseValues: Record<string, number> = {
      'mercedes': 45000,
      'bmw': 42000,
      'audi': 40000,
      'volkswagen': 25000,
      'renault': 20000,
      'peugeot': 22000,
      'citroën': 20000,
      'toyota': 25000,
      'honda': 23000,
      'ford': 20000,
      'opel': 18000,
      'fiat': 16000,
    };

    const baseValue = brandBaseValues[brand.toLowerCase()] || 20000;

    // Dépréciation standard
    let depreciationRate = 0.15; // 15% par an
    if (age > 5) depreciationRate = 0.08; // 8% après 5 ans
    if (age > 10) depreciationRate = 0.05; // 5% après 10 ans
    if (age > 15) depreciationRate = 0.02; // 2% après 15 ans (collection)

    let currentValue = baseValue * Math.pow(1 - depreciationRate, Math.min(age, 5));
    if (age > 5) currentValue *= Math.pow(0.92, Math.min(age - 5, 5));
    if (age > 10) currentValue *= Math.pow(0.95, Math.min(age - 10, 5));
    if (age > 15) currentValue *= Math.pow(0.98, age - 15);

    // Ajustement kilométrage
    if (mileage) {
      const expectedMileage = age * 15000;
      if (mileage > expectedMileage * 1.5) currentValue *= 0.8;
      else if (mileage < expectedMileage * 0.5) currentValue *= 1.1;
    }

    // Ajustement état
    const conditionMultipliers: Record<string, number> = {
      'excellent': 1.1,
      'good': 1.0,
      'fair': 0.8,
      'poor': 0.6,
    };

    if (condition) {
      currentValue *= conditionMultipliers[condition.toLowerCase()] || 1.0;
    }

    return {
      price: Math.round(Math.max(currentValue, 1000)), // Minimum 1000€
      currency: 'EUR',
      lastUpdated: new Date(),
      source: 'FALLBACK_ESTIMATE',
      estimatedValue: {
        trade: Math.round(currentValue * 0.8),
        private: Math.round(currentValue),
        retail: Math.round(currentValue * 1.15),
      },
    };
  }
}