# SmartPaper - Exam Paper Management System

A comprehensive web application for schools to create, manage, and print exam papers. Built with Next.js, Prisma, PostgreSQL, and TypeScript.

## Features

### Core Functionality
- **Question Bank**: Store and manage questions with support for:
  - Multiple question types (MCQ, Short Answer, Long Answer, Fill in the Blanks, True/False, etc.)
  - Multilingual support (English, Hindi, Sanskrit)
  - Difficulty levels (Easy, Medium, Hard)
  - Image support for questions
  - Organize by Book → Chapter → Topic
  
- **Academic Structure**: 
  - Academic Sessions (e.g., 2024-25)
  - Exam Groups (Quarterly, Half-Yearly, Annual)
  - Classes (1-12)
  - Subjects per class
  
- **Paper Creation**:
  - Search and filter questions
  - Add questions to paper sections
  - Preview and finalize papers
  - PDF export with school header
  
- **Role-Based Access**:
  - Admin: Full system access
  - Teacher: Create papers and questions
  - Exam Head: Manage sessions and approve papers
  - Printer: View finalized papers

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/CapMayank/smartPaper.git
cd smartPaper
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/smartpaper"
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"
```

4. Run database migrations:
```bash
npm run db:migrate
```

5. Generate Prisma client:
```bash
npm run db:generate
```

6. Seed the database with sample data:
```bash
npm run db:seed
```

7. Create an admin user:
```bash
npm run create-admin
```

8. Start the development server:
```bash
npm run dev
```

9. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### For Administrators

1. **Set Up Academic Structure**:
   - Navigate to Sessions to create academic years
   - Go to Classes to set up class levels (1-12)
   - Add subjects for each class

2. **Manage Users**:
   - Create teacher, exam head, and printer accounts
   - Assign appropriate roles

### For Teachers

1. **Build Question Bank**:
   - Go to Questions
   - Click "New Question"
   - Fill in question details (text, type, marks, difficulty, language)
   - Associate with book, chapter, and topic
   - Add tags for easy searching

2. **Create Exam Papers**:
   - Navigate to Papers
   - Click "Create Paper"
   - Select session, exam type, class, and subject
   - Search and add questions
   - Organize questions into sections
   - Preview the paper
   - Finalize when ready

## Database Schema

The application uses the following main entities:

- **AcademicSession**: Academic years (e.g., 2024-25)
- **ExamGroup**: Exam types within a session
- **Class**: Grade levels (1-12)
- **Subject**: Subjects taught in each class
- **Book**: Textbooks for subjects
- **Chapter**: Chapters within books
- **Topic**: Topics within chapters
- **Question**: Question bank with all metadata
- **Blueprint**: Templates for paper structure
- **Paper**: Exam papers
- **PaperItem**: Questions added to papers

## API Routes

### Sessions
- `GET /api/sessions` - List all sessions
- `POST /api/sessions` - Create new session

### Classes
- `GET /api/classes` - List all classes
- `POST /api/classes` - Create new class

### Subjects
- `GET /api/subjects?classId={id}` - List subjects (optionally by class)
- `POST /api/subjects` - Create new subject

### Questions
- `GET /api/questions?search={text}&type={type}&language={lang}` - Search questions
- `POST /api/questions` - Create new question

### Papers
- `GET /api/papers?examGroupId={id}&classId={id}` - List papers
- `POST /api/papers` - Create new paper
- `GET /api/papers/{id}` - Get paper details
- `PATCH /api/papers/{id}` - Update paper
- `DELETE /api/papers/{id}` - Delete paper
- `POST /api/papers/{id}/items` - Add question to paper
- `DELETE /api/papers/{id}/items?itemId={id}` - Remove question from paper
- `POST /api/papers/{id}/finalize` - Finalize paper

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linter
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data
- `npm run create-admin` - Create admin user
- `npm run verify-admin` - Verify admin account
- `npm run reset-admin` - Reset admin password

## Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Notifications**: Sonner

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
