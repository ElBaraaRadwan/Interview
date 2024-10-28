import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(private Prisma: PrismaService) {}

  async signup(dto: CreateAuthDto) {
    try {
      const hash = await argon.hash(dto.password);
      const user = this.Prisma.user.create({
        data: {
          email: dto.email,
          OrganizationId: '1', // This is hardcoded for now
          password: hash,
        },
      });

      console.log(user);
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('User already exists');
        }
      }
      throw error;
    }
  }

  async signin(dto: CreateAuthDto) {
    const user = this.Prisma.user.findUnique({ where: { email: dto.email } });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const valid = await argon.verify((await user).password, dto.password);

    if (!valid) {
      throw new ForbiddenException('Invalid password');
    }

    return user;
  }
}
