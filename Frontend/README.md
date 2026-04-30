# InterviewPro - AI Interview Preparation Platform

InterviewPro is a full-stack web application designed to help users prepare for technical and professional interviews using AI. It allows users to upload resumes, generate relevant interview questions, and access premium features through a subscription-based system.

---

## Features

### AI-Based Question Generation

* Generates interview questions from resume content or custom user input
* Produces role-specific and targeted questions for better preparation
* Automates question discovery, reducing manual effort

### User Authentication

* Secure login and registration using JWT-based authentication
* Passwords are encrypted using bcrypt before storage
* Protected routes to restrict unauthorized access

### Subscription System

* Integrated payment flow using Razorpay
* Enables controlled access to premium features
* Includes secure payment verification handling

### Resume Upload & Processing

* Supports PDF resume uploads
* Extracts and processes text content from resumes
* Uses extracted data to generate personalized interview questions

---

## Setup Instructions

### Prerequisites

* Node.js installed
* MongoDB database (local or MongoDB Atlas)

---

### 1. Environment Variables Configuration

Create a `.env` file inside the `Backend` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

---

### 2. Install Dependencies

**Backend**

```bash
cd Backend
npm install
```

**Frontend**

```bash
cd Frontend
npm install
```

---

### 3. Run the Application

**Start Backend**

```bash
cd Backend
npm run dev
```

(Server runs on `http://localhost:5000`)

**Start Frontend**

```bash
cd Frontend
npm run dev
```

(Client runs on Vite default port, typically `http://localhost:5173`)

---

## Project Structure

```
interview-pro/
├── Backend/
├── Frontend/
```

---

## Notes

* Ensure all environment variables are correctly configured before running the project
* Razorpay keys are required for subscription functionality
* Cloudinary credentials are required for file upload handling

---

## License

This project is intended for educational and demonstration purposes.
