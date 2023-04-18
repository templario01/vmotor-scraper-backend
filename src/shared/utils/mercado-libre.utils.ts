export function getMultiplesOfFortyEight(numero: number): number[] {
  const multiples = [1];
  let ultimo = 1;
  for (let i = 1; i < numero; i++) {
    ultimo += 48;
    multiples.push(ultimo);
  }
  return multiples;
}

export function parsePrice(strPrice: string): number {
  try {
    const price = strPrice.replace('.', '').trim();

    return parseFloat(price);
  } catch (error) {
    return undefined;
  }
}

export function convertToNumber(textNumber: string) {
  try {
    const numberString = textNumber.replace(/[^0-9]/g, '');

    return +numberString;
  } catch (error) {
    return undefined;
  }
}
