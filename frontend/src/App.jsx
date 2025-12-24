import { AuthProvider } from './contexts/AuthContext';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Public pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Patient pages
import PatientDashboard from './pages/Patient/Dashboard';
import AppointmentCreate from './pages/Patient/AppointmentCreate';
import Payment from './pages/Patient/Payment';
import Doctors from './pages/Patient/Doctors';
import Records from './pages/Patient/Records';
import UploadRecord from './pages/Patient/UploadRecord';
import AIDoctor from './pages/Patient/AIDoctor';

// Doctor pages
import DoctorDashboard from './pages/Doctor/Dashboard';
import AppointmentDetails from './pages/Doctor/AppointmentDetails';
import PrescriptionUpload from './pages/Doctor/PrescriptionUpload';

// ProtectedRoute
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        {/* ---------- PUBLIC ROUTES ---------- */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ---------- PATIENT ROUTES ---------- */}
        <Route
          path="/patient/dashboard"
          element={
            <ProtectedRoute role="patient">
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/appointment/create/:doctorId"
          element={
            <ProtectedRoute role="patient">
              <AppointmentCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/payment/:appointmentId"
          element={
            <ProtectedRoute role="patient">
              <Payment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/doctors"
          element={
            <ProtectedRoute role="patient">
              <Doctors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/records"
          element={
            <ProtectedRoute role="patient">
              <Records />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/records/upload"
          element={
            <ProtectedRoute role="patient">
              <UploadRecord />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/ai-doctor"
          element={
            <ProtectedRoute role="patient">
              <AIDoctor />
            </ProtectedRoute>
          }
        />

        {/* ---------- DOCTOR ROUTES ---------- */}
        <Route
          path="/doctor/dashboard"
          element={
            <ProtectedRoute role="doctor">
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/appointment/:appointmentId"
          element={
            <ProtectedRoute role="doctor">
              <AppointmentDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/appointment/:appointmentId/upload"
          element={
            <ProtectedRoute role="doctor">
              <PrescriptionUpload />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
};

export default App;
