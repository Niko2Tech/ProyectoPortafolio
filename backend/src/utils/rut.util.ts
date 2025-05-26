import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

// Función para validar el dígito verificador del RUT
function validarRut(rutCompleto: string): boolean {
  if (!rutCompleto.includes('-')) return false;

  const [numero, digitoVerificador] = rutCompleto.split('-');

  const rut = numero.replace(/\./g, ''); // quitamos puntos
  const dv = digitoVerificador.toLowerCase(); // puede ser k/K

  let suma = 0;
  let multiplicador = 2;

  for (let i = rut.length - 1; i >= 0; i--) {
    suma += parseInt(rut.charAt(i), 10) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resto = suma % 11;
  const digitoCalculado = 11 - resto;

  let dvEsperado = '';

  if (digitoCalculado === 11) {
    dvEsperado = '0';
  } else if (digitoCalculado === 10) {
    dvEsperado = 'k';
  } else {
    dvEsperado = digitoCalculado.toString();
  }

  return dvEsperado === dv;
}

@ValidatorConstraint({ async: false })
export class RutValidator implements ValidatorConstraintInterface {
  validate(rut: any): boolean {
    return typeof rut === 'string' && validarRut(rut);
  }

  defaultMessage(): string {
    return 'El RUT ingresado no es válido';
  }
}

// Decorador personalizado que se puede usar en los DTO
export function IsRut(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: RutValidator,
    });
  };
}
