export function includesAll(text: string, words: string[]): boolean {
  return words.every((word) => text.includes(word));
}

export function cleanSearchName(word: string): string {
  const caracteresValidos = /[^a-zA-Z0-9]+/g;
  word = word.replace(caracteresValidos, ' ');
  word = word.trim().toLowerCase();

  return word;
}

export function getMileage(mileage: string): number {
  const match = mileage.match(/(\d{1,3}(?:,\d{3})*|\d+)/);
  if (match) {
    const numberString = match[1].replace(/,/g, '');
    return parseInt(numberString, 10);
  } else {
    return null;
  }
}
