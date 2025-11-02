import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateAuthorDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsDateString()
  @IsOptional()
  birthDate?: string;
}
