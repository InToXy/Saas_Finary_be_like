import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
  IsUUID,
  Min,
} from 'class-validator';
import { AssetType } from '../../../types/prisma-types';

export class CreateAssetDto {
  @IsString()
  name: string;

  @IsEnum(AssetType)
  type: AssetType;

  @IsOptional()
  @IsString()
  symbol?: string;

  @IsOptional()
  @IsString()
  isin?: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  purchasePrice: number;

  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyInvestment?: number;

  @IsNumber()
  @Min(0)
  currentPrice: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsUUID()
  accountId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  // Collectibles fields
  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsString()
  condition?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsString()
  certification?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;
}
