# Body ID - Digital Health Platform

Body ID is a comprehensive digital health platform designed to streamline the interaction between patients and doctors. It provides secure medical record storage, easy appointment booking, video consultations, and AI-assisted health insights.

## 🚀 Key Features

### For Patients
- **Secure ID System**: Register using National ID (NID).
- **Appointment Booking**: Find doctors by specialty and book consultations.
- **Medical Records**: Upload and securely store medical history (Old prescriptions, Reports).
- **Record Sharing**: Grant temporary access to doctors to view your records using their BMDC ID.
- **AI Doctor**: Get instant preliminary health advice powered by AI.
- **Doctor Ratings**: Rate doctors anonymously after confirmed appointments.
- **Payment Integration**: Secure online payments for consultations.
- **Dashboard**: Track appointments, meaningful stats, and health history.

### For Doctors
- **Professional Profile**: Verified via BMDC ID.
- **Appointment Management**: View and manage upcoming patient visits.
- **Patient History**: Access shared patient records during consultations.
- **Prescription System**: Digital prescription generation.
- **Performance**: Track earnings and patient ratings.

### Admin
- **User Management**: Verify doctors and manage platform users.
- **Content Management**: Manage medical data and platform settings.

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT & Bcrypt
- **File Storage**: Cloudinary / Local Uploads
- **AI Integration**: OpenAI API
- **Vision**: Google Cloud Vision (for OCR on reports)
- **Payment**: Stripe

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas URL)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/body-id.git
cd body-id
```

### 2. Backend Setup
Navigate to the backend folder and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
OPENAI_API_KEY=your_openai_key
STRIPE_SECRET_KEY=your_stripe_key
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend folder:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:4000/api
```

Start the frontend development server:
```bash
npm run dev
```

## 🌐 Deployment (Cloudflare Tunnel)
This project is configured to work with Cloudflare Tunnel for easy exposure to the internet.

1.  Start Backend Tunnel:
    ```bash
    cloudflared tunnel --url http://localhost:4000 --protocol http2
    ```
2.  Update `frontend/.env` with the generated Backend URL.
3.  Start Frontend Tunnel:
    ```bash
    cloudflared tunnel --url http://localhost:5173 --protocol http2
    ```

## 📸 Screenshots


## 📄 License
This project is licensed under the ISC License.

---
**Note**: Ensure `server.allowedHosts` is configured in `vite.config.js` if deploying via Tunnels.
