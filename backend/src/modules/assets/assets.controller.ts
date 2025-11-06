import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto, UpdateAssetDto, AssetResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AssetType } from '../../types/prisma-types';

@Controller('assets')
@UseGuards(JwtAuthGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  create(
    @Req() req: any,
    @Body() createAssetDto: CreateAssetDto,
  ): Promise<AssetResponseDto> {
    return this.assetsService.create(req.user.userId, createAssetDto);
  }

  @Get()
  findAll(
    @Req() req: any,
    @Query('type') type?: AssetType,
    @Query('accountId') accountId?: string,
  ): Promise<AssetResponseDto[]> {
    return this.assetsService.findAll(req.user.userId, type, accountId);
  }

  @Get('monthly-investments')
  getAssetsWithMonthlyInvestment(
    @Req() req: any,
  ): Promise<AssetResponseDto[]> {
    return this.assetsService.getAssetsWithMonthlyInvestment(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any): Promise<AssetResponseDto> {
    return this.assetsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() updateAssetDto: UpdateAssetDto,
  ): Promise<AssetResponseDto> {
    return this.assetsService.update(id, req.user.userId, updateAssetDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any): Promise<void> {
    await this.assetsService.remove(id, req.user.userId);
  }
}
