export function includesAll(text: string, words: string[]): boolean {
  return words.every((word) => text.includes(word));
}
