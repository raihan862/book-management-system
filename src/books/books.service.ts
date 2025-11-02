import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { QueryBookDto } from './dto/query-book.dto';
import { IBookWithAuthor } from './interfaces/book.interface';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import { PaginationUtil } from '../common/utils/pagination.util';

/**
 * Service handling all book-related business logic
 */
@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBookDto: CreateBookDto): Promise<IBookWithAuthor> {
    await this.validateAuthorExists(createBookDto.authorId);

    const data = {
      title: createBookDto.title,
      isbn: createBookDto.isbn,
      genre: createBookDto.genre ?? null,
      publishedDate: createBookDto.publishedDate
        ? new Date(createBookDto.publishedDate)
        : null,
      author: {
        connect: { id: createBookDto.authorId },
      },
    };

    const book = await this.prisma.book.create({
      data,
      include: { author: true },
    });

    return book as IBookWithAuthor;
  }

  async findAll(
    query: QueryBookDto,
  ): Promise<PaginatedResponse<IBookWithAuthor>> {
    const { page, limit, skip } = PaginationUtil.calculatePaginationParams(
      query.page,
      query.limit,
    );

    const where = this.buildWhereClause(query);

    const [books, total] = await Promise.all([
      this.prisma.book.findMany({
        where,
        skip,
        take: limit,
        include: { author: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.book.count({ where }),
    ]);

    return PaginationUtil.createPaginatedResponse(
      books as IBookWithAuthor[],
      total,
      page,
      limit,
    );
  }

  async findOne(id: string): Promise<IBookWithAuthor> {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    return book as IBookWithAuthor;
  }

  async update(
    id: string,
    updateBookDto: UpdateBookDto,
  ): Promise<IBookWithAuthor> {
    await this.findOne(id);

    if (updateBookDto.authorId) {
      await this.validateAuthorExists(updateBookDto.authorId);
    }

    const data: Record<string, unknown> = {};

    if (updateBookDto.title !== undefined) {
      data.title = updateBookDto.title;
    }
    if (updateBookDto.isbn !== undefined) {
      data.isbn = updateBookDto.isbn;
    }
    if (updateBookDto.genre !== undefined) {
      data.genre = updateBookDto.genre;
    }
    if (updateBookDto.publishedDate !== undefined) {
      data.publishedDate = new Date(updateBookDto.publishedDate);
    }
    if (updateBookDto.authorId !== undefined) {
      data.author = {
        connect: { id: updateBookDto.authorId },
      };
    }

    const updatedBook = await this.prisma.book.update({
      where: { id },
      data,
      include: { author: true },
    });

    return updatedBook as IBookWithAuthor;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.book.delete({ where: { id } });
  }

  private async validateAuthorExists(authorId: string): Promise<void> {
    const authorExists = await this.prisma.author.findUnique({
      where: { id: authorId },
    });

    if (!authorExists) {
      throw new NotFoundException(`Author with ID ${authorId} not found`);
    }
  }

  private buildWhereClause(query: QueryBookDto): Record<string, unknown> {
    const where: Record<string, unknown> = {};

    if (query.title) {
      where.title = {
        contains: query.title,
        mode: 'insensitive',
      };
    }

    if (query.isbn) {
      where.isbn = {
        contains: query.isbn,
        mode: 'insensitive',
      };
    }

    if (query.authorId) {
      where.authorId = query.authorId;
    }

    return where;
  }
}
