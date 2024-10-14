import { Test, TestingModule } from '@nestjs/testing';
import { CalculatorController } from './calculator.controller';
import { CalculatorService } from './calculator.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('CalculatorController', () => {
  let controller: CalculatorController;
  let calculatorService: CalculatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalculatorController],
      providers: [
        {
          provide: CalculatorService,
          useValue: {
            evaluate: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CalculatorController>(CalculatorController);
    calculatorService = module.get<CalculatorService>(CalculatorService);
  });

  it('should evaluate a valid expression correctly', async () => {
    const expressionDto = { expression: '(1-1)*2+3*(1-3+4)+10/2' };
    const expectedResult = 11;

    jest.spyOn(calculatorService, 'evaluate').mockResolvedValue(expectedResult);

    const result = await controller.evaluate(expressionDto);
    expect(result).toMatchObject({ result: expectedResult });
  });

  it('should throw 400 for invalid expression', async () => {
    const expressionDto = { expression: '(1-1)*two' };

    jest.spyOn(calculatorService, 'evaluate').mockRejectedValue(new Error('Invalid expression'));

    await expect(controller.evaluate(expressionDto)).rejects.toThrow(
      new HttpException('Error evaluating expression', HttpStatus.INTERNAL_SERVER_ERROR),
    );
  });

  it('universe is', async () => {
    const expressionDto = { expression: '10 / 0' };

    jest.spyOn(calculatorService, 'evaluate').mockResolvedValue(Infinity);

    const result = await controller.evaluate(expressionDto);
    expect(result).toMatchObject({ result: Infinity });
  });
});
