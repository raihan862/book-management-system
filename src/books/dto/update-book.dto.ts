import {
  IsString,
  IsOptional,
  IsDateString,
  IsISBN,
  IsUUID,
} from 'class-validator';

export class UpdateBookDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsISBN()
  @IsOptional()
  isbn?: string;

  @IsDateString()
  @IsOptional()
  publishedDate?: string;

  @IsString()
  @IsOptional()
  genre?: string;

  @IsUUID()
  @IsOptional()
  authorId?: string;
}
