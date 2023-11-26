import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly validApiKeys: Array<string>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = this.extractKeyFromHeader(request);
    if (!apiKey) {
      throw new UnauthorizedException();
    }
    if (!this.isApiKeyValid(apiKey)) {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractKeyFromHeader(request: any): string | undefined {
    const key = request.headers['x-api-key'];
    return key;
  }
  private isApiKeyValid(key: string) {
    return this.validApiKeys.includes(key);
  }
}
