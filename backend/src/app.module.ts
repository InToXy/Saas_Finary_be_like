import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

// Common modules
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { AssetsModule } from './modules/assets/assets.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AggregationModule } from './modules/aggregation/aggregation.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SharedAccessModule } from './modules/shared-access/shared-access.module';
import { ReportsModule } from './modules/reports/reports.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 100, // 100 requests per minute
      },
    ]),

    // Scheduler for cron jobs
    ScheduleModule.forRoot(),

    // Common modules
    PrismaModule,
    RedisModule,

    // Feature modules
    AuthModule,
    UsersModule,
    AccountsModule,
    AssetsModule,
    TransactionsModule,
    AlertsModule,
    SubscriptionsModule,
    DashboardModule,
    AggregationModule,
    NotificationsModule,
    SharedAccessModule,
    ReportsModule,
    UploadModule,
  ],
})
export class AppModule {}
