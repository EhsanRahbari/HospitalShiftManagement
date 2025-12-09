import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //TODO: declaring dtos for user correctly
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    try {
      return this.authService.signIn(signInDto.userName, signInDto.password);
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        console.log('the user is not authorized', error);
        return {};
      }
    }
  }
}
