export abstract class AbstractFactory<T> {
  abstract make(input?: unknown): Promise<T>;
  abstract makeMany(factorial: number, input: unknown): Promise<T[]>;
}
