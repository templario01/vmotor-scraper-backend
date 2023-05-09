import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EnvConfigService } from '../../../config/env-config.service';
import { UserRepository } from '../../../persistence/repositories/user.repository';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class LoggedUser implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly envConfigService: EnvConfigService,
    private readonly userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = this.getContext(context);
      const token = this.extractTokenFromHeader(request);
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.envConfigService.jwtConfig().secret,
      });
      request['user'] = payload;

      return true;
    } catch {
      return true;
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    try {
      const [type, token] = request.headers.authorization?.split(' ') ?? [];

      return type === 'Bearer' ? token : undefined;
    } catch (error) {
      return undefined;
    }
  }

  private getContext(context: ExecutionContext) {
    if (context.getType<GqlContextType>() === 'graphql') {
      return GqlExecutionContext.create(context).getContext().req;
    } else {
      return context.switchToHttp().getRequest();
    }
  }
}
