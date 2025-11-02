import { Expose, Type } from 'class-transformer';
import { AuthorResponseDto } from '../../authors/dto/author-response.dto';

export class BookResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  isbn: string;

  @Expose()
  publishedDate: Date | null;

  @Expose()
  genre: string | null;

  @Expose()
  authorId: string;

  @Expose()
  @Type(() => AuthorResponseDto)
  author: AuthorResponseDto;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
