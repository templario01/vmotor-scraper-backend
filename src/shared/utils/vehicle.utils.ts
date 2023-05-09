export function includesAll(text: string, words: string[]): boolean {
  return words.every((word) => text.includes(word));
}

export function cleanSearchName(word: string): string {
  try {
    const caracteresValidos = /[^a-zA-Z0-9]+/g;
    word = word.replace(caracteresValidos, ' ');
    word = word.trim().toLowerCase();

    return word;
  } catch (error) {
    return undefined;
  }
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

export function formatLocation(texto: string): string {
  try {
    const regex = new RegExp(/^\s+|\s+$|[^a-zA-Z\s]/g);
    const indexComma = texto.indexOf(',');
    const formatedLocation =
      texto.slice(0, indexComma).replace(regex, '').trim() +
      ', ' +
      texto
        .slice(indexComma + 1)
        .replace(regex, '')
        .trim();

    return formatedLocation;
  } catch (error) {
    return null;
  }
}

export function getWordsAndYear(searchName: string) {
  const search = cleanSearchName(searchName);

  if (search) {
    const yearPattern = new RegExp(/\b\d{4}\b/g);
    const cleanSearch = search.replace(yearPattern, '');
    const year = +search.match(yearPattern)?.[0];
    const keywords = cleanSearch?.split(' ').filter((word) => word !== '');

    return {
      year,
      keywords,
    };
  }

  return { keywords: [], year: undefined };
}
