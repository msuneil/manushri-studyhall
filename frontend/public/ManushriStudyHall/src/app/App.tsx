import { BrowserRouter, Routes, Route } from 'react-router';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Rooms } from './pages/Rooms';
import { Seats } from './pages/Seats';
import { Payments } from './pages/Payments';
import { Occupants } from './pages/Occupants';
import { Expenses } from './pages/Expenses';
import { Tasks } from './pages/Tasks';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/seats" element={<Seats />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/occupants" element={<Occupants />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
