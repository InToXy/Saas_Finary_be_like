import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UploadAssetImageDto {
  @IsString()
  assetId: string;

  @IsOptional()
  @IsBoolean()
  isMain?: boolean;

  @IsOptional()
  @IsString()
  order?: string;
}

export class AssetImageResponseDto {
  id: string;
  assetId: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  order: number;
  isMain: boolean;
  createdAt: Date;
}
