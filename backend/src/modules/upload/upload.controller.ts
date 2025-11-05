import {
  Controller,
  Post,
  Delete,
  Patch,
  Get,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UploadAssetImageDto, AssetImageResponseDto } from './dto/upload-asset-image.dto';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('asset-image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload an image for an asset' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        assetId: {
          type: 'string',
        },
        isMain: {
          type: 'boolean',
        },
      },
    },
  })
  async uploadAssetImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() dto: UploadAssetImageDto,
    @CurrentUser() user: any,
  ): Promise<AssetImageResponseDto> {
    return this.uploadService.uploadAssetImage(
      file,
      dto.assetId,
      user.id,
      dto.isMain || false,
    );
  }

  @Get('asset/:assetId/images')
  @ApiOperation({ summary: 'Get all images for an asset' })
  async getAssetImages(
    @Param('assetId') assetId: string,
  ): Promise<AssetImageResponseDto[]> {
    return this.uploadService.getAssetImages(assetId);
  }

  @Patch('image/:imageId/set-main')
  @ApiOperation({ summary: 'Set an image as the main image' })
  async setMainImage(
    @Param('imageId') imageId: string,
    @CurrentUser() user: any,
  ): Promise<AssetImageResponseDto> {
    return this.uploadService.setMainImage(imageId, user.id);
  }

  @Delete('image/:imageId')
  @ApiOperation({ summary: 'Delete an asset image' })
  async deleteAssetImage(
    @Param('imageId') imageId: string,
    @CurrentUser() user: any,
  ): Promise<{ message: string }> {
    return this.uploadService.deleteAssetImage(imageId, user.id);
  }
}
