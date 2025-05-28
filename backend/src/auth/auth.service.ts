import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { comparePasswords } from 'src/utils/bcrypt.util';
import { AuthResponseDto } from './entities/auth-response.entity';
import { plainToInstance } from 'class-transformer';
import { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
      include: { rol: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }
    const IsValid = await comparePasswords(dto.password, user.password);
    if (!IsValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }
    const playload = {
      id: user.id,
      email: user.email,
      rolId: user.rol.id,
      rolName: user.rol.nombre,
    };
    const token = this.jwtService.sign(playload);
    return plainToInstance(AuthResponseDto, {
      token,
      ...user,
    });
  }

  async verifyToken(token: string) {
    try {
      const payload: JwtPayload = this.jwtService.verify(token);
      const user = await this.prisma.usuario.findUnique({
        where: { id: payload.id },
        include: { rol: true },
      });

      if (!user || !user.active) {
        throw new UnauthorizedException('Usuario no válido o inactivo');
      }

      // Verificar que el rol del token coincide con el rol actual del usuario
      if (user.rol.id !== payload.rolId) {
        throw new UnauthorizedException(
          'Los permisos del usuario han cambiado',
        );
      }

      return plainToInstance(AuthResponseDto, {
        ...user,
      });
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
