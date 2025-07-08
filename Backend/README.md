# TaskFlow Backend - Node.js Express API

A robust, scalable backend API for the TaskFlow project management platform built with Node.js, Express, and MongoDB. Features comprehensive authentication, role-based access control, file uploads, and clean MVC architecture.

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js for REST API
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with access/refresh tokens
- **Validation**: Express Validator for request validation
- **File Upload**: Multer + Cloudinary for file storage
- **Email**: Nodemailer with Mailgen for transactional emails
- **Security**: CORS, helmet, rate limiting
- **Development**: Nodemon for auto-restart

## 🌟 Features

### Authentication & Security

- **JWT Authentication**: Secure token-based authentication
- **Refresh Tokens**: Long-lived sessions with token rotation
- **Email Verification**: Account verification via email
- **Password Reset**: Secure password recovery flow
- **Role-Based Access**: Multiple user roles (Admin, Manager, Member)
- **Rate Limiting**: Protection against API abuse
- **CORS Configuration**: Cross-origin request handling

### Project Management

- **Project CRUD**: Create, read, update, delete projects
- **Team Management**: Add/remove members with role assignments
- **Project Ownership**: Creator becomes project admin
- **Project Statistics**: Task counts and completion rates

### Task Management

- **Task CRUD**: Complete task lifecycle management
- **Task Assignment**: Assign tasks to team members
- **Status Tracking**: TODO, IN_PROGRESS, DONE states
- **Priority Levels**: LOW, MEDIUM, HIGH, URGENT priorities
- **File Attachments**: Upload files to tasks via Cloudinary
- **Subtasks**: Break down complex tasks

### Collaboration Features

- **Notes System**: Project-wide notes for documentation
- **Activity Tracking**: Audit trail for project activities
- **Member Roles**: Different permission levels per project

## 📂 Project Structure

```
src/
├── app.js                    # Express app configuration
├── index.js                  # Server entry point
├── controllers/              # Route handler logic
│   ├── auth.controller.js         # Authentication endpoints
│   ├── healthcheck.controller.js  # Health check endpoint
│   ├── note.controller.js         # Notes management
│   ├── project.controller.js      # Project CRUD operations
│   ├── project_admin.controller.js # Project admin functions
│   ├── projectMember.controller.js # Team member management
│   ├── subtask.controller.js      # Subtask operations
│   ├── task.controller.js         # Task management
│   └── user.controller.js         # User profile management
├── db/
│   └── index.js              # Database connection setup
├── middlewares/              # Custom middleware
│   ├── auth.middleware.js         # Authentication middleware
│   ├── multer.middleware.js       # File upload handling
│   └── validator.middleware.js    # Request validation
├── models/                   # Mongoose schemas
│   ├── notes.models.js           # Notes schema
│   ├── project.models.js         # Project schema
│   ├── projectmember.models.js   # Project member schema
│   ├── subtasks.models.js        # Subtasks schema
│   ├── task.models.js            # Task schema
│   └── user.models.js            # User schema
├── routes/                   # API route definitions
│   ├── auth.routes.js            # Authentication routes
│   ├── chealthcheck.routes.js    # Health check routes
│   ├── note.routes.js            # Notes routes
│   ├── project.routes.js         # Project routes
│   ├── project_admin.routes.js   # Project admin routes
│   ├── subtask.routes.js         # Subtask routes
│   └── user.routes.js            # User routes
├── utils/                    # Utility functions
│   ├── apiErrors.js              # Custom error classes
│   ├── apiResponse.js            # Standardized API responses
│   ├── asyncHandler.js           # Async error handling
│   ├── constants.js              # Application constants
│   ├── fileUpload.cloudinary.js  # Cloudinary integration
│   └── mail.js                   # Email utilities
└── validators/               # Request validation schemas
    └── index.js              # Validation rules
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB 5.0+
- Cloudinary account (for file uploads)
- Email service (Mailtrap for development)

### Installation

1. **Clone the repository** (if not already done)

    ```bash
    git clone <repository-url>
    cd TaskFlow/Backend
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Set up environment variables**
   Create a `.env` file in the Backend directory:

    ```env
    # Server Configuration
    PORT=4000
    NODE_ENV=development

    # Database
    MONGO_URI=mongodb://localhost:27017
    DATABASE_NAME=taskflow

    # JWT Configuration
    JWT_SECRET=your_super_secret_jwt_key_here
    JWT_EXPIRY=7d
    ACCESS_TOKEN_SECRET=your_access_token_secret
    ACCESS_TOKEN_EXPIRY=15m
    REFRESH_TOKEN_SECRET=your_refresh_token_secret
    REFRESH_TOKEN_EXPIRY=30d

    # Frontend URL
    FRONTEND_URL=http://localhost:3000

    # Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret

    # Email Configuration (Mailtrap for development)
    MAILTRAP_HOST=smtp.mailtrap.io
    MAILTRAP_PORT=2525
    MAILTRAP_USER=your_mailtrap_user
    MAILTRAP_PASSWORD=your_mailtrap_password
    ```

4. **Start MongoDB**

    ```bash
    # Using MongoDB Community Server
    mongod

    # Or using Docker
    docker run --name mongodb -p 27017:27017 -d mongo:latest
    ```

5. **Start the development server**

    ```bash
    npm run dev
    ```

6. **Verify the setup**
   Navigate to `http://localhost:4000/api/v1/healthcheck`

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run test suite (if configured)
- `npm run lint` - Run ESLint for code quality

## 📚 API Documentation

### Base URL

```
http://localhost:4000/api/v1
```

### Authentication Endpoints

| Method | Endpoint                          | Description               | Auth Required |
| ------ | --------------------------------- | ------------------------- | ------------- |
| POST   | `/user/register`                  | Register new user         | No            |
| POST   | `/user/login`                     | User login                | No            |
| GET    | `/user/logout`                    | User logout               | Yes           |
| GET    | `/user/verify-email`              | Verify email address      | No            |
| POST   | `/user/resend-verification-email` | Resend verification email | No            |
| POST   | `/user/forgot-password-request`   | Request password reset    | No            |
| POST   | `/user/reset-password`            | Reset password with token | No            |
| POST   | `/user/refresh-access-token`      | Refresh access token      | No            |
| GET    | `/user/current-user`              | Get current user profile  | Yes           |
| PATCH  | `/user/change-password`           | Change password           | Yes           |

### Project Endpoints

| Method | Endpoint              | Description           | Auth Required       |
| ------ | --------------------- | --------------------- | ------------------- |
| GET    | `/project`            | Get all user projects | Yes                 |
| POST   | `/project`            | Create new project    | Yes                 |
| GET    | `/project/:projectId` | Get project details   | Yes                 |
| PATCH  | `/project/:projectId` | Update project        | Yes (Admin/Manager) |
| DELETE | `/project/:projectId` | Delete project        | Yes (Admin only)    |

### Project Member Endpoints

| Method | Endpoint                     | Description           | Auth Required       |
| ------ | ---------------------------- | --------------------- | ------------------- |
| GET    | `/project/:projectId/member` | Get project members   | Yes                 |
| POST   | `/project/:projectId/member` | Add project member    | Yes (Admin/Manager) |
| PATCH  | `/project/:projectId/member` | Update member role    | Yes (Admin/Manager) |
| DELETE | `/project/:projectId/member` | Remove project member | Yes (Admin/Manager) |

### Task Endpoints

| Method | Endpoint                                               | Description                 | Auth Required |
| ------ | ------------------------------------------------------ | --------------------------- | ------------- |
| GET    | `/project/:projectId/tasks`                            | Get project tasks           | Yes           |
| POST   | `/project/:projectId/tasks`                            | Create new task             | Yes           |
| GET    | `/project/:projectId/tasks/:taskId`                    | Get task details            | Yes           |
| PATCH  | `/project/:projectId/tasks/:taskId`                    | Update task                 | Yes           |
| DELETE | `/project/:projectId/tasks/:taskId`                    | Delete task                 | Yes           |
| PATCH  | `/project/:projectId/tasks/:taskId/status-or-priority` | Update task status/priority | Yes           |
| PATCH  | `/project/:projectId/tasks/:taskId/attachments`        | Upload task attachments     | Yes           |

### Subtask Endpoints

| Method | Endpoint                      | Description        | Auth Required |
| ------ | ----------------------------- | ------------------ | ------------- |
| GET    | `/subtask/:taskId`            | Get task subtasks  | Yes           |
| POST   | `/subtask/:taskId`            | Create new subtask | Yes           |
| PATCH  | `/subtask/:taskId/:subtaskId` | Update subtask     | Yes           |
| DELETE | `/subtask/:taskId/:subtaskId` | Delete subtask     | Yes           |

### Notes Endpoints

| Method | Endpoint                   | Description       | Auth Required |
| ------ | -------------------------- | ----------------- | ------------- |
| GET    | `/note/:projectId`         | Get project notes | Yes           |
| POST   | `/note/:projectId`         | Create new note   | Yes           |
| GET    | `/note/:projectId/:noteId` | Get note details  | Yes           |
| PATCH  | `/note/:projectId/:noteId` | Update note       | Yes           |
| DELETE | `/note/:projectId/:noteId` | Delete note       | Yes           |

### Health Check

| Method | Endpoint       | Description          | Auth Required |
| ------ | -------------- | -------------------- | ------------- |
| GET    | `/healthcheck` | Server health status | No            |

## 🗃️ Database Models

### User Model

```javascript
{
  name: String,              // User's full name
  avatar: {                  // Profile picture
    url: String,             // Cloudinary URL
    localPath: String        // Local file path
  },
  username: String,          // Unique username
  email: String,             // Email address
  password: String,          // Hashed password
  isEmailVerified: Boolean,  // Email verification status
  emailVerificationToken: String,
  emailVerificationExpiry: Date,
  forgotPasswordToken: String,
  forgotPasswordExpiry: Date,
  refreshToken: String,      // Current refresh token
  createdAt: Date,
  updatedAt: Date
}
```

### Project Model

```javascript
{
  name: String,              // Project name
  description: String,       // Project description
  createdBy: ObjectId,       // User who created project
  createdAt: Date,
  updatedAt: Date
}
```

### ProjectMember Model

```javascript
{
  user: ObjectId,            // Reference to User
  project: ObjectId,         // Reference to Project
  role: String,              // ADMIN, MANAGER, MEMBER
  joinedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Task Model

```javascript
{
  title: String,             // Task title
  description: String,       // Task description
  project: ObjectId,         // Reference to Project
  assignedTo: ObjectId,      // Reference to User
  assignedBy: ObjectId,      // Reference to User
  status: String,            // TODO, IN_PROGRESS, DONE
  priority: String,          // LOW, MEDIUM, HIGH, URGENT
  attachments: [{            // File attachments
    url: String,
    localPath: String,
    fileName: String
  }],
  dueDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Subtask Model

```javascript
{
  title: String,             // Subtask title
  task: ObjectId,            // Reference to Task
  isCompleted: Boolean,      // Completion status
  createdBy: ObjectId,       // Reference to User
  createdAt: Date,
  updatedAt: Date
}
```

### Note Model

```javascript
{
  project: ObjectId,         // Reference to Project
  createdBy: ObjectId,       // Reference to User
  content: String,           // Note content
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Configuration

### Database Configuration

The application uses MongoDB with Mongoose ODM. Connection settings are configured in `src/db/index.js`.

### Authentication Configuration

- JWT tokens for stateless authentication
- Refresh token rotation for enhanced security
- Configurable token expiry times
- Password hashing with bcrypt

### File Upload Configuration

- Multer for handling multipart/form-data
- Cloudinary for cloud storage
- File type validation
- Size limits and security checks

### Email Configuration

- Nodemailer for sending emails
- Mailgen for beautiful email templates
- Support for various email providers
- Development and production configurations

## 🛡️ Security Features

### Authentication Security

- Password hashing with bcrypt (12 rounds)
- JWT tokens with secure secrets
- Refresh token rotation
- Email verification required

### API Security

- CORS configuration for cross-origin requests
- Helmet for security headers
- Rate limiting to prevent abuse
- Input validation and sanitization
- SQL injection prevention (via Mongoose)

### File Upload Security

- File type validation
- File size limits
- Secure file storage with Cloudinary
- Malicious file detection

## 🚀 Deployment

### Docker Deployment

The backend is containerized with Docker:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=4000
MONGO_URI=mongodb://your-production-db
# ... other production configs
```

### Production Considerations

- Use environment variables for all secrets
- Enable MongoDB authentication
- Configure proper CORS origins
- Set up monitoring and logging
- Use HTTPS in production
- Configure rate limiting
- Set up database backups

## 🧪 Development Guidelines

### Code Structure

- Follow MVC architecture pattern
- Use async/await for asynchronous operations
- Implement proper error handling
- Write descriptive commit messages

### Error Handling

- Custom error classes for different scenarios
- Centralized error handling middleware
- Proper HTTP status codes
- Detailed error messages for development

### Validation

- Request validation using express-validator
- Schema validation with Mongoose
- File upload validation
- Email format validation

### Testing

- Unit tests for utility functions
- Integration tests for API endpoints
- Database testing with test database
- Mock external services

## 📈 Performance Optimization

### Database Optimization

- Proper indexing for frequently queried fields
- Population limits for referenced documents
- Aggregation pipelines for complex queries
- Connection pooling

### API Optimization

- Response compression
- Caching for static data
- Pagination for large datasets
- Efficient query patterns

## 🤝 Contributing

1. Follow the existing code structure and patterns
2. Write comprehensive tests for new features
3. Use proper error handling
4. Document API changes
5. Follow semantic versioning

## 📄 License

This project is part of the TaskFlow project management platform.

---

Built with ❤️ by [Jay Patil](https://github.com/patiljay956) using Node.js, Express, and MongoDB.
