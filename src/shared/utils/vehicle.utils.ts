export function includesAll(text: string, words: string[]): boolean {
  return words.every((word) => text.includes(word));
}

export function cleanSearchName(word: string): string {
  const caracteresValidos = /[^a-zA-Z0-9]+/g;
  word = word.replace(caracteresValidos, ' ');
  word = word.trim().toLowerCase();

  return word;
}
