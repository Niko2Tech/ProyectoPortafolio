// Tipos para el validador de RUT
interface RutValidationResult {
  isValid: boolean
  formatted: string
  message?: string
}

export class RutValidator {
  /**
   * Formatea un RUT aplicando puntos y guión
   * @param value - Valor del RUT a formatear
   * @returns RUT formateado
   */
  static formatRut(value: string = ''): string {
    // Elimina caracteres no válidos y convierte K a minúscula
    let cleanValue = value.replace(/[^\dKk]/g, '').replace(/K/g, 'k')

    // Aplica el formateo
    if (cleanValue.length > 7) {
      return `${cleanValue.slice(0, -7)}.${cleanValue.slice(-7, -4)}.${cleanValue.slice(-4, -1)}-${cleanValue.slice(-1)}`
    } else if (cleanValue.length > 4) {
      return `${cleanValue.slice(0, -4)}.${cleanValue.slice(-4, -1)}-${cleanValue.slice(-1)}`
    } else if (cleanValue.length > 1) {
      return `${cleanValue.slice(0, -1)}-${cleanValue.slice(-1)}`
    }
    return cleanValue
  }

  /**
   * Calcula el dígito verificador de un RUT
   * @param rutNumbers - Números del RUT sin dígito verificador
   * @returns Dígito verificador calculado
   */
  static calculateVerifierDigit(rutNumbers: string): string {
    let sum = 0
    let multiplier = 2

    // Recorre los números del RUT de derecha a izquierda
    for (let i = rutNumbers.length - 1; i >= 0; i--) {
      sum += parseInt(rutNumbers[i]) * multiplier
      multiplier = multiplier === 7 ? 2 : multiplier + 1
    }

    const remainder = sum % 11
    const verifierDigit = 11 - remainder

    if (verifierDigit === 11) return '0'
    if (verifierDigit === 10) return 'k'
    return verifierDigit.toString()
  }

  /**
   * Valida si un RUT es válido
   * @param rut - RUT a validar (puede estar formateado o no)
   * @returns Resultado de la validación
   */
  static validateRut(rut: string): RutValidationResult {
    if (!rut || rut.trim() === '') {
      return {
        isValid: false,
        formatted: '',
        message: 'RUT es requerido',
      }
    }

    // Limpia el RUT y convierte K a minúscula
    const cleanRut = rut.replace(/[^\dKk]/g, '').replace(/K/g, 'k')

    // Verifica longitud mínima
    if (cleanRut.length < 2) {
      return {
        isValid: false,
        formatted: this.formatRut(rut),
        message: 'RUT debe tener al menos 2 caracteres',
      }
    }

    // Verifica longitud máxima
    if (cleanRut.length > 9) {
      return {
        isValid: false,
        formatted: this.formatRut(rut),
        message: 'RUT no puede tener más de 9 caracteres',
      }
    }

    // Separa números y dígito verificador
    const rutNumbers = cleanRut.slice(0, -1)
    const providedVerifier = cleanRut.slice(-1)

    // Verifica que la parte numérica contenga solo números
    if (!/^\d+$/.test(rutNumbers)) {
      return {
        isValid: false,
        formatted: this.formatRut(rut),
        message: 'Los primeros dígitos deben ser números',
      }
    }

    // Verifica que el dígito verificador sea válido
    if (!/^[\dk]$/.test(providedVerifier)) {
      return {
        isValid: false,
        formatted: this.formatRut(rut),
        message: "Dígito verificador debe ser un número o 'k'",
      }
    }

    // Calcula el dígito verificador correcto
    const calculatedVerifier = this.calculateVerifierDigit(rutNumbers)

    // Verifica si el dígito verificador es correcto
    const isValid = calculatedVerifier === providedVerifier

    return {
      isValid,
      formatted: this.formatRut(rut),
      message: isValid ? undefined : 'Dígito verificador incorrecto',
    }
  }

  /**
   * Obtiene un RUT limpio (sin formato) desde un RUT formateado
   * @param formattedRut - RUT formateado
   * @returns RUT sin formato
   */
  static getCleanRut(formattedRut: string): string {
    return formattedRut.replace(/[^\dKk]/g, '').replace(/K/g, 'k')
  }

  /**
   * Verifica si un RUT tiene el formato correcto (visual)
   * @param rut - RUT a verificar
   * @returns true si tiene formato correcto
   */
  static hasCorrectFormat(rut: string): boolean {
    const formatRegex = /^\d{1,2}\.\d{3}\.\d{3}-[\dk]$/
    return formatRegex.test(rut)
  }
}

// Composable para usar en Vue 3
export function useRutValidator() {
  const formatRut = (value: string) => RutValidator.formatRut(value)
  const validateRut = (rut: string) => RutValidator.validateRut(rut)
  const getCleanRut = (formattedRut: string) => RutValidator.getCleanRut(formattedRut)

  return {
    formatRut,
    validateRut,
    getCleanRut,
  }
}
