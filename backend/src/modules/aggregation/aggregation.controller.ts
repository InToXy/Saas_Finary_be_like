import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AggregationService } from './aggregation.service';
import { PriceHistoryService } from './providers/price-history.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { BulkUpdateResponseDto, UpdatePriceDto } from './dto/price.dto';

@ApiTags('aggregation')
@Controller('aggregation')
export class AggregationController {
  constructor(
    private readonly aggregationService: AggregationService,
    private readonly priceHistory: PriceHistoryService,
  ) {}

  @Post('update/:assetId')
  @ApiOperation({ summary: 'Update price for a single asset' })
  async updateAssetPrice(
    @Param('assetId') assetId: string,
    @CurrentUser() user: any,
  ): Promise<{ success: boolean; price?: number; error?: string }> {
    // TODO: Verify asset ownership
    return this.aggregationService.updateAssetPrice(assetId);
  }

  @Post('update-bulk')
  @ApiOperation({ summary: 'Update prices for multiple assets' })
  async updateBulkPrices(
    @Body() body: { assetIds: string[] },
    @CurrentUser() user: any,
  ): Promise<BulkUpdateResponseDto> {
    // TODO: Verify assets ownership
    return this.aggregationService.updateAssetsPrices(body.assetIds);
  }

  @Post('update-all')
  @ApiOperation({ summary: 'Update prices for all trackable assets (admin only)' })
  async updateAllPrices(
    @CurrentUser() user: any,
  ): Promise<BulkUpdateResponseDto> {
    // TODO: Check if user is admin
    return this.aggregationService.updateAllAssets();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search for assets across all providers' })
  @ApiQuery({ name: 'query', required: true, description: 'Search query (symbol or name)' })
  @ApiQuery({ name: 'type', required: false, enum: ['CRYPTO', 'STOCK'], description: 'Asset type filter' })
  async searchAsset(
    @Query('query') query: string,
    @Query('type') type?: 'CRYPTO' | 'STOCK',
  ): Promise<any[]> {
    return this.aggregationService.searchAsset(query, type);
  }

  @Get('history/:assetId')
  @ApiOperation({ summary: 'Get price history for an asset' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days (default: 30)' })
  async getPriceHistory(
    @Param('assetId') assetId: string,
    @Query('days') days?: number,
    @CurrentUser() user?: any,
  ): Promise<Array<{ recordedAt: Date; price: number; source: string }>> {
    // TODO: Verify asset ownership
    return this.priceHistory.getPriceHistory(assetId, days ? parseInt(days.toString()) : 30);
  }

  @Get('statistics/:assetId')
  @ApiOperation({ summary: 'Get price statistics for an asset' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days (default: 30)' })
  async getPriceStatistics(
    @Param('assetId') assetId: string,
    @Query('days') days?: number,
    @CurrentUser() user?: any,
  ): Promise<{
    current: number;
    min: number;
    max: number;
    avg: number;
    changePercent: number;
  } | null> {
    // TODO: Verify asset ownership
    return this.priceHistory.getPriceStatistics(assetId, days ? parseInt(days.toString()) : 30);
  }
}
