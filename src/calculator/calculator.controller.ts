import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { IsString } from 'class-validator';
import { IsValidExpression } from './valid-expression.decorator';

class ExpressionDto {
  @IsString()
  @IsValidExpression()
  expression: string;
}

@Controller('evaluate')
export class CalculatorController {
  @Post()
  evaluate(@Body() expressionDto: ExpressionDto): any {
    const { expression } = expressionDto;

    try {
      const result = this.evaluateExpression(expression);
      return { result };
    } catch (error) {
      //todo creat global error handler
      throw new HttpException('Error evaluating expression', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  private evaluateExpression(expression: string): number {
    return Function(`"use strict"; return (${expression})`)();
  }
}