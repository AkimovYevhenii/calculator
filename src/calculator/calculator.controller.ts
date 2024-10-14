import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { IsString } from 'class-validator';
import { IsValidExpression } from './valid-expression.decorator';
import { CalculatorService } from './calculator.service';

class ExpressionDto {
  @IsString()
  @IsValidExpression()
  expression: string;
}

@Controller('evaluate')
export class CalculatorController {
  constructor(private readonly calculatorService: CalculatorService) {}
  @Post()
  async evaluate(@Body() expressionDto: ExpressionDto): Promise<{result: number}> {
    const { expression } = expressionDto;

    try {
      const result = await this.calculatorService.evaluate(expression);
      return { result };
    } catch (error) {
      //todo creat global error handler
      throw new HttpException('Error evaluating expression', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}