import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AggregationController } from './aggregation.controller';
import { AggregationService } from './aggregation.service';
import { CoinGeckoService } from './providers/coingecko.service';
import { AlphaVantageService } from './providers/alpha-vantage.service';
import { BinanceService } from './providers/binance.service';
import { YahooFinanceService } from './providers/yahoo-finance.service';
import { PriceHistoryService } from './providers/price-history.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [HttpModule, PrismaModule],
  controllers: [AggregationController],
  providers: [
    AggregationService,
    CoinGeckoService,
    AlphaVantageService,
    BinanceService,
    YahooFinanceService,
    PriceHistoryService,
  ],
  exports: [AggregationService, CoinGeckoService, AlphaVantageService, PriceHistoryService],
})
export class AggregationModule {}
