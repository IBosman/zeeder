# LeadsGPT (AI Agent Management System)

## Overview
A full-stack web application for managing AI agents, built with React (frontend), Express.js (backend), and PostgreSQL (database).

---

## Features
- User authentication (admin and user roles)
- Agent management (CRUD)
- Admin dashboard
- Modern UI (React + Tailwind + Shadcn)

---

## Getting Started

### 1. **Clone the Repository**
```sh
git clone <your-repo-url>
cd <your-repo-directory>
```

### 2. **Install Dependencies**
```sh
npm install
```

### 3. **Set Up Environment Variables**
Create a `.env` file in the root directory with the following variables:

```
# PostgreSQL connection string
DATABASE_URL=postgres://username:password@host:port/dbname

# JWT secret for authentication
JWT_SECRET=your_jwt_secret

# ElevenLabs API key (if using ElevenLabs integration)
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Default admin credentials (optional, fallback: admin/changeme)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme
```

> **Note:** The app will not run without a valid `.env` file. You must provide at least `DATABASE_URL` and `JWT_SECRET`.

### 4. **Set Up the Database**
- Make sure PostgreSQL is running and accessible.
- Run the migrations to set up the schema:
  ```sh
  npm run db:push
  ```

### 5. **Build the Project**
```sh
npm run build
```

### 6. **Start the App**
```sh
npm start
```
- The app will be available at [http://localhost:5000](http://localhost:5000)
- The default admin account will be created if it does not exist (see `.env` for credentials).

---

## **Usage**
- Log in with the admin account to access the admin dashboard.
- Create users, assign agents, and manage your AI agents.

---

## **Troubleshooting**
- **Database connection errors:** Check your `DATABASE_URL` and ensure PostgreSQL is running.
- **Missing .env values:** The app will not start without required environment variables.
- **Port conflicts:** The app runs on port 5000 by default.

---

## **Security Notes**
- Change the default admin password after first login.
- Never commit your `.env` file or real credentials to version control.

---

## **Contributing**
Pull requests and issues are welcome!

---

## **License**
MIT 