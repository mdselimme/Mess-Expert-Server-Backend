# Mess Expert Backend API Documentation - Dip

## Overview
This backend provides RESTful APIs for mess management, including user authentication, meal tracking, and mess administration. It uses Express.js, JWT authentication (via HTTP-only cookies), and PostgreSQL.

**Base URL:**
```
http://localhost:5000/api/v1/
```

---

## Authentication
- JWT tokens are issued on login and stored in HTTP-only cookies.
- Protected routes require a valid token in cookies.
- Middleware: `authenticateToken` verifies the token and attaches the user to `req.user`.

---

## Endpoints

### Auth Routes (`/auth`)

#### **Register**
- **POST** `/auth/register`
- **Description:** Register a new user.
- **Request Body:**
```json
{
  "fullName": "Shah Jalal Dip",
  "username": "dip",
  "email": "dip@gmail.com",
  "password": "yourpassword",
  "rememberMe": true
}
```
- **Response Example:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "dip",
    "email": "dip@gmail.com"
  }
}
```

#### **Login**
- **POST** `/auth/login`
- **Description:** Login and receive JWT cookie.
- **Request Body:**
```json
{
  "email": "dip@gmail.com",
  "password": "yourpassword",
  "rememberMe": true
}
```
- **Response Example:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "dip",
    "email": "dip@gmail.com",
    "token": "<jwt-token>"
  }
}
```

#### **Logout**
- **POST** `/auth/logout`
- **Description:** Logout (clears JWT cookie).
- **Response Example:**
```json
{
  "success": true,
  "message": "Log Out successfully"
}
```

#### **Check Auth**
- **GET** `/auth/check`
- **Description:** Check authentication status (requires valid token).
- **Response Example:**
```json
{
  "id": 1,
  "username": "dip"
}
```

---

### Meal Routes (`/meals`)

#### **Add Meal**
- **POST** `/meals/`
- **Description:** Add a meal record.
- **Request Body:**
```json
{
  "member_id": 1,
  "mess_id": 1,
  "date": "2024-06-01",
  "meal_type": "lunch"
}
```
- **Response Example:**
```json
{
  "message": "Meal added successfully"
}
```

#### **Get Meals**
- **GET** `/meals/`
- **Description:** Get meals (optionally filter by `mess_id`, `member_id`, `date`).
- **Query Example:**
```
/meals?mess_id=1&date=2024-06-01
```
- **Response Example:**
```json
[
  {
    "meal_id": 1,
    "member_id": 1,
    "mess_id": 1,
    "date": "2024-06-01",
    "meal_type": "lunch"
  }
]
```

---

### Mess Routes (`/mess`)

#### **Create Mess**
- **POST** `/mess/create`
- **Description:** Create a new mess (authenticated, admin only).
- **Request Body:**
```json
{
  "name": "Green Mess",
  "location": "Campus Block A"
}
```
- **Response Example:**
```json
{
  "message": "Mess created successfully",
  "messId": 1,
  "adminId": 1
}
```
- **Auth Required:** Yes (JWT cookie)

#### **Add Member to Mess**
- **POST** `/mess/:messId/add-member`
- **Description:** Add a member to a mess (authenticated, admin only).
- **Request Body:**
```json
{
  "email": "newuser@example.com"
}
```
- **Response Example:**
```json
{
  "message": "Member added successfully",
  "memberId": 2,
  "user": {
    "id": 2,
    "username": "newuser",
    "email": "newuser@example.com"
  }
}
```
- **Auth Required:** Yes (JWT cookie)

---

## Example cURL Requests

### Register
```
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Shah Jalal Dip","username":"dip","email":"dip@gmail.com","password":"yourpassword","rememberMe":true}'
```

### Login
```
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dip@gmail.com","password":"yourpassword","rememberMe":true}' \
  -c cookies.txt
```

### Add Meal (after login)
```
curl -X POST http://localhost:5000/api/v1/meals/ \
  -H "Content-Type: application/json" \
  -d '{"member_id":1,"mess_id":1,"date":"2024-06-01","meal_type":"lunch"}' \
  -b cookies.txt
```

### Create Mess (after login)
```
curl -X POST http://localhost:5000/api/v1/mess/create \
  -H "Content-Type: application/json" \
  -d '{"name":"Green Mess","location":"Campus Block A"}' \
  -b cookies.txt
```

---

## How to Run Locally

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up your `.env` file with database and JWT settings
4. Start the server:
   ```
   npm dun dev
   ```
5. The API will be available at `http://localhost:5000/api/v1/`

---

## Notes
- All protected routes require a valid JWT token in cookies (login first).
- Example data is used in this documentation; adapt as needed for your real data and environment.
