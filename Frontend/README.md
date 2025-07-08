# TaskFlow Frontend - React TypeScript Application

A modern, responsive React frontend for the TaskFlow project management platform built with TypeScript, Vite, and Tailwind CSS.

## 🛠️ Tech Stack

-   **Framework**: React 18 with TypeScript
-   **Build Tool**: Vite for fast development and optimized builds
-   **Styling**: Tailwind CSS with dark/light mode support
-   **UI Components**: Shadcn UI for modern, accessible components
-   **Icons**: Lucide React for beautiful, consistent icons
-   **Routing**: React Router for client-side navigation
-   **HTTP Client**: Axios with interceptors for API requests
-   **Animations**: Framer Motion for smooth transitions
-   **Form Handling**: React Hook Form with Zod validation
-   **State Management**: React Context API
-   **Date Handling**: date-fns for date manipulation

## 🌟 Features

### User Interface

-   **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
-   **Dark/Light Mode**: Toggle between themes with persistent preferences
-   **Modern UI**: Clean, intuitive interface with Shadcn components
-   **Loading States**: Skeleton loaders and spinners for better UX
-   **Toast Notifications**: Real-time feedback for user actions

### Project Management

-   **Project Dashboard**: Overview of all projects with statistics
-   **Project Creation**: Create new projects with detailed information
-   **Team Management**: Add/remove team members with role assignments
-   **Project Settings**: Update project details and configurations

### Task Management

-   **Kanban Board**: Drag-and-drop task management interface
-   **Task Lists**: Traditional list view with filtering and sorting
-   **Task Creation**: Create tasks with priorities, assignments, and deadlines
-   **File Attachments**: Upload and manage task-related files
-   **Subtasks**: Break down complex tasks into smaller components

### Collaboration

-   **Notes System**: Project-wide and personal notes
-   **Real-time Updates**: Live updates for team collaboration
-   **Activity Feed**: Track project and task activities
-   **Member Profiles**: View team member information and roles

## 📁 Project Structure

```
src/
├── api/                    # API layer
│   ├── axios.ts           # Axios configuration with interceptors
│   ├── endpoints.ts       # API endpoint definitions
│   ├── interceptors.ts    # Request/response interceptors
│   └── refresh.ts         # Token refresh logic
├── components/            # Reusable UI components
│   ├── auth/             # Authentication components
│   ├── contexts/         # React context providers
│   ├── dialogs/          # Modal dialog components
│   ├── error/            # Error boundary components
│   ├── forms/            # Form components
│   ├── kanban/           # Kanban board components
│   ├── layout/           # Layout components (Header, Sidebar)
│   ├── loading/          # Loading state components
│   ├── notes/            # Note management components
│   ├── profile/          # User profile components
│   ├── projectmember/    # Project member components
│   ├── projects/         # Project-related components
│   ├── table/            # Data table components
│   ├── task/             # Task management components
│   ├── tasklist/         # Task list view components
│   └── ui/               # Base UI components (Shadcn)
├── constants/            # App constants and routes
├── hooks/                # Custom React hooks
│   ├── use-auth.ts       # Authentication hook
│   ├── use-loading-controller.ts # Loading state management
│   ├── use-mobile.ts     # Mobile detection hook
│   └── use-theme.ts      # Theme management hook
├── lib/                  # Utility functions
├── schemas/              # Zod validation schemas
├── types/                # TypeScript type definitions
├── views/                # Page components
│   ├── app/              # Main application views
│   ├── auth/             # Authentication views
│   └── tabs/             # Tab-based views
├── App.tsx               # Main App component
└── main.tsx              # Application entry point
```

## 🚀 Getting Started

### Prerequisites

-   Node.js 18+
-   npm or yarn package manager

### Installation

1. **Clone the repository** (if not already done)

    ```bash
    git clone <repository-url>
    cd TaskFlow/Frontend
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Set up environment variables**
   Create a `.env` file in the Frontend directory:

    ```env
    VITE_API_BASE_URL=http://localhost:4000/api/v1
    ```

4. **Start the development server**

    ```bash
    npm run dev
    ```

5. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

### Available Scripts

-   `npm run dev` - Start development server with hot reload
-   `npm run build` - Build for production
-   `npm run preview` - Preview production build locally
-   `npm run lint` - Run ESLint for code quality
-   `npm run type-check` - Run TypeScript type checking

## 🎨 Styling and Theming

### Tailwind CSS Configuration

The project uses Tailwind CSS with custom configuration for:

-   Color schemes for dark/light modes
-   Custom component variants
-   Responsive breakpoints
-   Animation utilities

### Theme System

-   **Light Mode**: Clean, bright interface for daytime use
-   **Dark Mode**: Easy-on-eyes dark theme for low-light environments
-   **Automatic Detection**: Respects system preferences
-   **Persistent Storage**: Remembers user's theme choice

### Color Coding

-   **Projects**: Blue theme (`bg-blue-500`, `text-blue-600`)
-   **Tasks**: Green theme (`bg-green-500`, `text-green-600`)
-   **Notes**: Amber theme (`bg-amber-500`, `text-amber-600`)
-   **Members**: Indigo theme (`bg-indigo-500`, `text-indigo-600`)

## 🔧 Configuration

### Vite Configuration

The project uses Vite with the following key configurations:

-   React plugin with SWC for fast refresh
-   Tailwind CSS integration
-   Path aliases (`@/` for `src/`)
-   TypeScript support

### TypeScript Configuration

-   Strict type checking enabled
-   Path mapping for clean imports
-   Optimized for modern browsers
-   React types included

## 📱 Responsive Design

The application is fully responsive with breakpoints:

-   **Mobile**: 320px - 767px
-   **Tablet**: 768px - 1023px
-   **Desktop**: 1024px and above

Key responsive features:

-   Collapsible sidebar on mobile
-   Adaptive grid layouts
-   Touch-friendly interface elements
-   Optimized modal sizes

## 🔐 Authentication Flow

1. **Login/Register**: Secure authentication with JWT
2. **Token Management**: Automatic token refresh
3. **Protected Routes**: Route guards for authenticated content
4. **Session Persistence**: Remember user sessions
5. **Logout**: Clean session termination

## 🚀 Deployment

### Docker Deployment

The frontend is containerized with Docker:

```dockerfile
# Multi-stage build for optimized production image
FROM node:22-alpine as build
# ... build process
FROM node:22-alpine
# ... serve static files
```

### Environment Variables for Production

```env
VITE_API_BASE_URL=https://your-api-domain.com/api/v1
```

### Build Optimization

-   Tree shaking for smaller bundles
-   Code splitting for lazy loading
-   Asset optimization
-   Gzip compression ready

## 🧪 Development Guidelines

### Code Style

-   Use TypeScript for type safety
-   Follow React best practices
-   Use custom hooks for reusable logic
-   Implement proper error boundaries

### Component Organization

-   One component per file
-   Use index.ts for clean exports
-   Separate logic and presentation
-   Implement proper prop typing

### State Management

-   Use React Context for global state
-   Local state for component-specific data
-   Custom hooks for complex state logic
-   Avoid prop drilling

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for all new code
3. Add proper error handling
4. Write meaningful commit messages
5. Test on multiple screen sizes

## 📄 License

This project is part of the TaskFlow project management platform.

---

Built with ❤️ using React, TypeScript, and modern web technologies.
