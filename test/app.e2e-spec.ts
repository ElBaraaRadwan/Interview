import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { AppModule } from './../src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAuthDto } from 'src/auth/dto';
import { CreateOrganizationDto } from 'src/organization/dto';

describe('APP E2E', () => {
  let app: INestApplication;
  let Prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);

    //Clean Db before each test
    Prisma = app.get(PrismaService);
    await Prisma.cleanDB(); // This is a custom method to clean the database
    pactum.request.setBaseUrl('http://localhost:3333'); // This is a custom method to set the base url for the tests
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    const dto: CreateAuthDto = {
      name: 'Test User',
      email: 'test@test.com',
      password: 'password',
    };

    describe('Signup', () => {});

    describe('Signin', () => {});
  });

  describe('Organization', () => {
    const dto: CreateOrganizationDto = {
      name: 'Test Organization',
      description: 'Test Description',
    };
    describe('Create', () => {});

    describe('Invite', () => {});

    describe('findAll', () => {});

    describe('findOne', () => {});

    describe('Update', () => {});

    describe('Remove', () => {});
  });
});
