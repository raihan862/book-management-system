import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { Server } from 'http';

interface AuthorResponse {
  id: string;
  firstName: string;
  lastName: string;
  bio?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedAuthorsResponse {
  data: AuthorResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

describe('Authors (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: Server;
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
    server = app.getHttpServer() as Server;
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

      return request(server)
        .post('/authors')
        .send(createAuthorDto)
        .expect(201)
        .expect((res) => {
          const body = res.body as AuthorResponse;
          expect(body).toHaveProperty('id');
          expect(body.firstName).toBe(createAuthorDto.firstName);
          expect(body.lastName).toBe(createAuthorDto.lastName);
          expect(body.bio).toBe(createAuthorDto.bio);
          expect(body).toHaveProperty('createdAt');
          expect(body).toHaveProperty('updatedAt');
          createdAuthorId = body.id;
        });
    });

    it('should fail validation when firstName is missing', () => {
      const invalidDto = {
        lastName: 'Doe',
      };

      return request(server).post('/authors').send(invalidDto).expect(400);
    });
  });

  describe('GET /authors/:id', () => {
    it('should retrieve the created author', () => {
      return request(server)
        .get(`/authors/${createdAuthorId}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as AuthorResponse;
          expect(body.id).toBe(createdAuthorId);
          expect(body.firstName).toBe('John');
          expect(body.lastName).toBe('Doe');
        });
    });

    it('should return 404 for non-existent author', () => {
      return request(server)
        .get('/authors/123e4567-e89b-12d3-a456-426614174999')
        .expect(404);
    });
  });

  describe('GET /authors', () => {
    it('should retrieve all authors', () => {
      return request(server)
        .get('/authors')
        .expect(200)
        .expect((res) => {
          const body = res.body as PaginatedAuthorsResponse;
          expect(body).toHaveProperty('data');
          expect(body).toHaveProperty('meta');
          expect(Array.isArray(body.data)).toBe(true);
          expect(body.meta).toHaveProperty('total');
          expect(body.meta).toHaveProperty('page');
          expect(body.meta).toHaveProperty('limit');
        });
    });
  });

  describe('PATCH /authors/:id', () => {
    it('should update an author', () => {
      const updateDto = {
        bio: 'Updated biography',
      };

      return request(server)
        .patch(`/authors/${createdAuthorId}`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          const body = res.body as AuthorResponse;
          expect(body.bio).toBe(updateDto.bio);
        });
    });
  });

  describe('DELETE /authors/:id', () => {
    it('should delete an author', () => {
      return request(server).delete(`/authors/${createdAuthorId}`).expect(204);
    });

    it('should return 404 when trying to get deleted author', () => {
      return request(server).get(`/authors/${createdAuthorId}`).expect(404);
    });
  });
});
