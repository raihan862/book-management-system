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
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { QueryAuthorDto } from './dto/query-author.dto';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';

/**
 * Controller handling all author-related operations
 * Base route: /authors
 */
@Controller('authors')
@UseInterceptors(LoggingInterceptor)
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  /**
   * Create a new author
   * @param createAuthorDto - Data for creating the author
   * @returns The created author
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAuthorDto: CreateAuthorDto) {
    return this.authorsService.create(createAuthorDto);
  }

  /**
   * Get all authors with pagination and optional filters
   * @param query - Query parameters for pagination and filtering
   * @returns Paginated list of authors
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: QueryAuthorDto) {
    return this.authorsService.findAll(query);
  }

  /**
   * Get a single author by ID
   * @param id - Author UUID
   * @returns The author with associated books
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.authorsService.findOne(id);
  }

  /**
   * Update an existing author
   * @param id - Author UUID
   * @param updateAuthorDto - Data for updating the author
   * @returns The updated author
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAuthorDto: UpdateAuthorDto,
  ) {
    return this.authorsService.update(id, updateAuthorDto);
  }

  /**
   * Delete an author by ID
   * @param id - Author UUID
   * @returns No content on successful deletion
   * @throws ConflictException if author has associated books
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.authorsService.remove(id);
  }
}
