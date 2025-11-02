import { Expose, Type } from 'class-transformer';
import { BookResponseDto } from '../../books/dto/book-response.dto';

export class AuthorResponseDto {
  @Expose()
  id: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  bio: string | null;

  @Expose()
  birthDate: Date | null;

  @Expose()
  @Type(() => BookResponseDto)
  books?: BookResponseDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
