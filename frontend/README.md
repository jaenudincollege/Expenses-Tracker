@baseUrl = http://localhost:8000/api
@authToken = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ0ZXN0dXNlciIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTc0OTEzNTMzMCwiZXhwIjoxNzQ5NzQwMTMwfQ.F8fEiv4hROh7cgwp5oFZndpHlH-YrgdzRNw57XpOGy8

### API Health Check
GET {{baseUrl}}/health

### API Documentation
GET {{baseUrl}}/docs

### Authentication Endpoints

# Register a new user
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "fullName": "Test User"
}

### Login
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

### Get user profile (Protected)
GET {{baseUrl}}/auth/profile
Authorization: Bearer {{authToken}}

### Expense Endpoints

# Get all expenses (Protected)
GET {{baseUrl}}/expenses
Authorization: Bearer {{authToken}}

### Add a new expense (Protected)
POST {{baseUrl}}/expenses
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "title": "Lunch",
  "amount": 1500,
  "category": "Food",
  "date": "2025-06-05",
  "description": "Lunch at restaurant"
}

### Get expense by ID (Protected)
GET {{baseUrl}}/expenses/1
Authorization: Bearer {{authToken}}

### Update expense (Protected)
PATCH {{baseUrl}}/expenses/1
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "amount": 2000,
  "description": "Lunch with colleagues"
}

### Delete expense (Protected)
DELETE {{baseUrl}}/expenses/1
Authorization: Bearer {{authToken}}

### Get expenses for the last 30 days (Protected)
GET {{baseUrl}}/expenses/history/30
Authorization: Bearer {{authToken}}

### Download expenses as CSV (Protected)
GET {{baseUrl}}/expenses/download/csv
Authorization: Bearer {{authToken}}

### Income Endpoints

# Get all incomes (Protected)
GET {{baseUrl}}/incomes
Authorization: Bearer {{authToken}}

### Add a new income (Protected)
POST {{baseUrl}}/incomes
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "title": "Salary",
  "amount": 500000,
  "category": "Employment",
  "date": "2025-06-01",
  "description": "Monthly salary"
}

### Get income by ID (Protected)
GET {{baseUrl}}/incomes/1
Authorization: Bearer {{authToken}}

### Update income (Protected)
PATCH {{baseUrl}}/incomes/1
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "amount": 550000,
  "description": "Monthly salary with bonus"
}

### Delete income (Protected)
DELETE {{baseUrl}}/incomes/1
Authorization: Bearer {{authToken}}

### Get incomes for the last 30 days (Protected)
GET {{baseUrl}}/incomes/history/30
Authorization: Bearer {{authToken}}

### Download incomes as CSV (Protected)
GET {{baseUrl}}/incomes/download/csv
Authorization: Bearer {{authToken}}

### Transaction Endpoints

# Get all transactions (Protected)
GET {{baseUrl}}/transactions
Authorization: Bearer {{authToken}}

### Get transactions for the last 30 days (Protected)
GET {{baseUrl}}/transactions/history/30
Authorization: Bearer {{authToken}}

### Download transactions as CSV (Protected)
GET {{baseUrl}}/transactions/download/csv
Authorization: Bearer {{authToken}}


implement all of this api endpoint in this react application.
feature:
auth
store token
crud

focus only to make the application work, no need fancy styling