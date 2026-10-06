# Student Management System — Backend

A RESTful backend for a Student Management System built with **Node.js, Express.js, and MongoDB**.

The system is designed to manage students, teachers, courses, lessons, and administrative operations with role-based authentication and authorization.

## 🚀 Technologies

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- bcrypt
- dotenv
- CORS
- Nodemon

## 👥 User Roles

The system supports three main roles:

### 👨‍💼 Admin
- Manage students
- Manage teachers
- Manage courses
- Manage system data
- Access administrative operations

### 👨‍🏫 Teacher
- Access teacher-related functionality
- Manage courses and lessons according to their permissions

### 👨‍🎓 Student
- Register and log in
- Access student-related functionality
- View available courses
- Access course lessons

## 🔐 Authentication & Authorization

The backend uses **JWT (JSON Web Tokens)** for authentication.

Passwords are securely hashed using **bcrypt** before being stored in the database.

Role-based authorization is implemented through middleware to restrict access to specific resources based on the authenticated user's role.

## 📁 Project Structure

```text
Back End/
│
├── src/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── admin.controller.js
│   │   ├── course.controller.js
│   │   ├── lesson.controller.js
│   │   ├── login.controller.js
│   │   ├── register.controller.js
│   │   ├── student.controller.js
│   │   └── teacher.controller.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddlewarw.js
│   │   └── roleMiddleware.js
│   │
│   ├── models/
│   │   ├── courses.model.js
│   │   ├── leason.model.js
│   │   ├── student.model.js
│   │   ├── teacher.model.js
│   │   └── user.model.js
│   │
│   └── routes/
│       ├── admin.route.js
│       ├── courses.route.js
│       ├── lesson.route.js
│       ├── login.route.js
│       ├── register.route.js
│       ├── student.route.js
│       └── teacher.route.js
│
├── seedAdmin.js
├── service.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/zeinab55-scor/student-management-system-backend.git
```

Navigate to the project directory:

```bash
cd student-management-system-backend
```

Install dependencies:

```bash
npm install
```

## 🔑 Environment Variables

Create a `.env` file in the project root.

Example:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

> Never commit your `.env` file or expose your database credentials and JWT secret.

## ▶️ Running the Project

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server runs locally on:

```text
http://localhost:3000
```

## 👨‍💼 Admin Seeding

The project includes a script for creating the initial admin account.

Run:

```bash
npm run admin
```

Make sure your environment variables are configured before running the script.

## 🧩 Main Backend Modules

The backend is organized into separate modules for:

- Authentication
- User registration and login
- Student management
- Teacher management
- Course management
- Lesson management
- Admin operations
- Authentication middleware
- Role-based authorization
- Error handling

## 🛡️ Security

The backend includes:

- Password hashing with bcrypt
- JWT-based authentication
- Role-based authorization
- Environment variables for sensitive configuration
- Protected routes using authentication middleware

## 📌 Project Status

The backend is currently under development as part of a full-stack Student Management System.

More features and API endpoints will be added as development continues.

## 👩‍💻 Author

**Zeinab Ibrahim**

GitHub:  
https://github.com/zeinab55-scor

---

⭐ If you find this project useful, feel free to explore the repository and follow the development progress.