import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authSerivce: AuthService) {}

  /**
   * POST /auth/login
   * public route - no authentication needed
   */
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@CurrentUser() user: any, @Body() loginDto: LoginDto) {
    return this.authSerivce.login(user);
  }

  /**
   * GET /auth/profile
   * protected route - reuqires JWT token
   */

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async profile(@CurrentUser() user: any) {
    return this.authSerivce.getProfile(user.id);
  }

  /**
   * GET /auth/me
   * protected route
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@CurrentUser() user: any) {
    return user;
  }
}
