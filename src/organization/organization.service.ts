import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateOrganizationDto } from './dto';
import { UpdateOrganizationDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrganizationService {
  constructor(private readonly Prisma: PrismaService) {}
  async create(dto: CreateOrganizationDto) {
    try {
      const find = await this.Prisma.organization.findUnique({
        where: { name: dto.name },
      });

      if (find) {
        throw new ForbiddenException('Organization already exists');
      }
      const organization = await this.Prisma.organization.create({
        data: {
          name: dto.name,
          description: dto.description,
        },
      });

      return {
        id: organization.id,
      };
    } catch (error) {
      throw error;
    }
  }

  async invite(id: string, email: string) {
    try {
      const user = await this.Prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new ForbiddenException('User not found');
      }

      const organization = await this.Prisma.organization.findUnique({
        where: { id },
      });

      if (!organization) {
        throw new ForbiddenException('Organization not found');
      }

      await this.Prisma.organization.update({
        where: { id },
        data: {
          members: {
            connect: {
              email,
            },
          },
        },
      });

      return { message: 'User invited' };
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    const findAll = await this.Prisma.organization.findMany({
      include: {
        members: {
          select: { email: true, name: true, accessLevel: true },
        },
      },
    });

    return {
      data: findAll.map((find) => ({
        id: find.id,
        name: find.name,
        description: find.description,
        members: find.members,
      })),
    };
  }

  async findOne(id: string) {
    const find = await this.Prisma.organization.findUnique({
      where: { id },
      include: {
        members: {
          select: { email: true, name: true, accessLevel: true },
        },
      },
    });

    if (!find) throw new ForbiddenException('Organization not found');

    return {
      id: find.id,
      name: find.name,
      description: find.description,
      members: find.members,
    };
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    const Organization = await this.Prisma.organization.findUnique({
      where: { id },
    });

    if (!Organization) throw new ForbiddenException('Organization not found');

    const update = await this.Prisma.organization.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
      },
    });

    return {
      id: update.id,
      name: update.name,
      description: update.description,
    };
  }

  remove(id: string) {
    this.Prisma.organization.delete({ where: { id } });

    return { message: 'Organization deleted' };
  }
}
