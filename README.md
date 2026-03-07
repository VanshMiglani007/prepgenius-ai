# PrepGenius AI

PrepGenius AI is an intelligent exam preparation planner built using the MERN stack.

It helps students organize subjects, plan study schedules, track progress, and optimize their preparation.

## Tech Stack

Frontend
- React.js
- TailwindCSS

Backend
- Node.js
- Express.js

Database
- MongoDB Atlas

Authentication
- JWT
- bcrypt

## Features

- User authentication (Signup / Login)
- JWT protected routes
- Subject management
- Topic tracking
- Study planner generator
- Pomodoro focus timer
- Progress analytics dashboard
- Flashcards and revision system

## API Endpoints

### Authentication

POST `/api/auth/signup`  
POST `/api/auth/login`  
GET `/api/auth/profile`

### Upcoming APIs

POST `/api/subjects`  
GET `/api/subjects`  
PUT `/api/subjects/:id`  
DELETE `/api/subjects/:id`

## Project Structure

```
server
 ├ controllers
 ├ middleware
 ├ models
 ├ routes
 └ utils
```

## Author

Vansh Miglani
