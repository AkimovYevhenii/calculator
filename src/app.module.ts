import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CalculatorController } from './calculator/calculator.controller';
import { CalculatorService } from './calculator/calculator.service'

@Module({
  imports: [],
  controllers: [AppController, CalculatorController],
  providers: [AppService, CalculatorService],
})
export class AppModule {}
