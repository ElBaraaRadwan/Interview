import * as pactum from 'pactum';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from '../src/organization/dto';
import { CreateAuthDto, UpdateAuthDto } from '../src/auth/dto';

describe('APP E2E', () => {
  let prisma: PrismaService;
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3330);

    // Clean the database before running the tests
    prisma = app.get(PrismaService);
    await prisma.cleanDB();
    pactum.request.setBaseUrl('http://localhost:3330');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    describe('Signup', () => {
      const dto: CreateAuthDto = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'password',
      };
      it('should return 400 if the email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ password: dto.password })
          .expectStatus(400);
      });

      it('should return 400 if the password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ email: dto.email })
          .expectStatus(400);
      });

      it('should return 400 if no body provided', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });

      it('should create a new user', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });

      it("shouldn't create an existed user", () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(403);
      });
    });

    describe('Signin', () => {
      const dto: UpdateAuthDto = {
        email: 'test@test.com',
        password: 'password',
      };
      it('should return 400 if the email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ password: dto.password })
          .expectStatus(400);
      });

      it('should return 400 if the password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ email: dto.email })
          .expectStatus(400);
      });

      it('should return 400 if no body provided', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });
      it('should signin a user', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(201)
          .stores('token', 'accessToken');
      });

      it("shouldn't signin non-exist a user", () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ email: 'lol@lol.com', password: 'lol' })
          .expectStatus(403);
      });
    });
  });

  describe('Organization', () => {
    describe('Create', () => {
      const dto: CreateOrganizationDto = {
        name: 'Test Organization',
        description: 'Test Description',
      };
      it('should create a new organization', () => {
        return pactum
          .spec()
          .post('/organization')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('organizationId', 'id');
      });

      it("shouldn't create an existed organization", () => {
        return pactum
          .spec()
          .post('/organization')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .withBody(dto)
          .expectStatus(403);
      });
    });

    describe('Invite', () => {});

    describe('findAll', () => {
      it('should return all organizations', () => {
        return pactum
          .spec()
          .get('/organization')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('findOne', () => {
      it('should return an organization', () => {
        return pactum
          .spec()
          .get(`/organization/$S{id}`)
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{organizationId}');
      });
    });

    describe('Update', () => {
      const dto: UpdateOrganizationDto = {
        name: 'Test Organization Updated',
        description: 'Test Description Updated',
      };
      it('should update an organization', () => {
        return pactum
          .spec()
          .put(`/organization/$S{id}`)
          .withPathParams('id', '$S{organizationId}')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.name)
          .expectBodyContains(dto.description);
      });
    });

    describe('Remove', () => {
      it('should remove the organization', () => {
        return pactum
          .spec()
          .delete('/organization/{id}')
          .withPathParams('id', '$S{organization}')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .expectStatus(204);
      });

      it('should get empty organization', () => {
        return pactum
          .spec()
          .get('/organization')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});
