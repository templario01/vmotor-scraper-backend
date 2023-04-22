import { Controller, Get, Param, Res } from '@nestjs/common';
import { AuthService } from '../../application/auth/auth.service';
import { Response } from 'express';
import { decrypt } from '../../shared/utils/crypto.utils';

@Controller('user')
export class UserController {
  constructor(private authService: AuthService) {}

  @Get(':hexid/verify')
  async verifyEmail(@Param('hexid') hexid: string, @Res() res: Response) {
    const redirectUrl = process.env.CLIENT_URL;
    const decryptedId = parseInt(decrypt(hexid));
    console.log(decryptedId);
    const user = await this.authService.confirmAccount(decryptedId);
    if (user === null) {
      res.redirect(`${redirectUrl}/user-already-validated`);
    }
    res.set('Authorization', `Bearer ${user.accessToken}`);
    res.redirect(`${redirectUrl}/validate-user`);
  }
}
