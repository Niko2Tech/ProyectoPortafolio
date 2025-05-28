import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  Get,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './entities/auth-response.entity';
import { Response } from 'express';
import { ApiBody, ApiResponse, ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { RequestWithCookies } from './types/cookie.type';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    res.cookie('access_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000,
    });
    delete result.token;
    return result;
  }
  @Post('logout')
  @HttpCode(200)
  @ApiResponse({ status: 200, description: 'Sesión cerrada' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return { message: 'Sesión cerrada exitosamente' };
  }

  @Get('verify')
  @HttpCode(200)
  @ApiCookieAuth('access_token')
  @ApiResponse({
    status: 200,
    description: 'Token válido',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o no proporcionado',
  })
  async verify(@Req() req: RequestWithCookies) {
    const token = req.cookies?.access_token;

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }
    const result = await this.authService.verifyToken(token);
    return result;
  }
}
