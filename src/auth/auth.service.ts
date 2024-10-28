import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
    
@Injectable()
export class AuthService {
  constructor(private readonly Prisma: PrismaService) {}

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
          email: dto.email,
          OrganizationId: '671fd5784a6cdf5348552c89', // This is hardcoded for now
          password: hash,
        },
      });

      return user;
    } catch (error) {
      throw error;
    }
  }

  async signin(dto: CreateAuthDto) {
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

    return user;
  }
}
