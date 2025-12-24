# Body-ID Backend API Documentation

Complete API documentation for the Body-ID full-stack application backend.

## Base URL

```
http://localhost:4000/api
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_token>
```

---

## 🔐 Authentication Routes (`/api/auth`)

### Register New User

- **Method:** `POST`
- **Path:** `/api/auth/register`
- **Auth Required:** ❌ No
- **Request Body:**
  ```json
  {
    "role": "patient" | "doctor" | "admin",
    "name": "string",
    "email": "string",
    "phone": "string (optional)",
    "password": "string"
  }
  ```
- **Response:** `201 Created`
  ```json
  {
    "token": "jwt_token",
    "user": {
      "id": "user_id",
      "name": "string",
      "email": "string",
      "role": "string",
      "bodyId": "string (only for patients)"
    }
  }
  ```

### Login User

- **Method:** `POST`
- **Path:** `/api/auth/login`
- **Auth Required:** ❌ No
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "token": "jwt_token",
    "user": {
      "id": "user_id",
      "name": "string",
      "email": "string",
      "role": "string",
      "bodyId": "string",
      "password": "password_hash"
    }
  }
  ```

---

## 🧑‍⚕️ User Routes (`/api/users`)

### Get All Users

- **Method:** `GET`
- **Path:** `/api/users`
- **Auth Required:** ❌ No
- **Response:** `200 OK`
  ```json
  [
    {
      "_id": "user_id",
      "name": "string",
      "email": "string",
      "role": "string",
      ...
    }
  ]
  ```

### Get User by ID

- **Method:** `GET`
- **Path:** `/api/users/:id`
- **Auth Required:** ❌ No
- **URL Parameters:**
  - `id` - User ID
- **Response:** `200 OK`
  ```json
  {
    "_id": "user_id",
    "name": "string",
    "email": "string",
    "role": "string",
    ...
  }
  ```

---

## 📄 Medical Records Routes (`/api/records`)

### Upload Medical Record

- **Method:** `POST`
- **Path:** `/api/records/upload`
- **Auth Required:** ✅ Yes
- **Content-Type:** `multipart/form-data`
- **Request Body:**
  - `file` (file) - Required - Medical record file
  - `title` (string) - Optional - Record title
  - `description` (string) - Optional - Record description
  - `tags` (string) - Optional - Comma-separated tags
- **Response:** `201 Created`
  ```json
  {
    "message": "Record uploaded successfully",
    "record": {
      "_id": "record_id",
      "patientId": "user_id",
      "title": "string",
      "description": "string",
      "fileUrl": "cloudinary_url",
      "filePublicId": "public_id",
      "fileType": "mime_type",
      "tags": ["tag1", "tag2"],
      "createdAt": "date"
    }
  }
  ```

### Get All Records (Logged-in User)

- **Method:** `GET`
- **Path:** `/api/records`
- **Auth Required:** ✅ Yes
- **Response:** `200 OK`
  ```json
  {
    "message": "Records fetched successfully",
    "count": 5,
    "records": [
      {
        "_id": "record_id",
        "patientId": "user_id",
        "title": "string",
        "fileUrl": "url",
        ...
      }
    ]
  }
  ```

### Get Single Record by ID

- **Method:** `GET`
- **Path:** `/api/records/:recordId`
- **Auth Required:** ✅ Yes
- **URL Parameters:**
  - `recordId` - Record ID
- **Response:** `200 OK`
  ```json
  {
    "message": "Record fetched successfully",
    "record": {
      "_id": "record_id",
      "patientId": "user_id",
      "title": "string",
      "fileUrl": "url",
      ...
    }
  }
  ```

---

## 🗓 Appointment Routes (`/api/appointments`)

### Create New Appointment

- **Method:** `POST`
- **Path:** `/api/appointments`
- **Auth Required:** ✅ Yes
- **Request Body:**
  ```json
  {
    "patientId": "user_id (required)",
    "doctorId": "user_id (required)",
    "scheduledAt": "ISO_date_string (required)",
    "bodyId": "string (required)",
    "attachedRecordIds": ["record_id1", "record_id2"] (optional),
    "paymentIntentId": "string (optional)"
  }
  ```
- **Response:** `201 Created`
  ```json
  {
    "message": "Appointment created successfully",
    "appointment": {
      "_id": "appointment_id",
      "patientId": "user_id",
      "doctorId": "user_id",
      "bodyId": "string",
      "status": "pending",
      "scheduledAt": "date",
      "payment": {
        "amount": 0,
        "provider": "stripe",
        "paid": false
      },
      ...
    }
  }
  ```

### Get All Appointments

- **Method:** `GET`
- **Path:** `/api/appointments`
- **Auth Required:** ✅ Yes
- **Response:** `200 OK`
  ```json
  {
    "message": "Appointment fetch successfully",
    "appointment": [
      {
        "_id": "appointment_id",
        "patientId": "user_id",
        "doctorId": "user_id",
        "status": "pending",
        ...
      }
    ]
  }
  ```

### Get Appointment by ID

- **Method:** `GET`
- **Path:** `/api/appointments/:id`
- **Auth Required:** ✅ Yes
- **URL Parameters:**
  - `id` - Appointment ID
- **Response:** `200 OK`
  ```json
  {
    "message": "Get appointment {id}"
  }
  ```

---

## 💳 Payment Routes (`/api/payments`)

### Create Payment Intent (Stripe)

- **Method:** `POST`
- **Path:** `/api/payments/create-intent`
- **Auth Required:** ✅ Yes
- **Request Body:**
  ```json
  {
    "appointmentId": "appointment_id",
    "amount": 100.0
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "clientSecret": "stripe_client_secret"
  }
  ```

### Stripe Webhook

- **Method:** `POST`
- **Path:** `/api/payments/webhook`
- **Auth Required:** ❌ No (uses Stripe signature)
- **Content-Type:** `application/json` (raw)
- **Headers:**
  - `stripe-signature` - Stripe webhook signature
- **Response:** `200 OK`
  ```json
  {
    "received": true
  }
  ```

### Fake Payment (Testing)

- **Method:** `POST`
- **Path:** `/api/payments/fake-payment`
- **Auth Required:** ✅ Yes
- **Request Body:**
  ```json
  {
    "appointmentId": "appointment_id",
    "amount": 100.0
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "message": "Fake payment successful",
    "appointmentStatus": "paid",
    "payment": {
      "_id": "payment_id",
      "appointmentId": "appointment_id",
      "patientId": "user_id",
      "doctorId": "user_id",
      "amount": 100.0,
      "provider": "fake",
      "transactionId": "FAKE-timestamp",
      "paid": true,
      "status": "success"
    }
  }
  ```

---

## 📤 General Upload Routes (`/api/upload`)

### Upload Single File

- **Method:** `POST`
- **Path:** `/api/upload/single`
- **Auth Required:** ❌ No
- **Content-Type:** `multipart/form-data`
- **Request Body:**
  - `file` (file) - Required - File to upload
- **Response:** `200 OK`
  ```json
  {
    "url": "cloudinary_secure_url"
  }
  ```

---

## 📋 Medical History Routes (`/api/patient/history`)

### Upload Medical History

- **Method:** `POST`
- **Path:** `/api/patient/history/upload`
- **Auth Required:** ✅ Yes
- **Content-Type:** `multipart/form-data`
- **Request Body:**
  - `historyFile` (file) - Required - Medical history file
  - `description` (string) - Optional - Description of the history
- **Response:** `200 OK`
  ```json
  {
    "success": true,
    "history": {
      "_id": "history_id",
      "patient": "user_id",
      "description": "string",
      "fileUrl": "cloudinary_url",
      "uploadedAt": "date"
    }
  }
  ```

---

## 📝 Notes

### Authentication Token

After login/register, you'll receive a JWT token. Include it in all protected routes:

```
Authorization: Bearer <token>
```

### File Uploads

For file uploads, use `multipart/form-data` content type:

- Records: field name is `file`
- Medical History: field name is `historyFile`
- General Upload: field name is `file`

### Appointment Status Values

- `pending` - Initial status
- `paid` - Payment completed
- `confirmed` - Doctor confirmed
- `completed` - Appointment completed
- `rejected` - Appointment rejected
- `cancelled` - Appointment cancelled

### User Roles

- `patient` - Patient user (gets auto-generated bodyId)
- `doctor` - Doctor user
- `admin` - Admin user

### Error Responses

All endpoints may return error responses:

```json
{
  "message": "Error message",
  "error": "Detailed error (optional)"
}
```

Common status codes:

- `400` - Bad Request (missing/invalid data)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found
- `500` - Server Error

---

## 🚀 Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables in `.env`:

   ```
   PORT=4000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=1d
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_webhook_secret
   ```

3. Start the server:
   ```bash
   npm start
   # or
   nodemon server.js
   ```

---

## 📁 Project Structure

```
backend/
├── config.js                 # Database configuration
├── server.js                 # Main server file
├── controllers/              # Route controllers
│   ├── authController.js
│   ├── appointmentController.js
│   ├── paymentController.js
│   ├── recordController.js
│   └── historyUploaderControllers.js
├── middleware/               # Custom middleware
│   ├── authMiddleware.js    # JWT authentication
│   └── auth.js
├── models/                   # Mongoose models
│   ├── User.js
│   ├── Appointment.js
│   ├── Record.js
│   ├── Payment.js
│   ├── MedicalHistory.js
│   └── Rating.js
├── routes/                   # API routes
│   ├── auth.js
│   ├── user.js
│   ├── appointment.js
│   ├── recordRoutes.js
│   ├── payment.js
│   ├── upload.js
│   └── historyUpload.js
└── utils/                    # Utility functions
    ├── bodyId.js
    ├── cloudinary.js
    └── upload.js
```

---

**Last Updated:** Generated automatically from codebase analysis
