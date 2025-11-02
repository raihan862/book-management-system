import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { QueryAuthorDto } from './dto/query-author.dto';
import { IAuthor, IAuthorWithBooks } from './interfaces/author.interface';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import { PaginationUtil } from '../common/utils/pagination.util';

/**
 * Service handling all author-related business logic
 */
@Injectable()
export class AuthorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAuthorDto: CreateAuthorDto): Promise<IAuthor> {

    

    const data = {
      firstName: createAuthorDto.firstName,
      lastName: createAuthorDto.lastName,
      bio: createAuthorDto.bio ?? null,
      birthDate: createAuthorDto.birthDate
        ? new Date(createAuthorDto.birthDate)
        : null,
    };

    const author = await this.prisma.author.create({ data });

    return author;
  }

  async findAll(query: QueryAuthorDto): Promise<PaginatedResponse<IAuthor>> {
    const { page, limit, skip } = PaginationUtil.calculatePaginationParams(
      query.page,
      query.limit,
    );

    const where = this.buildWhereClause(query);

    const [authors, total] = await Promise.all([
      this.prisma.author.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.author.count({ where }),
    ]);

    return PaginationUtil.createPaginatedResponse(authors, total, page, limit);
  }

  async findOne(id: string): Promise<IAuthorWithBooks> {
    const author = await this.prisma.author.findUnique({
      where: { id },
      include: { books: true },
    });

    if (!author) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }

    return author as IAuthorWithBooks;
  }

  async update(id: string, updateAuthorDto: UpdateAuthorDto): Promise<IAuthor> {
    await this.findOne(id);

    const data: Record<string, unknown> = {};

    if (updateAuthorDto.firstName !== undefined) {
      data.firstName = updateAuthorDto.firstName;
    }
    if (updateAuthorDto.lastName !== undefined) {
      data.lastName = updateAuthorDto.lastName;
    }
    if (updateAuthorDto.bio !== undefined) {
      data.bio = updateAuthorDto.bio;
    }
    if (updateAuthorDto.birthDate !== undefined) {
      data.birthDate = new Date(updateAuthorDto.birthDate);
    }

    const updatedAuthor = await this.prisma.author.update({
      where: { id },
      data,
    });

    return updatedAuthor;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    const booksCount = await this.prisma.book.count({
      where: { authorId: id },
    });

    if (booksCount > 0) {
      throw new BadRequestException(
        `Cannot delete author with ${booksCount} associated book(s). Please delete the books first.`,
      );
    }

    await this.prisma.author.delete({ where: { id } });
  }

  private buildWhereClause(query: QueryAuthorDto): Record<string, unknown> {
    const where: Record<string, unknown> = {};

    if (query.firstName) {
      where.firstName = {
        contains: query.firstName,
        mode: 'insensitive',
      };
    }

    if (query.lastName) {
      where.lastName = {
        contains: query.lastName,
        mode: 'insensitive',
      };
    }

    return where;
  }
}
