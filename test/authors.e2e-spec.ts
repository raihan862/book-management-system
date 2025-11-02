import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

describe('Authors (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let createdAuthorId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.useGlobalFilters(new AllExceptionsFilter());

    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /authors', () => {
    it('should create a new author', () => {
      const createAuthorDto = {
        firstName: 'John',
        lastName: 'Doe',
        bio: 'A prolific writer',
        birthDate: '1980-01-01',
      };

      return request(app.getHttpServer())
        .post('/authors')
        .send(createAuthorDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.firstName).toBe(createAuthorDto.firstName);
          expect(res.body.lastName).toBe(createAuthorDto.lastName);
          expect(res.body.bio).toBe(createAuthorDto.bio);
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
          createdAuthorId = res.body.id;
        });
    });

    it('should fail validation when firstName is missing', () => {
      const invalidDto = {
        lastName: 'Doe',
      };

      return request(app.getHttpServer())
        .post('/authors')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /authors/:id', () => {
    it('should retrieve the created author', () => {
      return request(app.getHttpServer())
        .get(`/authors/${createdAuthorId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdAuthorId);
          expect(res.body.firstName).toBe('John');
          expect(res.body.lastName).toBe('Doe');
        });
    });

    it('should return 404 for non-existent author', () => {
      return request(app.getHttpServer())
        .get('/authors/123e4567-e89b-12d3-a456-426614174999')
        .expect(404);
    });
  });

  describe('GET /authors', () => {
    it('should retrieve all authors', () => {
      return request(app.getHttpServer())
        .get('/authors')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.meta).toHaveProperty('total');
          expect(res.body.meta).toHaveProperty('page');
          expect(res.body.meta).toHaveProperty('limit');
        });
    });
  });

  describe('PATCH /authors/:id', () => {
    it('should update an author', () => {
      const updateDto = {
        bio: 'Updated biography',
      };

      return request(app.getHttpServer())
        .patch(`/authors/${createdAuthorId}`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.bio).toBe(updateDto.bio);
        });
    });
  });

  describe('DELETE /authors/:id', () => {
    it('should delete an author', () => {
      return request(app.getHttpServer())
        .delete(`/authors/${createdAuthorId}`)
        .expect(204);
    });

    it('should return 404 when trying to get deleted author', () => {
      return request(app.getHttpServer())
        .get(`/authors/${createdAuthorId}`)
        .expect(404);
    });
  });
});
