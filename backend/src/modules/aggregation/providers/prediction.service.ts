import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

interface PredictionFactors {
  // Technical Analysis
  movingAverage7d: number;
  movingAverage30d: number;
  volatility: number;
  rsi: number;
  
  // Market Sentiment
  marketTrend: number;
  volume: number;
  
  // External Factors
  economicIndicators?: {
    inflation: number;
    interestRates: number;
    unemployment: number;
  };
  
  // Asset-specific factors
  assetType: string;
  age?: number; // For collectibles
  rarity?: number; // For collectibles
  condition?: number; // For collectibles
}

interface PredictionResult {
  assetId: string;
  predictedPrice: number;
  confidence: number;
  timeframe: string; // '1d', '7d', '30d', '90d'
  algorithm: string;
  factors: PredictionFactors;
  createdAt: Date;
  expiresAt: Date;
}

@Injectable()
export class PredictionService {
  private readonly logger = new Logger(PredictionService.name);
  private readonly aiApiKey: string;
  private readonly aiApiUrl: string;
  private readonly axiosInstance: AxiosInstance;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.aiApiKey = this.configService.get<string>('OPENAI_API_KEY') || '';
    this.aiApiUrl = 'https://api.openai.com/v1/chat/completions';
    this.axiosInstance = axios.create({
      baseURL: 'https://api.openai.com/v1',
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${this.aiApiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async generatePrediction(assetId: string, timeframe: '1d' | '7d' | '30d' | '90d'): Promise<PredictionResult | null> {
    try {
      const asset = await this.getAssetWithHistory(assetId);
      if (!asset) {
        this.logger.warn(`Asset ${assetId} not found for prediction`);
        return null;
      }

      // Calculate technical indicators
      const factors = await this.calculatePredictionFactors(asset);
      
      // Generate prediction based on asset type
      let prediction: PredictionResult;
      
      switch (asset.type) {
        case 'CRYPTO':
        case 'STOCK':
        case 'ETF':
          prediction = await this.predictFinancialAsset(asset, factors, timeframe);
          break;
          
        case 'LUXURY_WATCH':
        case 'COLLECTOR_CAR':
          prediction = await this.predictCollectibleAsset(asset, factors, timeframe);
          break;
          
        default:
          prediction = await this.predictGenericAsset(asset, factors, timeframe);
      }

      // Store prediction in database
      const savedPrediction = await this.prisma.assetPrediction.create({
        data: {
          assetId: prediction.assetId,
          predictedPrice: prediction.predictedPrice,
          confidence: prediction.confidence,
          timeframe: prediction.timeframe,
          algorithm: prediction.algorithm,
          factors: prediction.factors as any,
          expiresAt: prediction.expiresAt,
        },
      });

      return {
        ...prediction,
        createdAt: savedPrediction.createdAt,
      };

    } catch (error: any) {
      this.logger.error(`Failed to generate prediction for asset ${assetId}: ${error.message}`);
      return null;
    }
  }

  private async getAssetWithHistory(assetId: string) {
    return await this.prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        priceHistory: {
          orderBy: { recordedAt: 'desc' },
          take: 100, // Last 100 price points
        },
      },
    });
  }

  private async calculatePredictionFactors(asset: any): Promise<PredictionFactors> {
    const prices = asset.priceHistory.map((h: any) => h.price);
    const dates = asset.priceHistory.map((h: any) => h.recordedAt);

    return {
      movingAverage7d: this.calculateMovingAverage(prices, 7),
      movingAverage30d: this.calculateMovingAverage(prices, 30),
      volatility: this.calculateVolatility(prices),
      rsi: this.calculateRSI(prices),
      marketTrend: this.calculateTrend(prices, dates),
      volume: 1, // Default, would need actual volume data
      assetType: asset.type,
      age: asset.year ? new Date().getFullYear() - asset.year : undefined,
      rarity: this.estimateRarity(asset),
      condition: this.scoreCondition(asset.condition),
    };
  }

  private async predictFinancialAsset(asset: any, factors: PredictionFactors, timeframe: string): Promise<PredictionResult> {
    // Technical analysis approach
    let predictedPrice = asset.currentPrice;
    let confidence = 0.7; // Base confidence

    // Moving average analysis
    if (factors.movingAverage7d > factors.movingAverage30d) {
      predictedPrice *= 1.02; // Bullish signal
      confidence += 0.1;
    } else {
      predictedPrice *= 0.98; // Bearish signal
      confidence -= 0.1;
    }

    // RSI analysis
    if (factors.rsi > 70) {
      predictedPrice *= 0.95; // Overbought
      confidence += 0.05;
    } else if (factors.rsi < 30) {
      predictedPrice *= 1.05; // Oversold
      confidence += 0.05;
    }

    // Volatility adjustment
    if (factors.volatility > 0.3) {
      confidence -= 0.2; // High volatility reduces confidence
    }

    // Timeframe adjustment
    const multiplier = this.getTimeframeMultiplier(timeframe);
    predictedPrice *= multiplier;

    // Use AI for complex prediction if available
    const aiPrediction = await this.getAIPrediction(asset, factors, timeframe);
    if (aiPrediction) {
      predictedPrice = (predictedPrice + aiPrediction.price) / 2;
      confidence = Math.max(confidence, aiPrediction.confidence);
    }

    return {
      assetId: asset.id,
      predictedPrice: Math.round(predictedPrice * 100) / 100,
      confidence: Math.min(Math.max(confidence, 0.1), 0.95),
      timeframe,
      algorithm: 'TECHNICAL_ANALYSIS_ML',
      factors,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.getExpirationTime(timeframe)),
    };
  }

  private async predictCollectibleAsset(asset: any, factors: PredictionFactors, timeframe: string): Promise<PredictionResult> {
    let predictedPrice = asset.currentPrice;
    let confidence = 0.6; // Lower base confidence for collectibles

    // Age factor for collectibles
    if (factors.age && factors.age > 25) {
      predictedPrice *= 1.02; // Vintage premium
      confidence += 0.1;
    }

    // Rarity factor
    if (factors.rarity && factors.rarity > 0.8) {
      predictedPrice *= 1.05;
      confidence += 0.1;
    }

    // Condition factor
    if (factors.condition && factors.condition > 0.9) {
      predictedPrice *= 1.03;
      confidence += 0.05;
    }

    // Market trend for collectibles (generally appreciating)
    const yearlyAppreciation = this.getCollectibleAppreciation(asset.type);
    const timeframeFactor = this.getTimeframeDays(timeframe) / 365;
    predictedPrice *= Math.pow(1 + yearlyAppreciation, timeframeFactor);

    // Use specialized AI prediction for collectibles
    const aiPrediction = await this.getCollectibleAIPrediction(asset, factors, timeframe);
    if (aiPrediction) {
      predictedPrice = (predictedPrice + aiPrediction.price) / 2;
      confidence = Math.max(confidence, aiPrediction.confidence);
    }

    return {
      assetId: asset.id,
      predictedPrice: Math.round(predictedPrice * 100) / 100,
      confidence: Math.min(Math.max(confidence, 0.1), 0.85),
      timeframe,
      algorithm: 'COLLECTIBLE_VALUATION_ML',
      factors,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.getExpirationTime(timeframe)),
    };
  }

  private async predictGenericAsset(asset: any, factors: PredictionFactors, timeframe: string): Promise<PredictionResult> {
    // Simple trend-based prediction
    let predictedPrice = asset.currentPrice * (1 + factors.marketTrend);
    const confidence = 0.5; // Low confidence for generic assets

    return {
      assetId: asset.id,
      predictedPrice: Math.round(predictedPrice * 100) / 100,
      confidence,
      timeframe,
      algorithm: 'TREND_BASED',
      factors,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.getExpirationTime(timeframe)),
    };
  }

  private async getAIPrediction(asset: any, factors: PredictionFactors, timeframe: string): Promise<{ price: number; confidence: number } | null> {
    if (!this.aiApiKey) {
      return null;
    }

    try {
      const prompt = this.buildAIPrompt(asset, factors, timeframe);
      
      const response = await this.axiosInstance.post('/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a financial analyst specializing in price prediction. Respond with only a JSON object containing "price" and "confidence" fields.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 150,
      });

      const aiResponse = (response.data as any).choices[0].message.content;
      const parsed = JSON.parse(aiResponse);
      
      return {
        price: parseFloat(parsed.price),
        confidence: parseFloat(parsed.confidence),
      };
    } catch (error: any) {
      this.logger.warn(`AI prediction failed: ${error.message}`);
      return null;
    }
  }

  private async getCollectibleAIPrediction(asset: any, factors: PredictionFactors, timeframe: string): Promise<{ price: number; confidence: number } | null> {
    if (!this.aiApiKey) {
      return null;
    }

    try {
      const prompt = this.buildCollectibleAIPrompt(asset, factors, timeframe);
      
      const response = await this.axiosInstance.post('/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a collectible asset specialist. Analyze luxury watches, collector cars, and other collectibles for price prediction. Respond with only a JSON object containing "price" and "confidence" fields.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 150,
      });

      const aiResponse = (response.data as any).choices[0].message.content;
      const parsed = JSON.parse(aiResponse);
      
      return {
        price: parseFloat(parsed.price),
        confidence: parseFloat(parsed.confidence),
      };
    } catch (error: any) {
      this.logger.warn(`Collectible AI prediction failed: ${error.message}`);
      return null;
    }
  }

  private buildAIPrompt(asset: any, factors: PredictionFactors, timeframe: string): string {
    return `Analyze this ${asset.type} asset for ${timeframe} price prediction:
    
Current Price: ${asset.currentPrice} ${asset.currency}
Symbol: ${asset.symbol}
7-day MA: ${factors.movingAverage7d}
30-day MA: ${factors.movingAverage30d}
Volatility: ${factors.volatility}
RSI: ${factors.rsi}
Market Trend: ${factors.marketTrend}

Predict the price for ${timeframe} timeframe and confidence level (0-1).`;
  }

  private buildCollectibleAIPrompt(asset: any, factors: PredictionFactors, timeframe: string): string {
    return `Analyze this ${asset.type} collectible for ${timeframe} price prediction:
    
Brand: ${asset.brand}
Model: ${asset.model}
Year: ${asset.year}
Condition: ${asset.condition}
Current Price: ${asset.currentPrice} ${asset.currency}
Age: ${factors.age} years
Rarity Score: ${factors.rarity}
Condition Score: ${factors.condition}

Consider market trends, historical appreciation, and collectible market dynamics.
Predict the price for ${timeframe} timeframe and confidence level (0-1).`;
  }

  // Helper methods
  private calculateMovingAverage(prices: number[], days: number): number {
    const relevantPrices = prices.slice(0, days);
    return relevantPrices.reduce((sum, price) => sum + price, 0) / relevantPrices.length;
  }

  private calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;
    
    const returns = prices.slice(1).map((price, i) => Math.log(price / prices[i]));
    const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / returns.length;
    
    return Math.sqrt(variance * 252); // Annualized volatility
  }

  private calculateRSI(prices: number[], period = 14): number {
    if (prices.length < period + 1) return 50; // Neutral RSI
    
    const gains: number[] = [];
    const losses: number[] = [];
    
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? -change : 0);
    }
    
    const avgGain = gains.reduce((sum, gain) => sum + gain, 0) / period;
    const avgLoss = losses.reduce((sum, loss) => sum + loss, 0) / period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateTrend(prices: number[], dates: Date[]): number {
    if (prices.length < 2) return 0;
    
    // Simple linear regression for trend
    const n = Math.min(prices.length, 30); // Use last 30 data points
    const recentPrices = prices.slice(0, n);
    const x = Array.from({length: n}, (_, i) => i);
    
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = recentPrices.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * recentPrices[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const avgPrice = sumY / n;
    
    return slope / avgPrice; // Normalized trend
  }

  private estimateRarity(asset: any): number {
    // Basic rarity estimation based on brand/model
    const rareBrands = ['patek philippe', 'ferrari', 'lamborghini', 'rolex daytona'];
    const brandRarity = rareBrands.some(brand => 
      asset.brand?.toLowerCase().includes(brand.toLowerCase())
    ) ? 0.9 : 0.5;
    
    return brandRarity;
  }

  private scoreCondition(condition?: string): number {
    const conditionScores: Record<string, number> = {
      'new': 1.0,
      'like new': 0.95,
      'excellent': 0.9,
      'good': 0.8,
      'fair': 0.6,
      'poor': 0.4,
    };
    
    return condition ? conditionScores[condition.toLowerCase()] || 0.7 : 0.7;
  }

  private getTimeframeMultiplier(timeframe: string): number {
    const multipliers: Record<string, number> = {
      '1d': 1.001,
      '7d': 1.005,
      '30d': 1.02,
      '90d': 1.06,
    };
    
    return multipliers[timeframe] || 1.02;
  }

  private getTimeframeDays(timeframe: string): number {
    const days: Record<string, number> = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90,
    };
    
    return days[timeframe] || 30;
  }

  private getCollectibleAppreciation(assetType: string): number {
    const appreciation: Record<string, number> = {
      'LUXURY_WATCH': 0.08, // 8% per year
      'COLLECTOR_CAR': 0.12, // 12% per year
      'ARTWORK': 0.10,
      'WINE': 0.15,
    };
    
    return appreciation[assetType] || 0.05;
  }

  private getExpirationTime(timeframe: string): number {
    const expirationMs: Record<string, number> = {
      '1d': 24 * 60 * 60 * 1000, // 24 hours
      '7d': 7 * 24 * 60 * 60 * 1000, // 7 days
      '30d': 30 * 24 * 60 * 60 * 1000, // 30 days
      '90d': 90 * 24 * 60 * 60 * 1000, // 90 days
    };
    
    return expirationMs[timeframe] || 7 * 24 * 60 * 60 * 1000;
  }

  // Public methods for retrieving predictions
  async getAssetPredictions(assetId: string, timeframe?: string): Promise<any[]> {
    return await this.prisma.assetPrediction.findMany({
      where: {
        assetId,
        timeframe: timeframe || undefined,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getActivePredictions(userId: string): Promise<any[]> {
    return await this.prisma.assetPrediction.findMany({
      where: {
        asset: {
          userId,
        },
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        asset: {
          select: {
            name: true,
            type: true,
            symbol: true,
            currentPrice: true,
            currency: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}