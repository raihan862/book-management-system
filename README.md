# Book Management System API

A RESTful API for managing books and authors built with NestJS, Prisma, and PostgreSQL.

## Tech Stack

- **NestJS** - TypeScript framework
- **PostgreSQL** - Database
- **Prisma** - ORM
- **class-validator** - Validation

## Setup

```bash
# Install dependencies
yarn install

# Configure database
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Run migrations
npx prisma migrate dev --name init
npx prisma generate

# Start application
yarn start:dev
```

## API Endpoints

### Authors

| Method | Endpoint       | Description              |
| ------ | -------------- | ------------------------ |
| POST   | `/authors`     | Create author            |
| GET    | `/authors`     | List authors (paginated) |
| GET    | `/authors/:id` | Get author by ID         |
| PATCH  | `/authors/:id` | Update author            |
| DELETE | `/authors/:id` | Delete author            |

**Create Author:**

```json
POST /authors
{
  "firstName": "J.K.",
  "lastName": "Rowling",
  "bio": "British author",
  "birthDate": "1965-07-31"
}
```

**Query Parameters:** `page`, `limit`, `firstName`, `lastName`

### Books

| Method | Endpoint     | Description            |
| ------ | ------------ | ---------------------- |
| POST   | `/books`     | Create book            |
| GET    | `/books`     | List books (paginated) |
| GET    | `/books/:id` | Get book by ID         |
| PATCH  | `/books/:id` | Update book            |
| DELETE | `/books/:id` | Delete book            |

**Create Book:**

```json
POST /books
{
  "title": "Harry Potter and the Philosopher's Stone",
  "isbn": "978-0-7475-3269-9",
  "publishedDate": "1997-06-26",
  "genre": "Fantasy",
  "authorId": "author-uuid-here"
}
```

**Query Parameters:** `page`, `limit`, `title`, `isbn`, `authorId`

## Sample Workflow

```bash
# 1. Create an author
curl -X POST http://localhost:3000/authors \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Isaac",
    "lastName": "Asimov",
    "bio": "Science fiction writer",
    "birthDate": "1920-01-02"
  }'

# Response: { "id": "uuid-here", ... }

# 2. Create a book using the author ID
curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Foundation",
    "isbn": "978-0-553-29335-0",
    "publishedDate": "1951-06-01",
    "genre": "Science Fiction",
    "authorId": "uuid-here"
  }'

# 3. Get all books
curl http://localhost:3000/books?page=1&limit=10

# 4. Get author with books
curl http://localhost:3000/authors/uuid-here
```

## Testing

```bash
yarn test        # Unit tests
yarn test:e2e    # E2E tests
yarn test:cov    # Coverage
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error description or array of validation errors",
  "error": "Bad Request",
  "timestamp": "2025-11-02T10:30:00.000Z",
  "path": "/authors"
}
```

**Status Codes:**

- `200` - Success
- `201` - Created
- `204` - No Content (delete)
- `400` - Validation error
- `404` - Not found
- `409` - Conflict (duplicate ISBN)

## Database

```bash
npx prisma studio    # Open database GUI
npx prisma migrate dev --name description  # Create migration
```
