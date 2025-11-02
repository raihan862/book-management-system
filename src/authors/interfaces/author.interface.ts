/**
 * Author type definitions
 * After running `npx prisma generate`, import from @prisma/client instead:
 * import { Author } from '@prisma/client';
 */

export interface IAuthor {
  id: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  birthDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBook {
  id: string;
  title: string;
  isbn: string;
  publishedDate: Date | null;
  genre: string | null;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthorWithBooks extends IAuthor {
  books: IBook[];
}
