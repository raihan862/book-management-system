import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsISBN,
  IsUUID,
} from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsISBN()
  @IsNotEmpty()
  isbn: string;

  @IsDateString()
  @IsOptional()
  publishedDate?: string;

  @IsString()
  @IsOptional()
  genre?: string;

  @IsUUID()
  @IsNotEmpty()
  authorId: string;
}
