import Dinero from 'dinero.js';

/**
 * Returns a new Dinero instance that contains:
 *  the amount specified in minor currency unit and the decimals indicated.
 *
 * @param {number} amount The amount to convert in minor currency unit (e.g.: dollar to cents).
 * @param {number} precision The precision indicates the decimals to use (by default is 2).
 * @return {Dinero} amount in minor currency unit with decimals indicated.
 */

export function formatAmount(amount: number, precision = 2) {
  const factor = Math.pow(10, precision);
  const roundedAmount = Math.round(amount * factor);

  return Dinero({ amount: roundedAmount, precision: precision });
}
