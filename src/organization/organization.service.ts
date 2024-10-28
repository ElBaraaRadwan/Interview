import { Injectable } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrganizationService {
  constructor(private readonly Prisma: PrismaService) {}
  create(dto: CreateOrganizationDto) {
    return this.Prisma.organization.create({
      data: {
        name: dto.name,
        description: dto.description,
        // members: {
        //   connect: dto.members.map((memberId) => ({ id: memberId })),
        // },
      },
    });
  }

  findAll() {
    return this.Prisma.organization.findMany();
  }

  findOne(id: string) {
    return this.Prisma.organization.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateOrganizationDto) {
    return this.Prisma.organization.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        // members: {
        //   set: dto.members.map((memberId) => ({ id: memberId })),
        // },
      },
    });
  }

  remove(id: string) {
    return this.Prisma.organization.delete({ where: { id } });
  }
}
