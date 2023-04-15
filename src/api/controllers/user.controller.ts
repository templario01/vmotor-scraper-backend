import { Controller, Get, Param, Res } from '@nestjs/common';
import { AuthService } from '../../application/auth/auth.service';
import { Response } from 'express';

@Controller('user')
export class UserController {
  constructor(private authService: AuthService) {}

  @Get(':uuid/verify')
  async verifyEmail(@Param('uuid') uuid: string, @Res() res: Response) {
    const redirectUrl = process.env.CLIENT_URL;
    const user = await this.authService.confirmAccount(uuid);
    if (user === null) {
      res.redirect(`${redirectUrl}/user-already-validated`);
    }
    res.setHeader('Authorization', `Bearer ${user.accessToken}`);
    res.redirect(`${redirectUrl}/validate-user`);
  }
}
