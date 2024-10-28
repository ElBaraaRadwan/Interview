import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateAuthDto, UpdateAuthDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly Prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  async signup(dto: CreateAuthDto) {
    try {
      const findUser = await this.Prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (findUser) {
        throw new ForbiddenException('User already exists');
      }
      const hash = await argon.hash(dto.password);
      const user = await this.Prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          OrganizationId: '671fd5784a6cdf5348552c89', // This is hardcoded for now
          password: hash,
        },
      });

      return this.signToken(user.id, user.email);
    } catch (error) {
      throw error;
    }
  }

  async signin(dto: UpdateAuthDto) {
    const user = await this.Prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const valid = await argon.verify(user.password, dto.password);

    if (!valid) {
      throw new ForbiddenException('Invalid password');
    }

    return this.signToken(user.id, user.email);
  }

  async signToken(
    userId: string,
    email: string,
  ): Promise<{ accessToken: string }> {
    const payload = { userId, email };
    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '30m',
      secret,
    });
    return { accessToken: token };
  }
}
