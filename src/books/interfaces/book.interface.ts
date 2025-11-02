/**
 * Book type definitions
 * After running `npx prisma generate`, import from @prisma/client instead:
 * import { Book } from '@prisma/client';
 */

import { IAuthor } from '@authors/interfaces/author.interface';

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

export interface IBookWithAuthor extends IBook {
  author: IAuthor;
}
