# TaskFlow - Project & Task Management Platform

## Overview

TaskFlow is a modern, full-stack project and task management application designed to help teams collaborate, track progress, and stay productive. With an intuitive interface and comprehensive features, TaskFlow makes project management simple and efficient.

## 🛠️ Tech Stack

### Frontend

- React with TypeScript for a type-safe UI
- Vite for fast development and optimized builds
- Tailwind CSS for styling with dark/light mode support
- Shadcn UI for modern, accessible components
- Lucide React for beautiful icons
- React Router for navigation
- Axios for API requests
- Framer Motion for animations

### Backend

- Node.js and Express for the API server
- MongoDB with Mongoose ODM for data storage
- JWT for secure authentication
- Express Validator for request validation
- Multer and Cloudinary for file uploads
- Nodemailer with Mailgen for email notifications

### DevOps

- Docker and Docker Compose for containerization
- ESLint and Prettier for code quality

## 🌟 Features

### User Management

- Registration and login with JWT authentication
- Email verification and password reset
- User profiles with avatars
- Role-based access control

### Project Management

- Create, update, and delete projects
- Add team members with different roles (Admin, Manager, Member)
- Track project progress and completion rates
- Project overview with activity feeds

### Task Management

- Create and assign tasks with priority levels
- Track task status (Todo, In Progress, Done)
- Kanban board for visual task management
- Task list view with filtering and sorting
- File attachments for tasks
- Subtasks for breaking down complex tasks

### Notes & Collaboration

- Project notes for documentation
- Personal notes for private use
- Rich text editing

### Dashboard & Analytics

- Project summary with task statistics
- Recent activity tracking
- Visual progress indicators

## 📦 Docker Setup

### Prerequisites

- Docker and Docker Compose installed on your machine

### Running the Application

1. Clone the repository
2. Navigate to the project root directory
3. Create a `.env` file with the necessary environment variables (see below)
4. Run the application:
   ```
   docker-compose up --build
   ```
5. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000/api/v1
   - MongoDB: mongodb://localhost:27017 (available for database tools)

### Environment Variables

```
Frontend/

├── public/             # Public assets
├── src/
│   ├── api/            # API endpoints and services
│   ├── components/     # Reusable UI components
│   │   ├── contexts/   # React context providers
│   │   ├── forms/      # Form components
│   │   ├── kanban/     # Kanban board components
│   │   ├── layout/     # Layout components
│   │   ├── notes/      # Note components
│   │   ├── projectmember/ # Project member components
│   │   ├── ui/         # UI components from shadcn
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   ├── routes/         # Route definitions
│   ├── types/          # TypeScript type definitions
│   ├── views/          # Page components
│   │   ├── app/        # App views
│   │   ├── auth/       # Authentication views
│   │   ├── tabs/       # Tab views
│   ├── App.tsx         # Main App component
│   ├── main.tsx        # Entry point
├── index.html          # HTML template
├── tailwind.config.js  # Tailwind CSS configuration
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite configuration

Backend/

├── public/             # Public assets
├── src/
│   ├── controllers/    # Route handler logic
│   ├── db/             # Database connection
│   ├── middlewares/    # Custom middlewares
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API route definitions
│   ├── utils/          # Utility functions
│   ├── validators/     # Request validation
│   ├── app.js          # Express app configuration
│   ├── index.js        # Server entry point
├── .env                # Environment variables
```

## 📄 API Endpoints

### Authentication

- `POST /api/v1/user/register` - Register a new user
- `POST /api/v1/user/login` - Login and get access/refresh tokens
- `GET /api/v1/user/logout` - Logout
- `GET /api/v1/user/verify-email` - Verify email
- `POST /api/v1/user/refresh-access-token` - Refresh access token
- `GET /api/v1/user/current-user` - Get current user details
- `PATCH /api/v1/user/change-password` - Change password

### Projects

- `GET /api/v1/project` - Get all projects
- `POST /api/v1/project` - Create a new project
- `GET /api/v1/project/:projectId` - Get project details
- `PATCH /api/v1/project/:projectId` - Update project
- `DELETE /api/v1/project/:projectId` - Delete project

### Project Members

- `GET /api/v1/project/:projectId/member` - Get project members
- `POST /api/v1/project/:projectId/member` - Add project member
- `DELETE /api/v1/project/:projectId/member` - Remove project member
- `PATCH /api/v1/project/:projectId/member` - Update member role

### Tasks

- `GET /api/v1/project/:projectId/tasks` - Get project tasks
- `POST /api/v1/project/:projectId/tasks` - Create task
- `GET /api/v1/project/:projectId/tasks/:taskId` - Get task details
- `PATCH /api/v1/project/:projectId/tasks/:taskId` - Update task
- `DELETE /api/v1/project/:projectId/tasks/:taskId` - Delete task
- `PATCH /api/v1/project/:projectId/tasks/:taskId/status-or-priority` - Update task status/priority

### Notes

- `GET /api/v1/note/:projectId` - Get project notes
- `POST /api/v1/note/:projectId` - Create note
- `GET /api/v1/note/:projectId/:noteId` - Get note details
- `PATCH /api/v1/note/:projectId/:noteId/:memberId` - Update note
- `DELETE /api/v1/note/:projectId/:noteId/:memberId` - Delete note

## 💎 UI & Design Features

TaskFlow features a modern, responsive UI with the following design elements:

### Theming and Colors

- Full dark and light mode support
- Color-coded sections for better visual organization:
  - Blue theme for projects
  - Green theme for tasks
  - Amber/Yellow theme for notes
  - Indigo theme for members

### Visual Components

- Interactive Kanban board with drag-and-drop functionality
- Task cards with priority indicators
- Progress bars with gradient styling
- Avatar components for team members
- Responsive layouts for all screen sizes

### User Experience

- Loading skeletons for better perceived performance
- Toast notifications for user feedback
- Modal dialogs for forms and details
- Animated transitions for smoother interactions

## 🚀 Getting Started Without Docker

### Frontend Setup

1. Navigate to the Frontend directory
2. Install dependencies: `npm install`
3. Create `.env` file with `VITE_API_BASE_URL=http://localhost:4000/api/v1`
4. Start development server: `npm run dev`

### Backend Setup

1. Navigate to the Backend directory
2. Install dependencies: `npm install`
3. Create `.env` file with required environment variables
4. Start development server: `npm run dev`

## 👥 Contributors

- [Jay Patil](https://github.com/patiljay956) - Backend Developer
- [Omkar Shigvan](https://github.com/Omishigvan99) - Frontend Developer
