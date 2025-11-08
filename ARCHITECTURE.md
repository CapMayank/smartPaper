# SmartPaper - System Architecture & Implementation Guide

## Overview

SmartPaper is a comprehensive exam paper management system designed for schools to create, organize, and print exam papers efficiently. The system supports multilingual questions (English, Hindi, Sanskrit), various question types, and provides a structured approach to paper creation through blueprints.

## System Architecture

### Technology Stack

- **Frontend Framework**: Next.js 16 (App Router)
- **UI Framework**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Database**: PostgreSQL
- **ORM**: Prisma 6
- **Authentication**: Better Auth
- **Notifications**: Sonner

### Project Structure

```
smartPaper/
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── seed.ts             # Database seed script
│   └── migrations/         # Database migrations
├── src/
│   ├── app/
│   │   ├── api/            # API routes
│   │   │   ├── sessions/
│   │   │   ├── exam-groups/
│   │   │   ├── classes/
│   │   │   ├── subjects/
│   │   │   ├── books/
│   │   │   ├── chapters/
│   │   │   ├── topics/
│   │   │   ├── questions/
│   │   │   ├── papers/
│   │   │   └── auth/
│   │   ├── dashboard/      # Dashboard pages
│   │   │   ├── sessions/
│   │   │   ├── classes/
│   │   │   ├── questions/
│   │   │   ├── papers/
│   │   │   └── users/
│   │   └── ...             # Auth pages
│   ├── components/         # React components
│   │   ├── ui/             # UI primitives
│   │   └── ...             # Feature components
│   └── lib/                # Utilities
│       ├── prisma.ts       # Prisma client
│       ├── auth.ts         # Auth configuration
│       └── types.ts        # TypeScript types
└── public/                 # Static assets
```

## Database Schema

### Entity Relationships

```
AcademicSession
 └── ExamGroup (Quarterly, Half-Yearly, Annual)
      └── Paper
           ├── Class
           ├── Subject
           ├── Blueprint (optional)
           └── PaperItem[]
                └── Question

Class
 └── Subject
      └── Book
           └── Chapter
                └── Topic
                     └── Question
```

### Core Entities

#### AcademicSession
Represents an academic year (e.g., 2024-25)
- Fields: id, name, startYear, endYear, isActive
- Relations: hasMany ExamGroup

#### ExamGroup
Exam types within a session (Quarterly, Half-Yearly, Annual)
- Fields: id, name, sessionId
- Relations: belongsTo AcademicSession, hasMany Paper

#### Class
Grade levels (1-12)
- Fields: id, name, order
- Relations: hasMany Subject, hasMany Paper

#### Subject
Subjects taught in each class
- Fields: id, name, classId
- Relations: belongsTo Class, hasMany Book, hasMany Paper

#### Book
Textbooks for subjects
- Fields: id, name, subjectId
- Relations: belongsTo Subject, hasMany Chapter, hasMany Question

#### Chapter
Chapters within books
- Fields: id, name, order, bookId
- Relations: belongsTo Book, hasMany Topic, hasMany Question

#### Topic
Topics within chapters
- Fields: id, name, chapterId
- Relations: belongsTo Chapter, hasMany Question

#### Question
Question bank entries
- Fields:
  - id, text, type, language, difficulty, marks
  - tags[], options[], correctAnswer
  - imageUrl, passage, subQuestions[]
  - bookId, chapterId, topicId
- Relations: belongsTo Book/Chapter/Topic, hasMany PaperItem

#### Paper
Exam papers
- Fields:
  - id, title, maxMarks, duration, instructions
  - examGroupId, classId, subjectId, blueprintId
  - finalized, finalizedAt, createdById
- Relations:
  - belongsTo ExamGroup, Class, Subject, Blueprint, User
  - hasMany PaperItem

#### PaperItem
Questions added to a paper
- Fields: id, paperId, questionId, sectionName, order, marks
- Relations: belongsTo Paper, belongsTo Question

## API Endpoints

### Sessions
- `GET /api/sessions` - List all academic sessions
- `POST /api/sessions` - Create new session

### Exam Groups
- `GET /api/exam-groups?sessionId={id}` - List exam groups
- `POST /api/exam-groups` - Create new exam group

### Classes
- `GET /api/classes` - List all classes
- `POST /api/classes` - Create new class

### Subjects
- `GET /api/subjects?classId={id}` - List subjects
- `POST /api/subjects` - Create new subject

### Books
- `GET /api/books?subjectId={id}` - List books
- `POST /api/books` - Create new book

### Chapters
- `GET /api/chapters?bookId={id}` - List chapters
- `POST /api/chapters` - Create new chapter

### Topics
- `GET /api/topics?chapterId={id}` - List topics
- `POST /api/topics` - Create new topic

### Questions
- `GET /api/questions?search={text}&type={type}&language={lang}&difficulty={level}&bookId={id}&chapterId={id}&topicId={id}&marks={num}&page={num}&limit={num}`
- `POST /api/questions` - Create new question

### Papers
- `GET /api/papers?examGroupId={id}&classId={id}&subjectId={id}` - List papers
- `POST /api/papers` - Create new paper
- `GET /api/papers/{id}` - Get paper details with questions
- `PATCH /api/papers/{id}` - Update paper
- `DELETE /api/papers/{id}` - Delete paper
- `POST /api/papers/{id}/items` - Add question to paper
- `DELETE /api/papers/{id}/items?itemId={id}` - Remove question from paper
- `POST /api/papers/{id}/finalize` - Finalize paper (lock it)

## Question Types

The system supports the following question types:

1. **MCQ** - Multiple Choice Questions with options and correct answer
2. **FILL_IN_THE_BLANKS** - Fill in the blank questions
3. **TRUE_FALSE** - True or False questions
4. **MATCH_THE_FOLLOWING** - Matching questions (with image support)
5. **ONE_WORD** - One word answer questions
6. **NUMERICAL** - Numerical answer questions
7. **SHORT_ANSWER** - Short descriptive answer (2-3 marks)
8. **LONG_ANSWER** - Long descriptive answer (5+ marks)
9. **UNSEEN_PASSAGE** - Comprehension with multiple sub-questions
10. **POEM_EXPLANATION** - Poem explanation questions
11. **IMAGE_QUESTION** - Questions with images

## Language Support

- **ENGLISH** - English language questions
- **HINDI** - Hindi/Devanagari script questions
- **SANSKRIT** - Sanskrit/Devanagari script questions

Questions can be stored in any of these languages. For PDF generation, Devanagari fonts (Noto Sans Devanagari) should be embedded.

## User Roles

1. **ADMIN** - Full system access
   - Manage users, classes, subjects
   - Full CRUD on all entities
   
2. **TEACHER** - Create and manage questions and papers
   - Create questions
   - Create papers
   - Edit own papers
   
3. **EXAM_HEAD** - Oversight and approval
   - Manage sessions and exam groups
   - View all papers
   - Can finalize papers
   
4. **PRINTER** - View and print
   - View finalized papers
   - Generate PDFs

## Paper Creation Workflow

1. **Select Scope**
   - Choose Academic Session
   - Choose Exam Group (Quarterly/Half-Yearly/Annual)
   - Choose Class
   - Choose Subject

2. **Choose Blueprint** (optional)
   - Select existing blueprint or create new
   - Blueprint defines sections, question types, counts, marks

3. **Build Paper**
   - Search questions by keywords, type, difficulty, chapter, topic
   - Add questions to sections
   - Questions auto-saved to database
   - Can create new questions inline

4. **Preview & Finalize**
   - Preview paper with school header
   - Check total marks, duration
   - Finalize to lock the paper

5. **Generate PDF**
   - Print-ready PDF with:
     - School header
     - Class, Subject, Exam details
     - Roll number field
     - Proper pagination
     - Devanagari fonts for Hindi/Sanskrit

## Database Setup

### Initial Setup

```bash
# Install dependencies
npm install

# Set up environment variables
echo "DATABASE_URL=postgresql://user:password@localhost:5432/smartpaper" > .env

# Run migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Seed database
npm run db:seed

# Create admin user
npm run create-admin
```

### Sample Data

The seed script creates:
- One academic session (2024-25)
- Three exam groups (Quarterly, Half-Yearly, Annual)
- 12 classes (1-12)
- Subjects for Class 10 (Hindi, English, Math, Science, Social Science)
- Sample book, chapters, topics for Hindi
- Sample questions in Hindi

## Security Considerations

1. **Authentication**: All API routes require authentication
2. **Authorization**: Role-based access control on sensitive operations
3. **Data Validation**: Input validation on all POST/PATCH requests
4. **SQL Injection**: Prevented by Prisma ORM
5. **CSRF**: Next.js built-in protection
6. **XSS**: React's built-in escaping

## Performance Optimizations

1. **Database Indexing**: Unique constraints and indexed fields
2. **Pagination**: Questions API supports pagination
3. **Lazy Loading**: Components load on demand
4. **Optimistic Updates**: Client-side cache updates
5. **Build Optimization**: Static page generation where possible

## Future Enhancements

1. **Image Upload**: Cloudinary/S3 integration for question images
2. **Blueprint System**: Full CRUD for paper templates
3. **Advanced Search**: Full-text search with PostgreSQL tsvector
4. **PDF Generation**: Puppeteer integration for PDF export
5. **Bulk Import**: Excel/CSV import for questions
6. **Analytics**: Paper difficulty analysis, question usage stats
7. **Version Control**: Track paper revisions
8. **Collaboration**: Multiple teachers working on same paper
9. **Mobile App**: React Native mobile application
10. **AI Integration**: Question generation, difficulty prediction

## Contributing

See README.md for contribution guidelines.

## License

MIT License - See LICENSE file for details.
