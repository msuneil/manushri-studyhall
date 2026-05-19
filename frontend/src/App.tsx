import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import { ToastProvider } from './components/Toast';
import { ConfirmationProvider } from './components/Confirmation';
import { SettingsProvider } from './features/settings/SettingsContext';

// Lazy loading pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Rooms = lazy(() => import('./pages/Rooms'));
const Seats = lazy(() => import('./pages/Seats'));
const Attendance = lazy(() => import('./pages/Attendance'));
const Payments = lazy(() => import('./pages/Payments'));
const Occupants = lazy(() => import('./pages/Occupants'));
const Expenses = lazy(() => import('./pages/Expenses'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Settings = lazy(() => import('./pages/Settings'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <ToastProvider>
        <ConfirmationProvider>
          <BrowserRouter>
            <Suspense fallback={<Loading />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Routes Wrapper */}
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/seats" element={<Seats />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/occupants" element={<Occupants />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ConfirmationProvider>
    </ToastProvider>
  </SettingsProvider>
  );
}
