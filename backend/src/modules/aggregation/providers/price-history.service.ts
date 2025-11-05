import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class PriceHistoryService {
  private readonly logger = new Logger(PriceHistoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Record a price in history
   */
  async recordPrice(assetId: string, price: number, source: string): Promise<void> {
    try {
      await this.prisma.priceHistory.create({
        data: {
          assetId,
          price,
          source,
          recordedAt: new Date(),
        },
      });

      this.logger.debug(`Recorded price for asset ${assetId}: ${price} (${source})`);
    } catch (error: any) {
      this.logger.error(`Failed to record price for asset ${assetId}: ${error.message}`);
    }
  }

  /**
   * Get price history for an asset
   */
  async getPriceHistory(
    assetId: string,
    days = 30,
  ): Promise<Array<{ recordedAt: Date; price: number; source: string }>> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const history = await this.prisma.priceHistory.findMany({
        where: {
          assetId,
          recordedAt: {
            gte: cutoffDate,
          },
        },
        orderBy: {
          recordedAt: 'asc',
        },
        select: {
          recordedAt: true,
          price: true,
          source: true,
        },
      });

      return history;
    } catch (error: any) {
      this.logger.error(`Failed to get price history for asset ${assetId}: ${error.message}`);
      return [];
    }
  }

  /**
   * Get latest price from history
   */
  async getLatestPrice(assetId: string): Promise<{ price: number; recordedAt: Date; source: string } | null> {
    try {
      const latest = await this.prisma.priceHistory.findFirst({
        where: { assetId },
        orderBy: { recordedAt: 'desc' },
        select: {
          price: true,
          recordedAt: true,
          source: true,
        },
      });

      return latest;
    } catch (error: any) {
      this.logger.error(`Failed to get latest price for asset ${assetId}: ${error.message}`);
      return null;
    }
  }

  /**
   * Clean old price history (keep only recent data)
   */
  async cleanOldHistory(daysToKeep = 365): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await this.prisma.priceHistory.deleteMany({
        where: {
          recordedAt: {
            lt: cutoffDate,
          },
        },
      });

      this.logger.log(`Cleaned ${result.count} old price history records`);
      return result.count;
    } catch (error: any) {
      this.logger.error(`Failed to clean old price history: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get price statistics for an asset
   */
  async getPriceStatistics(assetId: string, days = 30): Promise<{
    current: number;
    min: number;
    max: number;
    avg: number;
    changePercent: number;
  } | null> {
    try {
      const history = await this.getPriceHistory(assetId, days);

      if (history.length === 0) {
        return null;
      }

      const prices = history.map(h => h.price);
      const current = prices[prices.length - 1];
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      const changePercent = ((current - prices[0]) / prices[0]) * 100;

      return {
        current,
        min,
        max,
        avg,
        changePercent,
      };
    } catch (error: any) {
      this.logger.error(`Failed to get price statistics for asset ${assetId}: ${error.message}`);
      return null;
    }
  }
}
