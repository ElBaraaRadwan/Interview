import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateOrganizationDto } from './dto';
import { UpdateOrganizationDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrganizationService {
  constructor(private readonly Prisma: PrismaService) {}
  create(dto: CreateOrganizationDto) {
    return this.Prisma.organization.create({
      data: {
        name: dto.name,
        description: dto.description,
      },
    });
  }

  async invite(
    id: string,
    dto: UpdateOrganizationDto,
    User: { email: string; id: string },
  ) {
    const user = await this.Prisma.user.findUnique({
      where: { email: User.email },
    });

    if (!user) throw new ForbiddenException('user not found');
    const invite = await this.Prisma.organization.update({
      where: { id },
      data: {
        members: dto.members
          ? {
              connect: dto.members.map((memberId = user.id) => ({
                id: memberId,
              })),
            }
          : undefined,
      },
    });

    if (!invite) throw new ForbiddenException('invite failed');
    return invite;
  }

  findAll() {
    return this.Prisma.organization.findMany();
  }

  findOne(id: string) {
    return this.Prisma.organization.findUnique({ where: { id } });
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
    return this.Prisma.organization.delete({ where: { id } });
  }
}
