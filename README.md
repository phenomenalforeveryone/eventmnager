# Event Manager – Full Stack MERN Application

A full-stack Event Management and Booking Platform built using the MERN stack. The application connects event organizers, attendees and administrators through a centralized platform for event discovery, management, registration and booking.

## Project Overview

Event Manager is designed to simplify event organization and participation. Organizers can create and manage events, users can explore and book events, and administrators can oversee platform activities and manage approvals.

## Technology Stack

**Frontend**
- React.js
- Vite
- JavaScript
- CSS

**Backend**
- Node.js
- Express.js
- REST API

**Database**
- MongoDB
- Mongoose

**Authentication and Security**
- JSON Web Tokens (JWT)
- bcrypt password hashing
- Role-based access control

**Development Tools**
- Git and GitHub
- VS Code
- npm

## Key Features

### 1. Authentication and User Management
- User registration and login
- Secure password hashing
- JWT-based authentication
- Role-based access for different users

### 2. Event Management
- Create and manage events
- Upload event posters
- View event details
- Edit and manage existing events

### 3. Event Booking
- Browse available events
- Register for events
- Manage bookings
- View booking and ticket information
- Cancel bookings

### 4. Organizer Dashboard
- Organizer registration and approval workflow
- Event management dashboard
- Manage attendees
- View event analytics

### 5. Administrator Dashboard
- Manage platform activities
- Review organizer applications
- Approve or reject events
- Manage platform users

### 6. User Dashboard
- View bookings
- Access tickets
- Save events
- Manage profile
- View notifications

## User Roles

| Role | Responsibilities |
|---|---|
| Administrator | Platform management and approvals |
| Organizer | Create and manage events and attendees |
| User | Discover events and manage bookings |

## Project Structure

```text
event-manager/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── validators/
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   ├── App.jsx
│   ├── main.jsx
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## Installation and Setup

### Prerequisites
- Node.js and npm
- MongoDB local installation or MongoDB Atlas
- Git

### 1. Clone the repository

```bash
git clone https://github.com/phenomenalforeveryone/eventmnager.git
cd eventmnager
```

### 2. Setup the backend

```bash
cd backend
npm install
```

Configure the backend environment variables using the provided `.env.example` file. Add your own MongoDB connection string and authentication configuration.

Start the backend using the appropriate script defined in `backend/package.json`.

### 3. Setup the frontend

Open another terminal:

```bash
cd frontend
npm install
```

Configure the frontend `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

### 4. Access the application

Frontend: http://localhost:5173

Backend: http://localhost:5000

## Security

- Password hashing
- JWT-based authentication
- Role-based authorization
- Environment variable configuration
- Protected application routes

## Future Improvements

- Online payment gateway integration
- Enhanced event recommendation system
- Advanced analytics and reporting
- Additional notification features
- Cloud deployment and scalability improvements

## Project Information

**Project Name:** Event Manager

**Category:** Full Stack Web Development

**Architecture:** MERN Stack

**Repository:** https://github.com/phenomenalforeveryone/eventmnager

**Developed by:** Urvi Singh

---

*Event Manager – Simplifying Event Discovery, Organization and Booking.*
