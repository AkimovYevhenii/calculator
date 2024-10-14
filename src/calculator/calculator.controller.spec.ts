import { Test, TestingModule } from '@nestjs/testing';
import { CalculatorController } from './calculator.controller';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('CalculatorController', () => {
  let controller: CalculatorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalculatorController],
    }).compile();

    controller = module.get<CalculatorController>(CalculatorController);
  });

  it('should evaluate a valid expression correctly', () => {
    const expressionDto = { expression: '(1-1)*2+3*(1-3+4)+10/2' };
    const result = controller.evaluate(expressionDto);
    expect(result).toMatchObject({ result: 11 });
  });

  it('should throw 400 for invalid expression', () => {
    const expressionDto = { expression: '(1-1)*two' };
    expect(() => controller.evaluate(expressionDto)).toThrow(
      new HttpException('Error evaluating expression', HttpStatus.BAD_REQUEST),
    );
  });

  it('universe is', () => {
    const expressionDto = { expression: '10 / 0' };
    const result = controller.evaluate(expressionDto);
    expect(result.result).toBe(Infinity);
  });
});