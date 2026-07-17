# 🚀 AI Interview Pro

An AI-powered interview preparation and career development platform built using the MERN Stack. The platform helps users generate AI-powered interview reports from their resumes, manage subscriptions, purchase tokens, and improve interview readiness through intelligent feedback.

---

# ✨ Features

## 🔐 Authentication
- User Registration
- User Login
- JWT Authentication
- Protected Routes
- Secure Cookie-Based Sessions

## 🤖 AI Interview Analysis
- Resume Upload
- AI-Powered Report Generation
- Personalized Interview Feedback
- Interview Report Storage

## 📄 Resume Processing
- PDF Resume Parsing
- Resume Analysis
- Report Generation

## 💳 Subscription & Payments
- Token-Based Usage System
- Subscription Plans
- Razorpay Payment Integration
- Payment Verification
- Automatic Token Updates

## ⚙️ User Settings
- Theme Preferences
- Account Settings
- Notification Preferences

---

# 🏗️ Tech Stack

## Frontend
- React.js
- React Router
- Axios
- React Hot Toast
- SCSS

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Bcrypt.js

## Third-Party Services
- Google Gemini AI
- Cloudinary
- Razorpay
- PDF Parse

---

# 📂 Project Structure

```text
interview-pro/
│
├── Frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── Backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── models/
│   │   └── config/
│   │
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

# 🔄 Application Flow

```text
User Register/Login
        ↓
Dashboard
        ↓
Upload Resume
        ↓
Token Validation
        ↓
AI Report Generation
        ↓
Save Report to MongoDB
        ↓
View Generated Report
        ↓
Purchase Subscription (Optional)
        ↓
Tokens Updated
```

---

# 🔐 Authentication Flow

```text
Register/Login
      ↓
Controller
      ↓
JWT Generation
      ↓
Cookie Storage
      ↓
Protected Routes Access
```

---

# 🤖 Interview Generation Flow

```text
Resume Upload
      ↓
Token Check
      ↓
AI Processing
      ↓
Generate Report
      ↓
Save Report
      ↓
Return Response
```

---

# 💳 Subscription Flow

```text
User Selects Plan
         ↓
Create Razorpay Order
         ↓
Open Razorpay Checkout
         ↓
Payment Success
         ↓
Verify Payment
         ↓
Add Tokens
         ↓
Update Subscription
```

---

# ⚡ Installation

## Clone Repository

```bash
git clone <repository-url>
cd interview-pro
```

## Install Frontend Dependencies

```bash
cd Frontend
npm install
```

## Install Backend Dependencies

```bash
cd Backend
npm install
```

---

# 🔑 Environment Variables

Create a `.env` file inside the Backend directory.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

GEMINI_API_KEY=your_gemini_api_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

---

# ▶️ Run the Application

## Start Backend

```bash
cd Backend
npm start
```

## Start Frontend

```bash
cd Frontend
npm run dev
```

---

# 📌 API Modules

- Authentication APIs
- Interview APIs
- User Settings APIs
- Subscription APIs
- Payment APIs

---

# 🚀 Future Enhancements

- Interview Analytics Dashboard
- AI Career Roadmap Generator
- Voice-Based Mock Interviews
- Resume Scoring System
- Email Notifications
- Admin Dashboard

---

# 👨‍💻 Author

Developed using the MERN Stack with AI-powered interview assistance, resume processing, subscription management, and Razorpay payment integration.

⭐ If you like this project, consider giving it a star on GitHub.