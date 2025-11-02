import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthorsService', () => {
  let service: AuthorsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    author: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    book: {
      count: jest.fn(),
    },
  };

  const mockAuthor = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    firstName: 'John',
    lastName: 'Doe',
    bio: 'A great author',
    birthDate: new Date('1980-01-01'),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuthorsService>(AuthorsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an author successfully', async () => {
      const createAuthorDto = {
        firstName: 'John',
        lastName: 'Doe',
        bio: 'A great author',
        birthDate: '1980-01-01',
      };

      mockPrismaService.author.create.mockResolvedValue(mockAuthor);

      const result = await service.create(createAuthorDto);

      expect(result).toEqual(mockAuthor);
      expect(mockPrismaService.author.create).toHaveBeenCalledWith({
        data: {
          firstName: createAuthorDto.firstName,
          lastName: createAuthorDto.lastName,
          bio: createAuthorDto.bio,
          birthDate: new Date(createAuthorDto.birthDate),
        },
      });
    });

    it('should create an author without optional fields', async () => {
      const createAuthorDto = {
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const authorWithoutOptionals = {
        ...mockAuthor,
        firstName: 'Jane',
        lastName: 'Smith',
        bio: null,
        birthDate: null,
      };

      mockPrismaService.author.create.mockResolvedValue(authorWithoutOptionals);

      const result = await service.create(createAuthorDto);

      expect(result).toEqual(authorWithoutOptionals);
      expect(mockPrismaService.author.create).toHaveBeenCalledWith({
        data: {
          firstName: createAuthorDto.firstName,
          lastName: createAuthorDto.lastName,
          bio: null,
          birthDate: null,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated authors', async () => {
      const query = { page: 1, limit: 10 };
      const authors = [mockAuthor];

      mockPrismaService.author.findMany.mockResolvedValue(authors);
      mockPrismaService.author.count.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(result).toEqual({
        data: authors,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
      expect(mockPrismaService.author.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter authors by firstName', async () => {
      const query = { firstName: 'John' };
      const authors = [mockAuthor];

      mockPrismaService.author.findMany.mockResolvedValue(authors);
      mockPrismaService.author.count.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(mockPrismaService.author.findMany).toHaveBeenCalledWith({
        where: {
          firstName: {
            contains: 'John',
            mode: 'insensitive',
          },
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return an author by id', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const authorWithBooks = { ...mockAuthor, books: [] };

      mockPrismaService.author.findUnique.mockResolvedValue(authorWithBooks);

      const result = await service.findOne(id);

      expect(result).toEqual(authorWithBooks);
      expect(mockPrismaService.author.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: { books: true },
      });
    });

    it('should throw NotFoundException if author not found', async () => {
      const id = 'non-existent-id';

      mockPrismaService.author.findUnique.mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(id)).rejects.toThrow(
        `Author with ID ${id} not found`,
      );
    });
  });

  describe('update', () => {
    it('should update an author successfully', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const updateAuthorDto = { bio: 'Updated bio' };
      const authorWithBooks = { ...mockAuthor, books: [] };
      const updatedAuthor = { ...mockAuthor, bio: 'Updated bio' };

      mockPrismaService.author.findUnique.mockResolvedValue(authorWithBooks);
      mockPrismaService.author.update.mockResolvedValue(updatedAuthor);

      const result = await service.update(id, updateAuthorDto);

      expect(result).toEqual(updatedAuthor);
      expect(mockPrismaService.author.update).toHaveBeenCalledWith({
        where: { id },
        data: { bio: 'Updated bio' },
      });
    });

    it('should throw NotFoundException if author not found', async () => {
      const id = 'non-existent-id';
      const updateAuthorDto = { bio: 'Updated bio' };

      mockPrismaService.author.findUnique.mockResolvedValue(null);

      await expect(service.update(id, updateAuthorDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete an author successfully', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const authorWithBooks = { ...mockAuthor, books: [] };

      mockPrismaService.author.findUnique.mockResolvedValue(authorWithBooks);
      mockPrismaService.book.count.mockResolvedValue(0);
      mockPrismaService.author.delete.mockResolvedValue(mockAuthor);

      await service.remove(id);

      expect(mockPrismaService.author.delete).toHaveBeenCalledWith({
        where: { id },
      });
    });

    it('should throw NotFoundException if author not found', async () => {
      const id = 'non-existent-id';

      mockPrismaService.author.findUnique.mockResolvedValue(null);

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if author has books', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const authorWithBooks = { ...mockAuthor, books: [] };

      mockPrismaService.author.findUnique.mockResolvedValue(authorWithBooks);
      mockPrismaService.book.count.mockResolvedValue(2);

      await expect(service.remove(id)).rejects.toThrow(BadRequestException);
      await expect(service.remove(id)).rejects.toThrow(
        'Cannot delete author with 2 associated book(s). Please delete the books first.',
      );
    });
  });
});
