import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Decimal } from '@prisma/client/runtime';
import { Kind, ValueNode } from 'graphql';

@Scalar('Decimal')
export class DecimalScalar implements CustomScalar<number, Decimal> {
  description = 'Decimal custom scalar type';

  parseValue(value: number): Decimal {
    return new Decimal(value);
  }

  serialize(value: Decimal): number {
    return parseFloat(value.toString());
  }

  parseLiteral(ast: ValueNode): Decimal {
    if (ast.kind === Kind.INT || ast.kind === Kind.FLOAT) {
      return new Decimal(parseFloat(ast.value));
    }
    return null;
  }
}
