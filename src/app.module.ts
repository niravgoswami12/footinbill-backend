import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { CoreModule } from './core/core.module';
import { ExceptionsFilter } from './core/filter/exceptions.filter';
import { TransformInterceptor } from './core/interceptor/transform.interceptor';
import { environments } from './environments/environments';
import { FeatureModule } from './feature/feature.module';
// import mongoose from 'mongoose';

// mongoose.set('debug', true);
@Module({
  imports: [
    CoreModule,
    FeatureModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(environments.mongoUri),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        stopAtFirstError: true,
        // forbidUnknownValues: true,
      }),
    },
    {
      provide: APP_FILTER,
      useClass: ExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
