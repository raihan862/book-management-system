import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseInterceptors,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { QueryBookDto } from './dto/query-book.dto';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';

/**
 * Controller handling all book-related operations
 * Base route: /books
 */
@Controller('books')
@UseInterceptors(LoggingInterceptor)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  /**
   * Create a new book
   * @param createBookDto - Data for creating the book
   * @returns The created book with author information
   * @throws BadRequestException if author doesn't exist
   * @throws ConflictException if ISBN already exists
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  /**
   * Get all books with pagination and optional filters
   * @param query - Query parameters for pagination and filtering
   * @returns Paginated list of books with author information
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: QueryBookDto) {
    return this.booksService.findAll(query);
  }

  /**
   * Get a single book by ID
   * @param id - Book UUID
   * @returns The book with author information
   * @throws NotFoundException if book not found
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.booksService.findOne(id);
  }

  /**
   * Update an existing book
   * @param id - Book UUID
   * @param updateBookDto - Data for updating the book
   * @returns The updated book with author information
   * @throws NotFoundException if book not found
   * @throws BadRequestException if new author doesn't exist
   * @throws ConflictException if new ISBN already exists
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    return this.booksService.update(id, updateBookDto);
  }

  /**
   * Delete a book by ID
   * @param id - Book UUID
   * @returns No content on successful deletion
   * @throws NotFoundException if book not found
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.booksService.remove(id);
  }
}
