import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
    PrismaModule,
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
