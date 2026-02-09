import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20'; // 👈 Importar Profile
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { GoogleUser } from '../interfaces/google-user.interface'; // 👈 Importar la interfaz

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService, // 👈 Agregar private readonly
    private readonly authService: AuthService,
  ) {
    super({
      // 👇 Usar <string> para calmar al linter
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || '',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { name, emails, photos, id } = profile;

    // Validación defensiva para TypeScript
    const userGoogle: GoogleUser = {
      email: emails && emails[0] ? emails[0].value : '',
      firstName: name && name.givenName ? name.givenName : '',
      lastName: name && name.familyName ? name.familyName : '',
      picture: photos && photos[0] ? photos[0].value : '',
      googleId: id,
      accessToken,
    };

    try {
      const user = await this.authService.validateGoogleUser(userGoogle);

      done(null, user);
    } catch (error) {
      done(error, undefined);
    }
  }
}
