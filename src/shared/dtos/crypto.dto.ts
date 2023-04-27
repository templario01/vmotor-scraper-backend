export interface SymmetricEncryption {
  readonly algorithm: string;
  readonly iv?: Buffer;
  readonly key: string;
}

export interface Hash {
  readonly iv: string;
  readonly content: string;
}
