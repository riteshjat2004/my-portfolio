# 🚀 My Portfolio

A modern full-stack portfolio website built using **Next.js, TypeScript, Tailwind CSS, Node.js, Express.js, MongoDB Atlas, JWT Authentication, Render, and Vercel**.

The project showcases my technical skills, projects, blogs, and professional journey while providing a secure administrative dashboard for managing portfolio content dynamically.

---

## 🌐 Live Demo

**Frontend:**
https://my-portfolio-two-theta-51.vercel.app/

**Backend API:**
https://portfolio-backend-9y68.onrender.com

**GitHub Repository:**
https://github.com/riteshjat2004/my-portfolio

---

## 📌 Features

### Public Portfolio

* Responsive modern UI
* Hero section
* About section
* Skills section
* Experience section
* Projects showcase
* Blogs listing
* Dynamic blog pages
* Contact form
* Mobile-friendly design
* Smooth navigation

### Admin Features

* Secure Admin Login
* JWT Authentication
* Protected Routes
* Admin Dashboard
* Project Management System
* Create Projects
* Update Projects
* Delete Projects
* Dynamic Content Management

### Backend Features

* RESTful API Architecture
* MongoDB Atlas Integration
* JWT Authentication
* Password Hashing using bcrypt
* Environment Variable Security
* MVC Architecture
* Request Validation
* Error Handling

### Deployment

* Frontend deployed on Vercel
* Backend deployed on Render
* MongoDB Atlas Cloud Database
* Continuous Deployment via GitHub

---

# 🏗️ System Architecture

```text
Frontend (Next.js)
        |
        v
Axios API Layer
        |
        v
Backend (Node.js + Express)
        |
        v
MongoDB Atlas
```

---

# 🛠️ Tech Stack

## Frontend

* Next.js
* TypeScript
* Tailwind CSS
* Axios
* React Hooks

## Backend

* Node.js
* Express.js
* JWT
* bcryptjs
* CORS
* dotenv

## Database

* MongoDB Atlas
* Mongoose

## Deployment

* Vercel
* Render
* GitHub

---

# 📂 Project Structure

## Frontend

```text
src/
│
├── api/
│
├── app/
│   ├── admin/
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── projects/
│   │   └── blogs/
│   │
│   └── blogs/
│       └── [slug]/
│
├── assets/
│
├── components/
│   ├── layout/
│   ├── navigation/
│   └── ui/
│
├── constants/
│
├── data/
│
├── sections/
│   ├── hero/
│   ├── about/
│   ├── skills/
│   ├── projects/
│   ├── blogs/
│   ├── experience/
│   ├── contact/
│   └── footer/
│
├── types/
│
└── utils/
```

## Backend

```text
backend/
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── server.js
│
└── package.json
```

---

# 🔐 Authentication Flow

```text
Admin Login
      |
      v
Backend Verification
      |
      v
JWT Token Generation
      |
      v
Token Stored on Client
      |
      v
Protected Dashboard Access
```

---

# 📡 API Endpoints

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
```

## Projects

```http
GET    /api/projects
POST   /api/projects
PUT    /api/projects/:id
DELETE /api/projects/:id
```

## Blogs

```http
GET /api/blogs
GET /api/blogs/:slug
```

## Profile

```http
GET /api/profile
POST /api/profile
PUT /api/profile
```

## Contact

```http
POST /api/contact
```

---

# ⚙️ Environment Variables

## Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=https://portfolio-backend-9y68.onrender.com/api
```

## Backend (.env)

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
```

---

# 🚀 Local Installation

## Clone Repository

```bash
git clone https://github.com/riteshjat2004/my-portfolio.git
```

---

## Frontend Setup

```bash
npm install
npm run dev
```

Runs on:

```text
http://localhost:3000
```

---

## Backend Setup

```bash
cd backend

npm install

npm run dev
```

Runs on:

```text
http://localhost:5000
```

---

# 🧪 Testing

The project has been tested for:

* Authentication
* Protected Routes
* Project CRUD Operations
* Blog Retrieval
* Dynamic Routing
* MongoDB Connectivity
* Frontend-Backend Communication
* Deployment Functionality

---

# 📈 Future Enhancements

* Blog Management Dashboard
* Contact Message Dashboard
* Rich Text Blog Editor
* Resume Management Panel
* Visitor Analytics Dashboard
* Search Functionality
* Enhanced Admin Controls
* Performance Monitoring

---

# 🎯 Key Learning Outcomes

This project helped me gain hands-on experience in:

* Full Stack Development
* Next.js App Router
* TypeScript
* REST API Development
* MongoDB Atlas
* JWT Authentication
* MVC Architecture
* Cloud Deployment
* Git & GitHub Workflow
* Production Debugging
* CORS Configuration
* Environment Variables
* Real-world Project Architecture

---

# 👨‍💻 Author

**Ritesh Jat**

B.Tech Electronics and Communication Engineering
MANIT Bhopal

GitHub: https://github.com/riteshjat2004

---

# ⭐ Support

If you found this project useful, consider giving it a star on GitHub.

```bash
⭐ Star this repository
```
