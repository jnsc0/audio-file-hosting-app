

# Audio File Hosting Web App

## System Architecture

The system consists of a **Frontend**, **Backend**, and **Database**, with the application deployed inside Docker containers. The architecture is designed to allow users to upload, manage, and play audio files. Here’s a high-level overview:

### High-Level Architecture Diagram
```
  +----------------+          +--------------------+       +--------------------+
  |    Frontend    |   <----> |       Backend      | <----> |     Database        |
  | (React + Vite) |          |  (Node.js + Express)|      | (MongoDB / Google Cloud 
 |                   |      |                      |       |              Storage)|
  +----------------+          +--------------------+       +--------------------+
         |                          |   ↑                    |
   User interacts with            API Requests             Stores metadata & audio files
      the frontend               (CRUD operations)
    (Vite Development)                                         
```

### Components

- **Frontend**:
  - Built with **React.js** using **Vite** as the bundler for fast development.
  - **Tailwind CSS** is used for styling.
  - The frontend communicates with the backend via RESTful APIs for authentication and file management.
  - The frontend is containerized using **Docker**.

- **Backend**:
  - Built with **Node.js** .
  - **MongoDB** and **Google Cloud Storage** is used for database storage (user data, audio metadata).
  - The backend handles authentication, user profile management, audio upload, file retrieval, and API security.
  - The backend is containerized using **Docker**.

- **Database**:
  - User data (accounts, metadata) are stored in **MongoDB**.
  - Audio files are stored in **Google Cloud Storage**

---

## API Definition



## Authentication 

### Register User
**Endpoint**: `POST /api/auth/register`  
**Description**: Register a new user with a username, password, and email.  
**Request Body**:
```json
{
  "username": "string",
  "password": "string",
  "email": "string"
}
```
**Response**:
- **201 Created**: User created successfully.
```json
{
  "message": "User created successfully"
}
```
- **400 Bad Request**: Error creating user.
```json
{
  "message": "Error creating user"
}
```

---

### Login User
**Endpoint**: `POST /api/auth/login`  
**Description**: Log in with a username and password to receive a JWT token.  
**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```
**Response**:
- **200 OK**: Successfully logged in, returns a JWT token and user details.
```json
{
  "token": "jwt_token",
  "userId": "user_id",
  "userRole": "user_role"
}
```
- **401 Unauthorized**: Invalid credentials.
```json
{
  "message": "Invalid credentials"
}
```
- **500 Internal Server Error**: Server error.
```json
{
  "message": "Server error"
}
```

---

### Request Password Reset Token
**Endpoint**: `POST /api/auth/forgot-password/request`  
**Description**: Request a password reset link to be sent via email.  
**Request Body**:
```json
{
  "email": "string"
}
```
**Response**:
- **200 OK**: Password reset link sent to the email address.
```json
{
  "message": "Password reset link sent to email"
}
```
- **404 Not Found**: User not found.
```json
{
  "message": "User not found"
}
```
- **500 Internal Server Error**: Server error.
```json
{
  "message": "Server error"
}
```

---

### Reset Password
**Endpoint**: `POST /api/auth/reset-password`  
**Description**: Reset the user's password using a valid token and a new password.  
**Request Body**:
```json
{
  "token": "string",
  "newPassword": "string"
}
```
**Response**:
- **200 OK**: Password successfully reset.
```json
{
  "message": "Password has been reset successfully"
}
```
- **400 Bad Request**: Invalid or expired token.
```json
{
  "message": "Invalid or expired token"
}
```
- **500 Internal Server Error**: Server error.
```json
{
  "message": "Server error"
}
```

---

### User Management (Authenticated)


## Get User
**Endpoint**: `GET /api/user/:id`  
**Description**: Retrieve user details by `id`. The user can access their own details or an admin can access any user's details.  
**Request Parameters**:
- `id` (string): The ID of the user to fetch.

**Response**:
- **200 OK**: Successfully retrieved user data.
```json
{
  "id": "user_id",
  "username": "string",
  "email": "string",
  "role": "string"
}
```
- **403 Forbidden**: User is not authorized to access this data.
```json
{
  "message": "Not authorized"
}
```
- **404 Not Found**: User not found.
```json
{
  "message": "User not found"
}
```

---

## Update User
**Endpoint**: `PUT /api/user/:id`  
**Description**: Update user details (password and other information). The user can update their own details or an admin can update any user's details.  
**Request Parameters**:
- `id` (string): The ID of the user to update.

**Request Body**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string" // optional, password will be hashed if provided
}
```

**Response**:
- **200 OK**: Successfully updated user data.
```json
{
  "id": "user_id",
  "username": "string",
  "email": "string",
  "role": "string"
}
```
- **403 Forbidden**: User is not authorized to update this data.
```json
{
  "message": "Not authorized"
}
```
- **404 Not Found**: User not found.
```json
{
  "message": "User not found"
}
```
- **500 Internal Server Error**: Server error.
```json
{
  "message": "Server error",
  "error": "error_message"
}
```

---

## Get All Users (Admin Only)
**Endpoint**: `GET /api/user`  
**Description**: Retrieve all users (admin only).  
**Response**:
- **200 OK**: Successfully retrieved all users.
```json
[
  {
    "id": "user_id",
    "username": "string",
    "email": "string",
    "role": "string"
  },
  ...
]
```
- **500 Internal Server Error**: Server error.
```json
{
  "message": "Server error"
}
```

---

## Delete User 
**Endpoint**: `DELETE /api/user/:id`  
**Description**: Delete user by `id`. A user can only delete their own account, while an admin can delete any user's account. Deletion is temporary, and users are permanently deleted after 1 minute.  
**Request Parameters**:
- `id` (string): The ID of the user to delete.

**Response**:
- **200 OK**: Successfully marked user for deletion. The user will be permanently deleted after 1 minute.
```json
{
  "message": "User marked for deletion. It will be permanently deleted after 1 minute."
}
```
- **403 Forbidden**: User is not authorized to delete this data.
```json
{
  "message": "Not authorized"
}
```
- **404 Not Found**: User not found.
```json
{
  "message": "User not found"
}
```
- **500 Internal Server Error**: Server error.
```json
{
  "message": "Server error"
}
```

---

# Audio Management API

## Upload Audio File
**Endpoint**: `POST /api/audio/upload`  
**Description**: Upload an audio file along with its metadata (title, category, description). The file is stored on Google Cloud Storage.  
**Request Body**:
```json
{
  "title": "string",
  "category": "string",
  "description": "string"
}
```
**Request Form Data**:
- `audioFile` (file): The audio file to upload.

**Response**:
- **201 Created**: Successfully uploaded the audio file.
```json
{
  "id": "audio_id",
  "title": "string",
  "category": "string",
  "description": "string",
  "fileUrl": "string"
}
```
- **400 Bad Request**: No file uploaded.
```json
{
  "message": "No file uploaded"
}
```
- **500 Internal Server Error**: Server error.
```json
{
  "message": "Server error"
}
```

---

## Get All Audio Files
**Endpoint**: `GET /api/audio`  
**Description**: Get all audio files. A user sees only their own files, while an admin sees all files, including those marked for deletion.  
**Response**:
- **200 OK**: Successfully retrieved audio files.
```json
[
  {
    "id": "audio_id",
    "title": "string",
    "category": "string",
    "description": "string",
    "fileUrl": "string"
  },
  ...
]
```
- **500 Internal Server Error**: Server error.
```json
{
  "message": "Server error"
}
```

---

## Get Single Audio File
**Endpoint**: `GET /api/audio/:id`  
**Description**: Get details of a single audio file. Only the file owner or an admin can view the file.  
**Request Parameters**:
- `id` (string): The ID of the audio file.

**Response**:
- **200 OK**: Successfully retrieved the audio file.
```json
{
  "id": "audio_id",
  "title": "string",
  "category": "string",
  "description": "string",
  "fileUrl": "string"
}
```
- **403 Forbidden**: User is not authorized to view this file.
```json
{
  "message": "Not authorized"
}
```
- **404 Not Found**: File not found.
```json
{
  "message": "File not found"
}
```
- **500 Internal Server Error**: Server error.
```json
{
  "message": "Server error"
}
```

---

## Update Audio File
**Endpoint**: `PUT /api/audio/:id`  
**Description**: Update an existing audio file's metadata or replace the audio file. Only the owner or an admin can update the file.  
**Request Parameters**:
- `id` (string): The ID of the audio file.

**Request Body**:
```json
{
  "title": "string", // optional
  "category": "string", // optional
  "description": "string" // optional
}
```

**Request Form Data**:
- `audioFile` (file): A new audio file to upload (optional).

**Response**:
- **200 OK**: Successfully updated the audio file.
```json
{
  "message": "Audio file updated successfully",
  "audio": {
    "id": "audio_id",
    "title": "string",
    "category": "string",
    "description": "string",
    "fileUrl": "string"
  }
}
```
- **403 Forbidden**: User is not authorized to update this file.
```json
{
  "message": "Not authorized to update this audio file"
}
```
- **404 Not Found**: Audio file not found.
```json
{
  "message": "Audio file not found"
}
```
- **500 Internal Server Error**: Server error.
```json
{
  "message": "Server error"
}
```

---

## Delete Audio File
**Endpoint**: `DELETE /api/audio/:id`  
**Description**: Soft-delete an audio file. Only the owner or an admin can delete the file. The file will be permanently deleted after 1 minute.  
**Request Parameters**:
- `id` (string): The ID of the audio file.

**Response**:
- **200 OK**: Successfully marked the audio file for deletion.
```json
{
  "message": "Audio file marked for deletion. It will be deleted permanently after 10 minutes."
}
```
- **403 Forbidden**: User is not authorized to delete this file.
```json
{
  "message": "Not authorized"
}
```
- **404 Not Found**: Audio file not found.
```json
{
  "message": "File not found"
}
```
- **500 Internal Server Error**: Server error.
```json
{
  "message": "Server error"
}
```

---

## Restore Soft-Deleted Audio File
**Endpoint**: `PUT /api/audio/:id/restore`  
**Description**: Restore a soft-deleted audio file. Only the owner or an admin can restore the file.  
**Request Parameters**:
- `id` (string): The ID of the audio file.

**Response**:
- **200 OK**: Successfully restored the audio file.
```json
{
  "message": "Audio file restored.",
  "audio": {
    "id": "audio_id",
    "title": "string",
    "category": "string",
    "description": "string",
    "fileUrl": "string"
  }
}
```
- **403 Forbidden**: User is not authorized to restore this file.
```json
{
  "message": "Not authorized"
}
```
- **404 Not Found**: Audio file not found.
```json
{
  "message": "File not found"
}
```
- **400 Bad Request**: No file to restore.
```json
{
  "message": "No file to restore."
}
```
- **500 Internal Server Error**: Server error.
```json
{
  "message": "Server error"
}
```

---

## Directory Structure

```
audio-file-hosting-web-app
  ├── backend
  │   ├── Dockerfile.backend
  │   └── (Other backend-related files)
  ├── frontend
  │   ├── Dockerfile.frontend
  │   └── (Other frontend-related files)
  ├── docker-compose.yml
  └── .dockerignore
```


## Running the App
To build and run the project using Docker, follow the steps below.

### Prerequisites

- Docker (https://www.docker.com/get-started)

### Running the Application

1. Clone the repository and navigate to the project folder.
2. Build and start the containers:
   ```bash
   docker-compose up --build
   
3. The frontend will be available at http://localhost:80.
4. The backend will be available at http://localhost:5000.

---
## If all fails.. we go back to basic


## Frontend:

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

4. use node 18:

   ```bash
   nvm use 18
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Run the frontend in development mode:

   ```bash
   npm run dev
   ```

## Backend:

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the backend:

   ```bash
   node server.js
   ```



---





