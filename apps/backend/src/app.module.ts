import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CategoriesModule } from './categories/categories.module';
import { AccountsModule } from './account/accounts.module';
import { BudgetsModule } from './budgets/budgets.module';
import { ReportsModule } from './reports/reports.module';
import { UsersModule } from './user/users.module';
import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from './logger.middleware';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), // Carpeta donde pondrás el icono
    }),
    PrismaModule,
    AuthModule,
    TransactionsModule,
    CategoriesModule,
    AccountsModule,
    BudgetsModule,
    ReportsModule,
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true, // Esto hace que no tengas que importarlo en cada módulo hijo
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
