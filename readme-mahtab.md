# Mess Expert Backend Server - Mahtab

## Api documentation

**Base URL:**
```
http://localhost:5000/api/v1/record
```

---

##  Authentication

All endpoints require a valid JWT token in the request headers:


- JWT tokens are issued on login and stored in HTTP-only cookies.
- Protected routes require a valid token in cookies.
- Middleware: `authenticateToken` verifies the token and attaches the user to `req.user`.


---

### Routes

#### **Deposit**
- **POST** `/deposit`
- **Description:** Stores deposited amount of individual member.
- **Request Body:**
```json
{
  "username":"your_username",
  "amount":10000,
  "date":"12-12-2222",
  "text":"total"
}
```

###  Success Response

- **Code**: `200 OK`

```json
{
  "success": true,
  "message": "Successfully stored deposit!",
  "data": {
    "id": 12,
    "member_id": 3,
    "mess_id": 2,
    "amount": 500,
    "date": "2025-07-08T00:00:00.000Z",
    "note": "Monthly deposit"
  }
}
```

###  Error Responses

| Code | Message                                                       |
|------|----------------------------------------------------           |
| 400  | Invalid input: username, date, amount or note missing/invalid |
| 403  | Only admin can add deposits                                   |
| 404  | User / Member / Mess not found                                |
| 500  | Internal Server Error                                         |

---


## 🔹 POST `/expenses`

- **Description**: Record an expense for a user. Only `admin` can add expenses, and requester must be in the same mess as the expensor.
- **Authentication Required**: Yes

### Request Headers

| Key            | Value                    | Required |
|----------------|--------------------------|----------|
| Authorization  | Bearer `<JWT token>`     | yes      |
| Content-Type   | application/json         | yes      |

###  Request Body

```json
{
  "username": "john_doe",
  "amount": 120,
  "description": "Bought groceries",
  "category": "Grocery",
  "date": "2025-07-08",
  "is_settled": false
}
```

###  Success Response

- **Code**: `201 Created`

```json
{
  "success": true,
  "data": {
    "id": 45,
    "mess_id": 2,
    "member_id": 3,
    "category": "Grocery",
    "amount": 120,
    "date": "2025-07-08T00:00:00.000Z",
    "description": "Bought groceries",
    "is_settled": false
  }
}
```

###  Error Responses

| Code | Message                                            |
|------|----------------------------------------------------|
| 400  | Invalid input                                      |
| 403  | Not admin / Requester and expensor not in same mess |
| 404  | User / Member / Mess not found                     |
| 500  | Internal Server Error                              |

---
# This two API will be available at `http://localhost:5000/api/v1/record`




## 🔹 GET `/:messId/mess-name`

- **Description**: Get messName using messId of a user if user has joined a mess earlier.

- **Authentication Required**: Yes

### Request Headers

| Key            | Value                    | Required |
|----------------|--------------------------|----------|
| Authorization  | Bearer `<JWT token>`     | yes      |
| Content-Type   | application/json         | yes      |

###  Request Body

```
No body

```

###  Success Response

- **Code**: `200`

```json
{
  "success": true,
  "message": "Successfully fetched mess name",
  "data": {
    "messId": 45,
    "messName": "ABC"
  }
}
```

###  Error Responses

| Code | Message                                             |
|------|---------------------------------------------------- |
| 403  | Not admin / Requester and expensor not in same mess |
| 404  | Mess not found                                      |
| 500  | Internal Server Error                               |

---
# The API's will be available at `http://localhost:5000/api/v1/mess`



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


##  Notes

- `username` is used to identify the user being charged or credited.
- `date` must be in `YYYY-MM-DD` format. If omitted in expenses, current date will be used.
- Only authenticated users with the role `admin` can access these endpoints.
- All monetary fields (`amount`) must be numbers.
