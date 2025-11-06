import { Module } from '@nestjs/common';
import { AggregationController } from './aggregation.controller';
import { AggregationService } from './aggregation.service';
import { CoinGeckoService } from './providers/coingecko.service';
import { AlphaVantageService } from './providers/alpha-vantage.service';
import { BinanceService } from './providers/binance.service';
import { YahooFinanceService } from './providers/yahoo-finance.service';
import { WatchMarketService } from './providers/watch-market.service';
import { CarValuationService } from './providers/car-valuation.service';
import { PredictionService } from './providers/prediction.service';
import { PriceHistoryService } from './providers/price-history.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AggregationController],
  providers: [
    AggregationService,
    CoinGeckoService,
    AlphaVantageService,
    BinanceService,
    YahooFinanceService,
    WatchMarketService,
    CarValuationService,
    PredictionService,
    PriceHistoryService,
  ],
  exports: [
    AggregationService, 
    CoinGeckoService, 
    AlphaVantageService, 
    WatchMarketService,
    CarValuationService,
    PredictionService,
    PriceHistoryService
  ],
})
export class AggregationModule {}
