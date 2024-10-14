import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

const validChars = /^[-+*/()0-9.\s]*$/;

@ValidatorConstraint({ async: false })
export class IsValidExpressionConstraint
  implements ValidatorConstraintInterface
{
  validate(expression: string): boolean {
    return validChars.test(expression);
  }

  defaultMessage(args: ValidationArguments): string {
    return 'Expression contains invalid characters';
  }
}

export function IsValidExpression(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidExpressionConstraint,
    });
  };
}