# Taskify - Advanced Task Management System

Taskify is a full-featured task management system built with Node.js, Express, and MongoDB.  
It supports **multi-role access control**, **task assignment**, **user management**, **authentication**, **OTP verification**, **password reset**

---

## 📚 Table of Contents

- [Purpose](#purpose)
- [Features](#features)
- [User Roles & Permissions](#user-roles--permissions)
- [Tech Stack](#tech-stack)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Middleware](#middleware)
- [Utilities](#utilities)
- [Postman Tests](#postman-tests)
- [Author](#author)

---

## 🎯 Purpose

Taskify is designed to help teams and individuals:

- Organize tasks efficiently
- Track task progress
- Assign tasks to specific users
- Enforce role-based permissions
- Securely manage users and passwords

---

## Features

### User Authentication & Authorization

- JWT-based authentication
- Login, Register, Logout
- OTP-based account verification
- Password reset via OTP

### Role-Based Access Control (RBAC)

- Admin, Manager, User roles
- Fine-grained permissions

### User Management

- Admin can create/update/delete users
- Manager can create "User" accounts
- Profile update for all users

### Task Management

- Create, Read, Update, Delete tasks
- Assign tasks to users
- Task status: Pending, In Progress, Completed
- Task priority: Low, Medium, High, Critical
- Due dates & automated reminders
- pagination , filtering $ sorting

### ✉️ Notifications

- Email notifications for OTP, password reset, and account verification

### Security

- Password complexity validation
- Refresh tokens for secure sessions

### Logging & Auditing

- Audit logs for registration, login, and password reset

### REST API

- Fully RESTful routes for Users and Tasks
- CORS enabled for frontend apps

---

## User Roles & Permissions

| Role        | Users Create     | Tasks Create    | Tasks Update   | Tasks Delete   |
| ----------- | ---------------- | --------------- | -------------- | -------------- |
| **Admin**   | Yes              | Yes (any task)  | Yes (any task) | Yes (any task) |
| **Manager** | Yes (only Users) | Yes (own tasks) | Own tasks only | No             |
| **User**    | No               | No              | Own tasks only | No             |

---

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT, Refresh Tokens
- **Email:** Nodemailer (OTP, verification, password reset)
- **Validation:** Express-Validator
- **Security:** bcrypt, password complexity validation

---

## Setup & Installation

### 1️⃣ Clone the repository

- git clone https://github.com/Misbah767/Task-Management-System.git
- cd Task-Management-System

2️⃣ Install dependencies

- bash
- Copy code
- npm install

  3️⃣ Configure environment variables

- Create a .env file in the root directory:

env
-Copy code

## MongoDB

MONGODB_URL="mongodb://localhost:27017"

## Or Atlas

MONGODB_URL=mongodb+srv://<username>:<password>@<cluster-url>/<db-name>

## JWT

JWT_SECRET=<your-secret-key>

## SMTP / Email

SMTP_HOST="smtp-relay.brevo.com"

SMTP_PORT=587

SMTP_USER=<your-smtp-user>

SMTP_PASS=<your-smtp-password>

4️⃣ Run the development server
bash

Copy code
npm run dev
Server starts at http://localhost:5000

5️⃣ Seed Admin
bash
Copy code
npm run seed/seedAdmin

POST /api/auth/register — Register new user

POST /api/auth/login — Login

POST /api/auth/logout — Logout (revokes tokens)

POST /api/auth/refresh — Refresh JWT token

POST /api/auth/verify-account — Verify account via OTP

POST /api/auth/forgot-password — Send OTP for reset

POST /api/auth/verify-reset-otp — Verify reset OTP

POST /api/auth/reset-password — Reset password

POST /api/auth/resend-account-otp — Resend OTP

POST /api/auth/resend-reset-otp — Resend OTP

Users

GET /api/users — List all users (Admin)

GET /api/users/:id — Get user by ID (Admin/Self)

POST /api/users — Create user (Admin→Manager / Manager→User)

PATCH /api/users/:id — Update user details (Admin/Self)

DELETE /api/users/:id — Delete user (Admin)

Tasks

GET /api/tasks — List tasks

POST /api/tasks — Create task (Admin/Manager)

GET /api/tasks/:id — Get task by ID

PATCH /api/tasks/:id — Update task

DELETE /api/tasks/:id — Delete task (Admin/Creator)

---

Author

Misbah Ilyas
