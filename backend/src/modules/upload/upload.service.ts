import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs/promises';
import { AssetImageResponseDto } from './dto/upload-asset-image.dto';

@Injectable()
export class UploadService {
  private readonly uploadDir: string;
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: string[];
  private readonly maxImagesPerAsset: number;

  constructor(private readonly prisma: PrismaService) {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB
    this.allowedMimeTypes = (
      process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp'
    ).split(',');
    this.maxImagesPerAsset = parseInt(
      process.env.MAX_IMAGES_PER_ASSET || '5',
    );
  }

  async uploadAssetImage(
    file: Express.Multer.File,
    assetId: string,
    userId: string,
    isMain = false,
  ): Promise<AssetImageResponseDto> {
    // Validate asset ownership
    const asset = await this.prisma.asset.findFirst({
      where: { id: assetId, userId },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    // Check current image count
    const existingImagesCount = await this.prisma.assetImage.count({
      where: { assetId },
    });

    if (existingImagesCount >= this.maxImagesPerAsset) {
      throw new BadRequestException(
        `Maximum ${this.maxImagesPerAsset} images per asset`,
      );
    }

    // Validate file
    this.validateFile(file);

    // Create upload directory if it doesn't exist
    await this.ensureUploadDir();

    // Generate unique filename
    const filename = this.generateFilename(file);
    const filepath = path.join(this.uploadDir, filename);

    // Process and save image
    await this.processAndSaveImage(file.buffer, filepath);

    // Create thumbnail
    const thumbnailFilename = `thumb_${filename}`;
    const thumbnailPath = path.join(this.uploadDir, thumbnailFilename);
    await this.createThumbnail(file.buffer, thumbnailPath);

    // Get next order number
    const maxOrder = await this.prisma.assetImage.findFirst({
      where: { assetId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const order = maxOrder ? maxOrder.order + 1 : 0;

    // If this is set as main, unset other main images
    if (isMain) {
      await this.prisma.assetImage.updateMany({
        where: { assetId, isMain: true },
        data: { isMain: false },
      });
    }

    // Save to database
    const assetImage = await this.prisma.assetImage.create({
      data: {
        assetId,
        url: `/uploads/${filename}`,
        filename,
        mimeType: file.mimetype,
        size: file.size,
        order,
        isMain: isMain || existingImagesCount === 0, // First image is main by default
      },
    });

    // Update asset thumbnail if this is the main image
    if (assetImage.isMain) {
      await this.prisma.asset.update({
        where: { id: assetId },
        data: { thumbnailUrl: `/uploads/${thumbnailFilename}` },
      });
    }

    return assetImage;
  }

  async deleteAssetImage(
    imageId: string,
    userId: string,
  ): Promise<{ message: string }> {
    const image = await this.prisma.assetImage.findFirst({
      where: {
        id: imageId,
        asset: { userId },
      },
      include: { asset: true },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    // Delete file from disk
    const filepath = path.join(this.uploadDir, image.filename);
    const thumbnailPath = path.join(this.uploadDir, `thumb_${image.filename}`);

    try {
      await fs.unlink(filepath);
      await fs.unlink(thumbnailPath);
    } catch (error) {
      // File might not exist, continue anyway
      console.error('Error deleting file:', error);
    }

    // Delete from database
    await this.prisma.assetImage.delete({ where: { id: imageId } });

    // If this was the main image, set another image as main
    if (image.isMain) {
      const nextImage = await this.prisma.assetImage.findFirst({
        where: { assetId: image.assetId },
        orderBy: { order: 'asc' },
      });

      if (nextImage) {
        await this.prisma.assetImage.update({
          where: { id: nextImage.id },
          data: { isMain: true },
        });

        await this.prisma.asset.update({
          where: { id: image.assetId },
          data: { thumbnailUrl: `/uploads/thumb_${nextImage.filename}` },
        });
      } else {
        await this.prisma.asset.update({
          where: { id: image.assetId },
          data: { thumbnailUrl: null },
        });
      }
    }

    return { message: 'Image deleted successfully' };
  }

  async getAssetImages(assetId: string): Promise<AssetImageResponseDto[]> {
    return this.prisma.assetImage.findMany({
      where: { assetId },
      orderBy: [{ isMain: 'desc' }, { order: 'asc' }],
    });
  }

  async setMainImage(
    imageId: string,
    userId: string,
  ): Promise<AssetImageResponseDto> {
    const image = await this.prisma.assetImage.findFirst({
      where: {
        id: imageId,
        asset: { userId },
      },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    // Unset other main images
    await this.prisma.assetImage.updateMany({
      where: { assetId: image.assetId, isMain: true },
      data: { isMain: false },
    });

    // Set this image as main
    const updatedImage = await this.prisma.assetImage.update({
      where: { id: imageId },
      data: { isMain: true },
    });

    // Update asset thumbnail
    await this.prisma.asset.update({
      where: { id: image.assetId },
      data: { thumbnailUrl: `/uploads/thumb_${image.filename}` },
    });

    return updatedImage;
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum ${this.maxFileSize / 1024 / 1024}MB`,
      );
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }
  }

  private generateFilename(file: Express.Multer.File): string {
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `asset_${timestamp}_${random}${ext}`;
  }

  private async ensureUploadDir(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  private async processAndSaveImage(
    buffer: Buffer,
    filepath: string,
  ): Promise<void> {
    await sharp(buffer)
      .resize(1920, 1920, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toFile(filepath);
  }

  private async createThumbnail(
    buffer: Buffer,
    filepath: string,
  ): Promise<void> {
    await sharp(buffer)
      .resize(400, 400, {
        fit: 'cover',
      })
      .jpeg({ quality: 80 })
      .toFile(filepath);
  }
}
