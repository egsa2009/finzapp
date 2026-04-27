import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CategoriesModule } from './categories/categories.module';
import { ReportsModule } from './reports/reports.module';
import { IngestModule } from './ingest/ingest.module';
import { RulesModule } from './rules/rules.module';
import { BudgetsModule } from './budgets/budgets.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    TransactionsModule,
    CategoriesModule,
    ReportsModule,
    IngestModule,
    RulesModule,
    BudgetsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
