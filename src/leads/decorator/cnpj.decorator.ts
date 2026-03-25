// cnpj.decorator.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { cnpj as cnpjValidator } from 'cpf-cnpj-validator';

@ValidatorConstraint({ name: 'cnpj', async: false })
export class CnpjConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    if (!value) return true; // Permite vazio (use @IsNotEmpty se necessário)
    return cnpjValidator.isValid(value); // Valida formato e dígitos
  }

  defaultMessage() {
    return 'invalid CNPJ';
  }
}

export function IsCnpj(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: CnpjConstraint,
    });
  };
}
