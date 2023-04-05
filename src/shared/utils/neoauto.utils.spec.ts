import { parsePrice, getEnumKeyByValue } from './neoauto.utils';

describe('neoauto.utils', () => {
  describe('parsePrice', () => {
    it.each([
      { value: '$27,000' },
      { value: '$27,000 ' },
      { value: ' $27,000' },
      { value: ' $ 27,000 ' },
    ])(
      'should return the correct integer number when the price is $value',
      ({ value }) => {
        const result = parsePrice(value);

        expect(result).toBe(27000);
      },
    );

    it.each([
      { value: '$27,000.08' },
      { value: '$27,000.08 ' },
      { value: ' $27,000.08' },
      { value: ' $ 27,000.08 ' },
    ])(
      'should return the correct decimal number when the price is $value',
      ({ value }) => {
        const result = parsePrice(value);

        expect(result).toBe(27000.08);
      },
    );

    it('should return undefined when the price is null', () => {
      const result = parsePrice(null);

      expect(result).toBe(undefined);
    });

    it('should return undefined when the price is invalid', () => {
      const result = parsePrice('#450000');

      expect(result).toBe(undefined);
    });
  });

  describe('getEnumKeyByValue', () => {
    it('should return the key name from Enum key', () => {
      enum EnumExample {
        FIRST_VALUE = 'first value',
        SECOND_VALUE = 'second value',
      }
      const result = getEnumKeyByValue(EnumExample, EnumExample.FIRST_VALUE);

      expect(result).toBe('FIRST_VALUE');
    });
  });
});

//auto/nuevo/honda-type-r-2023-1709812
