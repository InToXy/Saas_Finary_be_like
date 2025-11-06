import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto, UpdateAssetDto, AssetResponseDto } from './dto';
import { AssetType } from '@prisma/client';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    createAssetDto: CreateAssetDto,
  ): Promise<AssetResponseDto> {
    const {
      name,
      type,
      symbol,
      isin,
      quantity,
      purchasePrice,
      purchaseDate,
      monthlyInvestment,
      currentPrice,
      currency = 'EUR',
      accountId,
      description,
      brand,
      model,
      year,
      condition,
      serialNumber,
      certification,
      thumbnailUrl,
    } = createAssetDto;

    // Verify account ownership if accountId is provided
    if (accountId) {
      const account = await this.prisma.account.findFirst({
        where: { id: accountId, userId },
      });

      if (!account) {
        throw new NotFoundException('Account not found or access denied');
      }
    }

    // Calculate initial values
    const totalValue = currentPrice * quantity;
    const totalGain = totalValue - purchasePrice * quantity;
    const totalGainPercent =
      purchasePrice > 0 ? (totalGain / (purchasePrice * quantity)) * 100 : 0;

    const asset = await this.prisma.asset.create({
      data: {
        userId,
        accountId,
        name,
        type,
        symbol,
        isin,
        quantity,
        purchasePrice,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        monthlyInvestment,
        currentPrice,
        currency,
        totalValue,
        totalGain,
        totalGainPercent,
        lastPriceUpdate: new Date(),
        description,
        brand,
        model,
        year,
        condition,
        serialNumber,
        certification,
        thumbnailUrl,
      },
      include: {
        account: true,
        images: true,
        priceHistory: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
        predictions: {
          where: {
            expiresAt: {
              gte: new Date(),
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return this.mapToResponseDto(asset);
  }

  async findAll(
    userId: string,
    type?: AssetType,
    accountId?: string,
  ): Promise<AssetResponseDto[]> {
    const assets = await this.prisma.asset.findMany({
      where: {
        userId,
        isActive: true,
        ...(type && { type }),
        ...(accountId && { accountId }),
      },
      include: {
        account: true,
        images: true,
        priceHistory: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
        predictions: {
          where: {
            expiresAt: {
              gte: new Date(),
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return assets.map((asset) => this.mapToResponseDto(asset));
  }

  async findOne(id: string, userId: string): Promise<AssetResponseDto> {
    const asset = await this.prisma.asset.findFirst({
      where: { id, userId },
      include: {
        account: true,
        images: true,
        priceHistory: {
          orderBy: { recordedAt: 'desc' },
          take: 30,
        },
        predictions: {
          where: {
            expiresAt: {
              gte: new Date(),
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return this.mapToResponseDto(asset);
  }

  async update(
    id: string,
    userId: string,
    updateAssetDto: UpdateAssetDto,
  ): Promise<AssetResponseDto> {
    // Verify ownership
    const existingAsset = await this.prisma.asset.findFirst({
      where: { id, userId },
    });

    if (!existingAsset) {
      throw new NotFoundException('Asset not found');
    }

    // Verify account ownership if accountId is being updated
    if (updateAssetDto.accountId) {
      const account = await this.prisma.account.findFirst({
        where: { id: updateAssetDto.accountId, userId },
      });

      if (!account) {
        throw new NotFoundException('Account not found or access denied');
      }
    }

    // Recalculate values if price or quantity changed
    let updateData: any = { ...updateAssetDto };

    if (updateAssetDto.currentPrice !== undefined || updateAssetDto.quantity !== undefined) {
      const currentPrice = updateAssetDto.currentPrice ?? existingAsset.currentPrice;
      const quantity = updateAssetDto.quantity ?? existingAsset.quantity;
      const purchasePrice = updateAssetDto.purchasePrice ?? existingAsset.purchasePrice;

      updateData.totalValue = currentPrice * quantity;
      updateData.totalGain = updateData.totalValue - purchasePrice * quantity;
      updateData.totalGainPercent =
        purchasePrice > 0
          ? (updateData.totalGain / (purchasePrice * quantity)) * 100
          : 0;
      updateData.lastPriceUpdate = new Date();
    }

    // Convert purchaseDate string to Date if provided
    if (updateAssetDto.purchaseDate) {
      updateData.purchaseDate = new Date(updateAssetDto.purchaseDate);
    }

    const asset = await this.prisma.asset.update({
      where: { id },
      data: updateData,
      include: {
        account: true,
        images: true,
        priceHistory: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
        predictions: {
          where: {
            expiresAt: {
              gte: new Date(),
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return this.mapToResponseDto(asset);
  }

  async remove(id: string, userId: string): Promise<void> {
    const asset = await this.prisma.asset.findFirst({
      where: { id, userId },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    // Soft delete by setting isActive to false
    await this.prisma.asset.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getAssetsWithMonthlyInvestment(
    userId: string,
  ): Promise<AssetResponseDto[]> {
    const assets = await this.prisma.asset.findMany({
      where: {
        userId,
        isActive: true,
        monthlyInvestment: {
          not: null,
        },
      },
      include: {
        account: true,
        images: true,
        priceHistory: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
        predictions: {
          where: {
            expiresAt: {
              gte: new Date(),
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return assets.map((asset) => this.mapToResponseDto(asset));
  }

  private mapToResponseDto(asset: any): AssetResponseDto {
    return {
      id: asset.id,
      userId: asset.userId,
      accountId: asset.accountId,
      name: asset.name,
      type: asset.type,
      symbol: asset.symbol,
      isin: asset.isin,
      quantity: asset.quantity,
      purchasePrice: asset.purchasePrice,
      purchaseDate: asset.purchaseDate,
      monthlyInvestment: asset.monthlyInvestment,
      currentPrice: asset.currentPrice,
      currency: asset.currency,
      totalValue: asset.totalValue,
      totalGain: asset.totalGain,
      totalGainPercent: asset.totalGainPercent,
      lastPriceUpdate: asset.lastPriceUpdate,
      isActive: asset.isActive,
      description: asset.description,
      brand: asset.brand,
      model: asset.model,
      year: asset.year,
      condition: asset.condition,
      serialNumber: asset.serialNumber,
      certification: asset.certification,
      thumbnailUrl: asset.thumbnailUrl,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
    };
  }
}
