import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import RootLayout from './components/RootLayout';
import Login from './Login/Login';
import Register from './Register/Register';
import Profile from './Profile/Profile';  
import EditProfile from './Profile/EditProfile';
import ForgotPassword from './Login/ForgotPassword';
import Home from './Home/Home';
import ProtectedRoute from './components/ProtectedRoute';
import EventDetails from './components/EventDetails';
import EditEvent from './components/EditEvent';
import CreateEvent from './components/CreateEvent';
import MyEvents from './components/MyEvents';
import Events from './components/Events';
import Users from './components/Users';
import EventAnalytics from './components/EventAnalytics';
import BookingForm from './components/BookingForm';
import MyBookings from './components/MyBookings';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
      { path: 'events/:eventId', element: <EventDetails /> },
      {
        path: 'events/:eventId/book',
        element: <ProtectedRoute><BookingForm /></ProtectedRoute>
      },
      {
        path: 'profile',
        element: <ProtectedRoute><Profile /></ProtectedRoute>
      },
      {
        path: 'profile/edit',
        element: <ProtectedRoute><EditProfile /></ProtectedRoute>
      },
      {
        path: 'bookings',
        element: <ProtectedRoute><MyBookings /></ProtectedRoute>
      },
      {
        path: 'my-events',
        element: <ProtectedRoute><MyEvents /></ProtectedRoute>
      },
      {
        path: 'my-events/new',
        element: <ProtectedRoute><CreateEvent /></ProtectedRoute>
      },
      {
        path: 'my-events/analytics',
        element: <ProtectedRoute><EventAnalytics /></ProtectedRoute>
      },
      {
        path: 'events/:eventId/edit',
        element: <ProtectedRoute><EditEvent /></ProtectedRoute>
      },
      {
        path: 'admin/events',
        element: <ProtectedRoute><Events /></ProtectedRoute>
      },
      {
        path: 'admin/users',
        element: <ProtectedRoute><Users /></ProtectedRoute>
      },
      { path: '*', element: <Navigate to="/" replace /> }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;